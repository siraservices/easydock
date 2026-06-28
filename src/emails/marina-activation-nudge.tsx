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

interface MarinaActivationNudgeProps {
  marinaName: string;
  marinaCity: string;
  marinaState: string;
  marinaPhone?: string | null;
  marinaWebsite?: string | null;
  requesterName: string;
  requesterEmail: string;
  checkIn?: string;
  checkOut?: string;
  vesselLengthFt?: number;
  message?: string;
}

export default function MarinaActivationNudge({
  marinaName,
  marinaCity,
  marinaState,
  marinaPhone,
  marinaWebsite,
  requesterName,
  requesterEmail,
  checkIn,
  checkOut,
  vesselLengthFt,
  message,
}: MarinaActivationNudgeProps) {
  return (
    <Html>
      <Head />
      <Preview>New spot request for {marinaName} — reach out to activate</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "40px auto", backgroundColor: "#fff", borderRadius: 8, padding: "32px 40px" }}>
          <Heading style={{ color: "#0f172a", fontSize: 22, marginBottom: 4 }}>
            New lead for unclaimed marina
          </Heading>
          <Text style={{ color: "#64748b", marginTop: 0 }}>
            A boat owner just requested a spot at <strong>{marinaName}</strong>, which is
            not yet claimed on EasyDock. Contact the marina to activate their listing.
          </Text>

          <Section style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "16px 20px", margin: "20px 0" }}>
            <Text style={{ color: "#0f172a", margin: "0 0 8px", fontWeight: "bold" }}>Marina contact</Text>
            <Text style={{ color: "#166534", margin: "2px 0" }}><strong>{marinaName}</strong></Text>
            <Text style={{ color: "#475569", margin: "2px 0" }}>{marinaCity}, {marinaState}</Text>
            {marinaPhone && <Text style={{ color: "#475569", margin: "2px 0" }}>Phone: {marinaPhone}</Text>}
            {marinaWebsite && <Text style={{ color: "#475569", margin: "2px 0" }}>Website: {marinaWebsite}</Text>}
          </Section>

          <Section style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "16px 20px", margin: "20px 0" }}>
            <Text style={{ color: "#0f172a", margin: "0 0 8px", fontWeight: "bold" }}>Requester details</Text>
            <Text style={{ color: "#1e3a5f", margin: "2px 0" }}>{requesterName} — {requesterEmail}</Text>
            {checkIn && <Text style={{ color: "#475569", margin: "2px 0" }}>Check-in: {checkIn}</Text>}
            {checkOut && <Text style={{ color: "#475569", margin: "2px 0" }}>Check-out: {checkOut}</Text>}
            {vesselLengthFt && <Text style={{ color: "#475569", margin: "2px 0" }}>Vessel: ~{vesselLengthFt} ft</Text>}
            {message && <Text style={{ color: "#475569", margin: "8px 0 0", fontStyle: "italic" }}>&ldquo;{message}&rdquo;</Text>}
          </Section>

          <Text style={{ color: "#94a3b8", fontSize: 13 }}>
            Sent by EasyDock lead capture system. Reach out to the marina to invite
            them to claim their listing at easydock.vercel.app/claim.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
