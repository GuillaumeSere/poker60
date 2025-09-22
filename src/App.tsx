import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import React from 'react'
import { HUD } from './components/HUD'
import { CardsScene } from './components/Cards'

const PokerTable: React.FC = () => {
  return (
    <group>
      {/* tapis ovale (étiré sur X) */}
      <mesh position={[0, 0, 0]} scale={[1.8, 1, 1]}>
        <cylinderGeometry args={[2.6, 2.6, 0.16, 96]} />
        <meshStandardMaterial color="#14532d" />
      </mesh>
      {/* bordure ovale */}
      <mesh position={[0, 0.18, 0]} scale={[1.8, 1, 1]}>
        <cylinderGeometry args={[2.8, 2.8, 0.12, 96]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  )
}

export const App: React.FC = () => {
  return (
    <div className="h-dvh w-dvw">
      <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
        <color attach="background" args={[0.07, 0.07, 0.07]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <Stage intensity={0.3}>
          <PokerTable />
          <CardsScene />
        </Stage>
        <OrbitControls makeDefault />
      </Canvas>

      <HUD />
    </div>
  )
}


