"use client";

import { useState } from "react";

interface Props {
  condition: string;
  severity: string;
  emergencyContact: string;
  onClose: () => void;
}

export default function AlertModal({ condition, severity, emergencyContact, onClose }: Props) {
  const [phone, setPhone] = useState(emergencyContact);
  const [location, setLocation] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!phone) {
      setError("Please enter a phone number.");
      return;
    }
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, condition, severity, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send alert");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg p-6">
        {!sent ? (
          <>
            <h2 className="text-xl font-bold text-white mb-1">🚨 Alert Emergency Contact</h2>
            <p className="text-sm text-gray-400 mb-4">
              An SMS will be sent about: <span className="text-white font-medium">{condition}</span>
            </p>

            <div className="mb-3">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
                Location (optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Library, 2nd Floor"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {error && (
              <div className="mb-3 p-3 bg-red-900/50 border border-red-700 rounded-xl text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-2xl transition-colors"
              >
                {sending ? "Sending..." : "📱 Send Alert"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-white mb-2">Alert Sent!</h2>
            <p className="text-gray-400 text-sm mb-6">
              Emergency SMS sent to <span className="text-white">{phone}</span>
            </p>
            <button
              onClick={onClose}
              className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
