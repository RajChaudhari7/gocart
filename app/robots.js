export default function robots() {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: "https://gocart-delta.vercel.app/sitemap.js",
    };
}