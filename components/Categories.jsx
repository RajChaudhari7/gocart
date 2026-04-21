'use client'

import { useRouter } from 'next/navigation'
import { Laptop, Shirt, Watch, Smartphone } from 'lucide-react'

const categories = [
  { name: 'Electronics', icon: Laptop },
  { name: 'Fashion', icon: Shirt },
  { name: 'Watches', icon: Watch },
  { name: 'Mobiles', icon: Smartphone },
]

export default function Categories() {
  const router = useRouter()

  const handleClick = (category) => {
    router.push(`/product?category=${category}`)
  }

  return (
    <section className="py-16 bg-black text-white">
      <h2 className="text-3xl font-bold text-center mb-10">Categories</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 max-w-6xl mx-auto">
        {categories.map((cat, index) => {
          const Icon = cat.icon
          return (
            <div
              key={index}
              onClick={() => handleClick(cat.name)}
              className="cursor-pointer bg-[#020617] p-6 rounded-xl flex flex-col items-center hover:scale-105 transition"
            >
              <Icon size={40} />
              <p className="mt-3">{cat.name}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}