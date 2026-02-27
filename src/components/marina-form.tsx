"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadMarinaPhoto, deleteMarinaPhoto } from "@/lib/supabase/storage";
import { useAuth } from "@/lib/auth-context";
import { AMENITIES } from "@/lib/constants";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];

interface MarinaFormProps {
  initialData?: Marina;
}

export default function MarinaForm({ initialData }: MarinaFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [address, setAddress] = useState(initialData?.address || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [state, setState] = useState(initialData?.state || "FL");
  const [zip, setZip] = useState(initialData?.zip || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [amenities, setAmenities] = useState<string[]>(
    initialData?.amenities || []
  );
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleAmenity(key: string) {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !user) return;

    if (photos.length + files.length > 5) {
      setError("Maximum 5 photos allowed.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadMarinaPhoto(supabase, user.id, file);
        newUrls.push(url);
      }
      setPhotos((prev) => [...prev, ...newUrls]);
    } catch {
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(url: string) {
    try {
      await deleteMarinaPhoto(supabase, url);
      setPhotos((prev) => prev.filter((p) => p !== url));
    } catch {
      setError("Failed to remove photo.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setIsSubmitting(true);

    const marinaData = {
      name,
      description: description || null,
      address,
      city,
      state,
      zip: zip || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      amenities,
      photos,
    };

    try {
      if (initialData) {
        const { error: updateError } = await supabase
          .from("marinas")
          .update(marinaData as never)
          .eq("id", initialData.id);

        if (updateError) throw updateError;
        router.push(`/dashboard/marinas/${initialData.id}`);
      } else {
        const { data, error: insertError } = (await supabase
          .from("marinas")
          .insert({ ...marinaData, owner_id: user.id } as never)
          .select()
          .single()) as unknown as { data: { id: string } | null; error: Error | null };

        if (insertError) throw insertError;
        router.push(`/dashboard/marinas/${data!.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save marina.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Marina Name *
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Describe your marina, facilities, and what makes it special..."
        />
      </div>

      {/* Address row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Street Address *
          </label>
          <input
            id="address"
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            City *
          </label>
          <input
            id="city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            State *
          </label>
          <input
            id="state"
            type="text"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="zip"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ZIP Code
          </label>
          <input
            id="zip"
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Website
          </label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="https://"
          />
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amenities
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AMENITIES.map((a) => (
            <label
              key={a.key}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                amenities.includes(a.key)
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <input
                type="checkbox"
                checked={amenities.includes(a.key)}
                onChange={() => toggleAmenity(a.key)}
                className="sr-only"
              />
              <span className="text-sm">{a.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos ({photos.length}/5)
        </label>
        {photos.length > 0 && (
          <div className="flex gap-3 mb-3 flex-wrap">
            {photos.map((url) => (
              <div key={url} className="relative w-24 h-24">
                <img
                  src={url}
                  alt="Marina"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 5 && (
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            disabled={uploading}
            className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
          />
        )}
        {uploading && (
          <p className="text-sm text-gray-500 mt-1">Uploading...</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? "Saving..."
          : initialData
            ? "Update Marina"
            : "Create Marina"}
      </button>
    </form>
  );
}
