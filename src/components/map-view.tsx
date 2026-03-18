"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Map, Marker } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { filterMarinasByViewport } from "@/lib/hooks/use-map-filter";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];

interface MapViewProps {
  marinas: Marina[];
  onVisibleMarinaIdsChange: (ids: Set<string>) => void;
  hoveredMarinaId: string | null;
  onHoverMarina: (id: string | null) => void;
  onSelectMarina: (id: string) => void;
  initialCenter?: { longitude: number; latitude: number };
}

const DAILY_MAP_LOAD_LIMIT = 1500;

function checkMapLoadBudget(): boolean {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const stored = localStorage.getItem("mapbox_loads");
    const data = stored ? JSON.parse(stored) : { date: today, count: 0 };
    if (data.date !== today) {
      data.date = today;
      data.count = 0;
    }
    if (data.count >= DAILY_MAP_LOAD_LIMIT) return false;
    data.count += 1;
    localStorage.setItem("mapbox_loads", JSON.stringify(data));
    return true;
  } catch {
    return true;
  }
}

export default function MapView({
  marinas,
  onVisibleMarinaIdsChange,
  hoveredMarinaId,
  onHoverMarina,
  onSelectMarina,
  initialCenter,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [initialized, setInitialized] = useState(false);
  const [budgetExceeded, setBudgetExceeded] = useState(false);
  const initialCenterApplied = useRef(false);

  useEffect(() => {
    if (!checkMapLoadBudget()) {
      setBudgetExceeded(true);
      // Still show all marinas in the list even without the map
      const allIds = new Set(
        marinas.filter((m) => m.lat !== null && m.lng !== null).map((m) => m.id)
      );
      onVisibleMarinaIdsChange(allIds);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fly to geolocation result if it arrives after map has rendered
  useEffect(() => {
    if (initialCenter && initialized && mapRef.current && !initialCenterApplied.current) {
      initialCenterApplied.current = true;
      mapRef.current.flyTo({
        center: [initialCenter.longitude, initialCenter.latitude],
        zoom: 12,
      });
    }
  }, [initialCenter, initialized]);

  // Initialize visible marina IDs to ALL marinas on first render
  // so the list is not empty before the first map move
  useEffect(() => {
    if (!initialized && marinas.length > 0) {
      const allIds = new Set(
        marinas
          .filter((m) => m.lat !== null && m.lng !== null)
          .map((m) => m.id)
      );
      onVisibleMarinaIdsChange(allIds);
      setInitialized(true);
    }
  }, [marinas, initialized, onVisibleMarinaIdsChange]);

  // Also update when marinas prop changes (after a filter search)
  useEffect(() => {
    if (initialized && mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        const visible = filterMarinasByViewport(marinas, bounds);
        onVisibleMarinaIdsChange(new Set(visible.map((m) => m.id)));
      }
    }
  }, [marinas, initialized, onVisibleMarinaIdsChange]);

  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;
    const visible = filterMarinasByViewport(marinas, bounds);
    onVisibleMarinaIdsChange(new Set(visible.map((m) => m.id)));
  }, [marinas, onVisibleMarinaIdsChange]);

  const validMarinas = marinas.filter(
    (m) => m.lat !== null && m.lng !== null
  );

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-center p-6">
        <div>
          <span className="text-4xl block mb-2">&#128506;</span>
          <p className="font-semibold text-navy-800">Map unavailable</p>
          <p className="text-sm text-gray-500 mt-1">Map configuration is missing. Browse marinas from the list.</p>
        </div>
      </div>
    );
  }

  if (budgetExceeded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-center p-6">
        <div>
          <span className="text-4xl block mb-2">&#9875;</span>
          <p className="font-semibold text-navy-800">Map limit reached for today</p>
          <p className="text-sm text-gray-500 mt-1">Browse marinas from the list. Map resets daily.</p>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: initialCenter?.longitude ?? -80.1,
        latitude: initialCenter?.latitude ?? 26.1,
        zoom: 10,
      }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      style={{ width: "100%", height: "100%" }}
      onMoveEnd={handleMoveEnd}
    >
      {validMarinas.map((marina) => {
        const isHovered = hoveredMarinaId === marina.id;
        return (
          <Marker
            key={marina.id}
            longitude={marina.lng!}
            latitude={marina.lat!}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectMarina(marina.id);
            }}
          >
            <div
              onMouseEnter={() => onHoverMarina(marina.id)}
              onMouseLeave={() => onHoverMarina(null)}
              className="cursor-pointer transition-transform"
              style={{
                transform: isHovered ? "scale(1.3)" : "scale(1)",
                transition: "transform 0.15s ease",
              }}
              title={marina.name}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white ${
                  isHovered ? "bg-navy-800" : "bg-teal-600"
                }`}
              >
                {/* Anchor icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-4 h-4"
                >
                  <path d="M12 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-1 6h2v1.09A8.001 8.001 0 0 1 20 19v1h-2a6 6 0 0 0-5-5.917V17l3-3-1.414-1.414L12 14.172l-2.586-2.586L8 13l3 3v-2.917A6 6 0 0 0 6 19H4v-1a8.001 8.001 0 0 1 7-7.91V10z" />
                </svg>
              </div>
            </div>
          </Marker>
        );
      })}
    </Map>
  );
}
