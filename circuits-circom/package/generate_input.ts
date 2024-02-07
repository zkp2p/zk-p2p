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
} from "@zk-email/helpers/dist/binaryFormat";
import { CIRCOM_FIELD_MODULUS, MAX_HEADER_PADDED_BYTES, MAX_BODY_PADDED_BYTES, STRING_PRESELECTOR } from "@zk-email/helpers/dist/constants";
import { shaHash, partialSha, sha256Pad } from "@zk-email/helpers/dist/shaHash";
import { dkimVerify } from "@zk-email/helpers/dist/dkim";
import * as fs from "fs";
import { pki } from "node-forge";
import { hdfcReplaceMessageIdWithXGoogleOriginalMessageId } from "./preprocess";

async function getArgs() {
  const args = process.argv.slice(2);
  const emailFileArg = args.find((arg) => arg.startsWith("--email_file="));
  const paymentTypeArg = args.find((arg) => arg.startsWith("--payment_type="));
  const circuitTypeArg = args.find((arg) => arg.startsWith("--circuit_type="));
  const intentHashArg = args.find((arg) => arg.startsWith("--intent_hash="));
  const nonceArg = args.find((arg) => arg.startsWith("--nonce="));
  const outputFileNameArg = args.find((arg) => arg.startsWith("--output_file="))

  if (!emailFileArg || !paymentTypeArg || !circuitTypeArg) {
    console.log("Usage: npx ts-node generate_inputs.ts --email_file=emls/venmo_send.eml --payment_type=venmo --circuit_type=send --intent_hash=12345 --nonce=1 --output_file=inputs/input_venmo_send.json");
    process.exit(1);
  }

  const email_file = emailFileArg.split("=")[1];
  const payment_type = paymentTypeArg.split("=")[1];
  const circuit_type = circuitTypeArg.split("=")[1];
  const intentHash = intentHashArg ? intentHashArg.split("=")[1] : "12345";
  const nonce = nonceArg ? nonceArg.split("=")[1] : null;

  const email_file_dir = email_file.substring(0, email_file.lastIndexOf("/") + 1);
  const outputFileName = outputFileNameArg ? outputFileNameArg.split("=")[1] : nonce ? `input_${payment_type}_${circuit_type}_${nonce}` : `input_${payment_type}_${circuit_type}`;
  const output_file_path = `${email_file_dir}/../inputs/${outputFileName}.json`;

  return { email_file, payment_type, circuit_type, intentHash, nonce, output_file_path };
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
  expected_sha?: string[];
  precomputed_sha?: string[];
  body_hash_idx?: string;
  venmo_payer_id_idx?: string;
  email_from_idx?: string | number;
  email_to_idx?: string | number;
  email_timestamp_idx?: string;
  venmo_payee_id_idx?: string;
  venmo_amount_idx?: string;
  venmo_actor_id_idx?: string;
  hdfc_payee_id_idx?: string;
  hdfc_amount_idx?: string;
  hdfc_payment_id_idx?: string;
  hdfc_acc_num_idx?: string;
  paylah_amount_idx?: string;
  paylah_payer_mobile_num_idx?: string;
  paylah_payee_name_idx?: string;
  paylah_payee_mobile_num_idx?: string;
  paylah_payment_id_idx?: string;
  garanti_payer_mobile_num_idx?: string;
  garanti_payee_acc_num_idx?: string;
  garanti_amount_idx?: string;
  email_date_idx?: string;
  intermediate_hash?: string[];
  in_body_suffix_padded?: string[];
  in_body_suffix_len_padded_bytes?: string;
  intent_hash?: string;

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
  EMAIL_VENMO_SEND = "venmo_send",
  EMAIL_VENMO_REGISTRATION = "venmo_registration",
  EMAIL_HDFC_SEND = "hdfc_send",
  EMAIL_HDFC_REGISTRATION = "hdfc_registration",
  EMAIL_PAYLAH_SEND = "paylah_send",
  EMAIL_PAYLAH_REGISTRATION = "paylah_registration",
  EMAIL_GARANTI_REGISTRATION = "garanti_registration",
  EMAIL_GARANTI_BODY_SUFFIX_HASHER = "garanti_body_suffix_hasher",
  EMAIL_GARANTI_SEND = "garanti_send",
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

function base64ToByteArray(base64Array) {
  const base64String = base64Array.map(base64Val => String.fromCharCode(parseInt(base64Val, 10))).join('');
  let binaryString = atob(base64String);
  let stringArray = new Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    stringArray[i] = binaryString.charCodeAt(i).toString();
  }

  return stringArray;
}

export async function getCircuitInputs(
  rsa_signature: BigInt,
  rsa_modulus: BigInt,
  message: Buffer,
  body: Buffer,
  body_hash: string,
  intent_hash: string,
  circuit: CircuitType
): Promise<{
  valid: {
    validSignatureFormat?: boolean;
    validMessage?: boolean;
  };
  circuitInputs: ICircuitInputs;
}> {
  console.log("Starting processing of inputs");

  let MAX_HEADER_PADDED_BYTES_FOR_EMAIL_TYPE = MAX_HEADER_PADDED_BYTES;
  let MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = MAX_BODY_PADDED_BYTES;
  let MAX_INTERMEDIATE_PADDING_LENGTH = MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE;
  let STRING_PRESELECTOR_FOR_EMAIL_TYPE = STRING_PRESELECTOR;
  let STRING_PRESELECTOR_FOR_EMAIL_TYPE_INTERMEDIATE = STRING_PRESELECTOR;

  // Update preselector string based on circuit type
  if (circuit === CircuitType.EMAIL_VENMO_SEND) {
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "<!-- recipient name -->";
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 6272;  // +320 (>280 limit for custom message)
    MAX_HEADER_PADDED_BYTES_FOR_EMAIL_TYPE = 768;
  } else if (circuit === CircuitType.EMAIL_VENMO_REGISTRATION) {
    // IMPORTANT: Only send payment email can be used to register
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "<!-- recipient name -->";
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 6272;  // +320 (>280 limit for custom message)
    MAX_HEADER_PADDED_BYTES_FOR_EMAIL_TYPE = 768;
  } else if (circuit == CircuitType.EMAIL_HDFC_SEND) {
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "td esd-text\"";
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 4352;  // 4096 is the max observed body length
  } else if (circuit == CircuitType.EMAIL_HDFC_REGISTRATION) {
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "td esd-text\"";
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 4352;  // 4096 is the max observed body length
  } else if (circuit == CircuitType.EMAIL_PAYLAH_SEND) {
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "ontenttable\" align=3D\"left\"><br />";
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 2240;  // 2240 is the max observed body length
  } else if (circuit == CircuitType.EMAIL_PAYLAH_REGISTRATION) {
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "ontenttable\" align=3D\"left\"><br />";
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 2240;  // 2240 is the max observed body length
  } else if (circuit == CircuitType.EMAIL_GARANTI_SEND) {
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "<p>G&ouml;nderen Bilgileri:<br>";
    MAX_HEADER_PADDED_BYTES_FOR_EMAIL_TYPE = 512;
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 13312;  // 13312 is the max observed body length
    STRING_PRESELECTOR_FOR_EMAIL_TYPE_INTERMEDIATE = "Para transferleri bilgilendirmeleri"; // Should be the same as hashing helper circuit
    MAX_INTERMEDIATE_PADDING_LENGTH = 2688; // For divided circuits, we calculate what the padded intermediate length should be
  } else if (circuit == CircuitType.EMAIL_GARANTI_REGISTRATION) {
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "<p>G&ouml;nderen Bilgileri:<br>";
    MAX_HEADER_PADDED_BYTES_FOR_EMAIL_TYPE = 512;
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 13312;  // 13312 is max observed body length
    STRING_PRESELECTOR_FOR_EMAIL_TYPE_INTERMEDIATE = "Para transferleri bilgilendirmeleri"; // Should be the same as hashing helper circuit
    MAX_INTERMEDIATE_PADDING_LENGTH = 2688; // For divided circuits, we calculate what the padded intermediate length should be
  } else if (circuit == CircuitType.EMAIL_GARANTI_BODY_SUFFIX_HASHER) {
    STRING_PRESELECTOR_FOR_EMAIL_TYPE = "Para transferleri bilgilendirmeleri";
    MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE = 10752;  // 10752 is estimated length plus padding from intermediate cutoff to end
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
  const [messagePadded, messagePaddedLen] = await sha256Pad(prehashBytesUnpadded, MAX_HEADER_PADDED_BYTES_FOR_EMAIL_TYPE);
  const [bodyPadded, bodyPaddedLen] = await sha256Pad(body, Math.max(MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE, calc_length));

  // Convet messagePadded to string to print the specific header data that is signed
  // console.log(JSON.stringify(message).toString());

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
  console.log(bodyRemainingLen, " bytes remaining in body");
  assert(bodyRemainingLen < MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE, "Invalid slice");
  assert(bodyRemaining.length % 64 === 0, "Not going to be padded correctly with int64s");
  bodyRemaining = padWithZero(bodyRemaining, MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE);
  assert(bodyRemaining.length === MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE, "Invalid slice");
  const bodyShaPrecompute = await partialSha(precomputeText, shaCutoffIndex);

  // Compute identity revealer
  let circuitInputs: ICircuitInputs;
  const modulus = toCircomBigIntBytes(modulusBigInt);
  const signature = toCircomBigIntBytes(signatureBigInt);

  const in_len_padded_bytes = messagePaddedLen.toString();
  const in_padded = await Uint8ArrayToCharArray(messagePadded); // Packed into 1 byte signals
  const in_body_len_padded_bytes = bodyRemainingLen.toString();
  const in_body_padded = await Uint8ArrayToCharArray(bodyRemaining);
  const base_message = toCircomBigIntBytes(postShaBigintUnpadded);
  const precomputed_sha = await Uint8ArrayToCharArray(bodyShaPrecompute);
  const body_hash_idx = bufferToString(message).indexOf(body_hash).toString();

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
  } else if (circuit === CircuitType.EMAIL_VENMO_SEND) {
    const payee_id_selector = Buffer.from("user_id=3D");
    const venmo_payee_id_idx = (Buffer.from(bodyRemaining).indexOf(payee_id_selector) + payee_id_selector.length).toString();
    const payer_id_selector = Buffer.from("actor_id=3D");
    const venmo_payer_id_idx = (Buffer.from(bodyRemaining).indexOf(payer_id_selector) + payer_id_selector.length).toString();
    const email_timestamp_idx = (raw_header.length - trimStrByStr(raw_header, "t=").length).toString();
    const venmo_amount_idx = (raw_header.length - trimStrByStr(email_subject, "$").length).toString();
    console.log("Indexes into for venmo send email are: ", email_from_idx, venmo_amount_idx, venmo_payee_id_idx, venmo_payer_id_idx, email_timestamp_idx);

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
      email_timestamp_idx,
      venmo_payee_id_idx,
      venmo_payer_id_idx,
      email_from_idx,
      // IDs
      intent_hash,
    };
  } else if (circuit == CircuitType.EMAIL_VENMO_REGISTRATION) {
    const actor_id_selector = Buffer.from('&actor_id=3D');
    const venmo_actor_id_idx = (Buffer.from(bodyRemaining).indexOf(actor_id_selector) + actor_id_selector.length).toString();
    console.log("Indexes into for venmo send email are: ", email_from_idx, venmo_actor_id_idx);

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
      venmo_actor_id_idx,
      email_from_idx,
    };
  } else if (circuit == CircuitType.EMAIL_HDFC_SEND) {

    const payee_id_selector = Buffer.from("to VPA ");
    const hdfc_payee_id_idx = (Buffer.from(bodyRemaining).indexOf(payee_id_selector) + payee_id_selector.length).toString();

    const hdfc_amount_selector = Buffer.from("Dear Customer,<br> <br> Rs.");
    const hdfc_amount_idx = (Buffer.from(bodyRemaining).indexOf(hdfc_amount_selector) + hdfc_amount_selector.length).toString();
    const bodyRemainingString = Buffer.from(bodyRemaining).toString();
    const paymentIdRegex = /is ([0-9]+).<br/;
    const match = bodyRemainingString.match(paymentIdRegex);
    const hdfc_payment_id_selector = Buffer.from(match ? match[0] : "NOT A MATCH");
    // NOTE: add 3 to skip "is " 
    const hdfc_payment_id_idx = (Buffer.from(bodyRemaining).indexOf(hdfc_payment_id_selector) + 3).toString();

    const email_date_idx = (raw_header.length - trimStrByStr(raw_header, "date:").length).toString();
    const email_to_idx = raw_header.length - trimStrByStr(raw_header, "to:").length;
    const hdfc_acc_num_idx = (Buffer.from(bodyRemaining).indexOf(Buffer.from("**")) + Buffer.from("**").length).toString();

    console.log("Indexes into for hdfc send email are: ", email_from_idx, hdfc_payee_id_idx, hdfc_amount_idx, email_date_idx, email_to_idx, hdfc_acc_num_idx, hdfc_payment_id_idx)

    circuitInputs = {
      in_padded,
      modulus,
      signature,
      in_len_padded_bytes,
      precomputed_sha,
      in_body_padded,
      in_body_len_padded_bytes,
      body_hash_idx,
      // hdfc specific indices
      hdfc_amount_idx,
      hdfc_payee_id_idx,
      email_date_idx,
      email_from_idx,
      email_to_idx,
      hdfc_acc_num_idx,
      hdfc_payment_id_idx,
      // IDs
      intent_hash,
    }
  } else if (circuit == CircuitType.EMAIL_HDFC_REGISTRATION) {
    const email_to_idx = raw_header.length - trimStrByStr(raw_header, "to:").length;
    const hdfc_acc_num_idx = (Buffer.from(bodyRemaining).indexOf(Buffer.from("**")) + Buffer.from("**").length).toString();

    console.log("Indexes into for hdfc registration email are: ", email_from_idx, email_to_idx, hdfc_acc_num_idx)

    circuitInputs = {
      in_padded,
      modulus,
      signature,
      in_len_padded_bytes,
      precomputed_sha,
      in_body_padded,
      in_body_len_padded_bytes,
      body_hash_idx,
      // hdfc specific indices
      email_from_idx,
      email_to_idx,
      hdfc_acc_num_idx
    }
  } else if (circuit == CircuitType.EMAIL_PAYLAH_SEND) {
    const paylah_amount_selector = Buffer.from("<td>SGD");
    const paylah_amount_idx = (Buffer.from(bodyRemaining).indexOf(paylah_amount_selector) + paylah_amount_selector.length).toString();

    const paylah_payer_mobile_num_selector = Buffer.from("<td>PayLah! Wallet (Mobile ending ");
    const paylah_payer_mobile_num_idx = (Buffer.from(bodyRemaining).indexOf(paylah_payer_mobile_num_selector) + paylah_payer_mobile_num_selector.length).toString();

    const paylah_payee_name_selector = Buffer.from("To:</td>\r\n<td>");
    const paylah_payee_name_idx = (Buffer.from(bodyRemaining).indexOf(paylah_payee_name_selector) + paylah_payee_name_selector.length).toString();

    const paylah_payee_mobile_num_selector = Buffer.from("Mobile ending ");
    const first_mobile_ending_idx = Buffer.from(bodyRemaining).indexOf(paylah_payee_mobile_num_selector) + paylah_payee_mobile_num_selector.length;
    const paylah_payee_mobile_num_idx = (Buffer.from(bodyRemaining).indexOf(paylah_payee_mobile_num_selector, first_mobile_ending_idx) + paylah_payee_mobile_num_selector.length).toString();

    const paylah_payment_id_selector = Buffer.from("Transaction Ref: ");
    const paylah_payment_id_idx = (Buffer.from(bodyRemaining).indexOf(paylah_payment_id_selector) + paylah_payment_id_selector.length).toString();

    const email_timestamp_idx = (raw_header.length - trimStrByStr(raw_header, "t=").length).toString();
    const email_to_idx = raw_header.length - trimStrByStr(raw_header, "to:").length;
    console.log({
      'email_from_idx': email_from_idx,
      'email_timestamp_idx': email_timestamp_idx,
      'email_to_idx': email_to_idx,
      'paylah_amount_idx': paylah_amount_idx,
      'paylah_payer_mobile_num_idx': paylah_payer_mobile_num_idx,
      'paylah_payee_name_idx': paylah_payee_name_idx,
      'paylah_payee_mobile_num_idx': paylah_payee_mobile_num_idx,
      'paylah_payment_id_idx': paylah_payment_id_idx
    })

    circuitInputs = {
      in_padded,
      modulus,
      signature,
      in_len_padded_bytes,
      precomputed_sha,
      in_body_padded,
      in_body_len_padded_bytes,
      body_hash_idx,
      // paylah specific indices
      paylah_amount_idx,
      paylah_payer_mobile_num_idx,
      paylah_payee_name_idx,
      paylah_payee_mobile_num_idx,
      paylah_payment_id_idx,
      email_from_idx,
      email_timestamp_idx,
      email_to_idx,
      // IDs
      intent_hash,
    }
  } else if (circuit == CircuitType.EMAIL_PAYLAH_REGISTRATION) {
    const paylah_payer_mobile_num_selector = Buffer.from("<td>PayLah! Wallet (Mobile ending ");
    const paylah_payer_mobile_num_idx = (Buffer.from(bodyRemaining).indexOf(paylah_payer_mobile_num_selector) + paylah_payer_mobile_num_selector.length).toString();

    const email_to_idx = raw_header.length - trimStrByStr(raw_header, "to:").length;
    console.log("Indexes into for paylah send email are: ", email_from_idx, email_to_idx, paylah_payer_mobile_num_idx)

    circuitInputs = {
      in_padded,
      modulus,
      signature,
      in_len_padded_bytes,
      precomputed_sha,
      in_body_padded,
      in_body_len_padded_bytes,
      body_hash_idx,
      // paylah specific indices
      paylah_payer_mobile_num_idx,
      email_from_idx,
      email_to_idx,
    }
  } else if (circuit == CircuitType.EMAIL_GARANTI_REGISTRATION) {
    // Calculate SHA end selector.
    const intermediateShaSelector = STRING_PRESELECTOR_FOR_EMAIL_TYPE_INTERMEDIATE.split("").map((char) => char.charCodeAt(0));
    let intermediateShaCutoffIndex = Math.floor((await findSelector(bodyRemaining, intermediateShaSelector)) / 64) * 64;
    let intermediateBodyText = bodyRemaining.slice(0, intermediateShaCutoffIndex);

    intermediateBodyText = padWithZero(intermediateBodyText, MAX_INTERMEDIATE_PADDING_LENGTH);
    const in_body_intermediate = await Uint8ArrayToCharArray(intermediateBodyText);

    const bodyIntermediateLen = MAX_INTERMEDIATE_PADDING_LENGTH - (MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE - bodyRemainingLen);
    const in_body_len_intermediate_bytes = bodyIntermediateLen.toString();
    console.log(bodyIntermediateLen, " bytes in intermediate body (to be hashed with precomputed and returned to contract)");

    // Regexes
    const garanti_payer_name_selector = Buffer.from("<p>G&ouml;nderen Bilgileri:<br>\r\n                    <strong>");
    const garanti_payer_name_idx = (Buffer.from(bodyRemaining).indexOf(garanti_payer_name_selector) + garanti_payer_name_selector.length).toString();

    // Index of mobile number is index of first </strong></p> after payer_name - 7 (length of mobile number)
    const garanti_payer_mobile_num_selector = Buffer.from("</strong></p>");
    const garanti_payer_mobile_num_idx = (Buffer.from(bodyRemaining).indexOf(garanti_payer_mobile_num_selector, Number(garanti_payer_name_idx)) - 7).toString();

    let email_from_idx = raw_header.length - trimStrByStr(trimStrByStr(raw_header, "From:"), "<").length;    // Capital F
    const email_to_idx = raw_header.length - trimStrByStr(raw_header, "To: ").length;    // Capital T
    console.log({
      'email_from_idx': email_from_idx,
      'email_to_idx': email_to_idx,
      'garanti_payer_name_idx': garanti_payer_name_idx,
      'garanti_payer_mobile_num_idx': garanti_payer_mobile_num_idx
    });

    circuitInputs = {
      in_padded,
      modulus,
      signature,
      in_len_padded_bytes,
      precomputed_sha,
      in_body_padded: in_body_intermediate,
      in_body_len_padded_bytes: in_body_len_intermediate_bytes,
      body_hash_idx,
      // garanti specific indices
      email_from_idx,
      email_to_idx,
      garanti_payer_mobile_num_idx
    }
  } else if (circuit == CircuitType.EMAIL_GARANTI_SEND) {
    // Calculate SHA end selector.
    const intermediateShaSelector = STRING_PRESELECTOR_FOR_EMAIL_TYPE_INTERMEDIATE.split("").map((char) => char.charCodeAt(0));
    let intermediateShaCutoffIndex = Math.floor((await findSelector(bodyRemaining, intermediateShaSelector)) / 64) * 64;
    let intermediateBodyText = bodyRemaining.slice(0, intermediateShaCutoffIndex);

    intermediateBodyText = padWithZero(intermediateBodyText, MAX_INTERMEDIATE_PADDING_LENGTH);
    const in_body_intermediate = await Uint8ArrayToCharArray(intermediateBodyText);

    const bodyIntermediateLen = MAX_INTERMEDIATE_PADDING_LENGTH - (MAX_BODY_PADDED_BYTES_FOR_EMAIL_TYPE - bodyRemainingLen);
    const in_body_len_intermediate_bytes = bodyIntermediateLen.toString();
    console.log(bodyIntermediateLen, " bytes in intermediate body (to be hashed with precomputed and returned to contract)");

    // Regexes
    const garanti_payer_name_selector = Buffer.from("<p>G&ouml;nderen Bilgileri:<br>\r\n                    <strong>");
    const garanti_payer_name_idx = (Buffer.from(bodyRemaining).indexOf(garanti_payer_name_selector) + garanti_payer_name_selector.length).toString();

    // Index of mobile number is index of first </strong></p> after payer_name - 7 (length of mobile number)
    const garanti_payer_mobile_num_selector = Buffer.from("</strong></p>");
    const garanti_payer_mobile_num_idx = (Buffer.from(bodyRemaining).indexOf(garanti_payer_mobile_num_selector, Number(garanti_payer_name_idx)) - 7).toString();

    const garanti_payee_acc_num_selector = Buffer.from("TR");
    const garanti_payee_acc_num_idx = Buffer.from(bodyRemaining).indexOf(garanti_payee_acc_num_selector).toString();

    const garanti_amount_selector = Buffer.from("<p>Tutar: <strong>");
    const garanti_amount_idx = (Buffer.from(bodyRemaining).indexOf(garanti_amount_selector) + garanti_amount_selector.length).toString();

    let email_from_idx = raw_header.length - trimStrByStr(trimStrByStr(raw_header, "From:"), "<").length;    // Capital F
    const email_to_idx = raw_header.length - trimStrByStr(raw_header, "To: ").length;    // Capital T
    // TODO: MIGHT NOT WORK ALWAYS!!
    const email_timestamp_idx = (raw_header.length - trimStrByStr(raw_header, "t=").length).toString();    // Look for the first occurence of t=

    console.log({
      'email_from_idx': email_from_idx,
      'email_to_idx': email_to_idx,
      'email_timestamp_idx': email_timestamp_idx,
      'garanti_payer_mobile_num_idx': garanti_payer_mobile_num_idx,
      'garanti_payee_acc_num_idx': garanti_payee_acc_num_idx,
      'garanti_amount_idx': garanti_amount_idx
    });

    circuitInputs = {
      in_padded,
      modulus,
      signature,
      in_len_padded_bytes,
      precomputed_sha,
      in_body_padded: in_body_intermediate,
      in_body_len_padded_bytes: in_body_len_intermediate_bytes,
      body_hash_idx,
      // garanti specific indices
      email_from_idx,
      email_to_idx,
      email_timestamp_idx,
      garanti_payer_mobile_num_idx,
      garanti_payee_acc_num_idx,
      garanti_amount_idx,
      // IDs
      intent_hash,
    }

  } else if (circuit == CircuitType.EMAIL_GARANTI_BODY_SUFFIX_HASHER) {
    const intermediate_hash = precomputed_sha;
    const in_body_suffix_padded = in_body_padded;
    const in_body_suffix_len_padded_bytes = in_body_len_padded_bytes;

    // console.log("decoded body hash: ", JSON.stringify(intermediate_hash));

    circuitInputs = {
      intermediate_hash,
      in_body_suffix_padded,
      in_body_suffix_len_padded_bytes,
    }
  }
  else {
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
  type: CircuitType,
  intent_hash: string,
  nonce_raw: number | string | null = null
): Promise<ICircuitInputs> {
  const nonce = typeof nonce_raw == "string" ? nonce_raw.trim() : nonce_raw;

  var result, email: Buffer;
  if (typeof raw_email === "string") {
    email = Buffer.from(raw_email);
  } else email = raw_email;
  // console.log(email.toString());
  const processed_email = preProcessEmail(email, type);
  console.log(processed_email.toString());
  console.log("DKIM verification starting");
  result = await dkimVerify(processed_email);
  // console.log("From:", result.headerFrom);
  console.log("Results:", result.results[0]);
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
  let fin_result = await getCircuitInputs(sig, modulus, message, body, body_hash, intent_hash, type);
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



function preProcessEmail(email: Buffer, type: CircuitType): Buffer {

  if (type === CircuitType.EMAIL_HDFC_REGISTRATION || type === CircuitType.EMAIL_HDFC_SEND) {
    console.log("Preprocessing HDFC email. Updating message-id with x-google-original-message-id");
    return Buffer.from(hdfcReplaceMessageIdWithXGoogleOriginalMessageId(email.toString()));
  }
  return email;
}

// Only called when the whole function is called from the command line, to read inputs
async function test_generate(writeToFile: boolean = true) {
  const args = await getArgs();
  console.log(`Generating inputs for ${args.payment_type} ${args.circuit_type} with email file ${args.email_file} and output file ${args.output_file_path}`)
  const email = fs.readFileSync(args.email_file.trim());
  console.log("Email file read");

  const type = `${args.payment_type}_${args.circuit_type}` as CircuitType;
  const gen_inputs = await generate_inputs(email, type, args.intentHash, args.nonce);
  console.log("Input generation successful");
  if (writeToFile) {
    fs.writeFileSync(args.output_file_path, JSON.stringify(gen_inputs), { flag: "w" });
  }
  return gen_inputs;
}

// If file called directly with `npx tsx generate_inputs.ts`
if (typeof require !== "undefined" && require.main === module) {
  test_generate(true);
}
