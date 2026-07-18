"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";

import {
    setFollowedStores,
} from "./followStoreSlice";

export default function FollowStoreInitializer() {

    const dispatch = useDispatch();

    useEffect(() => {

        fetchFollowedStores();

    }, []);

    const fetchFollowedStores = async () => {

        try {

            const { data } = await axios.get(
                "/api/follow-store"
            );

            dispatch(
                setFollowedStores(data)
            );

        } catch (error) {

            console.log(error);

        }

    };

    return null;

}