'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import toast from "react-hot-toast"

export default function ReturnPage() {

  const { orderId } = useParams()
  const { getToken } = useAuth()

  const [items,setItems] = useState([])
  const [selected,setSelected] = useState({})

  const fetchOrder = async () => {
    const token = await getToken()

    const {data} = await axios.get(`/api/return/${orderId}`,{
      headers:{Authorization:`Bearer ${token}`}
    })

    setItems(data.items)
  }

  useEffect(()=>{
    fetchOrder()
  },[])

  const toggleItem = (id) => {
    setSelected(prev=>({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const submitReturn = async () => {
    const products = Object.keys(selected).filter(k=>selected[k])

    if(!products.length){
      toast.error("Select product")
      return
    }

    const token = await getToken()

    await axios.post("/api/return/create",{
      orderId,
      products
    },{
      headers:{Authorization:`Bearer ${token}`}
    })

    toast.success("OTP sent to your email")
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl mb-6">Return Products</h1>

      {items.map(item=>(
        <div key={item.productId} className="flex gap-4 mb-4">

          <input
            type="checkbox"
            onChange={()=>toggleItem(item.productId)}
          />

          <img
            src={item.product.images[0]}
            width={60}
          />

          <div>
            <p>{item.product.name}</p>
            <p>Qty : {item.quantity}</p>
          </div>

        </div>
      ))}

      <button
        onClick={submitReturn}
        className="bg-red-600 px-6 py-3 mt-6"
      >
        Return Selected Products
      </button>

    </div>
  )
}