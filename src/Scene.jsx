import { useRef, useMemo, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

function SkeletalOwl() {
  const groupRef = useRef()
  const leftWing = useRef()
  const rightWing = useRef()
  const { viewport } = useThree()
  
  // Random initialization for each owl
  const [data] = useState(() => ({
    // Much slower speed and wider initial vertical/horizontal gapping
    pos: new THREE.Vector3(
      -viewport.width - Math.random() * 10, // Staggered start off-screen left
      viewport.height / 3 + Math.random() * 1.5, // High up
      -3 - Math.random() * 4
    ),
    speed: 0.005 + Math.random() * 0.012, // Much slower flight
    wingSpeed: 3 + Math.random() * 2,
    offset: Math.random() * Math.PI * 2
  }))

  useFrame((state) => {
    if (!groupRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    // Slow movement across the screen
    data.pos.x += data.speed
    // Gentle bobbing
    data.pos.y += Math.sin(time * 0.5 + data.offset) * 0.002
    
    // Wrap around with long delay (gapping)
    if (data.pos.x > viewport.width + 2) {
        data.pos.x = -viewport.width - 5 - Math.random() * 15
        data.pos.y = viewport.height / 4 + Math.random() * 2
    }
    
    groupRef.current.position.copy(data.pos)
    
    // Sharp, Snappy Wing Flapping
    const flap = Math.asin(Math.sin(time * data.wingSpeed)) * 1.2 // More triangular wave for "sharp" movement
    if (leftWing.current && rightWing.current) {
        leftWing.current.rotation.z = -flap
        rightWing.current.rotation.z = flap
        // Tilt wings forward slightly
        leftWing.current.rotation.y = 0.3
        rightWing.current.rotation.y = -0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* Jagged Sharp Skeletal Body */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[0, -i * 0.06, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.06, 0.12, 4]} />
          <meshStandardMaterial color="#000" emissive="#111" />
        </mesh>
      ))}
      
      {/* Sharp Skull */}
      <mesh position={[0, 0.08, 0]}>
        <coneGeometry args={[0.06, 0.12, 4]} rotation={[Math.PI, 0, 0]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      
      {/* Dark Red Glowing Eyes */}
      <mesh position={[0.03, 0.08, 0.04]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#440000" emissive="#ff0000" emissiveIntensity={4} />
      </mesh>
      <mesh position={[-0.03, 0.08, 0.04]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#440000" emissive="#ff0000" emissiveIntensity={4} />
      </mesh>
      
      {/* Small Sharp Skeletal Wings */}
      <group position={[0.04, 0, 0]} ref={leftWing}>
         {/* Smaller Wing Bones */}
         <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.003, 0.008, 0.2, 4]} />
            <meshStandardMaterial color="#111" />
         </mesh>
         {/* Shorter Sharp Feathers */}
         {Array.from({ length: 3 }).map((_, i) => (
           <mesh key={i} position={[0.06 * i + 0.05, -0.05, 0]} rotation={[0, 0, -0.5]}>
             <coneGeometry args={[0.008, 0.15, 3]} />
             <meshStandardMaterial color="#000" transparent opacity={0.6} />
           </mesh>
         ))}
      </group>

      <group position={[-0.04, 0, 0]} ref={rightWing}>
         <mesh position={[-0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.003, 0.008, 0.2, 4]} />
            <meshStandardMaterial color="#111" />
         </mesh>
         {Array.from({ length: 3 }).map((_, i) => (
           <mesh key={i} position={[-0.06 * i - 0.05, -0.05, 0]} rotation={[0, 0, 0.5]}>
             <coneGeometry args={[0.008, 0.15, 3]} />
             <meshStandardMaterial color="#000" transparent opacity={0.6} />
           </mesh>
         ))}
      </group>
    </group>
  )
}

function BloodDrop({ startPos }) {
  const meshRef = useRef()
  const [data] = useState(() => ({
    pos: startPos.clone(),
    velocity: 0,
    gravity: 0.001 + Math.random() * 0.001,
    life: 1.0
  }))

  useFrame(() => {
    if (!meshRef.current) return
    data.velocity += data.gravity
    data.pos.y -= data.velocity
    data.life -= 0.008
    meshRef.current.position.copy(data.pos)
    const stretch = 1 + data.velocity * 15
    meshRef.current.scale.set(data.life, stretch * data.life, data.life)
    if (meshRef.current.material) {
        meshRef.current.material.opacity = data.life
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.012, 12, 12]} />
      <meshStandardMaterial 
        color="#800000" 
        emissive="#400000" 
        transparent 
        opacity={1}
        roughness={0}
        metalness={0.5}
      />
    </mesh>
  )
}

function DragonSegment({ 
  position, 
  rotation, 
  scale, 
  color, 
  isHead, 
  isTail,
  segmentIndex, 
  speedFactor, 
  spineRotation,
  time,
  lumPulse 
}) {
  const finalEmissiveIntensity = (isHead ? 4 : 1) + speedFactor * 2 + lumPulse * 1.5
  const scaleColor = isHead ? "#000000" : color
  
  const scaleMaterial = {
    color: "#000000", 
    emissive: isHead ? "#222" : scaleColor,
    emissiveIntensity: isHead ? 0.3 : finalEmissiveIntensity,
    metalness: 1,
    roughness: 0.1,
  }
  
  const boneMaterial = {
    color: "#111111",
    emissive: scaleColor,
    emissiveIntensity: finalEmissiveIntensity * 0.5,
    transparent: true,
    opacity: 0.7,
  }

  const hasWings = segmentIndex >= 5 && segmentIndex <= 8
  const flapSpeed = 6 + speedFactor * 12
  const flapAngle = Math.sin(time * flapSpeed - segmentIndex * 0.3) * (0.3 + speedFactor * 0.5)

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        {isHead ? (
          <group>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
              <coneGeometry args={[0.08, 0.4, 4]} />
              <meshStandardMaterial {...scaleMaterial} />
            </mesh>
            <mesh position={[0, 0, -0.1]}>
              <boxGeometry args={[0.12, 0.15, 0.15]} /> 
              <meshStandardMaterial {...scaleMaterial} />
            </mesh>
            <mesh position={[0.05, 0.08, -0.1]} rotation={[0.6, 0, 0.4]}>
              <coneGeometry args={[0.012, 0.25, 8]} />
              <meshStandardMaterial {...scaleMaterial} />
            </mesh>
            <mesh position={[-0.05, 0.08, -0.1]} rotation={[0.6, 0, -0.4]}>
              <coneGeometry args={[0.012, 0.25, 8]} />
              <meshStandardMaterial {...scaleMaterial} />
            </mesh>
            <mesh position={[0.04, 0.04, 0.08]}>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#8b0000" emissive="#ff0000" emissiveIntensity={10} />
            </mesh>
            <mesh position={[-0.04, 0.04, 0.08]}>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#8b0000" emissive="#ff0000" emissiveIntensity={10} />
            </mesh>
          </group>
        ) : (
          <boxGeometry args={[0.06, 0.04, 0.08]} />
        )}
        {!isHead && <meshStandardMaterial {...boneMaterial} />}
      </mesh>

      {!isHead && !isTail && (
        <mesh position={[0, 0, 0.04]}>
          <coneGeometry args={[0.05, 0.15, 3]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial {...scaleMaterial} />
        </mesh>
      )}

      {!isHead && !isTail && (
        <group rotation={[0, 0, spineRotation]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.002, 0.018, 0.5, 4]} />
            <meshStandardMaterial {...scaleMaterial} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.002, 0.018, 0.5, 4]} />
            <meshStandardMaterial {...scaleMaterial} />
          </mesh>
        </group>
      )}

      {hasWings && (
        <group position={[0, -0.04, 0]}>
          <group rotation={[0.4, 0, flapAngle]}>
            <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.3]}>
              <coneGeometry args={[0.2, 0.7, 3]} rotation={[0, 0, -Math.PI/2]} />
              <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={0.8} transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
               <cylinderGeometry args={[0.004, 0.018, 0.7]} />
               <meshStandardMaterial {...scaleMaterial} />
            </mesh>
          </group>
          <group rotation={[0.4, 0, -flapAngle]}>
            <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.3]}>
              <coneGeometry args={[0.2, 0.7, 3]} rotation={[0, 0, Math.PI/2]} />
              <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={0.8} transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[-0.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
               <cylinderGeometry args={[0.004, 0.018, 0.7]} />
               <meshStandardMaterial {...scaleMaterial} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  )
}

function Moon() {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      meshRef.current.material.emissiveIntensity = pulse
    }
  })
  return (
    <group position={[2, 3, -6]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial color="#440000" emissive="#ff0000" emissiveIntensity={0.5} metalness={1} roughness={0.2} />
      </mesh>
      <mesh scale={1.15}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial color="#ff0000" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
      <pointLight intensity={5} color="#ff0000" distance={15} />
    </group>
  )
}

export default function Scene() {
  const { viewport } = useThree()
  const numSegments = 45 
  const segmentDist = 0.05 
  const numOwls = 6 // Fewer owls for better gapping

  const segmentRefs = useRef([])
  const mousePos = useRef(new THREE.Vector3())
  const speedRef = useRef(0)
  const [drops, setDrops] = useState([])

  const segments = useMemo(() => {
    return Array.from({ length: numSegments }).map(() => ({
      pos: new THREE.Vector3(),
      rot: new THREE.Euler(),
      banking: 0
    }))
  }, [numSegments])

  const dragonColor = "#00ffff" 

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const targetX = (state.mouse.x * viewport.width) / 2
    const targetY = (state.mouse.y * viewport.height) / 2
    
    mousePos.current.lerp(new THREE.Vector3(targetX, targetY, 0), 0.12)
    const moveDist = mousePos.current.distanceTo(segments[0].pos)
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, moveDist, 0.08)
    
    segments[0].pos.copy(mousePos.current)

    const spawnChance = 0.02 + speedRef.current * 0.05
    if (Math.random() < spawnChance) {
      const newDrop = { id: Math.random(), pos: segments[0].pos.clone() }
      setDrops(prev => [...prev.slice(-30), newDrop])
    }

    for (let i = 1; i < numSegments; i++) {
        const prev = segments[i - 1].pos
        const curr = segments[i].pos
        const dir = new THREE.Vector3().subVectors(curr, prev).normalize()
        curr.copy(prev).add(dir.multiplyScalar(segmentDist))
        const waveFreq = 7 + speedRef.current * 12
        const slitherIntensity = 0.04 + (speedRef.current * 0.5) * (i / numSegments)
        const wave = Math.sin(time * waveFreq - i * 0.25) * slitherIntensity
        curr.x += wave * 0.1
        curr.y += wave * 0.1
        const lookDir = new THREE.Vector3().subVectors(prev, curr)
        if (lookDir.length() > 0.001) {
            const rotZ = Math.atan2(lookDir.y, lookDir.x) - Math.PI / 2
            const turnAmt = (segments[i-1].rot.z - rotZ)
            segments[i].banking = THREE.MathUtils.lerp(segments[i].banking, turnAmt * 6, 0.1)
            segments[i].rot.set(0, segments[i].banking, rotZ)
        }
    }

    segmentRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.position.copy(segments[i].pos)
        ref.rotation.copy(segments[i].rot)
      }
    })
  })

  return (
    <group>
      <Moon />
      
      {/* Skeletal Owls Background */}
      {Array.from({ length: numOwls }).map((_, i) => (
        <SkeletalOwl key={i} />
      ))}

      {segments.map((_, i) => (
        <group key={i} ref={(el) => (segmentRefs.current[i] = el)}>
          <DragonSegment 
            isHead={i === 0}
            isTail={i > numSegments - 10}
            segmentIndex={i}
            color={dragonColor}
            scale={(0.3 - (i / numSegments) * 0.2)}
            speedFactor={speedRef.current}
            spineRotation={Math.sin(Date.now() * 0.004 - i * 0.4) * 0.5}
            time={Date.now() * 0.001}
            lumPulse={Math.max(0, Math.sin(Date.now() * 0.003 - i * 0.2))}
          />
        </group>
      ))}
      {drops.map(drop => (
        <BloodDrop key={drop.id} startPos={drop.pos} />
      ))}
      <pointLight position={[5, 5, 5]} intensity={8} color={dragonColor} />
      <pointLight position={[-5, -5, 5]} intensity={6} color="#ffffff" />
      <ambientLight intensity={0.1} />
    </group>
  )
}