"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { useMemo, useState } from "react"

function Bar({ x, height, label }) {
  const [hovered, setHovered] = useState(false)

  return (
    <mesh
      position={[x, height / 2, 0]}
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

      {hovered && (
        <Text
          position={[0, height / 2 + 0.4, 0]}
          fontSize={0.18}
          color="#111827"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </mesh>
  )
}

export default function TopProducts3DChart({ data }) {

  // 🚨 VERY IMPORTANT: guard empty data
  const safeData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []
    return data.map(p => ({
      ...p,
      height: Math.max(p.sold / 2, 0.8)
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
      <Canvas
        shadows
        camera={{ position: [0, 5, 9], fov: 45 }}
      >
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[6, 10, 6]}
          intensity={1.2}
          castShadow
        />

        {/* Bars */}
        {safeData.map((item, i) => (
          <Bar
            key={i}
            x={i - safeData.length / 2 + 0.5}
            height={item.height}
            label={`${item.name} (${item.sold})`}
          />
        ))}

        {/* Floor */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
        >
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.25} />
        </mesh>

        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  )
}
