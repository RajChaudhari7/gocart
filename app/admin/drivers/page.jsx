"use client";

import { useState } from "react";
import axios from "axios";

export default function AddDriver() {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        vehicle: "",
        vehicleNo: "",
        storeId: ""
    });

    const submit = async () => {
        await axios.post("/api/admin/drivers", form);

        alert("Driver Added");
    };

    return (
        <div className="space-y-4">
            <input
                placeholder="Driver Name"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
                placeholder="Phone"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
                placeholder="Vehicle"
                onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
            />

            <input
                placeholder="Vehicle Number"
                onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })}
            />

            <button onClick={submit}>
                Add Driver
            </button>
        </div>
    );
}