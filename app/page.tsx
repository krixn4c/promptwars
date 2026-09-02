"use client";

import { useState, useRef, useEffect } from "react";
import type { FirstAidResponse } from "@/lib/types";
import FirstAidCard from "@/components/FirstAidCard";
import AlertModal from "@/components/AlertModal";
import SettingsModal from "@/components/SettingsModal";

const LANGUAGES = [
  { label: "English", value: "English" },
  { label: "हिंदी (Hindi)", value: "Hindi" },
  { label: "Español (Spanish)", value: "Spanish" },
  { label: "Français (French)", value: "French" },
  { label: "தமிழ் (Tamil)", value: "Tamil" },
  { label: "తెలుగు (Telugu)", value: "Telugu" },
];

export default function Home() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FirstAidResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Load emergency contact from localStorage
  const [emergencyContact, setEmergencyContact] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("campusaid_contact");
    if (saved) setEmergencyContact(saved);
  }, []);

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    setImage(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async () => {
    if (!text && !image) {
      setError("Please type something or upload a photo.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (text) formData.append("text", text);
    if (image) formData.append("image", image);
    formData.append("language", language);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText("");
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🏥</span>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">CampusAid</h1>
            <p className="text-xs text-gray-400">AI Emergency Assistant</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Language Selector */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
          Response Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {!result ? (
        <>
          {/* Text Input */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
              Describe the Situation
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Someone fainted in the library, person has a deep cut on their hand, fire alarm hazard..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
              Or Upload / Take a Photo
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 rounded-xl py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                📷 Camera
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 rounded-xl py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                🖼️ Gallery
              </button>
            </div>

            {/* Hidden inputs */}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
            />

            {/* Preview */}
            {imagePreview && (
              <div className="mt-2 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/70 rounded-full w-7 h-7 flex items-center justify-center text-white text-sm"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-xl text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || (!text && !image)}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Analyzing...
              </>
            ) : (
              <>🔍 Get First Aid Guide</>
            )}
          </button>

          <p className="text-center text-xs text-gray-600 mt-4">
            For life-threatening emergencies, call 911 immediately
          </p>
        </>
      ) : (
        /* Results View */
        <>
          <FirstAidCard result={result} />

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={() => setShowAlert(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-2"
            >
              🚨 Alert Emergency Contact
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-2xl transition-colors"
            >
              ← New Emergency
            </button>
          </div>
        </>
      )}

      {/* Modals */}
      {showAlert && result && (
        <AlertModal
          condition={result.condition}
          severity={result.severity}
          emergencyContact={emergencyContact}
          onClose={() => setShowAlert(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          emergencyContact={emergencyContact}
          onSave={(contact) => {
            setEmergencyContact(contact);
            localStorage.setItem("campusaid_contact", contact);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
