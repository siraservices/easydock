import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SlipDetailClient from "./slip-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const BASE_URL =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://easydock.vercel.app";

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("slips")
      .select("name, length_ft, price_per_night, marinas!inner(name, city, state, photos)")
      .eq("id", id)
      .single();

    if (!data) {
      return { title: "Slip Not Found | EasyDock" };
    }

    const slip = data as unknown as {
      name: string;
      length_ft: number;
      price_per_night: number;
      marinas: { name: string; city: string; state: string; photos: string[] };
    };
    const marina = slip.marinas;

    const title = `${slip.name} — ${slip.length_ft}ft Slip at ${marina.name} | EasyDock`;
    const description = `Book a ${slip.length_ft}ft boat slip at ${marina.name} in ${marina.city}, ${marina.state}. From $${slip.price_per_night}/night. No waitlist — reserve online instantly.`;
    const image = marina.photos?.[0];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/slips/${id}`,
        siteName: "EasyDock",
        ...(image ? { images: [{ url: image, alt: marina.name }] } : {}),
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return { title: "Boat Slip | EasyDock" };
  }
}

export default function SlipDetailPage() {
  return <SlipDetailClient />;
}
