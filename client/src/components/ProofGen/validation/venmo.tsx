import { dkimVerify } from '@helpers/dkim';


const VENMO_DOMAIN_KEYS = process.env.VENMO_DOMAIN_KEYS;
if (!VENMO_DOMAIN_KEYS) {
  throw new Error("VENMO_DOMAIN_KEYS environment variable is not defined.");
}

export const validateDKIMSignature = async (raw_email: string) => {
  var email: Buffer;
  if (typeof raw_email === "string") {
    email = Buffer.from(raw_email);
  } else email = raw_email;

  const keys = VENMO_DOMAIN_KEYS.split(',');
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

export function validateEmailDomainKey(emailContent: string) {
  const regexPattern = /Date:.*\d{1,2}\s+\w{3}\s+(\d{4})\s+/;

  const match = emailContent.match(regexPattern);
  if (!match) {
    throw new Error("Year not found in the email content.");
  }

  const year = match[1];
  return { emailRaw: year };
};

export function validateAndSanitizeEmailSubject(emailContent: string): { sanitizedEmail: string, didSanitize: boolean } {
  const subjectLinePattern = /^Subject:.*$/m;
  const subjectLineMatch = emailContent.match(subjectLinePattern);
  
  if (!subjectLineMatch) {
    throw new Error('No subject line found in the email content.');
  }
  
  const subjectLine = subjectLineMatch[0];

  const validationPattern = /^Subject:\s*You paid.*\$\d{1,3}(,\d{3})*(\.\d{0,2})?$/;
  const sanitizePattern = /^(Subject:)\s*(.*?)(You paid.*\$\d{1,3}(,\d{3})*(\.\d{0,2})?)$/;

  const isValid = validationPattern.test(subjectLine);
  const needsSanitization = sanitizePattern.test(subjectLine);

  let sanitizedEmail = emailContent;
  if (needsSanitization) {
    sanitizedEmail = emailContent.replace(subjectLinePattern, subjectLine.replace(sanitizePattern, '$1 $3'));
  } else if (!isValid) {
    throw new Error('The subject line is invalid and could not be sanitized.');
  }

  const didSanitize = sanitizedEmail !== emailContent;

  return {
    sanitizedEmail,
    didSanitize
  };
};
