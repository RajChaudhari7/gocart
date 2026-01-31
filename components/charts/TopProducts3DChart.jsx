"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Billboard } from "@react-three/drei"
import { useMemo, useState, useRef } from "react"
import * as THREE from "three"

/* 🎨 COLORS */
const COLORS = [
    "#4f46e5",
    "#16a34a",
    "#0ea5e9",
    "#f97316",
    "#dc2626",
    "#9333ea",
]

/* -------------------- PIE SLICE -------------------- */
function PieSlice({
    startAngle,
    angle,
    value,
    label,
    color,
    radius,
    thickness,
    isMobile,
}) {
    const [hovered, setHovered] = useState(false)

    const shape = useMemo(() => {
        const s = new THREE.Shape()
        s.moveTo(0, 0)
        s.absarc(0, 0, radius, startAngle, startAngle + angle)
        s.lineTo(0, 0)
        return s
    }, [startAngle, angle, radius])

    const midAngle = startAngle + angle / 2
    const popOut = hovered ? 0.25 : 0
    const fontSize = isMobile ? 0.22 : 0.28

    return (
        <group
            position={[
                Math.cos(midAngle) * popOut,
                Math.sin(midAngle) * popOut,
                0,
            ]}
        >
            {/* SLICE */}
            <mesh
                castShadow
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <extrudeGeometry
                    args={[shape, { depth: thickness, bevelEnabled: false }]}
                />
                <meshStandardMaterial
                    color={color}
                    emissive={hovered ? color : "#000"}
                    emissiveIntensity={hovered ? 0.5 : 0}
                />
            </mesh>

            {/* LABEL */}
            <Billboard>
                <Text
                    position={[
                        Math.cos(midAngle) * (radius + 0.7),
                        Math.sin(midAngle) * (radius + 0.7),
                        thickness + 0.1,
                    ]}
                    fontSize={fontSize}
                    color="#e5e7eb"
                    outlineWidth={0.04}
                    outlineColor="#020617"
                    depthTest={false}
                >
                    {label}
                </Text>
            </Billboard>

            {/* VALUE ON HOVER */}
            {hovered && (
                <Billboard>
                    <Text
                        position={[
                            Math.cos(midAngle) * (radius - 0.2),
                            Math.sin(midAngle) * (radius - 0.2),
                            thickness + 0.35,
                        ]}
                        fontSize={fontSize + 0.06}
                        color="#ffffff"
                        outlineWidth={0.05}
                        outlineColor="#020617"
                        depthTest={false}
                    >
                        {value}
                    </Text>
                </Billboard>
            )}
        </group>
    )
}

/* -------------------- ROTATING PIE GROUP -------------------- */
function RotatingPie({ slices, isMobile }) {
    const pieRef = useRef()
    const [paused, setPaused] = useState(false)

    useFrame(() => {
        if (!paused && pieRef.current) {
            pieRef.current.rotation.z += 0.003
        }
    })

    return (
        <group
            ref={pieRef}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
        >
            {slices.map((slice, i) => (
                <PieSlice
                    key={i}
                    {...slice}
                    radius={2.4}
                    thickness={0.6}
                    isMobile={isMobile}
                />
            ))}
        </group>
    )
}

/* -------------------- MAIN COMPONENT -------------------- */
export default function TopProducts3DPieChart({ data }) {
    const isMobile =
        typeof window !== "undefined" && window.innerWidth < 640

    const slices = useMemo(() => {
        if (!Array.isArray(data)) return []

        // ✅ REMOVE ZERO-SOLD PRODUCTS
        const validData = data.filter(
            (item) => Number(item.sold) > 0
        )

        if (validData.length === 0) return []

        const total = validData.reduce(
            (sum, item) => sum + Number(item.sold),
            0
        )

        let angleAcc = 0

        return validData.map((item, i) => {
            const value = Number(item.sold)
            const angle = (value / total) * Math.PI * 2

            const slice = {
                label: `${item.name} (${value})`,
                value,
                startAngle: angleAcc,
                angle,
                color: COLORS[i % COLORS.length],
            }

            angleAcc += angle
            return slice
        })
    }, [data])

    if (!slices.length) {
        return (
            <div className="h-[320px] flex items-center justify-center text-slate-500">
                No product sales data available
            </div>
        )
    }

    return (
        <div className="w-full h-[360px] sm:h-[420px] rounded-xl overflow-hidden">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 45 }}
                shadows
                onCreated={({ gl }) => {
                    gl.setClearColor("#0f172a") // dark background
                }}
            >
                {/* LIGHTS */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[6, 8, 6]} intensity={1.3} />

                {/* PIE */}
                <RotatingPie slices={slices} isMobile={isMobile} />

                {/* FLOOR */}
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0, -0.7]}
                    receiveShadow
                >
                    <planeGeometry args={[20, 20]} />
                    <shadowMaterial opacity={0.3} />
                </mesh>

                {/* CONTROLS */}
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    )
}
