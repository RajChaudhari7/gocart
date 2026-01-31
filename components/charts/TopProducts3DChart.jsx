"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { useState } from "react"

function Bar({ position, height, color, label }) {
  const [hovered, setHovered] = useState(false)

  return (
    <mesh
      position={[position[0], height / 2, position[2]]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      <boxGeometry args={[0.6, height, 0.6]} />
      <meshStandardMaterial
        color={color}
        emissive={hovered ? "#ffffff" : "#000000"}
        emissiveIntensity={hovered ? 0.4 : 0}
      />
      {hovered && (
        <Text
          position={[0, height / 2 + 0.4, 0]}
          fontSize={0.18}
          color="black"
        >
          {label}
        </Text>
      )}
    </mesh>
  )
}

export default function TopProducts3DChart({ data }) {
  return (
    <div className="w-full h-[320px] sm:h-[380px]">
      <Canvas
        shadows
        camera={{ position: [4, 4, 6], fov: 45 }}
      >
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
        />

        {/* Bars */}
        {data.map((item, i) => (
          <Bar
            key={i}
            position={[i - data.length / 2, 0, 0]}
            height={item.sold / 2}
            color="#4f46e5"
            label={`${item.name} (${item.sold})`}
          />
        ))}

        {/* Floor */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.2} />
        </mesh>

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}
