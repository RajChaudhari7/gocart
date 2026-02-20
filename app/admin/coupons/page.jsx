'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { Trash2 } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"

export default function AdminCoupons() {

    const { getToken } = useAuth()

    const [coupons, setCoupons] = useState([])

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: new Date()
    })

    const fetchCoupons = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/admin/coupon', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setCoupons(data.coupons)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        try {
            const token = await getToken()

            newCoupon.discount = Number(newCoupon.discount)
            newCoupon.expiresAt = new Date(newCoupon.expiresAt)

            const { data } = await axios.post('/api/admin/coupon', { coupon: newCoupon }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            toast.success(data.message)
            await fetchCoupons()

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const handleChange = (e) => {
        setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
    }

    const deleteCoupon = async (code) => {
        try {
            const confirm = window.confirm("Are you sure you want to delete this coupon?")
            if (!confirm) return;

            const token = await getToken()

            await axios.delete(`/api/admin/coupon?code=${code}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            await fetchCoupons()
            toast.success("Coupon Deleted successfully")

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    useEffect(() => {
        fetchCoupons();
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">

            {/* Page Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-800">
                    Coupon Management
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                    Create and manage discount coupons for your platform
                </p>
            </div>

            {/* ================= Add Coupon Card ================= */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-3xl">

                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                    Create New Coupon
                </h2>

                <form
                    onSubmit={(e) => toast.promise(handleAddCoupon(e), { loading: "Adding coupon..." })}
                    className="space-y-5"
                >

                    {/* Code & Discount */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Coupon Code"
                            name="code"
                            value={newCoupon.code}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-600 outline-none transition"
                        />

                        <input
                            type="number"
                            placeholder="Discount (%)"
                            min={1}
                            max={100}
                            name="discount"
                            value={newCoupon.discount}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-600 outline-none transition"
                        />
                    </div>

                    {/* Description */}
                    <input
                        type="text"
                        placeholder="Coupon Description"
                        name="description"
                        value={newCoupon.description}
                        onChange={handleChange}
                        required
                        className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-600 outline-none transition"
                    />

                    {/* Expiry Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            name="expiresAt"
                            value={format(newCoupon.expiresAt, 'yyyy-MM-dd')}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-600 outline-none transition"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="grid md:grid-cols-2 gap-6 pt-2">

                        {/* New User Toggle */}
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border">
                            <span className="text-sm font-medium text-slate-700">
                                For New Users
                            </span>
                            <input
                                type="checkbox"
                                checked={newCoupon.forNewUser}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                                className="w-5 h-5 accent-green-600 cursor-pointer"
                            />
                        </div>

                        {/* Member Toggle */}
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border">
                            <span className="text-sm font-medium text-slate-700">
                                For Members
                            </span>
                            <input
                                type="checkbox"
                                checked={newCoupon.forMember}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })}
                                className="w-5 h-5 accent-green-600 cursor-pointer"
                            />
                        </div>

                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-900 active:scale-95 transition-all duration-200 shadow-md"
                    >
                        Add Coupon
                    </button>

                </form>
            </div>


            {/* ================= Coupon List ================= */}
            <div className="mt-16">

                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                    Existing Coupons
                </h2>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">

                            <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left">Code</th>
                                    <th className="px-6 py-4 text-left">Description</th>
                                    <th className="px-6 py-4 text-left">Discount</th>
                                    <th className="px-6 py-4 text-left">Expiry</th>
                                    <th className="px-6 py-4 text-left">New User</th>
                                    <th className="px-6 py-4 text-left">Member</th>
                                    <th className="px-6 py-4 text-left">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200">

                                {coupons.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-slate-400">
                                            No coupons available
                                        </td>
                                    </tr>
                                )}

                                {coupons.map((coupon) => (
                                    <tr key={coupon.code} className="hover:bg-slate-50 transition">

                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {coupon.code}
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            {coupon.description}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-green-600">
                                            {coupon.discount}%
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            {format(coupon.expiresAt, 'yyyy-MM-dd')}
                                        </td>

                                        <td className="px-6 py-4">
                                            {coupon.forNewUser ? (
                                                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs rounded-full bg-slate-200 text-slate-600">
                                                    No
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {coupon.forMember ? (
                                                <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs rounded-full bg-slate-200 text-slate-600">
                                                    No
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <Trash2
                                                onClick={() =>
                                                    toast.promise(
                                                        deleteCoupon(coupon.code),
                                                        { loading: "Deleting coupon..." }
                                                    )
                                                }
                                                className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer transition"
                                            />
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>
                    </div>

                </div>
            </div>

        </div>
    )
}