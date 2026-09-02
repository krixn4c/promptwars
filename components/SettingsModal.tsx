"use client";

import { useState } from "react";

interface Props {
  emergencyContact: string;
  onSave: (contact: string) => void;
  onClose: () => void;
}

export default function SettingsModal({ emergencyContact, onSave, onClose }: Props) {
  const [contact, setContact] = useState(emergencyContact);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-white mb-1">⚙️ Settings</h2>
        <p className="text-sm text-gray-400 mb-4">
          Set your default emergency contact to receive SMS alerts.
        </p>

        <div className="mb-6">
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
            Emergency Contact Phone
          </label>
          <input
            type="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="+91 9876543210 or +1 234 567 8900"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Include country code. e.g. +91 for India, +1 for USA
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-400">
            🔒 <strong className="text-gray-300">Privacy:</strong> Your contact number is stored only in your browser and never sent to our servers. It is only used when you click "Send Alert".
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(contact)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-colors"
          >
            Save Contact
          </button>
        </div>
      </div>
    </div>
  );
}
