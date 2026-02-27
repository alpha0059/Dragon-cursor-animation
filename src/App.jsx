import { Canvas } from "@react-three/fiber"
import Scene from "./Scene"

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 5, 5]} intensity={1} />
      <Scene />
    </Canvas>
  )
}