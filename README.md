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
5.App will be running at 👉 http://localhost:3000

🙏 Acknowledgement
Thanks to Next.js, Prisma, and PostgreSQL communities for their excellent documentation.

Special thanks to OpenAI API for enabling AI-powered product listing.

Appreciation to the open-source community and resources that guided this project.