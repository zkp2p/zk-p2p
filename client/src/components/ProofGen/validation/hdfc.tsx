import { dkimVerify } from '@helpers/dkim';
import { hdfcReplaceMessageIdWithXGoogleOriginalMessageId } from '@zkp2p/circuits-circom-helpers/preprocess';


const HDFC_DOMAIN_KEYS = process.env.HDFC_DOMAIN_KEYS;
if (!HDFC_DOMAIN_KEYS) {
  throw new Error("HDFC_DOMAIN_KEYS environment variable is not defined.");
}

export const validateDKIMSignature = async (raw_email: string) => {
  var email: Buffer;
  if (typeof raw_email === "string") {
    email = Buffer.from(raw_email);
  } else email = raw_email;

  const keys = HDFC_DOMAIN_KEYS.split(',');
  let lastError: Error | null = null;

  for (const key of keys) {
    try {
      const result = await dkimVerify(email, { key: key });

      if (!result.results[0]) {
        throw new Error(`No result found on dkim output ${result}`);
      }

      if (!result.results[0].publicKey) {
        if (result.results[0].status.message) {
          throw new Error(result.results[0].status.message);
        } else {
          throw new Error(`No public key found on generate_inputs result ${JSON.stringify(result)}`);
        }
      }

      const { status } = result.results[0];
      if (status.result === "pass") {
        return result;
      }

      lastError = new Error(`DKIM verification failed with message: ${status.comment}`);
    } catch (error: any) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }
};

export function sanitizeAndProcessHdfcEmailSubject(emailContent: string): { processedEmail: string, didSanitize: boolean } {
  const subjectLinePattern = /^(Subject: ).*$/m;
  const subjectLineMatch = emailContent.match(subjectLinePattern);
  
  if (!subjectLineMatch) {
    throw new Error('No subject line found in the email content.');
  }
  
  const subjectLine = subjectLineMatch[0];

  const validationPattern = /^Subject: =\?UTF-8\?q\?=E2=9D=97_You_have_done_a_UPI_txn\._Check_details!\?=/;
  const sanitizePattern = /^Subject: ❗ You have done a UPI txn. Check details!$/;

  const isValid = validationPattern.test(subjectLine);
  const needsSanitization = sanitizePattern.test(subjectLine);

  let processedEmail = emailContent;
  if (needsSanitization) {
    processedEmail = sanitizeHdfcPasteEmail(emailContent);
  } else if (!isValid) {
    throw new Error('The subject line is invalid and could not be sanitized.');
  }

  // Update Google Original Message ID
  const preProcessedEmail = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(processedEmail);

  const didSanitize = preProcessedEmail !== emailContent;

  return {
    processedEmail: preProcessedEmail,
    didSanitize
  };
};

function sanitizeHdfcPasteEmail(emailContent: string): string {
  // Update Subject Line
  const subjectLinePattern = /^(Subject: ).*$/m;
  const subjectSanitizedEmail = emailContent.replace(subjectLinePattern, '$1=?UTF-8?q?=E2=9D=97_You_have_done_a_UPI_txn._Check_details!?=');

  // Update First Tab encoding occurrence
  const firstTabEncodedPattern = `=09=09=09  <tr>`;
  const tabEncodedSanitizedEmail = subjectSanitizedEmail.replace(firstTabEncodedPattern,'\t\t\t  <tr>');

  // Update Second Tab encoding occurrence
  const secondTabEncodedPattern = /=09=09=09=09=09=09=09=09=09=09=09=09=09=09=09<tr>/g; // multiple occurrences
  const secondTabEncodedSanitizedEmail = tabEncodedSanitizedEmail.replace(secondTabEncodedPattern, '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<tr>');

  // Update Third Tab encoding occurrence
  const thirdTabEncodedPattern = `=09=09=09=09=09=09=09=09=09=09=09=09=09=09=09`;
  const thirdTabEncodedSanitizedEmail = secondTabEncodedSanitizedEmail.replace(thirdTabEncodedPattern, '\t\t\t\t\t\t\t\t\t\t\t\t\t\t=09');

  // Update Fourth Tab encoding occurrence
  const fourthTabEncodingPattern = `=09=09=09 =20`;
  const fourthTabEncodedSanitizedEmail = thirdTabEncodedSanitizedEmail.replace(fourthTabEncodingPattern, '\t\t\t =20');

  return fourthTabEncodedSanitizedEmail;
};
