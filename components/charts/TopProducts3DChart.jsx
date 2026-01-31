"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Billboard } from "@react-three/drei"
import { useMemo, useState, useRef } from "react"
import * as THREE from "three"

/* 🎨 PROFESSIONAL COLOR PALETTE */
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
        s.absarc(0, 0, radius, startAngle, startAngle + angle, false)
        s.lineTo(0, 0)
        return s
    }, [startAngle, angle, radius])

    const midAngle = startAngle + angle / 2
    const popOut = hovered ? 0.25 : 0

    const labelRadius = radius + 0.7
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
                    args={[
                        shape,
                        {
                            depth: thickness,
                            bevelEnabled: false,
                        },
                    ]}
                />
                <meshStandardMaterial
                    color={color}
                    emissive={hovered ? color : "#000000"}
                    emissiveIntensity={hovered ? 0.5 : 0}
                />
            </mesh>

            {/* LABEL */}
            <Billboard>
                <Text
                    position={[
                        Math.cos(midAngle) * labelRadius,
                        Math.sin(midAngle) * labelRadius,
                        thickness + 0.1,
                    ]}
                    fontSize={fontSize}
                    color="#111827"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#ffffff"
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
                        fontSize={fontSize + 0.05}
                        color="#000000"
                        outlineWidth={0.02}
                        outlineColor="#ffffff"
                        depthTest={false}
                    >
                        {value}
                    </Text>
                </Billboard>
            )}
        </group>
    )
}

/* -------------------- MAIN PIE CHART -------------------- */
export default function TopProducts3DPieChart({ data }) {
    const isMobile =
        typeof window !== "undefined" && window.innerWidth < 640

    const pieRef = useRef()
    const [isInteracting, setIsInteracting] = useState(false)

    /* 🔄 AUTO ROTATION */
    useFrame(() => {
        if (!isInteracting && pieRef.current) {
            pieRef.current.rotation.z += 0.003
        }
    })

    const processedData = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return []

        const total = data.reduce(
            (sum, d) => sum + Number(d.sold || 0),
            0
        )

        let currentAngle = 0

        return data.map((item, i) => {
            const value = Number(item.sold) || 0
            const angle = (value / total) * Math.PI * 2

            const slice = {
                label: `${item.name} (${value})`,
                value,
                startAngle: currentAngle,
                angle,
                color: COLORS[i % COLORS.length],
            }

            currentAngle += angle
            return slice
        })
    }, [data])

    if (processedData.length === 0) {
        return (
            <div className="h-[320px] flex items-center justify-center text-sm text-slate-500">
                No product data available
            </div>
        )
    }

    return (
        <div className="w-full h-[360px] sm:h-[420px]">
            <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
                {/* LIGHTS */}
                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[6, 8, 6]}
                    intensity={1.2}
                    castShadow
                />

                {/* 🔄 ROTATING PIE */}
                <group
                    ref={pieRef}
                    rotation={[-Math.PI / 2, 0, 0]}
                    onPointerEnter={() => setIsInteracting(true)}
                    onPointerLeave={() => setIsInteracting(false)}
                >
                    {processedData.map((slice, i) => (
                        <PieSlice
                            key={i}
                            {...slice}
                            radius={2.4}
                            thickness={0.6}
                            isMobile={isMobile}
                        />
                    ))}
                </group>

                {/* FLOOR */}
                <mesh
                    receiveShadow
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0, -0.7]}
                >
                    <planeGeometry args={[20, 20]} />
                    <shadowMaterial opacity={0.25} />
                </mesh>

                {/* CONTROLS */}
                <OrbitControls
                    enableZoom={false}
                    maxPolarAngle={Math.PI / 2}
                />
            </Canvas>
        </div>
    )
}
