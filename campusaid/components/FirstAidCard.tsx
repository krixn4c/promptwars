"use client";

import type { FirstAidResponse } from "@/lib/types";

const SEVERITY_CONFIG = {
  low: { bg: "bg-green-900/40", border: "border-green-600", badge: "bg-green-700", text: "LOW", icon: "🟢" },
  medium: { bg: "bg-yellow-900/40", border: "border-yellow-600", badge: "bg-yellow-700", text: "MODERATE", icon: "🟡" },
  high: { bg: "bg-orange-900/40", border: "border-orange-600", badge: "bg-orange-700", text: "HIGH", icon: "🟠" },
  critical: { bg: "bg-red-900/40", border: "border-red-600", badge: "bg-red-700", text: "CRITICAL", icon: "🔴" },
};

export default function FirstAidCard({ result }: { result: FirstAidResponse }) {
  const config = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.medium;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold text-white">{result.condition}</h2>
          <span className={`px-2 py-1 rounded-lg text-xs font-bold text-white shrink-0 ${config.badge}`}>
            {config.icon} {config.text}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">⏱ Estimated: {result.estimatedTime}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Steps */}
        <div>
          <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">
            ✅ Steps to Follow
          </h3>
          <ol className="space-y-2">
            {result.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-green-500 font-bold text-sm shrink-0 w-5">{i + 1}.</span>
                <span className="text-gray-200 text-sm leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Do Not */}
        {result.doNot.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">
              ❌ Do NOT
            </h3>
            <ul className="space-y-1">
              {result.doNot.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-red-400 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Call Emergency If */}
        {result.callEmergencyIf.length > 0 && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3">
            <h3 className="text-sm font-semibold text-red-300 uppercase tracking-wider mb-2">
              🚨 Call 911 / Emergency If:
            </h3>
            <ul className="space-y-1">
              {result.callEmergencyIf.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-red-200">
                  <span className="shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Translated Summary */}
        {result.translatedSummary && (
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-3">
            <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-2">
              🌐 Local Language Summary
            </h3>
            <p className="text-sm text-blue-100">{result.translatedSummary}</p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 italic border-t border-gray-700 pt-3">
          ⚕️ {result.disclaimer}
        </p>
      </div>
    </div>
  );
}
