import {
  bytesToBigInt,
  stringToBytes,
  fromHex,
  toCircomBigIntBytes,
  packBytesIntoNBytes,
  bufferToUint8Array,
  bufferToString,
  bufferToHex,
  Uint8ArrayToString,
  Uint8ArrayToCharArray,
  assert,
  mergeUInt8Arrays,
  int8toBytes,
  int64toBytes,
} from "@zk-email/helpers/src/binaryFormat";
import { CIRCOM_FIELD_MODULUS, MAX_HEADER_PADDED_BYTES, MAX_BODY_PADDED_BYTES, STRING_PRESELECTOR } from "@zk-email/helpers/src/constants";
import { shaHash, partialSha, sha256Pad } from "@zk-email/helpers/src/shaHash";
import { dkimVerify } from "@zk-email/helpers/src/dkim";
import * as fs from "fs";
import { pki } from "node-forge";

async function getArgs(email_file_name: string) {
  const args = process.argv.slice(2);
  const emailFileArg = args.find((arg) => arg.startsWith("--email_file="));
  const nonceArg = args.find((arg) => arg.startsWith("--nonce="));

  const email_file = emailFileArg ? emailFileArg.split("=")[1] : `emls/${email_file_name}.eml`;
  const nonce = nonceArg ? nonceArg.split("=")[1] : null;

  return { email_file, nonce };
}

export interface ICircuitInputs {
  modulus?: string[];
  signature?: string[];
  base_message?: string[];
  in_padded?: string[];
  in_body_padded?: string[];
  in_body_len_padded_bytes?: string;
  in_padded_n_bytes?: string[];
  in_len_padded_bytes?: string;
  in_body_hash?: string[];
  precomputed_sha?: string[];
  body_hash_idx?: string;
  addressParts?: string[];
  address?: string;
  address_plus_one?: string;
  twitter_username_idx?: string;
  venmo_receive_id_idx?: string;
  email_from_idx?: string;
  email_timestamp_idx?: string;
  venmo_send_id_idx?: string;
  venmo_amount_idx?: string;
  order_id?: string;
  claim_id?: string;

  // subject commands only
  command_idx?: string;
  message_id_idx?: string;
  amount_idx?: string;
  currency_idx?: string;
  recipient_idx?: string;
  custom_message_id_from?: string[];
  custom_message_id_recipient?: string[];
  nullifier?: string;
  relayer?: string;
}

export enum CircuitType {
  RSA = "rsa",
  SHA = "sha",
  TEST = "test",
  EMAIL_TWITTER = "email_twitter",
  EMAIL_VENMO_RECEIVE = "email_venmo_receive",
  EMAIL_VENMO_SEND = "email_venmo_send",
  EMAIL_SUBJECT = "email_subject",
}

async function findSelector(a: Uint8Array, selector: number[]): Promise<number> {
  let i = 0;
  let j = 0;
  while (i < a.length) {
    if (a[i] === selector[j]) {
      j++;
      if (j === selector.length) {
        return i - j + 1;
      }
    } else {
      j = 0;
    }
    i++;
  }
  return -1;
}

// Returns the part of str that appears after substr
function trimStrByStr(str: string, substr: string) {
  const index = str.indexOf(substr);
  if (index === -1) return str;
  return str.slice(index + substr.length, str.length);
}

function strToCharArrayStr(str: string) {
  return str.split("").map((char) => char.charCodeAt(0).toString());
}

// padWithZero(bodyRemaining, MAX_BODY_PADDED_BYTES)
function padWithZero(arr: Uint8Array, length: number) {
  while (arr.length < length) {
    arr = mergeUInt8Arrays(arr, int8toBytes(0));
  }
  return arr;
}
export async function getCircuitInputs(
  rsa_signature: BigInt,
  rsa_modulus: BigInt,
  message: Buffer,
  body: Buffer,
  body_hash: string,
  order_id: string,
  claim_id: string,
  eth_address: string,
  circuit: CircuitType
): Promise<{
  valid: {
    validSignatureFormat?: boolean;
    validMessage?: boolean;
  };
  circuitInputs: ICircuitInputs;
}> {
  console.log("Starting processing of inputs");

  let MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = MAX_BODY_PADDED_BYTES;
  let STRING_PRESELECTOR_FOR_EMAIL_TYPE = STRING_PRESELECTOR;

  // Update preselector string based on circuit type
  if (circuit === CircuitType.EMAIL_VENMO_RECEIVE) {
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "\r\ntps://venmo.com/code?user_id=3D";
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 6400;  // 6200 length + 200 chars long custom message
  } else if (circuit === CircuitType.EMAIL_VENMO_SEND) {
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "                    href=3D\"https://venmo.com/code?user_id=3D";
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 6016;  // 5708 length + 300 chars long custom message
  }

  // Derive modulus from signature
  // const modulusBigInt = bytesToBigInt(pubKeyParts[2]);
  const modulusBigInt = rsa_modulus;
  // Message is the email header with the body hash
  const prehash_message_string = message;
  // const baseMessageBigInt = AAYUSH_PREHASH_MESSAGE_INT; // bytesToBigInt(stringToBytes(message)) ||
  // const postShaBigint = AAYUSH_POSTHASH_MESSAGE_PADDED_INT;
  const signatureBigInt = rsa_signature;

  // Perform conversions
  const prehashBytesUnpadded = typeof prehash_message_string == "string" ? new TextEncoder().encode(prehash_message_string) : Uint8Array.from(prehash_message_string);
  const postShaBigintUnpadded = bytesToBigInt(stringToBytes((await shaHash(prehashBytesUnpadded)).toString())) % CIRCOM_FIELD_MODULUS;

  // Sha add padding
  // 65 comes from the 64 at the end and the 1 bit in the start, then 63 comes from the formula to round it up to the nearest 64. see sha256algorithm.com for a more full explanation of paddnig length
  const calc_length = Math.floor((body.length + 63 + 65) / 64) * 64;
  const [messagePadded, messagePaddedLen] = await sha256Pad(prehashBytesUnpadded, MAX_HEADER_PADDED_BYTES);
  const [bodyPadded, bodyPaddedLen] = await sha256Pad(body, Math.max(MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE, calc_length));

  // Convet messagePadded to string to print the specific header data that is signed
  console.log(JSON.stringify(message).toString());

  // Ensure SHA manual unpadded is running the correct function
  const shaOut = await partialSha(messagePadded, messagePaddedLen);

  assert((await Uint8ArrayToString(shaOut)) === (await Uint8ArrayToString(Uint8Array.from(await shaHash(prehashBytesUnpadded)))), "SHA256 calculation did not match!");

  // Precompute SHA prefix
  const selector = STRING_PRESELECTOR_FOR_EMAIL_TYPE.split("").map((char) => char.charCodeAt(0));
  const selector_loc = await findSelector(bodyPadded, selector);
  console.log("Body selector found at: ", selector_loc);
  let shaCutoffIndex = Math.floor((await findSelector(bodyPadded, selector)) / 64) * 64;
  const precomputeText = bodyPadded.slice(0, shaCutoffIndex);
  let bodyRemaining = bodyPadded.slice(shaCutoffIndex);
  const bodyRemainingLen = bodyPaddedLen - precomputeText.length;
  assert(bodyRemainingLen < MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE, "Invalid slice");
  assert(bodyRemaining.length % 64 === 0, "Not going to be padded correctly with int64s");
  bodyRemaining = padWithZero(bodyRemaining, MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE);
  assert(bodyRemaining.length === MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE, "Invalid slice");
  const bodyShaPrecompute = await partialSha(precomputeText, shaCutoffIndex);

  // Compute identity revealer
  let circuitInputs;
  const modulus = toCircomBigIntBytes(modulusBigInt);
  const signature = toCircomBigIntBytes(signatureBigInt);

  const in_len_padded_bytes = messagePaddedLen.toString();
  const in_padded = await Uint8ArrayToCharArray(messagePadded); // Packed into 1 byte signals
  const in_body_len_padded_bytes = bodyRemainingLen.toString();
  const in_body_padded = await Uint8ArrayToCharArray(bodyRemaining);
  const base_message = toCircomBigIntBytes(postShaBigintUnpadded);
  const precomputed_sha = await Uint8ArrayToCharArray(bodyShaPrecompute);
  const body_hash_idx = bufferToString(message).indexOf(body_hash).toString();

  const address = bytesToBigInt(fromHex(eth_address)).toString();
  const nullifier = signature[0];
  // bytesToBigInt(fromHex()).toString();
  const address_plus_one = (bytesToBigInt(fromHex(eth_address)) + 1n).toString();

  let raw_header = Buffer.from(prehash_message_string).toString();
  const email_from_idx = raw_header.length - trimStrByStr(trimStrByStr(raw_header, "from:"), "<").length;

  let email_subject = trimStrByStr(raw_header, "\r\nsubject:");
  //in javascript, give me a function that extracts the first word in a string, everything before the first space

  if (circuit === CircuitType.RSA) {
    circuitInputs = {
      modulus,
      signature,
      base_message,
    };
  } else if (circuit === CircuitType.EMAIL_VENMO_RECEIVE) {
    const RECEIVE_ID_SELECTOR = Buffer.from(STRING_PRESELECTOR_FOR_EMAIL_TYPE);
    const venmo_receive_id_idx = (Buffer.from(bodyRemaining).indexOf(RECEIVE_ID_SELECTOR) + RECEIVE_ID_SELECTOR.length).toString();
    const email_timestamp_idx = (raw_header.length - trimStrByStr(raw_header, "t=").length).toString();

    console.log("Indexes into for venmo receive email are: ", email_timestamp_idx, venmo_receive_id_idx);

    circuitInputs = {
      in_padded,
      modulus,
      signature,
      in_len_padded_bytes,
      precomputed_sha,
      in_body_padded,
      in_body_len_padded_bytes,
      body_hash_idx,
      // venmo specific indices
      email_timestamp_idx,
      venmo_receive_id_idx,
      // IDs
      order_id,
      // claim_id
    };
  } else if (circuit === CircuitType.EMAIL_VENMO_SEND) {
    const SEND_ID_SELECTOR = Buffer.from(STRING_PRESELECTOR_FOR_EMAIL_TYPE);
    const venmo_send_id_idx = (Buffer.from(bodyRemaining).indexOf(SEND_ID_SELECTOR) + SEND_ID_SELECTOR.length).toString();

    const venmo_amount_idx = (raw_header.length - trimStrByStr(email_subject, "$").length).toString();
    console.log("Indexes into for venmo send email are: ", venmo_amount_idx, venmo_send_id_idx);

    circuitInputs = {
      in_padded,
      modulus,
      signature,
      in_len_padded_bytes,
      precomputed_sha,
      in_body_padded,
      in_body_len_padded_bytes,
      body_hash_idx,
      // venmo specific indices
      venmo_amount_idx,
      venmo_send_id_idx,
      // IDs
      order_id,
      // claim_id
    };
  } else if (circuit === CircuitType.EMAIL_TWITTER) {
    const USERNAME_SELECTOR = Buffer.from(STRING_PRESELECTOR_FOR_EMAIL_TYPE);
    const twitter_username_idx = (Buffer.from(bodyRemaining).indexOf(USERNAME_SELECTOR) + USERNAME_SELECTOR.length).toString();
    console.log("Indexes into header string are: ", email_from_idx, twitter_username_idx);

    circuitInputs = {
      in_padded,
      modulus,
      signature,
      in_len_padded_bytes,
      precomputed_sha,
      in_body_padded,
      in_body_len_padded_bytes,
      twitter_username_idx,
      address,
      address_plus_one,
      body_hash_idx,
      // email_from_idx,
    };
  } else if (circuit === CircuitType.EMAIL_SUBJECT) {
    // First word after "subject:" (usually send/Send)
    const command = email_subject.split(" ")[0];
    const command_idx = raw_header.length - email_subject.length;
    // Index of first word after command
    const amount_idx = raw_header.length - trimStrByStr(email_subject, command).length;
    // Index of second word after command
    const currency_idx = raw_header.length - trimStrByStr(trimStrByStr(email_subject, command), " ").length;
    // Index of first word after subject and "to"
    const recipient_idx = raw_header.length - trimStrByStr(email_subject, " to ").length;
    // Used to get the private message-id
    const message_id_idx = raw_header.length - trimStrByStr(raw_header, "\r\nmessage-id:<").length;
    const message_id = raw_header.slice(message_id_idx).split(">\r\n")[0];
    const MAX_MESSAGE_ID_LEN = 128;
    const message_id_array = await Uint8ArrayToCharArray(padWithZero(stringToBytes(message_id), MAX_MESSAGE_ID_LEN));
    console.log("Indexes into header string are: ", email_from_idx, amount_idx, currency_idx, recipient_idx);

    circuitInputs = {
      in_padded,
      modulus,
      signature,
      in_len_padded_bytes,
      address: address,
      nullifier: nullifier,
      body_hash_idx,
      email_from_idx: email_from_idx.toString(),
      command_idx: command_idx.toString(),
      message_id_idx: message_id_idx.toString(),
      amount_idx: amount_idx.toString(),
      currency_idx: currency_idx.toString(),
      recipient_idx: recipient_idx.toString(),
      custom_message_id_from: message_id_array,
      custom_message_id_recipient: message_id_array,
    };
  } else {
    assert(circuit === CircuitType.SHA, "Invalid circuit type");
    circuitInputs = {
      in_padded,
      in_len_padded_bytes,
      precomputed_sha,
    };
  }
  return {
    circuitInputs,
    valid: {},
  };
}

// Nonce is useful to disambiguate files for input/output when calling from the command line, it is usually null or hash(email)
export async function generate_inputs(
  raw_email: Buffer | string,
  eth_address: string,
  type: CircuitType = CircuitType.EMAIL_SUBJECT,
  nonce_raw: number | null | string = null,
  order_id: string,
  claim_id: string
): Promise<ICircuitInputs> {
  const nonce = typeof nonce_raw == "string" ? nonce_raw.trim() : nonce_raw;

  var result, email: Buffer;
  if (typeof raw_email === "string") {
    email = Buffer.from(raw_email);
  } else email = raw_email;

  console.log("DKIM verification starting");
  result = await dkimVerify(email);
  // console.log("From:", result.headerFrom);
  // console.log("Results:", result.results[0]);
  if (!result.results[0]) {
    throw new Error(`No result found on dkim output ${result}`);
  } else {
    if (!result.results[0].publicKey) {
      if (result.results[0].status.message) {
        throw new Error(result.results[0].status.message);
      } else {
        throw new Error(`No public key found on generate_inputs result ${JSON.stringify(result)}`);
      }
    }
  }
  const _ = result.results[0].publicKey.toString();
  console.log("DKIM verification successful");
  // try {
  //   // TODO: Condition code on if there is an internet connection, run this code
  //   var frozen = Cryo.stringify(result);
  //   fs.writeFileSync(`./email_cache_2.json`, frozen, { flag: "w" });
  // } catch (e) {
  //   console.log("Reading cached email instead!");
  //   let frozen = fs.readFileSync(`./email_cache.json`, { encoding: "utf-8" });
  //   result = Cryo.parse(frozen);
  // }
  let sig = BigInt("0x" + Buffer.from(result.results[0].signature, "base64").toString("hex"));
  let message = result.results[0].status.signature_header;
  let body = result.results[0].body;
  let body_hash = result.results[0].bodyHash;

  let pubkey = result.results[0].publicKey;
  const pubKeyData = pki.publicKeyFromPem(pubkey.toString());
  // const pubKeyData = CryptoJS.parseKey(pubkey.toString(), 'pem');
  let modulus = BigInt(pubKeyData.n.toString());
  let fin_result = await getCircuitInputs(sig, modulus, message, body, body_hash, order_id, claim_id, eth_address, type);
  return fin_result.circuitInputs;
}

// Sometimes, newline encodings re-encode \r\n as just \n, so re-insert the \r so that the email hashes correctly
export async function insert13Before10(a: Uint8Array): Promise<Uint8Array> {
  let ret = new Uint8Array(a.length + 1000);
  let j = 0;
  for (let i = 0; i < a.length; i++) {
    // Ensure each \n is preceded by a \r
    if (a[i] === 10 && i > 0 && a[i - 1] !== 13) {
      ret[j] = 13;
      j++;
    }
    ret[j] = a[i];
    j++;
  }
  return ret.slice(0, j);
}

// Only called when the whole function is called from the command line, to read inputs
// Will generate a test proof with the empty Ethereum address, that cannot be proven by anybody else
async function test_generate(writeToFile: boolean = true, email_file_name: string, type: CircuitType) {
  const { email_file, nonce } = await getArgs(email_file_name);
  const email = fs.readFileSync(email_file.trim());
  console.log(email);
  const gen_inputs = await generate_inputs(email, "0x0000000000000000000000000000000000000000", type, nonce, "1", "0");
  console.log(JSON.stringify(gen_inputs));
  if (writeToFile) {
    const file_dir = email_file.substring(0, email_file.lastIndexOf("/") + 1);
    const filename = nonce ? `${file_dir}/input_${nonce}.json` : `./inputs/input_${email_file_name}.json`;
    console.log(`Writing to default file ${filename}`);
    fs.writeFileSync(filename, JSON.stringify(gen_inputs), { flag: "w" });
  }
  return gen_inputs;
}

// If file called directly with `npx tsx generate_inputs.ts`
if (typeof require !== "undefined" && require.main === module) {
  // Example usage: yarn gen-input venmo_receive EMAIL_VENMO_RECEIVE
  test_generate(true, process.argv[2], CircuitType[process.argv[3] as keyof typeof CircuitType]);
}
