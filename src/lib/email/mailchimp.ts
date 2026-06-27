import { createHash } from 'crypto';

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY ?? '';
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID ?? '';
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX ?? 'us1';

function subscriberHash(email: string): string {
  return createHash('md5').update(email.toLowerCase()).digest('hex');
}

/**
 * Subscribe (or update) a lead in Mailchimp.
 * Tags are applied by user_type so welcome automations can branch.
 * Non-fatal — call sites should not await the result critically.
 */
export async function subscribeToMailchimp(
  email: string,
  firstName: string,
  userType: 'yacht_owner' | 'marina_owner'
): Promise<void> {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    // Not configured — skip silently (dev/test environment)
    return;
  }

  const hash = subscriberHash(email);
  const tag = userType === 'yacht_owner' ? 'Yacht Owner' : 'Marina Owner';

  const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${hash}`;

  const body = {
    email_address: email.toLowerCase(),
    status_if_new: 'subscribed',
    merge_fields: {
      FNAME: firstName,
    },
    tags: [tag, 'Lead'],
  };

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Mailchimp subscribe error:', err);
    }
  } catch (err) {
    console.error('subscribeToMailchimp failed:', err);
  }
}
