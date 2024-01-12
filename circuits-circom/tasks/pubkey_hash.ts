import { resolveTxt } from 'dns';
import { promisify } from 'util';
import { buildMimcSponge } from "circomlibjs";
import {
    toCircomBigIntBytes,
} from "@zk-email/helpers/src/binaryFormat";
import forge from 'node-forge';


let mimcHasher: any;
export async function initializeMimcHasher() {
    if (!mimcHasher) {
        mimcHasher = await buildMimcSponge();
    }
}


const resolveTxtAsync = promisify(resolveTxt);

// Fetches the DKIM public key from DNS
export async function fetchDnsTxtRecord(domain: string, selector: string): Promise<string[]> {
    const queryDomain = `${selector}._domainkey.${domain}`;
    try {
        const records = await resolveTxtAsync(queryDomain);
        return records.flat();
    } catch (error) {
        console.error(`Error fetching DNS TXT record for ${queryDomain}:`, error);
        throw error;
    }
}

// Extract modulus from DKIM public key
export const extractModulus = (publicKey: string): string[] => {
    const certMatch = publicKey.match(/p=([0-9A-Za-z/+]+=*)/);

    if (!certMatch) {
        throw new Error('Failed to extract modulus from DKIM public key');
    }

    // Decode base64 encoded cert
    const decodedCert = Buffer.from(certMatch[1], 'base64').toString('binary');

    // Parse the ASN.1 structure
    const asn1 = forge.asn1.fromDer(decodedCert);
    const rsaPublicKey = forge.pki.publicKeyFromAsn1(asn1);

    // Extract modulus as a BigInt
    const modulusBigInt = BigInt(`0x${rsaPublicKey.n.toString(16)}`);
    console.log('Modulus:', modulusBigInt.toString());

    // Convert to the desired format
    const modulusInt = toCircomBigIntBytes(modulusBigInt);
    return modulusInt;
}

export const mimcSponge = (arr: (number | bigint | string)[]): string =>
    mimcHasher.F.toString(mimcHasher.multiHash(arr, "123", "1"));



// If file called directly with `npx tsx pubkey_hash.ts`
if (typeof require !== "undefined" && require.main === module) {
    const fetch = process.argv[2]
    let domainKey;

    initializeMimcHasher().then(() => {
        if (fetch == '1') {
            const domain = process.argv[3]
            const selector = process.argv[4]

            console.log("Fetching domain key:", domain, selector)
            fetchDnsTxtRecord(domain, selector)
                .then(_domainKey => {
                    domainKey = _domainKey[0];
                    console.log("Fetched domain key:", domainKey);

                    const modulus = extractModulus(domainKey);
                    console.log("Modulus:", modulus);
                    console.log("Modulus Hash:", mimcSponge(modulus));
                })
                .catch(error => console.error('Failed to fetch domain key:', error));
        } else {
            console.log("Using domain key:", process.argv[3]);
            domainKey = process.argv[3];

            const modulus = extractModulus(domainKey);
            console.log("Modulus:", modulus);
            console.log("Modulus Hash:", mimcSponge(modulus));
        }
    }).catch((err) => {
        console.log('Failed to initialize hasher', err);
    });
}