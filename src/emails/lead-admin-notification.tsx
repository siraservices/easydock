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

interface LeadAdminNotificationProps {
  name: string;
  email: string;
  userType: "yacht_owner" | "marina_owner";
  phone?: string | null;
  boatLength?: string | null;
  preferredArea?: string | null;
}

export default function LeadAdminNotification({
  name,
  email,
  userType,
  phone,
  boatLength,
  preferredArea,
}: LeadAdminNotificationProps) {
  const label = userType === "marina_owner" ? "Marina Owner" : "Boat Owner";

  return (
    <Html>
      <Head />
      <Preview>New {label} lead — {name}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif" }}>
        <Container
          style={{
            maxWidth: 600,
            margin: "40px auto",
            backgroundColor: "#fff",
            borderRadius: 8,
            padding: "32px 40px",
          }}
        >
          <Heading style={{ color: "#0f172a", fontSize: 22, marginBottom: 4 }}>
            New {label} lead
          </Heading>
          <Text style={{ color: "#64748b", marginTop: 0 }}>
            Someone just submitted the EasyDock interest form.
          </Text>

          <Section
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 6,
              padding: "16px 20px",
              margin: "20px 0",
            }}
          >
            <Text style={{ color: "#0f172a", margin: "0 0 8px", fontWeight: "bold" }}>
              Lead details
            </Text>
            <Text style={{ color: "#1e40af", margin: "2px 0" }}>
              <strong>{name}</strong>
            </Text>
            <Text style={{ color: "#475569", margin: "2px 0" }}>{email}</Text>
            <Text style={{ color: "#475569", margin: "2px 0" }}>
              Type: {label}
            </Text>
            {phone && (
              <Text style={{ color: "#475569", margin: "2px 0" }}>
                Phone: {phone}
              </Text>
            )}
            {boatLength && (
              <Text style={{ color: "#475569", margin: "2px 0" }}>
                Boat length: {boatLength}
              </Text>
            )}
            {preferredArea && (
              <Text style={{ color: "#475569", margin: "2px 0" }}>
                Area: {preferredArea}
              </Text>
            )}
          </Section>

          <Text style={{ color: "#64748b", fontSize: 14 }}>
            Reply directly to this email or reach out at {email} to follow up.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
