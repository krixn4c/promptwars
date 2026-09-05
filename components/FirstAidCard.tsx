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
    <article
      className={`rounded-2xl border ${config.border} ${config.bg} overflow-hidden`}
      aria-label={`First aid guide for ${result.condition}`}
      role="region"
    >
      {/* Header */}
      <header className="p-4 border-b border-gray-700/50">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold text-white">{result.condition}</h2>
          <span
            className={`px-2 py-1 rounded-lg text-xs font-bold text-white shrink-0 ${config.badge}`}
            aria-label={`Severity: ${config.text}`}
            role="status"
          >
            {config.icon} {config.text}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1" aria-label={`Estimated time: ${result.estimatedTime}`}>
          ⏱ Estimated: {result.estimatedTime}
        </p>
      </header>

      <div className="p-4 space-y-4">
        {/* Steps */}
        <section aria-labelledby="steps-heading">
          <h3 id="steps-heading" className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">
            ✅ Steps to Follow
          </h3>
          <ol className="space-y-2" aria-label="First aid steps">
            {result.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-green-500 font-bold text-sm shrink-0 w-5" aria-hidden="true">{i + 1}.</span>
                <span className="text-gray-200 text-sm leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Do Not */}
        {result.doNot.length > 0 && (
          <section aria-labelledby="donot-heading">
            <h3 id="donot-heading" className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">
              ❌ Do NOT
            </h3>
            <ul className="space-y-1" aria-label="Things not to do">
              {result.doNot.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-red-400 shrink-0" aria-hidden="true">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Call Emergency If */}
        {result.callEmergencyIf.length > 0 && (
          <section
            className="bg-red-900/30 border border-red-700/50 rounded-xl p-3"
            aria-labelledby="emergency-heading"
            role="alert"
          >
            <h3 id="emergency-heading" className="text-sm font-semibold text-red-300 uppercase tracking-wider mb-2">
              🚨 Call 911 / Emergency If:
            </h3>
            <ul className="space-y-1" aria-label="Emergency triggers">
              {result.callEmergencyIf.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-red-200">
                  <span aria-hidden="true">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Translated Summary */}
        {result.translatedSummary && (
          <section
            className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-3"
            aria-labelledby="translation-heading"
          >
            <h3 id="translation-heading" className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-2">
              🌐 Local Language Summary
            </h3>
            <p className="text-sm text-blue-100" lang="und">{result.translatedSummary}</p>
          </section>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 italic border-t border-gray-700 pt-3" role="note">
          ⚕️ {result.disclaimer}
        </p>
      </div>
    </article>
  );
}
