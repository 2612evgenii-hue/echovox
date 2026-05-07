import { Environment } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'

const MODEL_BASE = '/model/'

let templateRoot: THREE.Object3D | null = null
let loadPromise: Promise<THREE.Group> | null = null

function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose()
      const mats = child.material
      const list = Array.isArray(mats) ? mats : [mats]
      for (const m of list) {
        m?.dispose()
      }
    }
  })
}

/**
 * В OBJ четыре слота MTL: metal, metal_2, metal_steel, setka.
 * Одна PNG на все меши даёт «мраморные» полосы: UV металла не совпадают с UV текстуры.
 * Texture_Diffuse оставляем только у «сетки» (setka); корпус — хром без диффузной карты + env.
 */
function configureMaterialsForOBJ(object: THREE.Object3D, diffuseTex: THREE.Texture | null) {
  if (diffuseTex) {
    diffuseTex.colorSpace = THREE.SRGBColorSpace
    diffuseTex.flipY = false
    diffuseTex.wrapS = THREE.ClampToEdgeWrapping
    diffuseTex.wrapT = THREE.ClampToEdgeWrapping
    diffuseTex.anisotropy = 2
    diffuseTex.needsUpdate = true
  }

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.frustumCulled = true

    const mats = child.material
    const list = Array.isArray(mats) ? mats : [mats]
    const next = list.map((mat) => {
      const slot = (mat.name || '').trim().toLowerCase()
      mat.dispose()

      if (slot === 'setka') {
        return new THREE.MeshStandardMaterial({
          name: mat.name,
          color: 0xffffff,
          map: diffuseTex ?? undefined,
          metalness: diffuseTex ? 0.1 : 0.06,
          roughness: diffuseTex ? 0.58 : 0.82,
          envMapIntensity: 0.45,
        })
      }

      if (slot === 'metal') {
        return new THREE.MeshStandardMaterial({
          name: mat.name,
          color: new THREE.Color('#c5cad3'),
          metalness: 0.93,
          roughness: 0.2,
          envMapIntensity: 1.35,
        })
      }

      if (slot === 'metal_2') {
        return new THREE.MeshStandardMaterial({
          name: mat.name,
          color: new THREE.Color('#aeb6c4'),
          metalness: 0.9,
          roughness: 0.26,
          envMapIntensity: 1.15,
        })
      }

      if (slot === 'metal_steel') {
        return new THREE.MeshStandardMaterial({
          name: mat.name,
          color: new THREE.Color('#9aa3b0'),
          metalness: 0.88,
          roughness: 0.38,
          envMapIntensity: 1.1,
        })
      }

      return new THREE.MeshStandardMaterial({
        name: mat.name,
        color: new THREE.Color('#b4bac4'),
        metalness: 0.86,
        roughness: 0.28,
        envMapIntensity: 1.05,
      })
    })

    child.material = Array.isArray(mats) ? next : next[0]!
  })
}

function fitToBox(object: THREE.Object3D, targetSize: number) {
  object.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6)
  const s = targetSize / maxDim
  object.scale.setScalar(s)
  object.position.set(-center.x * s, -center.y * s, -center.z * s)
}

function loadMicTemplate(): Promise<THREE.Object3D> {
  if (templateRoot) return Promise.resolve(templateRoot)
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const mtlLoader = new MTLLoader()
    mtlLoader.setPath(MODEL_BASE)
    mtlLoader.load(
      'Shure_55.mtl',
      (materials) => {
        materials.preload()
        const objLoader = new OBJLoader()
        objLoader.setMaterials(materials)
        objLoader.setPath(MODEL_BASE)
        objLoader.load(
          'Shure_55.obj',
          (object) => {
            const texLoader = new THREE.TextureLoader()
            texLoader.setPath(MODEL_BASE)
            texLoader.load(
              'Texture_Diffuse.png',
              (texture) => {
                configureMaterialsForOBJ(object, texture)
                fitToBox(object, 1.65)
                templateRoot = object
                resolve(object)
              },
              undefined,
              () => {
                configureMaterialsForOBJ(object, null)
                fitToBox(object, 1.65)
                templateRoot = object
                resolve(object)
              },
            )
          },
          undefined,
          reject,
        )
      },
      undefined,
      reject,
    )
  })

  return loadPromise
}

function cloneMeshMaterials(mesh: THREE.Mesh) {
  const mats = mesh.material
  const list: THREE.Material[] = Array.isArray(mats) ? mats : [mats]
  const copies = list.map((m) => {
    const c = m.clone()
    if (c instanceof THREE.MeshStandardMaterial && c.map) {
      c.map = c.map.clone()
      c.map.colorSpace = THREE.SRGBColorSpace
      c.needsUpdate = true
    }
    return c
  })
  mesh.material = Array.isArray(mats) ? copies : copies[0]!
}

function deepCloneForInstance(source: THREE.Object3D) {
  const root = source.clone(true)
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.frustumCulled = true
      cloneMeshMaterials(child)
    }
  })
  return root as THREE.Group
}

/** Крупный размер в кадре (desktop); clipping hero только по overflow секции */
const HERO_MIC_SCALE = 3.52

/**
 * Фиксированный наклон к заголовку слева (против часовой в кадре).
 * Крутится только дочерняя группа по Y — этот угол не «плывёт».
 */
const BASE_POSE: [number, number, number] = [0.06, -0.46, 0.44]

/** Ниже и правее в кадре (desktop) */
const MODEL_OFFSET: [number, number, number] = [0.24, -1.28, 0]

function MicMesh({
  animGroupRef,
  reducedMotion,
}: {
  animGroupRef: RefObject<THREE.Group | null>
  reducedMotion: boolean
}) {
  const [root, setRoot] = useState<THREE.Group | null>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    let active = true
    loadMicTemplate()
      .then((template) => {
        if (!active) return
        setRoot(deepCloneForInstance(template))
      })
      .catch(() => {
        if (active) setRoot(null)
      })
    return () => {
      active = false
      setRoot((prev) => {
        if (prev) disposeObject3D(prev)
        return null
      })
    }
  }, [])

  const spinY = 0.52

  useFrame((_, delta) => {
    const g = animGroupRef.current
    if (!g) return
    const slow = hovered ? 0.35 : 1
    const reduce = reducedMotion ? 0.12 : 1
    const dt = Math.min(delta, 1 / 45)
    g.rotation.y += dt * spinY * slow * reduce
  })

  return (
    <group rotation={BASE_POSE} scale={HERO_MIC_SCALE} position={MODEL_OFFSET}>
      <group
        ref={animGroupRef}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        {root ? <primitive object={root} dispose={null} /> : null}
      </group>
    </group>
  )
}

/** Сразу после монтирования GL дергаем invalidate — иначе в части браузеров кадр «залипает» до первого события. */
function KickFrames() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
    const raf = requestAnimationFrame(() => invalidate())
    const t = window.setTimeout(() => invalidate(), 80)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [invalidate])
  return null
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  const animRef = useRef<THREE.Group>(null)

  return (
    <>
      <KickFrames />
      <ambientLight intensity={0.38} />
      <hemisphereLight
        color="#e8e4f0"
        groundColor="#1a1520"
        intensity={0.32}
      />
      <directionalLight position={[5, 7, 5]} intensity={0.95} color="#ffffff" />
      <directionalLight position={[-5, 3, -2]} intensity={0.38} color="#a8b4c8" />
      <pointLight position={[5, 5, 3]} intensity={0.82} />
      <pointLight
        position={[-4, 2, -5]}
        intensity={0.42}
        color="#8b5cf6"
      />
      <Suspense fallback={null}>
        <Environment
          preset="studio"
          environmentIntensity={0.68}
          resolution={256}
        />
      </Suspense>
      <Suspense fallback={null}>
        <MicMesh animGroupRef={animRef} reducedMotion={reducedMotion} />
      </Suspense>
    </>
  )
}

export type MicrophoneModelProps = {
  reducedMotion?: boolean
}

export function MicrophoneModel({ reducedMotion = false }: MicrophoneModelProps) {
  return (
    <div
      className="pointer-events-auto absolute inset-y-0 left-auto right-[-26%] z-0 h-auto min-h-0 w-[min(62vw,58rem)] max-w-none translate-x-2 transform-gpu overflow-hidden
      lg:right-[-24%] lg:w-[min(60vw,62rem)]"
    >
      <div className="relative h-full w-full min-h-0 overflow-hidden">
        <Canvas
          className="h-full w-full touch-none brightness-[0.88] saturate-[0.88] contrast-[0.97]"
          frameloop="always"
          shadows={false}
          dpr={[1, 1.25]}
          onCreated={(state) => {
            state.invalidate()
            requestAnimationFrame(() => state.invalidate())
          }}
          gl={{
            antialias: true,
            alpha: true,
            depth: true,
            stencil: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
            preserveDrawingBuffer: false,
          }}
          camera={{
            position: [0.46, -0.15, 6.85],
            fov: 29.5,
            near: 0.1,
            far: 100,
          }}
        >
          <Scene reducedMotion={reducedMotion} />
        </Canvas>
      </div>
    </div>
  )
}

export default MicrophoneModel
