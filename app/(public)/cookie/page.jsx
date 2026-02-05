'use client'

import { useState } from "react"

export default function CookieSettingsPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
  })

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences))
    alert("Cookie preferences saved successfully!")
  }

  return (
    <section className="min-h-screen bg-[#020617] text-white px-6 py-24">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">
            Cookie <span className="text-cyan-400">Settings</span>
          </h1>
          <p className="text-white/60 text-sm">
            Manage how SheKart uses cookies to improve your experience.
          </p>
        </header>

        {/* Essential Cookies */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Essential Cookies</h3>
            <p className="text-sm text-white/50 mt-1">
              Required for the website to function properly. Cannot be disabled.
            </p>
          </div>
          <input
            type="checkbox"
            checked
            disabled
            className="w-5 h-5 accent-emerald-400"
          />
        </div>

        {/* Analytics Cookies */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Analytics Cookies</h3>
            <p className="text-sm text-white/50 mt-1">
              Help us understand how users interact with SheKart.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.analytics}
            onChange={() => handleToggle("analytics")}
            className="w-5 h-5 accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Marketing Cookies */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Marketing Cookies</h3>
            <p className="text-sm text-white/50 mt-1">
              Used to personalize offers and marketing communications.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.marketing}
            onChange={() => handleToggle("marketing")}
            className="w-5 h-5 accent-pink-400 cursor-pointer"
          />
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-white/10 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold hover:opacity-90 transition"
          >
            Save Preferences
          </button>
        </div>

      </div>
    </section>
  )
}
