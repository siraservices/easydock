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

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface CalculatorLeadAdminNotificationProps {
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

export default function CalculatorLeadAdminNotification({
  email,
  phone,
  role,
  marinaName,
  region,
  totalSlips,
  vacantSlips,
  avgMonthlyRate,
  annualLoss,
}: CalculatorLeadAdminNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New calculator lead{marinaName ? ` — ${marinaName}` : ""}{" "}
        {annualLoss ? `(${fmt.format(annualLoss)}/yr loss)` : ""}
      </Preview>
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
            New marina owner lead (calculator)
          </Heading>
          <Text style={{ color: "#64748b", marginTop: 0 }}>
            A marina owner just used the revenue calculator and submitted their contact info.
          </Text>

          <Section
            style={{
              backgroundColor: "#fefce8",
              border: "1px solid #fde68a",
              borderRadius: 6,
              padding: "16px 20px",
              margin: "20px 0",
            }}
          >
            <Text style={{ color: "#0f172a", margin: "0 0 8px", fontWeight: "bold" }}>
              Contact
            </Text>
            <Text style={{ color: "#92400e", margin: "2px 0" }}>
              <strong>{email}</strong>
            </Text>
            {phone && (
              <Text style={{ color: "#475569", margin: "2px 0" }}>
                Phone: {phone}
              </Text>
            )}
            {role && (
              <Text style={{ color: "#475569", margin: "2px 0" }}>Role: {role}</Text>
            )}
          </Section>

          <Section
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 6,
              padding: "16px 20px",
              margin: "20px 0",
            }}
          >
            <Text style={{ color: "#0f172a", margin: "0 0 8px", fontWeight: "bold" }}>
              Marina details
            </Text>
            {marinaName && (
              <Text style={{ color: "#166534", margin: "2px 0" }}>
                <strong>{marinaName}</strong>
              </Text>
            )}
            {region && (
              <Text style={{ color: "#475569", margin: "2px 0" }}>Region: {region}</Text>
            )}
            {totalSlips != null && (
              <Text style={{ color: "#475569", margin: "2px 0" }}>
                Total slips: {totalSlips}
              </Text>
            )}
            {vacantSlips != null && (
              <Text style={{ color: "#475569", margin: "2px 0" }}>
                Vacant slips: {vacantSlips}
              </Text>
            )}
            {avgMonthlyRate != null && (
              <Text style={{ color: "#475569", margin: "2px 0" }}>
                Avg monthly rate: {fmt.format(avgMonthlyRate)}
              </Text>
            )}
          </Section>

          {annualLoss != null && (
            <Section
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 6,
                padding: "16px 20px",
                margin: "20px 0",
              }}
            >
              <Text style={{ color: "#0f172a", margin: "0 0 4px", fontWeight: "bold" }}>
                Estimated annual revenue loss
              </Text>
              <Text style={{ color: "#dc2626", fontSize: 28, margin: "0", fontWeight: "bold" }}>
                {fmt.format(annualLoss)}
              </Text>
            </Section>
          )}

          <Text style={{ color: "#64748b", fontSize: 14 }}>
            Reply directly to this email or reach out at {email} to follow up.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
