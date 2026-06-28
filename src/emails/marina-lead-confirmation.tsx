import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MarinaLeadConfirmationProps {
  name: string;
  marinaName: string;
  checkIn?: string;
  checkOut?: string;
}

export default function MarinaLeadConfirmation({
  name,
  marinaName,
  checkIn,
  checkOut,
}: MarinaLeadConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your spot request at {marinaName} is on its way</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 560, margin: "40px auto", backgroundColor: "#fff", borderRadius: 8, padding: "32px 40px" }}>
          <Heading style={{ color: "#0f172a", fontSize: 22, marginBottom: 8 }}>
            Request received, {name}!
          </Heading>
          <Text style={{ color: "#475569" }}>
            We&apos;ve forwarded your interest in <strong>{marinaName}</strong> to
            our team. We&apos;ll reach out to the marina on your behalf and let you
            know as soon as they&apos;re ready to take bookings on EasyDock.
          </Text>
          {(checkIn || checkOut) && (
            <Section style={{ backgroundColor: "#f8fafc", borderRadius: 6, padding: "16px 20px", margin: "20px 0" }}>
              <Text style={{ color: "#0f172a", margin: 0, fontWeight: "bold" }}>Your requested dates</Text>
              {checkIn && <Text style={{ color: "#475569", margin: "4px 0 0" }}>Check-in: {checkIn}</Text>}
              {checkOut && <Text style={{ color: "#475569", margin: "4px 0 0" }}>Check-out: {checkOut}</Text>}
            </Section>
          )}
          <Text style={{ color: "#94a3b8", fontSize: 13 }}>
            In the meantime, browse available slips on EasyDock — many marinas
            are ready to book today.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
