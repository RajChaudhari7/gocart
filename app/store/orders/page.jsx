'use client'

import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useOrderStore } from "@/hooks/use-order-store"

const STATUS_FLOW = [
    "ORDER_PLACED",
    "PACKED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERY_INITIATED",
    "DELIVERED",
    "CANCELLED"
]

export default function StoreOrders() {

    const { getToken } = useAuth()
    const { setOrderCount } = useOrderStore()

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [showOtpModal, setShowOtpModal] = useState(false)
    const [otpOrder, setOtpOrder] = useState(null)
    const [enteredOtp, setEnteredOtp] = useState("")
    const [verifyingOtp, setVerifyingOtp] = useState(false)

    const [otpExpiryTime, setOtpExpiryTime] = useState(null)
    const [timeLeft, setTimeLeft] = useState(0)

    const [resendCooldown, setResendCooldown] = useState(0)
    const [resendingOtp, setResendingOtp] = useState(false)

    const [showReturnOtpModal, setShowReturnOtpModal] = useState(false)
    const [returnOrder, setReturnOrder] = useState(null)
    const [returnOtp, setReturnOtp] = useState("")
    const [verifyingReturnOtp, setVerifyingReturnOtp] = useState(false)

    const currentDate = new Date()

    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)

    const months = [
        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"
    ]

    /* ================= FETCH ================= */

    const fetchOrders = async () => {

        try {

            const token = await getToken()

            const { data } = await axios.get('/api/store/orders',{
                headers:{ Authorization:`Bearer ${token}` }
            })

            setOrders(data.orders)
            setOrderCount(data.activeCount)

        } catch (error) {

            toast.error(error?.response?.data?.error || error.message)

        } finally {
            setLoading(false)
        }

    }

    /* ================= UPDATE STATUS ================= */

    const updateOrderStatus = async (order,newStatus) => {

        const currentIndex = STATUS_FLOW.indexOf(order.status)
        const newIndex = STATUS_FLOW.indexOf(newStatus)

        if(newIndex < currentIndex){
            toast.error("You cannot move order status backwards")
            return
        }

        try{

            const token = await getToken()

            await axios.post(
                "/api/store/orders",
                {orderId:order.id,status:newStatus},
                {headers:{Authorization:`Bearer ${token}`}}
            )

            await fetchOrders()

            toast.success(`Order status updated to ${newStatus}`)

        }catch(error){

            toast.error(error?.response?.data?.error || error.message)

        }

    }

    /* ================= CANCEL ================= */

    const cancelOrder = async(order)=>{

        if(order.status === "DELIVERED" || order.status === "CANCELLED") return

        if(!confirm("Are you sure you want to cancel this order?")) return

        try{

            const token = await getToken()

            await axios.post(
                "/api/orders/cancel",
                {orderId:order.id},
                {headers:{Authorization:`Bearer ${token}`}}
            )

            toast.success("Order canceled successfully")

            fetchOrders()

        }catch(error){

            toast.error(error?.response?.data?.error || error.message)

        }

    }

    /* ================= VERIFY DELIVERY OTP ================= */

    const verifyDeliveryOtp = async ()=>{

        if(enteredOtp.length !== 6){
            toast.error("Enter valid OTP")
            return
        }

        try{

            setVerifyingOtp(true)

            const token = await getToken()

            await axios.post(
                "/api/store/orders/verify-delivery-otp",
                {orderId:otpOrder.id,otp:enteredOtp},
                {headers:{Authorization:`Bearer ${token}`}}
            )

            toast.success("Delivery verified")

            setShowOtpModal(false)
            setEnteredOtp("")
            setOtpOrder(null)

            fetchOrders()

        }catch(error){

            toast.error(error?.response?.data?.error || "OTP verification failed")

        }finally{

            setVerifyingOtp(false)

        }

    }

    /* ================= VERIFY RETURN OTP ================= */

    const verifyReturnOtp = async ()=>{

        if(returnOtp.length !== 6){
            toast.error("Enter valid OTP")
            return
        }

        try{

            setVerifyingReturnOtp(true)

            const token = await getToken()

            await axios.post(
                "/api/store/orders/verify-return-otp",
                {orderId:returnOrder.id,otp:returnOtp},
                {headers:{Authorization:`Bearer ${token}`}}
            )

            toast.success("Return verified")

            setShowReturnOtpModal(false)
            setReturnOtp("")
            setReturnOrder(null)

            fetchOrders()

        }catch(error){

            toast.error(error?.response?.data?.error || "Verification failed")

        }finally{

            setVerifyingReturnOtp(false)

        }

    }

    /* ================= RESEND OTP ================= */

    const resendOtp = async()=>{

        try{

            setResendingOtp(true)

            const token = await getToken()

            const {data} = await axios.post(
                "/api/store/orders/resend-otp",
                {orderId:otpOrder.id},
                {headers:{Authorization:`Bearer ${token}`}}
            )

            toast.success("OTP resent")

            if(data.order){

                setOtpOrder(data.order)

                if(data.order.deliveryOtpExpiry){

                    const exp = new Date(data.order.deliveryOtpExpiry)

                    setOtpExpiryTime(exp)
                    setTimeLeft(Math.floor((exp - new Date())/1000))

                }

            }

            setResendCooldown(60)

        }catch(error){

            toast.error("Resend failed")

        }finally{

            setResendingOtp(false)

        }

    }

    /* ================= FILTER ================= */

    const filteredOrders = orders.filter(order=>{

        const orderDate = new Date(order.createdAt)

        if(selectedDate){

            const selected = new Date(selectedDate)

            return (
                orderDate.getDate() === selected.getDate() &&
                orderDate.getMonth() === selected.getMonth() &&
                orderDate.getFullYear() === selected.getFullYear()
            )

        }

        return(
            orderDate.getFullYear() === selectedYear &&
            orderDate.getMonth() === selectedMonth
        )

    })

    /* ================= REVENUE ================= */

    const revenue = filteredOrders
        .filter(o=>o.status !== "CANCELLED")
        .reduce((t,o)=>t+o.total,0)

    const cancelledAmount = filteredOrders
        .filter(o=>o.status === "CANCELLED")
        .reduce((t,o)=>t+o.total,0)

    /* ================= EFFECTS ================= */

    useEffect(()=>{

        fetchOrders()

    },[])

    useEffect(()=>{

        if(resendCooldown <= 0) return

        const t = setInterval(()=>{

            setResendCooldown(prev => Math.max(prev-1,0))

        },1000)

        return()=>clearInterval(t)

    },[resendCooldown])

    useEffect(()=>{

        if(!showOtpModal || !otpExpiryTime) return

        const interval = setInterval(()=>{

            const diff = otpExpiryTime - new Date()

            setTimeLeft(Math.max(0,Math.floor(diff/1000)))

        },1000)

        return()=>clearInterval(interval)

    },[showOtpModal,otpExpiryTime])

    if(loading) return <Loading/>

    return(
        <>
        
        {/* HEADER */}

        <div className="flex justify-between mb-6">

            <h1 className="text-3xl font-semibold text-slate-700">
                Store Orders
            </h1>

            <div className="flex gap-3">

                <select
                value={selectedMonth}
                onChange={e=>{
                    setSelectedMonth(Number(e.target.value))
                    setSelectedDate(null)
                }}
                className="border rounded-lg px-3 py-2"
                >
                {months.map((m,i)=>(
                    <option key={i} value={i}>{m}</option>
                ))}
                </select>

                <select
                value={selectedYear}
                onChange={e=>{
                    setSelectedYear(Number(e.target.value))
                    setSelectedDate(null)
                }}
                className="border rounded-lg px-3 py-2"
                >
                {[...new Set(orders.map(o=>new Date(o.createdAt).getFullYear()))]
                .sort((a,b)=>b-a)
                .map(year=>(
                    <option key={year}>{year}</option>
                ))}
                </select>

            </div>

        </div>

        {/* SUMMARY */}

        <div className="bg-white shadow rounded-xl p-5 border mb-6">

            <div className="grid sm:grid-cols-2 gap-6">

                <div className="bg-emerald-50 p-4 rounded-lg">

                    <p className="text-sm text-emerald-600">
                        Revenue
                    </p>

                    <p className="text-2xl font-bold text-emerald-700">
                        ₹{revenue}
                    </p>

                </div>

                <div className="bg-red-50 p-4 rounded-lg">

                    <p className="text-sm text-red-600">
                        Cancelled Orders
                    </p>

                    <p className="text-2xl font-bold text-red-700">
                        ₹{cancelledAmount}
                    </p>

                </div>

            </div>

        </div>

        {/* ORDERS */}

        <div className="grid gap-5 max-w-5xl">

            {filteredOrders.map(order=>(
                
                <div
                key={order.id}
                className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500"
                >

                    <div className="flex justify-between mb-3">

                        <h2 className="text-lg font-medium">
                            {order.user?.name}
                        </h2>

                        <span className="px-3 py-1 bg-yellow-100 rounded text-sm">
                            {order.status}
                        </span>

                    </div>

                    <div className="flex gap-2 mt-4">

                        {order.status !== "CANCELLED" && (
                            <select
                            value={order.status}
                            onChange={e=>updateOrderStatus(order,e.target.value)}
                            className="border rounded px-3 py-1 text-sm"
                            >
                            {STATUS_FLOW.map(s=>(
                                <option key={s}>{s}</option>
                            ))}
                            </select>
                        )}

                        <button
                        onClick={()=>cancelOrder(order)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        >
                        Cancel
                        </button>

                    </div>

                </div>

            ))}

        </div>

        {/* RETURN OTP MODAL */}

        {showReturnOtpModal && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl p-6 w-full max-w-md">

                <h2 className="text-xl font-semibold text-center mb-4">
                    Verify Return OTP
                </h2>

                <input
                type="text"
                maxLength={6}
                value={returnOtp}
                onChange={e=>setReturnOtp(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-center text-xl tracking-widest"
                />

                <div className="flex gap-3 mt-5">

                    <button
                    onClick={()=>setShowReturnOtpModal(false)}
                    className="flex-1 bg-gray-200 py-2 rounded"
                    >
                    Cancel
                    </button>

                    <button
                    onClick={verifyReturnOtp}
                    className="flex-1 bg-purple-600 text-white py-2 rounded"
                    >
                    Verify
                    </button>

                </div>

            </div>

        </div>

        )}

        </>
    )

}