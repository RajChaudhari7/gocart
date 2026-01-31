"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text, Billboard } from "@react-three/drei"
import { useMemo, useState } from "react"

/* 🎨 PROFESSIONAL COLOR PALETTE */
const COLORS = [
  "#4f46e5",
  "#16a34a",
  "#0ea5e9",
  "#f97316",
  "#dc2626",
  "#9333ea",
]

/* 🔠 GOOGLE FONT (NO LOCAL FILE NEEDED) */
const FONT_URL =
  "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTcviYwY.woff"

/* SHOW ONLY TOP PRODUCTS */
const MAX_PRODUCTS = 5

/* -------------------- BAR -------------------- */
function Bar({ x, height, label, sold, color, isMobile }) {
  const [hovered, setHovered] = useState(false)

  const baseFont = isMobile ? 0.14 : 0.17
  const labelFontSize =
    label.length > 14 ? baseFont * 0.75 :
    label.length > 10 ? baseFont * 0.85 :
    baseFont

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
          emissive={hovered ? color : "#000"}
          emissiveIntensity={hovered ? 0.55 : 0}
        />
      </mesh>

      {/* SOLD VALUE (HOVER) */}
      {hovered && (
        <Billboard>
          <Text
            position={[0, height + 0.3, 0]}
            font={FONT_URL}
            fontSize={isMobile ? 0.16 : 0.2}
            color="#111827"
            anchorX="center"
            anchorY="bottom"
            depthTest={false}
            outlineWidth={0.015}
            outlineColor="#ffffff"
          >
            {sold} sold
          </Text>
        </Billboard>
      )}

      {/* PRODUCT NAME */}
      <Billboard>
        <Text
          position={[0, -0.35, 0]}
          font={FONT_URL}
          fontSize={labelFontSize}
          color={color}
          anchorX="center"
          anchorY="top"
          maxWidth={isMobile ? 0.9 : 1.2}
          textAlign="center"
          depthTest={false}
        >
          {label}
        </Text>
      </Billboard>
    </group>
  )
}

/* -------------------- MAIN CHART -------------------- */
export default function TopProducts3DChart({ data }) {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 640

  const topProducts = useMemo(() => {
    if (!Array.isArray(data)) return []

    return [...data]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, MAX_PRODUCTS)
      .map((p, i) => ({
        name: p.name || "Unknown",
        sold: Number(p.sold) || 0,
        color: COLORS[i % COLORS.length],
        height: Math.min(Math.max((p.sold || 0) / 2, 1), 6),
      }))
  }, [data])

  if (!topProducts.length) {
    return (
      <div className="h-[320px] flex items-center justify-center text-sm text-slate-500">
        No top selling products
      </div>
    )
  }

  return (
    <div className="w-full h-[340px] sm:h-[420px]">
      <Canvas shadows camera={{ position: [0, 5, 9], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 10, 6]} intensity={1.2} castShadow />

        {topProducts.map((item, i) => (
          <Bar
            key={i}
            x={i - topProducts.length / 2 + 0.5}
            height={item.height}
            label={item.name}
            sold={item.sold}
            color={item.color}
            isMobile={isMobile}
          />
        ))}

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.25} />
        </mesh>

        <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  )
}
