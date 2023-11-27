export function replaceMessageIdWithXGoogleOriginalMessageId(str) {
	const messageIdLabel = "Message-ID: <";
	const xGoogleMessageIdLabel = "X-Google-Original-Message-ID: ";

	const messageIdStart = str.indexOf(messageIdLabel) + messageIdLabel.length;
	const messageIdEnd = str.indexOf(">", messageIdStart);
	const messageId = str.substring(messageIdStart, messageIdEnd);

	console.log("Message ID: ", messageId);

	const xMessageIdStart = str.indexOf(xGoogleMessageIdLabel) + xGoogleMessageIdLabel.length;
	const xMessageIdEnd = str.indexOf("\r", xMessageIdStart);
	const xMessageId = str.substring(xMessageIdStart, xMessageIdEnd);

	console.log("X-Google-Original-Message-ID: ", xMessageId);

	// Replace "<message-id>" with "x-message-id"
	return str.replace("<" + messageId + ">", xMessageId);
}