# GoCart — Multi-Vendor E-Commerce Platform

🔗 [Live Demo](https://gocart-delta.vercel.app) &nbsp;|&nbsp; 📂 [GitHub Repository](https://github.com/RajChaudhari7/gocart)

A modern multi-vendor e-commerce platform where customers can shop across multiple sellers, sellers can manage their own stores, and admins oversee the entire platform. Powered by Next.js, PostgreSQL, Prisma, and AI-generated product listings.

---

## Features

### For Customers
- Browse and search products across multiple vendors
- Shopping cart and seamless checkout
- Multiple payment options — Stripe (card) and Cash on Delivery
- Coupon/discount code support
- **Prime Membership** with exclusive pricing and benefits
- Order history and product ratings

### For Sellers
- Register as a seller or switch from a customer account
- **AI-powered product listing** — upload a product image and the platform auto-generates the product name, description, price, and offer price
- Add, edit, and delete products
- Seller dashboard to manage orders, revenue, and performance

### For Admins
- Manage and approve/block user accounts
- Approve and verify sellers
- Monitor and manage all product listings
- View and manage orders across the platform
- Handle reports, disputes, and platform settings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Clerk |
| Payments | Stripe |
| AI | OpenAI API (product listing generation) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- Clerk account
- Stripe account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/RajChaudhari7/gocart.git
cd gocart

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/gocart"
NEXTAUTH_SECRET=your_nextauth_secret

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

```bash
# Run Prisma migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
gocart/
├── app/              # Next.js app router — pages and API routes
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and API clients
├── middlewares/      # Auth and role-check middleware
├── inngest/          # Background job handlers
├── prisma/           # Prisma schema and migrations
├── configs/          # App-level config files
└── public/           # Static assets
```

---

## Key Implementation Highlights

- **AI product generation** — product images are sent server-side to OpenAI's vision API; the response returns a structured name, description, and price suggestion that sellers can review and edit before publishing
- **Role-based access control** — Clerk authentication with role metadata (`user` / `seller` / `admin`); each section of the app is protected by middleware checking the user's role
- **Stripe integration** — card payments via Stripe Checkout; webhook handlers confirm orders on `payment_intent.succeeded` events
- **Prime membership** — subscribers see exclusive pricing applied automatically at checkout

---

## Screenshots

> Add screenshots of the homepage, product listing with AI generation, seller dashboard, and checkout here.

---

## Author

**Raj Chaudhari** — [LinkedIn](https://linkedin.com/in/raj-chaudhari-mern) · [GitHub](https://github.com/RajChaudhari7)
