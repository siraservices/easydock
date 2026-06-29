"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

export default function BlogEmailCapture() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, user_type: "marina_owner" }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.errors?.email || data.errors?.name || data.error || "Something went wrong.";
        setErrorMsg(msg);
        setStatus("error");
        return;
      }

      track("lead_captured", { user_type: "marina_owner", source: "blog" });
      setStatus("success");
    } catch {
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-10 rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center">
        <div className="text-teal-600 text-3xl mb-2">✓</div>
        <p className="font-semibold text-teal-800">You're on the list!</p>
        <p className="text-sm text-teal-700 mt-1">
          We'll reach out when EasyDock is ready to help your marina fill slips.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6">
      <p className="text-sm font-semibold text-gray-700 mb-1">
        Not ready to claim your marina yet?
      </p>
      <p className="text-sm text-gray-500 mb-4">
        Leave your email and we'll follow up when you're ready — no spam, ever.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Notify me"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
