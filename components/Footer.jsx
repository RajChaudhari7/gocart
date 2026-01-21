import Link from "next/link"

const Footer = () => {

    /* ---------------- Icons ---------------- */
    const MailIcon = () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14.6654 4.66699L8.67136 8.48499C8.46796 8.60313 8.23692 8.66536 8.0017 8.66536C7.76647 8.66536 7.53544 8.60313 7.33203 8.48499L1.33203 4.66699" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="1.33203" y="2.66699" width="13.3333" height="10.6667" rx="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )

    const PhoneIcon = () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M9.22 11.045C7.37 10.136 5.87 8.64 4.96 6.79" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2.665 1.333H4.665C5.399 1.333 6 1.933 6 2.667V4.667C6 5.4 5.399 6 4.665 6H3.333" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13.332 9.999H11.332C10.599 9.999 9.999 10.599 9.999 11.333V13.333C9.999 14.066 10.599 14.666 11.332 14.666H13.332" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )

    const MapPinIcon = () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.334 6.666C13.334 10 8 14.666 8 14.666C8 14.666 2.667 10 2.667 6.666C2.667 3.724 5.059 1.333 8 1.333C10.941 1.333 13.334 3.724 13.334 6.666Z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="6.666" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )

    const socialIcons = [
        { icon: FacebookIcon, link: "https://www.facebook.com" },
        { icon: InstagramIcon, link: "https://www.instagram.com" },
        { icon: TwitterIcon, link: "https://twitter.com" },
        { icon: LinkedinIcon, link: "https://www.linkedin.com" },
    ]

    /* ---------------- Data ---------------- */

    const linkSections = [
        {
            title: "PRODUCTS",
            links: [
                { text: "Earphones", path: "/shop" },
                { text: "Headphones", path: "/shop" },
                { text: "Smartphones", path: "/shop" },
                { text: "Laptops", path: "/shop" },
            ],
        },
        {
            title: "COMPANY",
            links: [
                { text: "Home", path: "/" },
                { text: "About Us", path: "/about" },
                { text: "Become a Member", path: "/pricing" },
                { text: "Create Store", path: "/create-store" },
            ],
        },
        {
            title: "CONTACT",
            links: [
                { text: "globalmart@gmail.com", icon: MailIcon },
                { text: "+91 8600412566", icon: PhoneIcon },
                { text: "Nandurbar, Maharashtra", icon: MapPinIcon },
            ],
        },
    ]

    return (
        <footer className="bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-6">
            <div className="max-w-7xl mx-auto">

                {/* TOP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16 border-b border-white/10">

                    {/* BRAND */}
                    <div>
                        <Link href="/" className="text-4xl font-semibold">
                            <span className="text-cyan-400">Global</span>
                            <span className="text-white">Mart</span>
                            <span className="text-emerald-400 text-5xl">.</span>
                        </Link>

                        <p className="mt-6 text-sm text-white/60 max-w-md">
                            GlobalMart is your destination for premium gadgets and smart
                            technology. Discover innovation, performance, and reliability —
                            all in one place.
                        </p>

                        <div className="flex items-center gap-3 mt-5"> {socialIcons.map((item, i) => (<Link href={item.link} key={i} className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:scale-105 hover:border border-slate-300 transition rounded-full">
                            <item.icon /> </Link>))} </div>
                    </div>

                    {/* LINKS */}
                    <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {linkSections.map((section, index) => (
                            <div key={index}>
                                <h3 className="font-semibold text-sm tracking-wider text-white/80 mb-5">
                                    {section.title}
                                </h3>
                                <ul className="space-y-3 text-sm text-white/60">
                                    {section.links.map((link, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            {link.icon && <link.icon />}
                                            {link.path ? (
                                                <Link href={link.path} className="hover:text-cyan-400 transition">
                                                    {link.text}
                                                </Link>
                                            ) : (
                                                <span>{link.text}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BOTTOM */}
                <div className="py-6 text-center text-sm text-white/50">
                    © {new Date().getFullYear()} GlobalMart. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

export default Footer
