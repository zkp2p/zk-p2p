use std::{collections::HashMap, fs::File, path::Path};
mod js_caller;
use crate::vrm::js_caller::*;
use fancy_regex::Regex;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
// use daggy::Dag;
// use daggy::NodeIndex;
// use daggy::Walker;
use graph_cycles::Cycles;
use petgraph::prelude::*;
use serde_json::Value;
use std::collections::HashSet;
use std::fmt::format;
use std::io::BufWriter;
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum VrmError {
    #[error("No edge from {:?} to {:?} in the graph",.0,.1)]
    NoEdge(NodeIndex<usize>, NodeIndex<usize>),
    #[error(transparent)]
    JsCallerError(#[from] JsCallerError),
    #[error(transparent)]
    IoError(#[from] std::io::Error),
    #[error(transparent)]
    RegexError(#[from] fancy_regex::Error),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecomposedRegexConfig {
    pub max_byte_size: usize,
    pub parts: Vec<RegexPartConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegexPartConfig {
    pub is_public: bool,
    pub regex_def: String,
    pub max_size: usize,
    pub solidity: Option<SoldityType>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum SoldityType {
    String,
    Uint,
    Decimal,
}

impl DecomposedRegexConfig {
    pub fn gen_regex_files(&self, allstr_file_path: &PathBuf, substr_file_pathes: &[PathBuf]) -> Result<(), VrmError> {
        let catch_all = catch_all_regex_str()?;
        let text_context_prefix = text_context_prefix_regex_str()?;
        let first_part = RegexPartConfig {
            is_public: false,
            regex_def: "(".to_string() + catch_all.as_str() + "+)?" + &text_context_prefix,
            max_size: self.max_byte_size,
            solidity: None,
        };
        let last_part = RegexPartConfig {
            is_public: false,
            regex_def: "\r\n(".to_string() + catch_all.as_str() + "+)?",
            max_size: self.max_byte_size,
            solidity: None,
        };
        let mut all_regex = String::new();
        let part_configs = &self.parts;
        for config in vec![&[first_part][..], part_configs, &[last_part][..]].concat().iter() {
            all_regex += &config.regex_def;
        }
        // println!("all_regex {}", all_regex);
        let dfa_val = get_dfa_json_value(&all_regex)?;
        let regex_text = dfa_to_regex_def_text(&dfa_val)?;
        let mut regex_file = File::create(allstr_file_path)?;
        write!(regex_file, "{}", regex_text)?;
        regex_file.flush()?;

        let mut graph = Graph::<bool, String, Directed, usize>::with_capacity(0, 0);
        let max_state = get_max_state(&dfa_val)?;
        add_graph_nodes(&dfa_val, &mut graph, None, max_state)?;
        let accepted_state = get_accepted_state(&dfa_val).ok_or(JsCallerError::NoAcceptedState)?;

        let mut remove_edges = HashSet::new();
        graph.visit_all_cycles(|g, cycle_nodes| {
            if cycle_nodes.len() == 1 {
                return;
            }
            // println!("cycles {:?}", cycle_nodes);
            let n = cycle_nodes.len();
            let e = g.find_edge(cycle_nodes[n - 1], cycle_nodes[0]).unwrap();
            remove_edges.insert(e);
        });
        let accepted_state_index = NodeIndex::from(accepted_state);
        let mut pathes = Vec::<Vec<NodeIndex<usize>>>::new();
        let mut stack = Vec::<(NodeIndex<usize>, Vec<NodeIndex<usize>>)>::new();
        stack.push((accepted_state_index, vec![accepted_state_index]));
        let mut pushed_edge = HashSet::new();
        let mut self_nodes = HashSet::new();

        while stack.len() != 0 {
            // println!("stack size {} visited size {}", stack.len(), visited.len());
            let (node, path) = stack.pop().unwrap();
            // println!("node {:?}", node);
            let mut parents = graph.neighbors(node).detach();
            while let Some((edge, parent)) = parents.next(&graph) {
                if parent.index() == node.index() {
                    self_nodes.insert(node.index());
                    graph.remove_edge(edge).unwrap();
                    continue;
                }
                if !path.contains(&parent) {
                    if parent.index() == 0 {
                        // println!("path {:?}", path);
                        pathes.push(path.to_vec());
                        continue;
                    }
                    if let Some(rev_e) = graph.find_edge(parent, node) {
                        if remove_edges.contains(&rev_e) && !pushed_edge.contains(&rev_e) {
                            graph.remove_edge(rev_e);
                        }
                    }
                    pushed_edge.insert(edge);
                    stack.push((parent, vec![path.clone(), vec![parent]].concat()));
                }
            }
        }

        let mut public_config_indexes: Vec<usize> = vec![];
        let mut part_regexes = vec![];
        for (idx, config) in part_configs.iter().enumerate() {
            if config.is_public {
                public_config_indexes.push(idx);
            }
            if idx == 0 {
                part_regexes.push(Regex::new(&format_regex_str(&config.regex_def)?)?);
            } else {
                let pre_regex = part_regexes[idx - 1].to_string();
                part_regexes.push(Regex::new(&(pre_regex + &format_regex_str(&config.regex_def)?))?);
            }
        }
        let num_public_parts = public_config_indexes.len();
        debug_assert_eq!(num_public_parts, substr_file_pathes.len());
        let mut substr_defs_array = (0..num_public_parts).map(|_| HashSet::<(usize, usize, bool)>::new()).collect_vec();
        for path in pathes.iter_mut() {
            let n = path.len();
            path.append(&mut vec![NodeIndex::from(0)]);
            let edges = (0..n)
                .map(|idx| {
                    // println!("from {:?} to {:?}", path[idx], path[idx + 1]);
                    graph.find_edge(path[idx], path[idx + 1]).ok_or(VrmError::NoEdge(path[idx], path[idx + 1]))
                })
                .collect::<Result<Vec<EdgeIndex<usize>>, VrmError>>()?;
            let string_vec = edges.iter().map(|edge| graph.edge_weight(*edge).unwrap().as_str()).collect::<Vec<&str>>();
            let path_states = path.into_iter().rev().map(|node| node.index()).collect::<Vec<usize>>();
            let path_strs = string_vec.iter().rev().map(|s| s.to_string()).collect::<Vec<String>>();
            // for (idx, state) in path_states.iter().enumerate() {
            //     println!("idx {} state {}", idx, state,);
            // }
            // for (idx, str) in path_strs.iter().enumerate() {
            //     println!(
            //         "idx {} byte {} str {}",
            //         idx,
            //         str.as_bytes()[0],
            //         (str.as_bytes()[0] as char)
            //     );
            // }

            self.add_substr_defs_from_path(&mut substr_defs_array, &path_states, &path_strs, &part_regexes, &public_config_indexes)?;
        }
        for index in self_nodes.iter() {
            // println!("self index {}", index);
            for defs in substr_defs_array.iter_mut() {
                if defs.iter().find(|def| (def.0 == *index || def.1 == *index) && !def.2).is_some() {
                    defs.insert((*index, *index, false));
                }
            }
        }
        // println!("{:?}", substr_defs_array);

        for (idx, defs) in substr_defs_array.into_iter().enumerate() {
            let mut writer = BufWriter::new(File::create(&substr_file_pathes[idx])?);
            let max_size = &part_configs[public_config_indexes[idx]].max_size;
            writer.write_fmt(format_args!("{}\n", &max_size))?;
            writer.write_fmt(format_args!("0\n{}\n", self.max_byte_size - 1))?;
            for (cur, next, _) in defs.iter() {
                writer.write_fmt(format_args!("{} {}\n", cur, next))?;
            }
        }
        // println!("pathes {:?}", pathes);
        Ok(())
    }

    fn add_substr_defs_from_path(
        &self,
        substr_defs_array: &mut [HashSet<(usize, usize, bool)>],
        path_states: &[usize],
        path_strs: &[String],
        part_regexes: &[Regex],
        public_config_indexes: &[usize],
    ) -> Result<(), VrmError> {
        debug_assert_eq!(path_states.len(), path_strs.len() + 1);
        let mut concat_str = String::new();
        for (idx, str) in path_strs.into_iter().enumerate() {
            let first_chars = str.as_bytes();
            concat_str += &(first_chars[0] as char).to_string();
        }
        let index_ends = part_regexes
            .iter()
            .map(|regex| {
                // println!(
                //     "regex {}, found {:?} end {}",
                //     regex,
                //     regex
                //         .find(&concat_str)
                //         .unwrap()
                //         .unwrap()
                //         .as_str()
                //         .as_bytes(),
                //     regex.find(&concat_str).unwrap().unwrap().end()
                // );
                // println!("regex {}", regex);
                let found = regex.find(&concat_str).unwrap().unwrap();
                if found.start() == found.end() {
                    found.end() + 1
                } else {
                    found.end()
                }
            })
            .collect_vec();

        for (idx, (index, defs)) in public_config_indexes.iter().zip(substr_defs_array.iter_mut()).enumerate() {
            let start = if *index == 0 { 0 } else { index_ends[index - 1] };
            let end = index_ends[*index];
            // println!("start {} end {}", start, end);
            let substr_def_array: &[usize] = &path_states[(start)..=end];
            // println!("substr_def_array {:?}", substr_def_array);
            for idx in 0..(substr_def_array.len() - 1) {
                // println!("{} {}", substr_def_array[idx], substr_def_array[idx + 1],);
                let is_last = (idx == substr_def_array.len() - 2) && idx > 0;
                defs.insert((substr_def_array[idx], substr_def_array[idx + 1], is_last));
            }
        }
        Ok(())
    }
}
