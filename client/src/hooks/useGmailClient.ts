/*
 * users.getProfile
 */

export async function fetchProfile(
  accessToken: string, 
): Promise<string> {
  const url = `https://www.googleapis.com/gmail/v1/users/me/profile`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Emails:', data);

    return data.emailAddress;
  } else {
    console.error('Failed to fetch emails:', response);

    throw new Error('Failed to fetch emails');
  }
}

/*
 * messages.list
 */

export type GmailMessagesListResponse = {
  messages: Array<{
    id: string;
    threadId: string;
  }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
};

export async function fetchVenmoEmailList(
  accessToken: string, 
  queryParams: any
): Promise<GmailMessagesListResponse> {
  const defaultParams = {
    maxResults: 3,
    pageToken: 0,
  };

  const finalQueryParams = { ...defaultParams, ...queryParams };
  const queryString = new URLSearchParams(finalQueryParams).toString();
  const url = `https://www.googleapis.com/gmail/v1/users/me/messages?${queryString}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    const data: GmailMessagesListResponse = await response.json();
    console.log('Emails:', data);
    return data;
  } else {
    console.error('Failed to fetch emails:', response);
    throw new Error('Failed to fetch emails');
  }
}

/*
 * messages.get
 */

export type RawEmailResponse = {
  subject: string;
  internalDate: string;
  decodedContents: string;
};

export async function fetchEmailsRaw(
  accessToken: string,
  messageIds: string[]
): Promise<RawEmailResponse[]> {
  try {
    const fetchPromises = messageIds.map(messageId => {
      const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=raw`;

      return fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch email with ID: ${messageId}`);
        }

        return response.json();
      })
      .then(data => {
        let rawBase64 = data.raw
          .replace(/-/g, '+')
          .replace(/_/g, '/');

        while (rawBase64.length % 4) {
          rawBase64 += '=';
        }

        const decodedContents = atob(rawBase64);

        const subject = decodedContents.match(/Subject: (.*)/)?.[1] || 'No Subject';

        return {
          subject,
          internalDate: data.internalDate,
          decodedContents
        };
      }) as Promise<RawEmailResponse>;
    });

    const results = await Promise.all(fetchPromises);

    console.log('Decoded Emails:', results);

    return results;
  } catch (error) {
    console.error('Error fetching emails:', error);
    
    throw new Error('Error fetching emails');
  }
};
