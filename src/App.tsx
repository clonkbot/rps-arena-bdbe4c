import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text, MeshDistortMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

type Choice = 'rock' | 'paper' | 'scissors' | null
type Result = 'win' | 'lose' | 'draw' | null

const CHOICES: Choice[] = ['rock', 'paper', 'scissors']

function getResult(player: Choice, computer: Choice): Result {
  if (!player || !computer) return null
  if (player === computer) return 'draw'
  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) {
    return 'win'
  }
  return 'lose'
}

// Stylized Rock - Distorted sphere with rough look
function Rock({ position, color, scale = 1, onClick, isHovered, isSelected }: {
  position: [number, number, number]
  color: string
  scale?: number
  onClick?: () => void
  isHovered?: boolean
  isSelected?: boolean
}) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.005
      if (isSelected) {
        ref.current.scale.setScalar(scale * (1 + Math.sin(state.clock.elapsedTime * 4) * 0.1))
      }
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh
        ref={ref}
        position={position}
        scale={scale * (isHovered ? 1.15 : 1)}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = onClick ? 'pointer' : 'default' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.5 : 0.3}
          roughness={0.3}
          metalness={0.8}
          distort={0.3}
          speed={2}
        />
      </mesh>
    </Float>
  )
}

// Stylized Paper - Flat plane with wave effect
function Paper({ position, color, scale = 1, onClick, isHovered, isSelected }: {
  position: [number, number, number]
  color: string
  scale?: number
  onClick?: () => void
  isHovered?: boolean
  isSelected?: boolean
}) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
      ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={ref}
        position={position}
        scale={scale * (isHovered ? 1.15 : 1)}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = onClick ? 'pointer' : 'default' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <RoundedBox args={[1.6, 2, 0.05]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.5 : 0.3}
            roughness={0.2}
            metalness={0.9}
            side={THREE.DoubleSide}
          />
        </RoundedBox>
      </mesh>
    </Float>
  )
}

// Stylized Scissors - Two crossing blades
function Scissors({ position, color, scale = 1, onClick, isHovered, isSelected }: {
  position: [number, number, number]
  color: string
  scale?: number
  onClick?: () => void
  isHovered?: boolean
  isSelected?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const [openAngle, setOpenAngle] = useState(0.3)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.008
      setOpenAngle(0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15)
    }
  })

  const bladeGeometry = (
    <boxGeometry args={[0.15, 1.8, 0.08]} />
  )

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
      <group
        ref={groupRef}
        position={position}
        scale={scale * (isHovered ? 1.15 : 1)}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = onClick ? 'pointer' : 'default' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        {/* Blade 1 */}
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, openAngle]}>
          {bladeGeometry}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.5 : 0.3}
            roughness={0.2}
            metalness={0.95}
          />
        </mesh>
        {/* Blade 2 */}
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, -openAngle]}>
          {bladeGeometry}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.5 : 0.3}
            roughness={0.2}
            metalness={0.95}
          />
        </mesh>
        {/* Handle rings */}
        <mesh position={[-0.3, -0.7, 0]}>
          <torusGeometry args={[0.25, 0.08, 16, 32]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0.3, -0.7, 0]}>
          <torusGeometry args={[0.25, 0.08, 16, 32]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  )
}

function ChoiceModel({ choice, position, color, scale, onClick, isHovered, isSelected }: {
  choice: Choice
  position: [number, number, number]
  color: string
  scale?: number
  onClick?: () => void
  isHovered?: boolean
  isSelected?: boolean
}) {
  switch (choice) {
    case 'rock':
      return <Rock position={position} color={color} scale={scale} onClick={onClick} isHovered={isHovered} isSelected={isSelected} />
    case 'paper':
      return <Paper position={position} color={color} scale={scale} onClick={onClick} isHovered={isHovered} isSelected={isSelected} />
    case 'scissors':
      return <Scissors position={position} color={color} scale={scale} onClick={onClick} isHovered={isHovered} isSelected={isSelected} />
    default:
      return null
  }
}

// Animated result text
function ResultText({ result }: { result: Result }) {
  const ref = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 3 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const text = result === 'win' ? 'YOU WIN!' : result === 'lose' ? 'YOU LOSE' : 'DRAW!'
  const color = result === 'win' ? '#00ff88' : result === 'lose' ? '#ff3366' : '#ffcc00'

  return (
    <group ref={ref}>
      <Text
        font="https://fonts.gstatic.com/s/orbitron/v29/yMJRMIlzdpvBhQQL_Qq7dy0.woff"
        fontSize={0.8}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000"
      >
        {text}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
        />
      </Text>
    </group>
  )
}

// Particle system for victory
function VictoryParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null!)
  const particleCount = 200

  const positions = new Float32Array(particleCount * 3)
  const velocities = useRef<Float32Array>(new Float32Array(particleCount * 3))

  useEffect(() => {
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      velocities.current[i * 3] = (Math.random() - 0.5) * 0.02
      velocities.current[i * 3 + 1] = Math.random() * 0.03 + 0.01
      velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    }
  }, [])

  useFrame(() => {
    if (ref.current && active) {
      const pos = ref.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += velocities.current[i * 3]
        pos[i * 3 + 1] += velocities.current[i * 3 + 1]
        pos[i * 3 + 2] += velocities.current[i * 3 + 2]

        if (pos[i * 3 + 1] > 6) {
          pos[i * 3 + 1] = -1
          pos[i * 3] = (Math.random() - 0.5) * 10
          pos[i * 3 + 2] = (Math.random() - 0.5) * 10
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true
    }
  })

  if (!active) return null

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#00ff88"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

// Arena floor with grid
function ArenaFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[30, 30, 30, 30]} />
      <meshStandardMaterial
        color="#0a0a0a"
        metalness={0.8}
        roughness={0.2}
        wireframe={false}
      />
    </mesh>
  )
}

// Grid overlay
function Grid() {
  return (
    <gridHelper
      args={[30, 30, '#ff00ff', '#00ffff']}
      position={[0, -1.99, 0]}
    />
  )
}

function Scene({ playerChoice, computerChoice, result, onChoice, hoveredChoice, setHoveredChoice }: {
  playerChoice: Choice
  computerChoice: Choice
  result: Result
  onChoice: (choice: Choice) => void
  hoveredChoice: Choice
  setHoveredChoice: (choice: Choice) => void
}) {
  return (
    <>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 5, 25]} />

      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 0]} intensity={1} color="#ff00ff" />
      <pointLight position={[-5, 3, 0]} intensity={0.5} color="#00ffff" />
      <pointLight position={[5, 3, 0]} intensity={0.5} color="#ffff00" />
      <spotLight position={[0, 10, 0]} intensity={2} angle={0.3} penumbra={1} color="#ffffff" />

      <ArenaFloor />
      <Grid />

      {/* Player choices at bottom */}
      {!playerChoice && (
        <>
          <ChoiceModel
            choice="rock"
            position={[-3, 0, 3]}
            color="#ff3366"
            scale={0.8}
            onClick={() => onChoice('rock')}
            isHovered={hoveredChoice === 'rock'}
          />
          <ChoiceModel
            choice="paper"
            position={[0, 0, 3]}
            color="#00ff88"
            scale={0.8}
            onClick={() => onChoice('paper')}
            isHovered={hoveredChoice === 'paper'}
          />
          <ChoiceModel
            choice="scissors"
            position={[3, 0, 3]}
            color="#00ccff"
            scale={0.8}
            onClick={() => onChoice('scissors')}
            isHovered={hoveredChoice === 'scissors'}
          />
        </>
      )}

      {/* Show selected choices */}
      {playerChoice && computerChoice && (
        <>
          <ChoiceModel
            choice={playerChoice}
            position={[-2, 0, 0]}
            color="#ff3366"
            scale={1.2}
            isSelected={result === 'win'}
          />
          <ChoiceModel
            choice={computerChoice}
            position={[2, 0, 0]}
            color="#00ccff"
            scale={1.2}
            isSelected={result === 'lose'}
          />
        </>
      )}

      {/* Result text */}
      {result && <ResultText result={result} />}

      {/* Victory particles */}
      <VictoryParticles active={result === 'win'} />

      <Environment preset="night" />
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={15}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

export default function App() {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null)
  const [computerChoice, setComputerChoice] = useState<Choice>(null)
  const [result, setResult] = useState<Result>(null)
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 })
  const [hoveredChoice, setHoveredChoice] = useState<Choice>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleChoice = (choice: Choice) => {
    if (isAnimating || !choice) return

    setIsAnimating(true)
    setPlayerChoice(choice)

    // Computer makes random choice after delay
    setTimeout(() => {
      const compChoice = CHOICES[Math.floor(Math.random() * 3)]
      setComputerChoice(compChoice)

      const gameResult = getResult(choice, compChoice)
      setResult(gameResult)

      if (gameResult === 'win') setScore(s => ({ ...s, wins: s.wins + 1 }))
      else if (gameResult === 'lose') setScore(s => ({ ...s, losses: s.losses + 1 }))
      else setScore(s => ({ ...s, draws: s.draws + 1 }))

      setIsAnimating(false)
    }, 800)
  }

  const resetGame = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
  }

  return (
    <div className="w-screen h-screen bg-[#050510] overflow-hidden relative" style={{ fontFamily: "'Orbitron', sans-serif" }}>
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)'
        }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1
            className="text-2xl md:text-4xl font-bold tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #ff3366, #ff00ff, #00ffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(255,51,102,0.5)',
              filter: 'drop-shadow(0 0 10px rgba(255,0,255,0.5))'
            }}
          >
            ROCK PAPER SCISSORS
          </h1>

          {/* Score */}
          <div className="flex gap-4 md:gap-6 text-xs md:text-sm tracking-widest">
            <div className="text-center">
              <div className="text-[#00ff88]" style={{ textShadow: '0 0 10px #00ff88' }}>WINS</div>
              <div className="text-xl md:text-3xl text-white">{score.wins}</div>
            </div>
            <div className="text-center">
              <div className="text-[#ff3366]" style={{ textShadow: '0 0 10px #ff3366' }}>LOSSES</div>
              <div className="text-xl md:text-3xl text-white">{score.losses}</div>
            </div>
            <div className="text-center">
              <div className="text-[#ffcc00]" style={{ textShadow: '0 0 10px #ffcc00' }}>DRAWS</div>
              <div className="text-xl md:text-3xl text-white">{score.draws}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 4, 10], fov: 50 }}
        shadows
        className="touch-none"
      >
        <Suspense fallback={null}>
          <Scene
            playerChoice={playerChoice}
            computerChoice={computerChoice}
            result={result}
            onChoice={handleChoice}
            hoveredChoice={hoveredChoice}
            setHoveredChoice={setHoveredChoice}
          />
        </Suspense>
      </Canvas>

      {/* Instructions / Play Again */}
      <div className="absolute bottom-20 md:bottom-24 left-0 right-0 z-20 flex flex-col items-center gap-4 px-4">
        {!playerChoice && !isAnimating && (
          <div
            className="text-[#00ffff] text-sm md:text-lg tracking-[0.3em] animate-pulse text-center"
            style={{ textShadow: '0 0 20px #00ffff' }}
          >
            CLICK TO CHOOSE YOUR WEAPON
          </div>
        )}

        {result && (
          <button
            onClick={resetGame}
            className="px-6 md:px-8 py-3 md:py-4 text-sm md:text-base tracking-widest font-bold transition-all duration-300 hover:scale-110"
            style={{
              background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
              border: 'none',
              color: '#000',
              clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
              boxShadow: '0 0 30px rgba(255,0,255,0.5), 0 0 60px rgba(0,255,255,0.3)'
            }}
          >
            PLAY AGAIN
          </button>
        )}
      </div>

      {/* Choice labels on mobile */}
      {!playerChoice && (
        <div className="absolute bottom-32 md:hidden left-0 right-0 z-20 flex justify-around px-8">
          <span className="text-[#ff3366] text-xs tracking-wider" style={{ textShadow: '0 0 10px #ff3366' }}>ROCK</span>
          <span className="text-[#00ff88] text-xs tracking-wider" style={{ textShadow: '0 0 10px #00ff88' }}>PAPER</span>
          <span className="text-[#00ccff] text-xs tracking-wider" style={{ textShadow: '0 0 10px #00ccff' }}>SCISSORS</span>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-center">
        <p
          className="text-[10px] md:text-xs tracking-wider opacity-40"
          style={{
            color: '#888',
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          Requested by @OxPaulius · Built by @clonkbot
        </p>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-16 md:w-24 h-16 md:h-24 border-l-2 border-t-2 border-[#ff00ff] opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 border-r-2 border-t-2 border-[#00ffff] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 md:w-24 h-16 md:h-24 border-l-2 border-b-2 border-[#00ffff] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 md:w-24 h-16 md:h-24 border-r-2 border-b-2 border-[#ff00ff] opacity-50 pointer-events-none" />
    </div>
  )
}
