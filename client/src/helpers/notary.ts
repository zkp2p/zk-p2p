export const NOTARY_VERIFICATION_SIGNING_KEY = process.env.NOTARY_VERIFICATION_SIGNING_KEY;
if (!NOTARY_VERIFICATION_SIGNING_KEY) {
    throw new Error("NOTARY_VERIFICATION_SIGNING_KEY environment variable is not defined.");
};

export const NOTARY_VERIFICATION_ENDPOINT = process.env.NOTARY_VERIFICATION_ENDPOINT;
if (!NOTARY_VERIFICATION_ENDPOINT) {
    throw new Error("NOTARY_VERIFICATION_ENDPOINT environment variable is not defined.");
};

export const NOTARY_VERIFICATION_HOST = process.env.NOTARY_VERIFICATION_HOST;
if (!NOTARY_VERIFICATION_HOST) {
    throw new Error("NOTARY_VERIFICATION_HOST environment variable is not defined.");
};
