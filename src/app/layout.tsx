import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://easydock.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "EasyDock — Find & Book Marina Slips in South Florida",
    template: "%s | EasyDock",
  },
  description:
    "Stop waiting years for a marina slip. EasyDock connects boat owners with available dock slips across South Florida — browse, compare, and book online in minutes.",
  metadataBase: new URL(APP_URL),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "EasyDock",
    title: "EasyDock — Find & Book Marina Slips in South Florida",
    description:
      "Stop waiting years for a marina slip. Browse available dock slips across South Florida and book online in minutes. No waitlist, no phone tag.",
    url: APP_URL,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "EasyDock logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EasyDock — Find & Book Marina Slips in South Florida",
    description:
      "Stop waiting years for a marina slip. Browse available dock slips across South Florida and book online in minutes.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
