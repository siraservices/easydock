import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import MarinaProfileClient from "./marina-profile-client";

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
      .from("marinas")
      .select("name, city, state, description, photos")
      .eq("id", id)
      .eq("is_active", true)
      .single() as unknown as {
        data: {
          name: string;
          city: string;
          state: string;
          description: string | null;
          photos: string[];
        } | null;
      };

    if (!data) return { title: "Marina Not Found | EasyDock" };

    const title = `${data.name} — Marina in ${data.city}, ${data.state} | EasyDock`;
    const description =
      data.description ??
      `Book a boat slip at ${data.name} in ${data.city}, ${data.state}. Browse available slips and reserve online with EasyDock.`;
    const image = data.photos?.[0];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/marinas/${id}`,
        siteName: "EasyDock",
        ...(image ? { images: [{ url: image, alt: data.name }] } : {}),
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
    return { title: "Marina | EasyDock" };
  }
}

export default function MarinaProfilePage() {
  return <MarinaProfileClient />;
}
