import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

export interface BookingCancelledEmailProps {
  bookingId: string;
  marinaName: string;
  slipName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  boatOwnerEmail?: string;
  marinaOwnerEmail?: string;
}

export default function BookingCancelledEmail({
  bookingId,
  marinaName,
  slipName,
  checkIn,
  checkOut,
  totalPrice,
}: BookingCancelledEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://easydock.com';
  const bookingUrl = `${appUrl}/bookings/${bookingId}`;

  return (
    <Html>
      <Head />
      <Preview>Booking cancelled — {marinaName} from {checkIn} to {checkOut}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>EasyDock</Heading>
            <Text style={headerSubStyle}>Marina Booking Platform</Text>
          </Section>

          {/* Main content */}
          <Section style={contentStyle}>
            <Heading style={h1Style}>Booking Cancelled</Heading>
            <Text style={textStyle}>
              The booking at <strong>{marinaName}</strong> has been cancelled. If a payment was made,
              a full refund will be processed to your original payment method within 5–10 business days.
            </Text>

            {/* Booking details card */}
            <Section style={detailsCardStyle}>
              <Text style={detailRowStyle}>
                <strong>Slip:</strong> {slipName}
              </Text>
              <Text style={detailRowStyle}>
                <strong>Marina:</strong> {marinaName}
              </Text>
              <Text style={detailRowStyle}>
                <strong>Check-in:</strong> {checkIn}
              </Text>
              <Text style={detailRowStyle}>
                <strong>Check-out:</strong> {checkOut}
              </Text>
              <Hr style={hrStyle} />
              <Text style={detailRowStyle}>
                <strong>Refund Amount:</strong> ${totalPrice.toFixed(2)}
              </Text>
            </Section>

            <Button style={buttonStyle} href={bookingUrl}>
              View Booking
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              This email was sent by EasyDock. Please do not reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f5f7fa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: '20px 0',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  margin: '0 auto',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#1e3a5f',
  padding: '24px 32px',
  textAlign: 'center',
};

const logoStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 700,
  margin: 0,
};

const headerSubStyle: React.CSSProperties = {
  color: '#a8c5e0',
  fontSize: '13px',
  margin: '4px 0 0',
};

const contentStyle: React.CSSProperties = {
  padding: '32px',
};

const h1Style: React.CSSProperties = {
  color: '#1e3a5f',
  fontSize: '22px',
  fontWeight: 600,
  margin: '0 0 16px',
};

const textStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 20px',
};

const detailsCardStyle: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '0 0 24px',
};

const detailRowStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  margin: '6px 0',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#dc2626',
  margin: '12px 0',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#1e3a5f',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '15px',
  display: 'inline-block',
};

const footerStyle: React.CSSProperties = {
  backgroundColor: '#f5f7fa',
  padding: '16px 32px',
  borderTop: '1px solid #e5e7eb',
};

const footerTextStyle: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center',
  margin: 0,
};
