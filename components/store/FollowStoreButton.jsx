"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";

import {
    followStore,
    unfollowStore,
} from "@/lib/features/followStore/followStoreSlice";

export default function FollowStoreButton({
    store,
    variant = "card",
    className = "",
}) {

    const dispatch = useDispatch();

    const followedStores = useSelector(
        (state) => state.followStore.stores
    );

    const [loading, setLoading] = useState(false);

    const isFollowing = useMemo(() => {

        return followedStores.some(
            (item) => item.id === store.id
        );

    }, [followedStores, store.id]);

    const handleToggleFollow = async (event) => {
        event?.preventDefault();
        event?.stopPropagation();

        if (loading) return;

        setLoading(true);

        try {

            if (isFollowing) {

                await axios.delete(
                    `/api/follow-store/${store.id}`
                );

                dispatch(
                    unfollowStore(store.id)
                );

                toast.success("Store unfollowed");

            } else {

                await axios.post(
                    "/api/follow-store",
                    {
                        storeId: store.id,
                    }
                );

                dispatch(
                    followStore(store)
                );

                toast.success("Store followed");

            }

        } catch (error) {

            console.log(error);

            toast.error(
                error?.response?.data?.error ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);

        }

    };

    const isProfile = variant === "profile";

    return (

        <motion.button

            whileTap={{ scale: 0.96 }}

            whileHover={{ scale: 1.02 }}

            onClick={handleToggleFollow}

            disabled={loading}

            className={`
  flex
  items-center
  justify-center
  gap-2
  font-semibold
  transition-all
  duration-300

  ${isProfile
                    ? "px-6 py-3 rounded-2xl text-sm"
                    : "w-full px-4 py-2 rounded-xl text-xs"
                }

  ${isFollowing
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }

  disabled:opacity-60
  disabled:cursor-not-allowed

  ${className}
`}
        >

            {loading ? (

                <Loader2
                    size={18}
                    className="animate-spin"
                />

            ) : isFollowing ? (

                <>
                    <Check size={18} />
                    Following
                </>

            ) : (

                <>
                    <UserPlus size={18} />
                    Follow
                </>

            )}

        </motion.button>

    );

}