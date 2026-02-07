'use client'

import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminApprove() {
    const { user } = useUser()
    const { getToken } = useAuth()

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionId, setActionId] = useState(null)

    const fetchStores = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/admin/approve-store', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStores(data.stores)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async ({ storeId, status }) => {
        setActionId(storeId)
        try {
            const token = await getToken()
            const { data } = await axios.post(
                '/api/admin/approve-store',
                { storeId, status },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            toast.success(data.message)
            await fetchStores()
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setActionId(null)
        }
    }

    useEffect(() => {
        if (user) fetchStores()
    }, [user])

    if (loading) return <Loading />

    return (
        <div className="mb-28 max-w-5xl">
            <h1 className="text-3xl font-semibold text-slate-800 mb-6">
                Store Approval
            </h1>

            {stores.length ? (
                <div className="flex flex-col gap-5">
                    {stores.map(store => (
                        <div
                            key={store.id}
                            className="bg-white border rounded-xl shadow-sm p-6 flex max-md:flex-col justify-between gap-4"
                        >
                            <StoreInfo store={store} />

                            <div className="flex items-center gap-3 flex-wrap">
                                <button
                                    disabled={actionId === store.id}
                                    onClick={() =>
                                        toast.promise(
                                            handleApprove({
                                                storeId: store.id,
                                                status: 'approved'
                                            }),
                                            { loading: "Approving store..." }
                                        )
                                    }
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-60"
                                >
                                    Approve
                                </button>

                                <button
                                    disabled={actionId === store.id}
                                    onClick={() =>
                                        toast.promise(
                                            handleApprove({
                                                storeId: store.id,
                                                status: 'rejected'
                                            }),
                                            { loading: "Rejecting store..." }
                                        )
                                    }
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-60"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-2xl text-slate-400 font-medium">
                        No store applications pending 🚀
                    </h1>
                </div>
            )}
        </div>
    )
}
