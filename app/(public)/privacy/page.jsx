export default function PrivacyPolicyPage() {
  return (
    <section className="min-h-screen bg-[#020617] text-white px-6 py-24">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">
            Privacy <span className="text-cyan-400">Policy</span>
          </h1>
          <p className="text-white/50 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        {/* Introduction */}
        <p className="text-white/70 leading-relaxed">
          At <strong>SheKart</strong>, we are committed to protecting your privacy.
          SheKart is a women-led platform built to empower women entrepreneurs and
          shoppers. This Privacy Policy explains how we collect, use, and safeguard
          your personal information when you use our website and services.
        </p>

        {/* Information We Collect */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-emerald-400">
            Information We Collect
          </h2>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>Name, email address, and phone number</li>
            <li>Account details when you become a member or create a store</li>
            <li>Order, payment, and transaction information</li>
            <li>Device and usage data such as IP address and browser type</li>
          </ul>
        </div>

        {/* How We Use Information */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-cyan-400">
            How We Use Your Information
          </h2>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>To operate and improve the SheKart platform</li>
            <li>To process orders and payments securely</li>
            <li>To communicate important updates and offers</li>
            <li>To support women-led businesses</li>
            <li>To comply with legal obligations</li>
          </ul>
        </div>

        {/* Data Security */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-purple-400">
            Data Security
          </h2>
          <p className="text-white/70 leading-relaxed">
            We use reasonable security measures to protect your personal information.
            However, no method of transmission over the internet is completely secure.
          </p>
        </div>

        {/* Sharing Information */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-pink-400">
            Sharing of Information
          </h2>
          <p className="text-white/70 leading-relaxed">
            SheKart does not sell your personal data. Information may be shared with
            trusted service providers only to deliver our services or meet legal
            requirements.
          </p>
        </div>

        {/* Cookies */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-yellow-400">
            Cookies
          </h2>
          <p className="text-white/70 leading-relaxed">
            Cookies help us improve your experience on SheKart. You can disable
            cookies through your browser settings at any time.
          </p>
        </div>

        {/* User Rights */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-indigo-400">
            Your Rights
          </h2>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>Access or update your personal information</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-3 border-t border-white/10 pt-6">
          <h2 className="text-xl font-semibold text-emerald-400">
            Contact Us
          </h2>
          <p className="text-white/70">
            If you have any questions regarding this Privacy Policy, contact us at:
          </p>
          <p className="text-white font-medium">
            📧 hello@shekart.com
          </p>
        </div>

      </div>
    </section>
  )
}
