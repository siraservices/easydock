import { Resend } from 'resend';
import BookingCreatedEmail from '@/emails/booking-created';
import BookingApprovedEmail from '@/emails/booking-approved';
import BookingDeniedEmail from '@/emails/booking-denied';
import BookingCancelledEmail from '@/emails/booking-cancelled';

// Lazy initialization — Resend throws if API key is missing at constructor time,
// so we instantiate only when actually sending (not at module load).
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export interface BookingEmailParams {
  bookingId: string;
  marinaName: string;
  slipName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  boatOwnerEmail: string;
  marinaOwnerEmail: string;
}

type BookingTrigger = 'created' | 'approved' | 'denied' | 'cancelled';

function getSubject(trigger: BookingTrigger, marinaName: string): string {
  switch (trigger) {
    case 'created':
      return `New booking at ${marinaName}`;
    case 'approved':
      return `Booking approved — ${marinaName}`;
    case 'denied':
      return `Booking update — ${marinaName}`;
    case 'cancelled':
      return `Booking cancelled — ${marinaName}`;
  }
}

function getRecipients(trigger: BookingTrigger, params: BookingEmailParams): string[] {
  switch (trigger) {
    case 'created':
      return [params.boatOwnerEmail, params.marinaOwnerEmail];
    case 'approved':
      return [params.boatOwnerEmail];
    case 'denied':
      return [params.boatOwnerEmail];
    case 'cancelled':
      return [params.boatOwnerEmail, params.marinaOwnerEmail];
  }
}

function getTemplate(trigger: BookingTrigger, params: BookingEmailParams) {
  switch (trigger) {
    case 'created':
      return BookingCreatedEmail(params);
    case 'approved':
      return BookingApprovedEmail(params);
    case 'denied':
      return BookingDeniedEmail(params);
    case 'cancelled':
      return BookingCancelledEmail(params);
  }
}

/**
 * Sends a booking email notification. Non-fatal — catches all errors and logs them.
 * Email failure must never block the API response.
 */
export async function sendBookingEmail(
  trigger: BookingTrigger,
  params: BookingEmailParams
): Promise<void> {
  try {
    const recipients = getRecipients(trigger, params);
    const subject = getSubject(trigger, params.marinaName);
    const react = getTemplate(trigger, params);

    const { error } = await getResend().emails.send({
      from: 'EasyDock <bookings@easydock.com>',
      to: recipients,
      subject,
      react,
    });

    if (error) {
      console.error('Resend email error:', error);
    }
  } catch (err) {
    console.error('sendBookingEmail failed:', err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = any;

interface BookingWithRelations {
  id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  boat_owner_id: string;
  slips: {
    name: string;
    marinas: {
      id: string;
      name: string;
      owner_id: string;
    };
  };
}

/**
 * Fetches all data needed to send a booking email using the admin client
 * (bypasses RLS to read cross-user profile emails).
 */
export async function fetchBookingEmailParams(
  adminClient: AdminClient,
  bookingId: string
): Promise<BookingEmailParams> {
  // Fetch booking with slip and marina details
  const { data: booking, error: bookingError } = await adminClient
    .from('bookings')
    .select('id, check_in, check_out, total_price, boat_owner_id, slips(name, marinas(id, name, owner_id))')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    throw new Error(`Failed to fetch booking ${bookingId}: ${bookingError?.message}`);
  }

  const b = booking as BookingWithRelations;
  const marinaOwnerId = b.slips.marinas.owner_id;

  // Fetch both parties' emails from profiles
  const [boatOwnerResult, marinaOwnerResult] = await Promise.all([
    adminClient
      .from('profiles')
      .select('email')
      .eq('id', b.boat_owner_id)
      .single(),
    adminClient
      .from('profiles')
      .select('email')
      .eq('id', marinaOwnerId)
      .single(),
  ]);

  const boatOwnerEmail: string = boatOwnerResult.data?.email ?? '';
  const marinaOwnerEmail: string = marinaOwnerResult.data?.email ?? '';

  return {
    bookingId: b.id,
    marinaName: b.slips.marinas.name,
    slipName: b.slips.name,
    checkIn: b.check_in,
    checkOut: b.check_out,
    totalPrice: b.total_price,
    boatOwnerEmail,
    marinaOwnerEmail,
  };
}
