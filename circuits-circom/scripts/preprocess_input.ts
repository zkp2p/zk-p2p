export function hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str) {

	// Replace Message-ID with X-Google-Original-Message-ID if Message-ID contains SMTPIN_ADDED_BROKEN@mx.google.com
	const messageIdLabel = "Message-ID: <";
	const xGoogleMessageIdLabel = "X-Google-Original-Message-ID: ";

	const messageIdStart = str.indexOf(messageIdLabel) + messageIdLabel.length;
	const messageIdEnd = str.indexOf(">", messageIdStart);
	const messageId = str.substring(messageIdStart, messageIdEnd);
	console.log("Message ID: ", messageId, "\n");

	if (messageId.includes("SMTPIN_ADDED_BROKEN@mx.google.com")) {
		const xMessageIdStart = str.indexOf(xGoogleMessageIdLabel) + xGoogleMessageIdLabel.length;
		const xMessageIdEnd = str.indexOf(".com", xMessageIdStart) + ".com".length;
		const xMessageId = str.substring(xMessageIdStart, xMessageIdEnd);

		console.log("X-Google-Original-Message-ID: ", xMessageId, "\n");

		// Replace "<message-id>" with "x-message-id"
		return str.replace("<" + messageId + ">", xMessageId);
	}

	return str;
}