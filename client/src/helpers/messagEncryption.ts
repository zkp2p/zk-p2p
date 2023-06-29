import * as crypto from 'crypto';
import EthCrypto from 'eth-crypto';


export const generateAccountFromSignature = (signature: string): string => {
  const hash = crypto.createHash('sha512');
  hash.update(signature);

  // console.log('Generated account hash from signature:');
  // console.log(hash.digest('hex'));

  return hash.digest('hex');
}

export const getPublicKeyFromAccount = (account: string): string => {
  const entropy = Buffer.from(account, 'utf-8');
  const identity = EthCrypto.createIdentity(entropy);

  // console.log('Generated identity:');
  // console.log(identity);

  return identity.publicKey;
}

export async function encryptMessage(message: string, publicKey: string) {
  const encrypted = await EthCrypto.encryptWithPublicKey(publicKey, message);
  const encryptedString = EthCrypto.cipher.stringify(encrypted);

  // console.log('Encrypted message:');
  // console.log(encrypted);

  return encryptedString;
}

export async function decryptMessageWithAccount(encrypted: string, account: string) {
  const entropy = Buffer.from(account, 'utf-8');
  const privateKey = EthCrypto.createIdentity(entropy).privateKey;

  const encryptedObject = EthCrypto.cipher.parse(encrypted);
  const decrypted = EthCrypto.decryptWithPrivateKey(privateKey, encryptedObject);

  // console.log('Decrypted message:');
  // console.log(decrypted);

  return decrypted;
}
