export function hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str: string) {

	// Replace Message-ID with X-Google-Original-Message-ID if Message-ID contains SMTPIN_ADDED_BROKEN@mx.google.com
	const messageIdLabel = "Message-ID: ";
	const xGoogleMessageIdLabel = "X-Google-Original-Message-ID: ";

	if (str.indexOf(messageIdLabel) == -1) {
		return str;
	}

	const messageIdStart = str.indexOf(messageIdLabel) + messageIdLabel.length;
	const messageIdEnd = str.indexOf("\n", messageIdStart);
	const messageId = str.substring(messageIdStart, messageIdEnd);

	console.log("Message ID:", messageId, "\n");

	if (
		messageId.includes("SMTPIN_ADDED_BROKEN@mx.google.com") ||
		messageId.includes("SMTPIN_ADDED_BROKEN@MX.GOOGLE.COM")
	) {
		const xMessageIdStart = str.indexOf
			(xGoogleMessageIdLabel) + xGoogleMessageIdLabel.length;
		const xMessageIdEnd = str.indexOf("\n", xMessageIdStart);
		const xMessageId = str.substring(xMessageIdStart, xMessageIdEnd);

		console.log("X-Google-Original-Message-ID:", xMessageId, "\n");
		return str.replace(messageId, xMessageId);
	}

	return str;
}