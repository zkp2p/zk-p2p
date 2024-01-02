import { hdfcReplaceMessageIdWithXGoogleOriginalMessageId } from '@zkp2p/circuits-circom/scripts/preprocess_input';


export function validateAndSanitizeHdfcEmailSubject(emailContent: string): { sanitizedEmail: string, didSanitize: boolean } {
  const subjectLinePattern = /^(Subject: ).*$/m;
  const subjectLineMatch = emailContent.match(subjectLinePattern);
  
  if (!subjectLineMatch) {
    throw new Error('No subject line found in the email content.');
  }
  
  const subjectLine = subjectLineMatch[0];

  const validationPattern = /^Subject: =\?UTF-8\?q\?=E2=9D=97_You_have_done_a_UPI_txn\._Check_details\!?=$/;
  const sanitizePattern = /^Subject: ❗ You have done a UPI txn. Check details!$/;

  const isValid = validationPattern.test(subjectLine);
  const needsSanitization = sanitizePattern.test(subjectLine);

  let sanitizedEmail = emailContent;
  if (needsSanitization) {
    const replacedMessageIdEmail = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(emailContent);

    sanitizedEmail = replacedMessageIdEmail.replace(subjectLinePattern, '$1=?UTF-8?q?=E2=9D=97_You_have_done_a_UPI_txn._Check_details!?=');
  } else if (!isValid) {
    throw new Error('The subject line is invalid and could not be sanitized.');
  }

  const didSanitize = sanitizedEmail !== emailContent;

  return {
    sanitizedEmail,
    didSanitize
  };
};
