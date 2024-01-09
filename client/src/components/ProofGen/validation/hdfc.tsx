import { hdfcReplaceMessageIdWithXGoogleOriginalMessageId } from '@zkp2p/circuits-circom/scripts/preprocess_input';


export function validateAndSanitizeHdfcEmailSubject(emailContent: string): { sanitizedEmail: string, didSanitize: boolean } {
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

  let sanitizedEmail = emailContent;
  if (needsSanitization) {
    sanitizedEmail = sanitizeHdfcPasteEmail(emailContent);
  } else if (!isValid) {
    throw new Error('The subject line is invalid and could not be sanitized.');
  }

  const didSanitize = sanitizedEmail !== emailContent;

  return {
    sanitizedEmail,
    didSanitize
  };
};

function sanitizeHdfcPasteEmail(emailContent: string): string {
  // Update Google Original Message ID
  const replacedMessageIdEmail = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(emailContent);
  
  // Update Subject Line
  const subjectLinePattern = /^(Subject: ).*$/m;
  const subjectSanitizedEmail = replacedMessageIdEmail.replace(subjectLinePattern, '$1=?UTF-8?q?=E2=9D=97_You_have_done_a_UPI_txn._Check_details!?=');

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
