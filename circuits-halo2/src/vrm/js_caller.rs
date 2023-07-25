use std::collections::HashMap;

use js_sandbox::{AnyError, JsError, Script};
use petgraph::prelude::*;
use serde_json::Value;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum JsCallerError {
    #[error("Edges {0} are not object")]
    InvalidEdges(Value),
    #[error("node value {0} is not u64")]
    InvalidNodeValue(Value),
    #[error("No accepted state")]
    NoAcceptedState,
    #[error(transparent)]
    JsError(#[from] JsError),
    #[error(transparent)]
    JsonError(#[from] serde_json::Error),
}

pub fn catch_all_regex_str() -> Result<String, JsCallerError> {
    let code: &'static str = include_str!("regex.js");
    let mut script = Script::from_string(code)?;
    let result: String = script.call("catchAllRegexStr", ())?;
    Ok(result)
}

pub fn text_context_prefix_regex_str() -> Result<String, JsCallerError> {
    let code: &'static str = include_str!("regex.js");
    let mut script = Script::from_string(code)?;
    let result: String = script.call("textContextPrefix", ())?;
    Ok(result)
}

pub fn format_regex_str(regex: &str) -> Result<String, JsCallerError> {
    let code: &'static str = include_str!("regex.js");
    let mut script = Script::from_string(code)?;
    let result: String = script.call("formatRegexPrintable", (regex,))?;
    Ok(result)
}

pub fn get_dfa_json_value(regex: &str) -> Result<Vec<Value>, JsCallerError> {
    let code: &'static str = include_str!("regex.js");
    let mut script = Script::from_string(code)?;
    let result: String = script.call("regexToDfa", (regex,))?;
    Ok(serde_json::from_str(&result)?)
}

pub fn get_accepted_state(dfa_val: &[Value]) -> Option<usize> {
    for i in 0..dfa_val.len() {
        if dfa_val[i]["type"] == "accept" {
            return Some(i as usize);
        }
    }
    None
}

pub fn get_max_state(dfa_val: &[Value]) -> Result<usize, JsCallerError> {
    let mut max_state = 0;
    for (i, val) in dfa_val.iter().enumerate() {
        for (_, next_node_val) in val["edges"].as_object().ok_or(JsCallerError::InvalidEdges(val["edges"].clone()))?.iter() {
            let next_node = next_node_val.as_u64().ok_or(JsCallerError::InvalidNodeValue(next_node_val.clone()))? as usize;
            if next_node > max_state {
                max_state = next_node;
            }
        }
    }
    Ok(max_state)
}

pub fn add_graph_nodes(dfa_val: &[Value], graph: &mut Graph<bool, String, Directed, usize>, last_max_state: Option<usize>, next_max_state: usize) -> Result<(), JsCallerError> {
    let first_new_state = match last_max_state {
        Some(v) => v + 1,
        None => 0,
    };
    for idx in first_new_state..=next_max_state {
        graph.add_node(idx == next_max_state);
    }

    for (i, val) in dfa_val.iter().enumerate() {
        for (key, next_node_val) in val["edges"].as_object().ok_or(JsCallerError::InvalidEdges(val["edges"].clone()))?.iter() {
            let next_node = next_node_val.as_u64().ok_or(JsCallerError::InvalidNodeValue(next_node_val.clone()))? as usize;
            if let Some(max) = last_max_state {
                if i <= max && next_node <= max {
                    continue;
                }
            }
            let key_list: Vec<String> = serde_json::from_str(&key)?;
            let mut key_str = String::new();
            for key_char in key_list.iter() {
                assert!(key_char.len() == 1);
                key_str += key_char;
            }
            graph.add_edge(NodeIndex::from(next_node), NodeIndex::from(i), key_str);
        }
    }
    Ok(())
}

pub fn dfa_to_regex_def_text(dfa_val: &[Value]) -> Result<String, JsCallerError> {
    let accepted_state = get_accepted_state(dfa_val).ok_or(JsCallerError::NoAcceptedState)?;
    let max_state = get_max_state(dfa_val)?;
    let mut text = "0\n".to_string();
    text += &format!("{}\n", accepted_state.to_string());
    text += &format!("{}\n", max_state.to_string());
    for (i, val) in dfa_val.iter().enumerate() {
        for (key, next_node_val) in val["edges"].as_object().ok_or(JsCallerError::InvalidEdges(val["edges"].clone()))?.iter() {
            let key_list: Vec<String> = serde_json::from_str(&key)?;
            for key_char in key_list.iter() {
                let key_char: char = key_char.chars().collect::<Vec<char>>()[0];
                let next_node = next_node_val.as_u64().ok_or(JsCallerError::InvalidNodeValue(next_node_val.clone()))? as usize;
                // println!("i {} next {} char {}", i, next_node, key_char as u8);
                text += &format!("{} {} {}\n", i.to_string(), next_node.to_string(), (key_char as u8).to_string());
            }
        }
    }
    Ok(text)
}
