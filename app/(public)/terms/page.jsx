"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Mail,
  ShieldCheck,
  Store,
} from "lucide-react";

const TermsPage = () => {
  const sections = [
    {
      number: "01",
      title: "Acceptance of Terms",
      content: (
        <>
          By accessing or using Nandurbar Bazar, you agree to comply with these
          Terms of Service and all applicable laws and regulations. If you do
          not agree with any part of these terms, please do not use our
          platform.
        </>
      ),
    },
    {
      number: "02",
      title: "About Nandurbar Bazar",
      content: (
        <>
          Nandurbar Bazar is a local marketplace platform designed to connect
          customers with local shops and sellers. We provide the technology and
          platform through which customers can discover products and businesses.
        </>
      ),
    },
    {
      number: "03",
      title: "Customer Responsibilities",
      content: (
        <>
          When using Nandurbar Bazar, you agree to provide accurate information
          and use the platform responsibly. You must not use the platform for
          fraudulent, unlawful, abusive, or misleading activities.
        </>
      ),
    },
    {
      number: "04",
      title: "Seller Responsibilities",
      content: (
        <>
          Sellers are responsible for the accuracy of their shop information,
          product descriptions, prices, availability, and other information
          displayed on the platform.
          <br />
          <br />
          Sellers must ensure that the products they list comply with applicable
          laws and regulations. Sellers are also responsible for fulfilling
          orders and providing customers with accurate information.
        </>
      ),
    },
    {
      number: "05",
      title: "Products & Pricing",
      content: (
        <>
          Product prices, availability, images, descriptions, and other details
          may be updated by sellers from time to time. Nandurbar Bazar does not
          guarantee that all product information will always be completely
          accurate or up to date.
        </>
      ),
    },
    {
      number: "06",
      title: "Orders & Payments",
      content: (
        <>
          Orders placed through the platform may be subject to acceptance and
          availability by the respective seller.
          <br />
          <br />
          Where online payments are available, payments may be processed through
          third-party payment providers. Nandurbar Bazar may not directly store
          or process sensitive payment information.
        </>
      ),
    },
    {
      number: "07",
      title: "Delivery",
      content: (
        <>
          Delivery availability, delivery times, charges, and fulfillment may
          vary depending on the seller, product, location, and other
          circumstances.
          <br />
          <br />
          Any delivery estimates shown on the platform are approximate and may
          change due to circumstances beyond our control.
        </>
      ),
    },
    {
      number: "08",
      title: "Returns & Refunds",
      content: (
        <>
          Returns, exchanges, cancellations, and refunds may depend on the
          individual seller&apos;s policies and the nature of the product.
          Customers should review the applicable seller or product information
          before completing a purchase.
        </>
      ),
    },
    {
      number: "09",
      title: "Prohibited Activities",
      content: (
        <>
          Users must not:
          <ul className="mt-5 space-y-3">
            <li className="flex gap-3">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-cyan-400"
              />
              Use the platform for unlawful or fraudulent activities.
            </li>

            <li className="flex gap-3">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-cyan-400"
              />
              Create fake accounts or impersonate another person or business.
            </li>

            <li className="flex gap-3">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-cyan-400"
              />
              Upload misleading, harmful, or inappropriate content.
            </li>

            <li className="flex gap-3">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-cyan-400"
              />
              Attempt to interfere with or compromise the platform.
            </li>

            <li className="flex gap-3">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-cyan-400"
              />
              Abuse, harass, or deceive other users or sellers.
            </li>
          </ul>
        </>
      ),
    },
    {
      number: "10",
      title: "Account Security",
      content: (
        <>
          If you create an account, you are responsible for maintaining the
          confidentiality of your login credentials and for activity performed
          through your account.
          <br />
          <br />
          If you believe your account has been compromised, please contact us as
          soon as possible.
        </>
      ),
    },
    {
      number: "11",
      title: "Intellectual Property",
      content: (
        <>
          The Nandurbar Bazar name, branding, design, interface, graphics, and
          other original platform content may be protected by applicable
          intellectual property laws.
          <br />
          <br />
          You may not reproduce, copy, modify, distribute, or commercially
          exploit our platform content without appropriate authorization.
        </>
      ),
    },
    {
      number: "12",
      title: "Third-Party Services",
      content: (
        <>
          Nandurbar Bazar may use third-party services for functions such as
          payments, authentication, hosting, analytics, communication, or other
          platform features.
          <br />
          <br />
          Use of such services may also be subject to the terms and policies of
          the respective third-party providers.
        </>
      ),
    },
    {
      number: "13",
      title: "Limitation of Liability",
      content: (
        <>
          To the extent permitted by applicable law, Nandurbar Bazar will not be
          responsible for indirect, incidental, special, or consequential losses
          arising from the use of the platform.
          <br />
          <br />
          We do not guarantee uninterrupted, error-free, or continuously
          available access to the platform.
        </>
      ),
    },
    {
      number: "14",
      title: "Changes to These Terms",
      content: (
        <>
          We may update these Terms of Service from time to time to reflect
          changes to our services, policies, or legal requirements.
          <br />
          <br />
          Updated terms will be posted on this page. Your continued use of the
          platform after changes are published means you accept the updated
          terms.
        </>
      ),
    },
    {
      number: "15",
      title: "Contact Us",
      content: (
        <>
          If you have questions regarding these Terms of Service, you can
          contact the Nandurbar Bazar team.
          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <div className="flex items-center gap-3">
              <Mail size={17} className="text-cyan-400" />
              <span className="text-sm text-white/70">
                nandurbarbazar@gmail.com
              </span>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="pointer-events-none fixed inset-0">
        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)]
            [background-size:50px_50px]
          "
        />

        <div className="absolute left-1/4 top-0 h-[450px] w-[450px] rounded-full bg-cyan-500/[0.06] blur-[130px]" />

        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.05] blur-[120px]" />
      </div>

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="relative z-10 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm font-bold text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back to home
            </Link>

            <Link href="/" className="text-xl font-black tracking-[-0.05em]">
              Nandurbar
              <span className="text-cyan-400">Bazar</span>
              <span className="text-emerald-400">.</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative z-10 px-5 pb-14 pt-20 sm:px-6 md:pb-20 md:pt-28 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div
            className="
              mx-auto
              mb-6
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-cyan-400/20
              bg-cyan-400/[0.07]
              text-cyan-400
              shadow-[0_0_40px_rgba(34,211,238,0.08)]
            "
          >
            <FileText size={24} />
          </div>

          <p
            className="
              mb-4
              text-[10px]
              font-bold
              uppercase
              tracking-[0.3em]
              text-cyan-400
            "
          >
            Legal
          </p>

          <h1
            className="
              text-4xl
              font-black
              tracking-[-0.05em]
              sm:text-5xl
              md:text-6xl
            "
          >
            Terms of
            <span className="ml-2 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Service
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/40 sm:text-base sm:leading-8">
            These terms explain the rules and responsibilities for using
            Nandurbar Bazar and help keep our marketplace safe and trustworthy
            for everyone.
          </p>

          <div className="mt-7 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/25">
            <ShieldCheck size={13} className="text-emerald-400" />
            Last updated: August 31, 2026
          </div>
        </div>
      </section>

      {/* ==========================================
          QUICK INFO
      ========================================== */}

      <section className="relative z-10 px-5 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl">
            <Store size={19} className="mb-4 text-cyan-400" />

            <p className="text-xs font-bold text-white/70">Local Marketplace</p>

            <p className="mt-2 text-xs leading-5 text-white/30">
              Connecting customers with local shops.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl">
            <ShieldCheck size={19} className="mb-4 text-emerald-400" />

            <p className="text-xs font-bold text-white/70">
              Safe & Responsible
            </p>

            <p className="mt-2 text-xs leading-5 text-white/30">
              We work to maintain a trusted marketplace.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl">
            <Mail size={19} className="mb-4 text-purple-400" />

            <p className="text-xs font-bold text-white/70">Need Help?</p>

            <p className="mt-2 text-xs leading-5 text-white/30">
              Contact us whenever you have questions.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          TERMS CONTENT
      ========================================== */}

      <section className="relative z-10 px-5 pb-20 sm:px-6 md:pb-28 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#070d19]/80 backdrop-blur-xl">
            {sections.map((section, index) => (
              <article
                key={section.number}
                className={`
                  p-6
                  sm:p-8
                  md:p-10
                  ${
                    index !== sections.length - 1
                      ? "border-b border-white/[0.06]"
                      : ""
                  }
                `}
              >
                <div className="flex gap-5">
                  <div className="hidden shrink-0 pt-1 sm:block">
                    <span className="font-mono text-[10px] font-bold tracking-widest text-cyan-400/50">
                      {section.number}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                      {section.title}
                    </h2>

                    <div className="mt-4 text-sm leading-7 text-white/45 sm:text-[15px] sm:leading-8">
                      {section.content}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          FOOTER CTA
      ========================================== */}

      <section className="relative z-10 border-t border-white/[0.06] px-5 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <p className="text-sm font-bold text-white/70">
              Have questions about our terms?
            </p>

            <p className="mt-1 text-xs text-white/30">
              Our team is happy to help.
            </p>
          </div>

          <Link
            href="/contact"
            className="
              group
              flex
              items-center
              gap-2
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/[0.06]
              px-5
              py-3
              text-xs
              font-bold
              text-cyan-300
              transition-all
              hover:border-cyan-400/40
              hover:bg-cyan-400/10
            "
          >
            Contact Support
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default TermsPage;
