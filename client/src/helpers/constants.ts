// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
export const ZERO = BigInt(0);
export const SECONDS_IN_DAY = BigInt(86400);

export const MAX_USDC_TRANSFER_SIZE_VENMO = 500000000n; // 500 USD
export const MAX_USDC_TRANSFER_SIZE_HDFC = 100000000n; // 100 USD
export const MAX_USDC_TRANSFER_SIZE_GARANTI = 100000000n; // 100 USD

export const DEPOSIT_REFETCH_INTERVAL = 20000; // 0.3 minutes
export const STATE_REFETCH_INTERVAL = 60000; // 1 minute
// export const DEPOSIT_REFETCH_INTERVAL = 2000000; // 30 minutes
// export const STATE_REFETCH_INTERVAL = 6000000; // 100 minute

export const VENMO_EMAIL_FILTER = `from:venmo@venmo.com subject:"You paid" after:2024/01/10`;
export const HDFC_EMAIL_FULTER = `from:alerts@hdfcbank.net subject:"❗ You have done a UPI txn. Check details!" after:2023/09/01`;
export const GARANTI_EMAIL_FULTER = `from:garanti@info.garantibbva.com.tr subject:"Para Transferi Bilgilendirmesi" after:2023/09/01`;

export const PRECISION = BigInt(1_000_000_000_000_000_000); // 18
export const USDC_UNITS = BigInt(1_000_000); // 6
export const PENNY_IN_USDC_UNITS = BigInt(10_000); // 6

export const EMPTY_STRING = '';

export const SOCKET_QUOTE_DEFAULT_ADDRESS = '0x18Cc6F90512C6D95ACA0d57F98C727D61873c06a';
export const SOCKET_DEFAULT_SOL_ADDRESS = '8pHKRNF3u8tndkUJ4euAddNWM9EAMWbUiK5GVmtaGY5U';
export const QUOTE_FETCHING_DEBOUNCE_MS = 750;

// the numeric form of the payload1 passed into the primitive
// corresponds to the openssh signature produced by the following command:
// echo "E PLURIBUS UNUM; DO NOT SHARE" | ssh-keygen -Y sign -n double-blind.xyz -f ~/.ssh/id_rsa | pbcopy
export const MAGIC_DOUBLE_BLIND_BASE_MESSAGE =
    14447023197094784173331616578829287000074783130802912942914027114823662617007553911501158244718575362051758829289159984830457466395841150324770159971462582912755545324694933673046215187947905307019469n;
// Length in bits
export const MAGIC_DOUBLE_BLIND_BASE_MESSAGE_LEN = 672;

export const CIRCOM_FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
export const MAX_HEADER_PADDED_BYTES = 1024; // NOTE: this must be the same as the first arg in the email in main args circom
export const MAX_BODY_PADDED_BYTES = 6400; // NOTE: this must be the same as the arg to sha the remainder number of bytes in the email in main args circom


export const CLIENT_VERSION = '0.2.5';

// circom constants from main.circom / https://zkrepl.dev/?gist=30d21c7a7285b1b14f608325f172417b
// template RSAGroupSigVerify(n, k, levels) {
// component main { public [ modulus ] } = RSAVerify(121, 17);
// component main { public [ root, payload1 ] } = RSAGroupSigVerify(121, 17, 30);
export const CIRCOM_BIGINT_N = 121;
export const CIRCOM_BIGINT_K = 17;
export const CIRCOM_LEVELS = 30;


// This is the string that comes right before the target string in the email. Ideally as close to the end of the email as possible.
export const STRING_PRESELECTOR = "<!-- recipient name -->";


// Misc smart contract values
export const UINT256_MAX = "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const CALLER_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
export const DEFAULT_NETWORK = "base";


// Proving key paths
export const HOSTED_FILES_PATH = "https://s3.amazonaws.com/zk-p2p/v2/v0.0.10/";
export const REGISTRATION_KEY_FILE_NAME = "venmo_registration/venmo_registration";
export const SEND_KEY_FILE_NAME = "venmo_send/venmo_send";

export const RemoteProofGenEmailTypes = {
    REGISTRATION: "registration",
    SEND: "send",
};

const ENABLE_STATE_LOGGING = false;
export const esl = ENABLE_STATE_LOGGING;
