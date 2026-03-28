import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

export interface LeadConfirmationEmailProps {
  name: string;
  userType: 'yacht_owner' | 'marina_owner';
}

export default function LeadConfirmationEmail({ name, userType }: LeadConfirmationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://easydock.co';
  const isYachtOwner = userType === 'yacht_owner';

  const headline = isYachtOwner
    ? 'We\'re finding slips in your area'
    : 'We\'ll be in touch about listing your marina';

  const body = isYachtOwner
    ? 'Thanks for your interest in EasyDock! We\'re actively expanding our network of marinas across South Florida. We\'ll reach out as soon as there are available slips matching your needs.'
    : 'Thanks for your interest in listing your marina on EasyDock! Our team will reach out shortly to walk you through getting your slips listed and start accepting bookings.';

  return (
    <Html>
      <Head />
      <Preview>{headline}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>EasyDock</Heading>
            <Text style={headerSubStyle}>Marina Booking Platform</Text>
          </Section>

          {/* Main content */}
          <Section style={contentStyle}>
            <Heading style={h1Style}>Hi {name},</Heading>
            <Text style={textStyle}>{body}</Text>
            <Text style={textStyle}>
              In the meantime, feel free to explore the platform and see what&apos;s available.
            </Text>
            <Button style={buttonStyle} href={appUrl}>
              {isYachtOwner ? 'Browse Available Slips' : 'Learn More'}
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Questions? Reply to this email or reach us at{' '}
              <a href="mailto:hello@easydock.co" style={{ color: '#2BA89D' }}>hello@easydock.co</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f5f7fa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
  backgroundColor: '#1B3A6B',
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
  color: '#1B3A6B',
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

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#2BA89D',
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
