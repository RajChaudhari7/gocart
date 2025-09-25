GlobalMart
GlobalMart is a modern multivendor ecommerce platform built with Next.js, Prisma, and PostgreSQL. It allows users to shop as customers or become sellers and manage their stores with ease.

✨ A unique feature is its AI-powered product listing system: sellers upload a product image, and the platform automatically generates the name, description, price, and offer price, saving time and ensuring professional listings.

✨ Features
🔑 User authentication & authorization

🛒 Customers can become sellers

🤖 AI-powered product listings

📦 Product management (add, edit, delete)

🛍 Shopping cart & checkout system

📊 Seller dashboard for orders & revenue

🔎 Smart search & filtering

📱 Responsive design for all devices

👥 Roles & Permissions
👤 User (Customer)

Register and log in securely with the help of clerk

Browse products across multiple vendors

Add products to the cart and checkout

Search and filter products

View order history

Can rate the products

Can use the Coupon Code

Can be the prime member

🛍 Seller (Vendor)

Register as a seller / switch to seller account

Upload product images → AI auto-generates product details (name, description, price, offer)

Add, edit, or delete products

Manage orders received from customers

Track sales, revenue, and performance in the seller dashboard

🛠 Admin

Manage all users (approve/block accounts)

Approve or verify sellers

Monitor and manage product listings

View and manage orders across the platform

Handle reports, disputes, and platform settings

🛠 Tech Stack
Frontend: Next.js, Tailwind CSS

Backend: Next.js API Routes

Database: PostgreSQL

ORM: Prisma

AI Integration: OpenAI API

Deployment: Vercel

⚙️ Installation & Setup
1.Clone the repo

git clone https://github.com/RajChaudhari7/gocart.git
cd gocart
2.Install dependencies

npm install
3.Configure environment variables in .env

DATABASE_URL="postgresql://username:password@localhost:5432/globalmart"
NEXTAUTH_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_api_key
4.Start development server

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/(public)/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Outfit](https://vercel.com/font), a new font family for Vercel.

---

## 🤝 Contributing <a name="-contributing"></a>

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for more details on how to get started.

---

## 📜 License <a name="-license"></a>

This project is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
