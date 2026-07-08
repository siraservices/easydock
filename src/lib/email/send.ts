import { Resend } from 'resend';
import BookingCreatedEmail from '@/emails/booking-created';
import BookingApprovedEmail from '@/emails/booking-approved';
import BookingDeniedEmail from '@/emails/booking-denied';
import BookingCancelledEmail from '@/emails/booking-cancelled';
import BookingConfirmedEmail from '@/emails/booking-confirmed';
import LeadConfirmationEmail from '@/emails/lead-confirmation';
import MarinaLeadConfirmation from '@/emails/marina-lead-confirmation';
import MarinaActivationNudge from '@/emails/marina-activation-nudge';
import LeadAdminNotification from '@/emails/lead-admin-notification';
import CalculatorLeadAdminNotification from '@/emails/calculator-lead-admin-notification';

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

type BookingTrigger = 'created' | 'approved' | 'denied' | 'cancelled' | 'confirmed';

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
    case 'confirmed':
      return `Payment confirmed — ${marinaName}`;
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
    case 'confirmed':
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
    case 'confirmed':
      return BookingConfirmedEmail(params);
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

/**
 * Sends a confirmation email to a new lead. Non-fatal — catches all errors.
 */
export async function sendLeadConfirmationEmail(
  toEmail: string,
  name: string,
  userType: 'yacht_owner' | 'marina_owner'
): Promise<void> {
  try {
    const subject = userType === 'yacht_owner'
      ? 'We\'re on it — EasyDock'
      : 'Thanks for your interest in EasyDock';

    const { error } = await getResend().emails.send({
      from: 'EasyDock <hello@easydock.co>',
      to: [toEmail],
      subject,
      react: LeadConfirmationEmail({ name, userType }),
    });

    if (error) {
      console.error('Resend lead email error:', error);
    }
  } catch (err) {
    console.error('sendLeadConfirmationEmail failed:', err);
  }
}

export interface MarinaLeadEmailParams {
  requesterName: string;
  requesterEmail: string;
  marinaName: string;
  marinaCity: string;
  marinaState: string;
  marinaPhone?: string | null;
  marinaWebsite?: string | null;
  checkIn?: string;
  checkOut?: string;
  vesselLengthFt?: number;
  message?: string;
}

const ADMIN_EMAIL = 'aira4development@gmail.com';

/**
 * Sends boat owner confirmation + admin activation nudge for an unclaimed marina lead.
 * Non-fatal — email failures never block the API response.
 */
export async function sendMarinaLeadEmails(params: MarinaLeadEmailParams): Promise<void> {
  try {
    await Promise.all([
      getResend().emails.send({
        from: 'EasyDock <hello@easydock.co>',
        to: [params.requesterEmail],
        subject: `Your spot request at ${params.marinaName} — EasyDock`,
        react: MarinaLeadConfirmation({
          name: params.requesterName,
          marinaName: params.marinaName,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
        }),
      }),
      getResend().emails.send({
        from: 'EasyDock Leads <leads@easydock.co>',
        to: [ADMIN_EMAIL],
        subject: `New lead: ${params.marinaName} (unclaimed)`,
        react: MarinaActivationNudge(params),
      }),
    ]);
  } catch (err) {
    console.error('sendMarinaLeadEmails failed:', err);
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

const ADMIN_NOTIFY_EMAIL = 'aira4development@gmail.com';

export interface LeadAdminNotificationParams {
  name: string;
  email: string;
  userType: 'yacht_owner' | 'marina_owner';
  phone?: string | null;
  boatLength?: string | null;
  preferredArea?: string | null;
}

/**
 * Sends admin notification when someone submits the landing page interest form.
 * Non-fatal — email failure must never block the API response.
 */
export async function sendLeadAdminNotification(params: LeadAdminNotificationParams): Promise<void> {
  try {
    const { error } = await getResend().emails.send({
      from: 'EasyDock Leads <leads@easydock.co>',
      to: [ADMIN_NOTIFY_EMAIL],
      subject: `New ${params.userType === 'marina_owner' ? 'marina owner' : 'boat owner'} lead — ${params.name}`,
      react: LeadAdminNotification(params),
    });
    if (error) {
      console.error('sendLeadAdminNotification Resend error:', error);
    }
  } catch (err) {
    console.error('sendLeadAdminNotification failed:', err);
  }
}

export interface CalculatorLeadAdminNotificationParams {
  email: string;
  phone?: string | null;
  role?: string | null;
  marinaName?: string | null;
  region?: string | null;
  totalSlips?: number | null;
  vacantSlips?: number | null;
  avgMonthlyRate?: number | null;
  annualLoss?: number | null;
}

/**
 * Sends admin notification when someone submits the revenue calculator lead form.
 * Non-fatal — email failure must never block the API response.
 */
export async function sendCalculatorLeadAdminNotification(
  params: CalculatorLeadAdminNotificationParams
): Promise<void> {
  try {
    const loss = params.annualLoss != null ? ` — $${params.annualLoss.toLocaleString()}/yr loss` : '';
    const marina = params.marinaName ? ` (${params.marinaName})` : '';
    const { error } = await getResend().emails.send({
      from: 'EasyDock Leads <leads@easydock.co>',
      to: [ADMIN_NOTIFY_EMAIL],
      subject: `New calculator lead${marina}${loss}`,
      react: CalculatorLeadAdminNotification(params),
    });
    if (error) {
      console.error('sendCalculatorLeadAdminNotification Resend error:', error);
    }
  } catch (err) {
    console.error('sendCalculatorLeadAdminNotification failed:', err);
  }
}
