"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text, Billboard } from "@react-three/drei"
import { useMemo, useState } from "react"

/* 🎨 PROFESSIONAL COLOR PALETTE */
const COLORS = [
  "#4f46e5", // indigo
  "#16a34a", // green
  "#0ea5e9", // sky
  "#f97316", // orange
  "#dc2626", // red
  "#9333ea", // purple
]

/* -------------------- BAR -------------------- */
function Bar({ x, height, label, sold, color, isMobile }) {
  const [hovered, setHovered] = useState(false)

  /* 🔠 AUTO FONT SIZE (LONG NAME → SMALLER) */
  const nameLength = label.length
  const baseFont = isMobile ? 0.12 : 0.14
  const labelFontSize =
    nameLength > 14 ? baseFont * 0.75 :
    nameLength > 10 ? baseFont * 0.85 :
    baseFont

  const valueFontSize = isMobile ? 0.13 : 0.16

  return (
    <group position={[x, 0, 0]}>
      
      {/* BAR */}
      <mesh
        position={[0, height / 2, 0]}
        castShadow
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[0.6, height, 0.6]} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : color}
          emissive={hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.6 : 0}
        />
      </mesh>

      {/* VALUE ABOVE BAR (HOVER) */}
      {hovered && (
        <Billboard>
          <Text
            position={[0, height + 0.28, 0]}
            fontSize={valueFontSize}
            color="#111827"
            anchorX="center"
            anchorY="bottom"
            depthTest={false}
            outlineWidth={0.015}
            outlineColor="#ffffff"
          >
            {sold}
          </Text>
        </Billboard>
      )}

      {/* LABEL BELOW BAR (NAME + NUMBER) */}
      <Billboard>
        <Text
          position={[0, -0.3, 0]}
          fontSize={labelFontSize}
          color={color}
          anchorX="center"
          anchorY="top"
          maxWidth={isMobile ? 0.9 : 1.1}
          textAlign="center"
          depthTest={false}
        >
          {label} ({sold})
        </Text>
      </Billboard>
    </group>
  )
}

/* -------------------- MAIN CHART -------------------- */
export default function TopProducts3DChart({ data }) {

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 640

  const safeData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []

    return data.map((p, i) => ({
      name: p.name || "Unknown",
      sold: Number(p.sold) || 0,
      color: COLORS[i % COLORS.length],
      height: Math.min(
        Math.max((Number(p.sold) || 0) / 2, 0.8),
        6
      )
    }))
  }, [data])

  if (safeData.length === 0) {
    return (
      <div className="h-[320px] flex items-center justify-center text-sm text-slate-500">
        No product data available
      </div>
    )
  }

  return (
    <div className="w-full h-[340px] sm:h-[400px]">
      <Canvas shadows camera={{ position: [0, 5, 9], fov: 45 }}>
        
        {/* LIGHTS */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[6, 10, 6]}
          intensity={1.2}
          castShadow
        />

        {/* BARS */}
        {safeData.map((item, i) => (
          <Bar
            key={i}
            x={i - safeData.length / 2 + 0.5}
            height={item.height}
            label={item.name}
            sold={item.sold}
            color={item.color}
            isMobile={isMobile}
          />
        ))}

        {/* FLOOR */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.25} />
        </mesh>

        {/* CONTROLS */}
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  )
}
