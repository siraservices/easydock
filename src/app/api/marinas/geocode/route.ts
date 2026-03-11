import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { address?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { address } = body;

  if (!address || address.trim() === "") {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "MAPBOX_ACCESS_TOKEN is not configured" },
      { status: 400 }
    );
  }

  try {
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(address)}&access_token=${token}&limit=1`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ lat: null, lng: null });
    }

    const data = await res.json();
    const features = data.features as Array<{
      geometry: { coordinates: [number, number] };
    }>;

    if (!features || features.length === 0) {
      return NextResponse.json({ lat: null, lng: null });
    }

    // Mapbox v6 geometry.coordinates is [lng, lat]
    const [lng, lat] = features[0].geometry.coordinates;
    return NextResponse.json({ lat, lng });
  } catch {
    return NextResponse.json({ lat: null, lng: null });
  }
}
