use std::fs::File;

use fancy_regex::Regex;
use itertools::Itertools;

use crate::{DefaultEmailVerifyConfigParams, EMAIL_VERIFY_CONFIG_ENV};

pub fn get_email_circuit_public_hash_input(
    headerhash: &[u8],
    public_key_n_bytes: &[u8],
    header_substrs: Vec<Option<(usize, String)>>,
    body_substrs: Vec<Option<(usize, String)>>,
    header_max_byte_size: usize,
    body_max_byte_size: usize,
) -> Vec<u8> {
    let bodyhash = header_substrs[0].as_ref().unwrap().1.as_bytes();
    let max_len = header_max_byte_size + body_max_byte_size;
    let mut expected_masked_chars = vec![0u8; max_len];
    let mut expected_substr_ids = vec![0u8; max_len]; // We only support up to 256 substring patterns.
    for (substr_idx, m) in header_substrs.iter().enumerate() {
        if let Some((start, chars)) = m {
            for (idx, char) in chars.as_bytes().iter().enumerate() {
                expected_masked_chars[start + idx] = *char;
                expected_substr_ids[start + idx] = substr_idx as u8 + 1;
            }
        }
    }
    for (substr_idx, m) in body_substrs.iter().enumerate() {
        if let Some((start, chars)) = m {
            for (idx, char) in chars.as_bytes().iter().enumerate() {
                expected_masked_chars[header_max_byte_size + start + idx] = *char;
                expected_substr_ids[header_max_byte_size + start + idx] = substr_idx as u8 + 1;
            }
        }
    }
    vec![
        headerhash,
        bodyhash,
        &[0u8; (128 - 32 - 44)][..],
        &public_key_n_bytes,
        &expected_masked_chars,
        &expected_substr_ids,
    ]
    .concat()
}

pub fn get_email_substrs(
    header_str: &str,
    body_str: &str,
    header_substr_regexes: Vec<Vec<String>>,
    body_substr_regexes: Vec<Vec<String>>,
) -> (Vec<Option<(usize, String)>>, Vec<Option<(usize, String)>>) {
    let bodyhash_substr = get_substr(
        &header_str,
        &[r"(?<=bh=)(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|0|1|2|3|4|5|6|7|8|9|\+|/|=)+(?=;)".to_string()],
    );
    let header_substrs = header_substr_regexes
        .iter()
        .map(|raws| {
            let raws = raws.into_iter().map(|raw| format!(r"{}", raw)).collect_vec();
            get_substr(&header_str, raws.as_slice())
        })
        .collect_vec();
    let header_substrings = vec![vec![bodyhash_substr], header_substrs].concat();
    let body_substrings = body_substr_regexes
        .iter()
        .map(|raws| {
            let raws = raws.into_iter().map(|raw| format!(r"{}", raw)).collect_vec();
            get_substr(&body_str, raws.as_slice())
        })
        .collect_vec();
    (header_substrings, body_substrings)
}

pub fn get_substr(input_str: &str, regexes: &[String]) -> Option<(usize, String)> {
    let regexes = regexes.into_iter().map(|raw| Regex::new(&raw).unwrap()).collect_vec();
    let mut start = 0;
    let mut substr = input_str;
    println!("first regex {}", regexes[0]);
    for regex in regexes.into_iter() {
        // println!(r"regex {}", regex);
        match regex.find(substr).unwrap() {
            Some(m) => {
                start += m.start();
                substr = m.as_str();
            }
            None => {
                return None;
            }
        };
    }
    println!("substr {}", substr);
    // println!("start {}", start);
    Some((start, substr.to_string()))
}

pub fn read_default_circuit_config_params() -> DefaultEmailVerifyConfigParams {
    let path = std::env::var(EMAIL_VERIFY_CONFIG_ENV).expect("You should set the configure file path to EMAIL_VERIFY_CONFIG.");
    let contents = std::fs::read(path.clone()).expect("Failed to read file");
    let contents_str = String::from_utf8(contents).unwrap();

    let params: DefaultEmailVerifyConfigParams =
        serde_json::from_reader(File::open(path.as_str()).expect(&format!("{} does not exist.", path))).expect("File is found but invalid.");
    params
}
