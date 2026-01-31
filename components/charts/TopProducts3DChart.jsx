"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text, Billboard } from "@react-three/drei"
import { useMemo, useState } from "react"

/* -------------------- BAR -------------------- */
function Bar({ x, height, label, sold, isMobile }) {
  const [hovered, setHovered] = useState(false)

  // 🔥 Auto-scale font sizes
  const labelFontSize = isMobile ? 0.11 : 0.14
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
          color={hovered ? "#6366f1" : "#4f46e5"}
          emissive={hovered ? "#a5b4fc" : "#000000"}
          emissiveIntensity={hovered ? 0.6 : 0}
        />
      </mesh>

      {/* VALUE (ABOVE BAR ON HOVER) */}
      {hovered && (
        <Billboard>
          <Text
            position={[0, height + 0.28, 0]}
            fontSize={valueFontSize}
            color="#111827"
            anchorX="center"
            anchorY="bottom"
            depthTest={false}
            outlineWidth={0.012}
            outlineColor="#ffffff"
          >
            {sold}
          </Text>
        </Billboard>
      )}

      {/* LABEL (BELOW BAR) */}
      <Billboard>
        <Text
          position={[0, -0.28, 0]}
          fontSize={labelFontSize}
          color="#334155"
          anchorX="center"
          anchorY="top"
          maxWidth={isMobile ? 0.9 : 1.1}
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

  // ✅ Mobile detection (safe for Next.js)
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 640

  const safeData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []

    return data.map(p => ({
      name: p.name || "Unknown",
      sold: Number(p.sold) || 0,
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
