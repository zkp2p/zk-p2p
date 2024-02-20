import { dkimVerify } from '@helpers/dkim';


const GARANTI_DOMAIN_KEYS = process.env.GARANTI_DOMAIN_KEYS;
if (!GARANTI_DOMAIN_KEYS) {
  throw new Error("GARANTI_DOMAIN_KEYS environment variable is not defined.");
}

export const validateDKIMSignature = async (raw_email: string) => {
  var email: Buffer;
  if (typeof raw_email === "string") {
    email = Buffer.from(raw_email);
  } else email = raw_email;

  const keys = GARANTI_DOMAIN_KEYS.split(',');
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

export function sanitizeAndProcessGarantiEmailSubject(emailContent: string): { processedEmail: string, didSanitize: boolean } {
  const subjectLinePattern = /^(Subject: ).*$/m;
  const subjectLineMatch = emailContent.match(subjectLinePattern);

  if (!subjectLineMatch) {
    throw new Error('No subject line found in the email content.');
  }

  const subjectLine = subjectLineMatch[0];

  const validationPattern = /^Subject: Para Transferi Bilgilendirmesi$/;

  const isValid = validationPattern.test(subjectLine);

  let processedEmail = emailContent;
  if (!isValid) {
    console.log("error here 70");
    throw new Error('The subject line is invalid and could not be sanitized.');
  }

  return {
    processedEmail,
    didSanitize: false
  };
};
