"use client";

import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const formRef = useRef(null);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      );

      setStatus({ type: "success", message: "Thank you! We will contact you soon." });
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus({ type: "error", message: "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-14">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about orders, vendors, or partnerships? We’d love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Contact Info */}
          <div className="space-y-6">
            <InfoCard icon={<Mail />} title="Email" text="support@gocart.com" />
            <InfoCard icon={<Phone />} title="Phone" text="+91 90000 00000" />
            <InfoCard icon={<MapPin />} title="Address" text="India" />
          </div>

          {/* Contact Form */}
          <motion.form
            ref={formRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 shadow-sm"
          >
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                rows="4"
                value={form.message}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {status && (
              <p className={`mb-4 font-medium ${
                status.type === "success" ? "text-green-600" : "text-red-600"
              }`}>
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm">
      <div className="text-pink-600">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-gray-600 text-sm">{text}</p>
      </div>
    </div>
  );
}
