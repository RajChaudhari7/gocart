"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text, Billboard } from "@react-three/drei"
import { useMemo, useState } from "react"

const COLORS = [
  "#4f46e5",
  "#16a34a",
  "#0ea5e9",
  "#f97316",
  "#dc2626"
]

const FONT_URL =
  "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTcviYwY.woff"

export default function TopProducts3DChart({ data = [] }) {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 640

  const products = useMemo(() => {
    if (!data.length) return []
    return data.map((p, i) => ({
      ...p,
      color: COLORS[i % COLORS.length],
      height: Math.min(Math.max(p.sold * 0.6, 1.2), 6)
    }))
  }, [data])

  if (!products.length) {
    return (
      <div className="h-[340px] flex items-center justify-center text-sm text-slate-400">
        No top-selling products yet
      </div>
    )
  }

  return (
    <div className="w-full h-[340px] sm:h-[420px]">
      <Canvas camera={{ position: [0, 5, 9], fov: 45 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 10, 6]} intensity={1.2} castShadow />

        {products.map((item, i) => (
          <Bar
            key={i}
            x={i - products.length / 2 + 0.5}
            {...item}
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

/* ---------------- BAR ---------------- */
function Bar({ x, height, name, sold, color, isMobile }) {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={[x, 0, 0]}>
      <mesh
        position={[0, height / 2, 0]}
        castShadow
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[0.6, height, 0.6]} />
        <meshStandardMaterial
          color={hovered ? "#fff" : color}
          emissive={hovered ? color : "#000"}
          emissiveIntensity={hovered ? 0.55 : 0}
        />
      </mesh>

      {hovered && (
        <Billboard>
          <Text
            position={[0, height + 0.3, 0]}
            font={FONT_URL}
            fontSize={isMobile ? 0.16 : 0.2}
            color="#111827"
            outlineWidth={0.015}
            outlineColor="#ffffff"
          >
            {sold} sold
          </Text>
        </Billboard>
      )}

      <Billboard>
        <Text
          position={[0, -0.35, 0]}
          font={FONT_URL}
          fontSize={isMobile ? 0.14 : 0.17}
          color={color}
          maxWidth={1.2}
          textAlign="center"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  )
}
