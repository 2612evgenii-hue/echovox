import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react'
import * as THREE from 'three'
import heroEnvUrl from '@/assets/baground.jpeg'
import { useHeroMicLayoutBlendRef } from '@/hooks/useHeroMicLayoutBlendRef'
import { useMinLg } from '@/hooks/useMinLg'
import { cn } from '@/lib/utils'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'

const MODEL_SHURE_BASE = '/model/'
const MODEL_FBX_BASE = '/model_1/'
const FBX_FILE = 'Microphone.FBX'

export type MicrophoneVariant = 'shure' | 'model1'

let templateRootShure: THREE.Object3D | null = null
let loadPromiseShure: Promise<THREE.Group> | null = null

let templateRootFbx: THREE.Object3D | null = null
let loadPromiseFbx: Promise<THREE.Group> | null = null

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

/** Зеркальный хром: белый metalness + низкая roughness + env; diffuse-карты дают «пластик». */
function chromeMirrorPhysical(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    name: 'chrome',
    color: 0xffffff,
    metalness: 1,
    roughness: 0.06,
    envMapIntensity: 4.25,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  })
}

/** Общие текстуры для «сетки» в желобках (один раз на загрузку). */
let grilleMeshTexCache: {
  map: THREE.CanvasTexture
  bumpMap: THREE.CanvasTexture
} | null = null

function getGrilleMeshTextures() {
  if (grilleMeshTexCache) return grilleMeshTexCache

  const size = 256
  const cell = 14

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#090a0e'
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = '#2f3548'
  ctx.lineWidth = 1.25
  ctx.globalAlpha = 0.95
  for (let i = 0; i <= size; i += cell) {
    ctx.beginPath()
    ctx.moveTo(i + 0.5, 0)
    ctx.lineTo(i + 0.5, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i + 0.5)
    ctx.lineTo(size, i + 0.5)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
  ctx.fillStyle = '#3d455a'
  for (let x = 0; x < size; x += cell) {
    for (let y = 0; y < size; y += cell) {
      ctx.beginPath()
      ctx.arc(x, y, 1.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const map = new THREE.CanvasTexture(canvas)
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  map.repeat.set(22, 22)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4
  map.needsUpdate = true

  const bumpCanvas = document.createElement('canvas')
  bumpCanvas.width = size
  bumpCanvas.height = size
  const bctx = bumpCanvas.getContext('2d')!
  const imgData = ctx.getImageData(0, 0, size, size)
  bctx.putImageData(imgData, 0, 0)

  const bumpMap = new THREE.CanvasTexture(bumpCanvas)
  bumpMap.wrapS = THREE.RepeatWrapping
  bumpMap.wrapT = THREE.RepeatWrapping
  bumpMap.repeat.set(22, 22)
  bumpMap.colorSpace = THREE.NoColorSpace
  bumpMap.needsUpdate = true

  grilleMeshTexCache = { map, bumpMap }
  return grilleMeshTexCache
}

/** Желобки / «сетка»: не чистый чёрный, мелкая структура ячеек + bump */
function grooveMeshGrilleMaterial(name?: string): THREE.MeshStandardMaterial {
  const { map, bumpMap } = getGrilleMeshTextures()
  return new THREE.MeshStandardMaterial({
    name: name || 'groove-grille',
    color: new THREE.Color('#12151c'),
    map,
    bumpMap,
    bumpScale: 0.042,
    metalness: 0.22,
    roughness: 0.78,
    envMapIntensity: 0.16,
  })
}

/** FBX: хром на корпусе; желобки и слоты Default — чёрные матовые (имена из Microphone.FBX). */
function configureMaterialsForFBX(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.frustumCulled = true

    const mats = child.material
    const list = Array.isArray(mats) ? mats : [mats]
    const meshLower = child.name.toLowerCase()

    const next = list.map((mat) => {
      const mn = (mat.name || '').toLowerCase()
      mat.dispose()

      if (meshLower.includes('star') || meshLower.includes('circle')) {
        return chromeMirrorPhysical()
      }

      /*
       * Горизонтальные желобки в этом FBX — Mesh Rectangle01/02 с материалом chrome.
       * Loft01 — внутренняя часть с Default.
       */
      const grooveSlats =
        meshLower.includes('rectangle') ||
        meshLower === 'loft01'

      if (grooveSlats) {
        return grooveMeshGrilleMaterial(mat.name)
      }

      if (mn.includes('chrome')) {
        return chromeMirrorPhysical()
      }

      if (mn.includes('default') || mn.includes('__default')) {
        return grooveMeshGrilleMaterial(mat.name)
      }

      return chromeMirrorPhysical()
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

function loadShureTemplate(): Promise<THREE.Object3D> {
  if (templateRootShure) return Promise.resolve(templateRootShure)
  if (loadPromiseShure) return loadPromiseShure

  loadPromiseShure = new Promise((resolve, reject) => {
    const mtlLoader = new MTLLoader()
    mtlLoader.setPath(MODEL_SHURE_BASE)
    mtlLoader.load(
      'Shure_55.mtl',
      (materials) => {
        materials.preload()
        const objLoader = new OBJLoader()
        objLoader.setMaterials(materials)
        objLoader.setPath(MODEL_SHURE_BASE)
        objLoader.load(
          'Shure_55.obj',
          (object) => {
            const texLoader = new THREE.TextureLoader()
            texLoader.setPath(MODEL_SHURE_BASE)
            texLoader.load(
              'Texture_Diffuse.png',
              (texture) => {
                configureMaterialsForOBJ(object, texture)
                fitToBox(object, 1.65)
                templateRootShure = object
                resolve(object)
              },
              undefined,
              () => {
                configureMaterialsForOBJ(object, null)
                fitToBox(object, 1.65)
                templateRootShure = object
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

  return loadPromiseShure
}

function loadFbxTemplate(): Promise<THREE.Object3D> {
  if (templateRootFbx) return Promise.resolve(templateRootFbx)
  if (loadPromiseFbx) return loadPromiseFbx

  loadPromiseFbx = new Promise((resolve, reject) => {
    const loader = new FBXLoader()
    loader.load(
      `${MODEL_FBX_BASE}${FBX_FILE}`,
      (group) => {
        configureMaterialsForFBX(group)
        fitToBox(group, 1.65)
        templateRootFbx = group
        resolve(group)
      },
      undefined,
      reject,
    )
  })

  return loadPromiseFbx
}

function loadMicTemplate(variant: MicrophoneVariant): Promise<THREE.Object3D> {
  return variant === 'shure' ? loadShureTemplate() : loadFbxTemplate()
}

function cloneMeshMaterials(mesh: THREE.Mesh) {
  const mats = mesh.material
  const list: THREE.Material[] = Array.isArray(mats) ? mats : [mats]
  const copies = list.map((m) => {
    const c = m.clone()
    if (c instanceof THREE.MeshPhysicalMaterial) {
      if (c.map) {
        c.map = c.map.clone()
        c.map.colorSpace = THREE.SRGBColorSpace
      }
      if (c.metalnessMap) c.metalnessMap = c.metalnessMap.clone()
      if (c.roughnessMap) c.roughnessMap = c.roughnessMap.clone()
      if (c.normalMap) c.normalMap = c.normalMap.clone()
      c.needsUpdate = true
    } else if (c instanceof THREE.MeshStandardMaterial) {
      if (c.map) {
        c.map = c.map.clone()
        c.map.colorSpace = THREE.SRGBColorSpace
      }
      if (c.bumpMap) {
        c.bumpMap = c.bumpMap.clone()
        c.bumpMap.colorSpace = THREE.NoColorSpace
      }
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

/**
 * После fitToBox центр AABB в нуле, но визуальный «верх» микрофона тянет ощущение точки у решётки.
 * Сдвигаем меш так, чтобы ось вращения проходила через точку на доле высоты от низа bbox (ниже геом. центра).
 * Возвращает вектор для сдвига родителя — тем самым возвращаем микрофон на прежнее место в кадре.
 */
function applyMicPivotAlongLongAxis(
  root: THREE.Object3D,
  fracFromBottom: number,
): THREE.Vector3 {
  root.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(root)
  const min = box.min
  const max = box.max
  const sx = max.x - min.x
  const sy = max.y - min.y
  const sz = max.z - min.z
  const compensation = new THREE.Vector3()
  if (sy >= sx && sy >= sz) {
    const pivotY = min.y + fracFromBottom * sy
    root.position.y -= pivotY
    compensation.set(0, pivotY, 0)
  } else if (sz >= sx) {
    const pivotZ = min.z + fracFromBottom * sz
    root.position.z -= pivotZ
    compensation.set(0, 0, pivotZ)
  } else {
    const pivotX = min.x + fracFromBottom * sx
    root.position.x -= pivotX
    compensation.set(pivotX, 0, 0)
  }
  return compensation
}

const MIC_LAYOUT = {
  side: {
    /** Крупный размер в кадре (desktop lg+) */
    scale: 2.55,
    /**
     * Фиксированный наклон к заголовку слева (против часовой в кадре).
     * Крутится только дочерняя группа по Y — этот угол не «плывёт».
     */
    basePose: [0.06, -0.1, 0.52] as [number, number, number],
    /** X меньше — левее (зона между текстом и краем); Y — высота в кадре */
    modelOffset: [0.44, 0.06, 0] as [number, number, number],
  },
  'center-back': {
    /** Крупнее в центре узкого экрана; рамка задаётся контейнером Canvas */
    scale: 1.98,
    /** Меньше крен против часовой (Z) и наклон по X, чем на широком — микрофон ровнее по центру */
    basePose: [0.028, 0, 0.34] as [number, number, number],
    /** Чуть выше — видна «ножка» целиком при узком кадре */
    modelOffset: [0, 0.2, 0] as [number, number, number],
  },
} as const

/** Камера дальше в центральном режиме — низ меша не обрезается; FOV чуть шире для запаса по вертикали */
const CAM_Z_CENTER = 8.52
const CAM_Z_SIDE = 7.05
const CAM_FOV_CENTER = 31.6
const CAM_FOV_SIDE = 29.5

function HeroMicCameraRig({
  blendRef,
}: {
  blendRef: MutableRefObject<number>
}) {
  const { camera } = useThree()
  useFrame(() => {
    const b = blendRef.current
    const cam = camera as THREE.PerspectiveCamera
    cam.position.z = THREE.MathUtils.lerp(CAM_Z_CENTER, CAM_Z_SIDE, b)
    cam.position.y = THREE.MathUtils.lerp(0.27, 0.3, b)
    cam.fov = THREE.MathUtils.lerp(CAM_FOV_CENTER, CAM_FOV_SIDE, b)
    cam.updateProjectionMatrix()
  })
  return null
}

/** Нормализованные координаты курсора по области микрофона (-1…1); `active` — указатель над блоком */
export type MicPointerControl = {
  active: boolean
  nx: number
  ny: number
}

/** Пассивное вращение вокруг Y (рад/с); ниже — медленнее */
const IDLE_SPIN_Y = 0.3
/** Доп. поворот по Y/X при наведении (рад) */
const HOVER_YAW_RANGE = 0.52
const HOVER_PITCH_RANGE = 0.38
/** Сглаживание к целевой ориентации в обычном режиме (кватернионный slerp) */
const ORIENT_SMOOTH = 8
/**
 * В первые миллисекунды после монтирования кватернион группы = identity;
 * сразу высокий ORIENT_SMOOTH даёт резкий «щёлчок» к BASE_POSE. Ниже — старт
 * сглаживания; за INTRO_ORIENT_MS выходим на ORIENT_SMOOTH.
 */
const ORIENT_INTRO_START = 2.1
const INTRO_ORIENT_MS = 1250
/** При prefers-reduced-motion — короче, но без мгновенного скачка */
const INTRO_ORIENT_MS_REDUCE = 380
const ORIENT_INTRO_START_REDUCE = 4.5

/** Доля высоты bbox от нижней грани до точки вращения (0.5 = центр AABB; меньше — точка ниже, ближе к основанию) */
const MIC_PIVOT_FRAC_FROM_BOTTOM = 0.44

const POINTER_HOVER_BLEND_MIN = 0.93

function MicMesh({
  animGroupRef,
  reducedMotion,
  variant,
  pointerCtrlRef,
  layoutBlendRef,
  onVisualReady,
}: {
  animGroupRef: RefObject<THREE.Group | null>
  reducedMotion: boolean
  variant: MicrophoneVariant
  pointerCtrlRef: MutableRefObject<MicPointerControl>
  layoutBlendRef: MutableRefObject<number>
  onVisualReady?: () => void
}) {
  const { camera } = useThree()
  const onReadyRef = useRef(onVisualReady)
  onReadyRef.current = onVisualReady
  const [root, setRoot] = useState<THREE.Group | null>(null)
  const [pivotVisualComp, setPivotVisualComp] = useState<
    [number, number, number]
  >([0, 0, 0])
  const spinAccumRef = useRef(0)
  const hoverYawFreezeRef = useRef(0)
  const prevPointerActiveRef = useRef(false)
  const orientIntroT0Ref = useRef<number | null>(null)

  const baseQuatRef = useRef(
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        MIC_LAYOUT.side.basePose[0],
        MIC_LAYOUT.side.basePose[1],
        MIC_LAYOUT.side.basePose[2],
        'XYZ',
      ),
    ),
  )

  const blendedEuler = useRef(new THREE.Euler())
  const outerGroupRef = useRef<THREE.Group>(null)
  const tmpQ = useRef(new THREE.Quaternion())
  const tmpRelEuler = useRef(new THREE.Euler())
  const qYaw = useRef(new THREE.Quaternion())
  const qPitch = useRef(new THREE.Quaternion())
  const targetQ = useRef(new THREE.Quaternion())
  const camRight = useRef(new THREE.Vector3())
  const worldUp = useRef(new THREE.Vector3(0, 1, 0))

  useEffect(() => {
    let active = true
    loadMicTemplate(variant)
      .then((template) => {
        if (!active) return
        const cloned = deepCloneForInstance(template)
        const comp = applyMicPivotAlongLongAxis(cloned, MIC_PIVOT_FRAC_FROM_BOTTOM)
        setPivotVisualComp([comp.x, comp.y, comp.z])
        setRoot(cloned)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            onReadyRef.current?.()
          })
        })
      })
      .catch(() => {
        if (active) {
          setPivotVisualComp([0, 0, 0])
          setRoot(null)
        }
      })
    return () => {
      active = false
      setRoot((prev) => {
        if (prev) disposeObject3D(prev)
        return null
      })
      setPivotVisualComp([0, 0, 0])
    }
  }, [variant])

  useFrame((_, delta) => {
    const g = animGroupRef.current
    const outer = outerGroupRef.current
    if (!g || !outer) return

    const b = layoutBlendRef.current
    const L0 = MIC_LAYOUT['center-back']
    const L1 = MIC_LAYOUT.side
    if (b < POINTER_HOVER_BLEND_MIN) {
      pointerCtrlRef.current.active = false
    }

    const e = blendedEuler.current
    e.set(
      THREE.MathUtils.lerp(L0.basePose[0], L1.basePose[0], b),
      THREE.MathUtils.lerp(L0.basePose[1], L1.basePose[1], b),
      THREE.MathUtils.lerp(L0.basePose[2], L1.basePose[2], b),
      'XYZ',
    )
    baseQuatRef.current.setFromEuler(e)

    const scale = THREE.MathUtils.lerp(L0.scale, L1.scale, b)
    outer.scale.setScalar(scale)
    outer.position.set(
      THREE.MathUtils.lerp(L0.modelOffset[0], L1.modelOffset[0], b) +
        pivotVisualComp[0],
      THREE.MathUtils.lerp(L0.modelOffset[1], L1.modelOffset[1], b) +
        pivotVisualComp[1],
      THREE.MathUtils.lerp(L0.modelOffset[2], L1.modelOffset[2], b) +
        pivotVisualComp[2],
    )

    const reduce = reducedMotion ? 0.12 : 1
    const dt = Math.min(delta, 1 / 45)
    const p = pointerCtrlRef.current
    const hoverMul = reduce

    if (orientIntroT0Ref.current === null) orientIntroT0Ref.current = performance.now()
    const introMs = reducedMotion ? INTRO_ORIENT_MS_REDUCE : INTRO_ORIENT_MS
    const introStart = reducedMotion ? ORIENT_INTRO_START_REDUCE : ORIENT_INTRO_START
    const introElapsed = performance.now() - orientIntroT0Ref.current
    const introT = introMs <= 0 ? 1 : Math.min(1, introElapsed / introMs)
    const introEase = 1 - (1 - introT) ** 3
    const orientSmooth = THREE.MathUtils.lerp(introStart, ORIENT_SMOOTH, introEase)
    const alpha = 1 - Math.exp(-orientSmooth * dt)

    camRight.current.setFromMatrixColumn(camera.matrixWorld, 0).normalize()

    if (!p.active && prevPointerActiveRef.current) {
      tmpQ.current.copy(baseQuatRef.current).invert().multiply(g.quaternion)
      tmpRelEuler.current.setFromQuaternion(tmpQ.current, 'YXZ')
      spinAccumRef.current = tmpRelEuler.current.y
    }

    if (p.active && !prevPointerActiveRef.current) {
      hoverYawFreezeRef.current = spinAccumRef.current
    }
    prevPointerActiveRef.current = p.active

    if (!p.active) {
      spinAccumRef.current += dt * IDLE_SPIN_Y * reduce
      tmpQ.current.setFromAxisAngle(worldUp.current, spinAccumRef.current)
    } else {
      const yawAng =
        hoverYawFreezeRef.current + p.nx * HOVER_YAW_RANGE * hoverMul
      const pitchAng = -p.ny * HOVER_PITCH_RANGE * hoverMul
      qYaw.current.setFromAxisAngle(worldUp.current, yawAng)
      qPitch.current.setFromAxisAngle(camRight.current, pitchAng)
      tmpQ.current.copy(qYaw.current).multiply(qPitch.current)
    }

    targetQ.current.copy(baseQuatRef.current).multiply(tmpQ.current)
    g.quaternion.slerp(targetQ.current, Math.min(1, alpha))
  })

  return (
    <group ref={outerGroupRef}>
      <group ref={animGroupRef}>
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

/** То же изображение, что фон hero; слегка темнее для читаемых отражений в хроме. */
function createDimmedHeroEnvTexture(source: THREE.Texture): THREE.CanvasTexture {
  const img = source.image as HTMLImageElement | ImageBitmap
  const w =
    'naturalWidth' in img && img.naturalWidth
      ? img.naturalWidth
      : (img as ImageBitmap).width
  const h =
    'naturalHeight' in img && img.naturalHeight
      ? img.naturalHeight
      : (img as ImageBitmap).height
  const maxW = 2048
  const scale = w > maxW ? maxW / w : 1
  const cw = Math.max(1, Math.round(w * scale))
  const ch = Math.max(1, Math.round(h * scale))

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!
  ctx.filter = 'saturate(0.94) brightness(0.94) contrast(1.02)'
  ctx.drawImage(img, 0, 0, cw, ch)
  ctx.filter = 'none'
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgb(84, 82, 96)'
  ctx.fillRect(0, 0, cw, ch)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.flipY = false
  tex.needsUpdate = true
  return tex
}

/** Отражения на микрофоне = hero-фон (JPEG), чуть приглушённый. */
function HeroReflectionEnvironment({
  url,
  onReady,
}: {
  url: string
  onReady?: () => void
}) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    let cancelled = false
    const prevEnv = scene.environment
    const prevIntensity =
      'environmentIntensity' in scene
        ? (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity
        : undefined

    const loader = new THREE.TextureLoader()
    let pmrem: THREE.PMREMGenerator | null = null
    let baked: THREE.WebGLRenderTarget | null = null

    loader.load(
      url,
      (tex) => {
        if (cancelled) {
          tex.dispose()
          return
        }
        tex.flipY = false
        tex.mapping = THREE.EquirectangularReflectionMapping
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true

        const processed = createDimmedHeroEnvTexture(tex)
        tex.dispose()

        pmrem = new THREE.PMREMGenerator(gl)
        baked = pmrem.fromEquirectangular(processed)
        processed.dispose()

        scene.environment = baked.texture
        if ('environmentIntensity' in scene) {
          ;(scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity =
            1.12
        }
        scene.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh) || !obj.material) return
          const mats = obj.material
          const list = Array.isArray(mats) ? mats : [mats]
          for (const m of list) {
            m.needsUpdate = true
          }
        })
        invalidate()
        queueMicrotask(() => onReady?.())
      },
      undefined,
      () => {
        if (!cancelled) invalidate()
        onReady?.()
      },
    )

    return () => {
      cancelled = true
      if (baked) baked.dispose()
      if (pmrem) pmrem.dispose()
      scene.environment = prevEnv
      if (prevIntensity !== undefined && 'environmentIntensity' in scene) {
        ;(scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity =
          prevIntensity
      }
      invalidate()
    }
  }, [gl, invalidate, scene, url, onReady])

  return null
}

function Scene({
  reducedMotion,
  variant,
  pointerCtrlRef,
  layoutBlendRef,
  onMicMeshPainted,
  onSplashSceneReady,
}: {
  reducedMotion: boolean
  variant: MicrophoneVariant
  pointerCtrlRef: MutableRefObject<MicPointerControl>
  layoutBlendRef: MutableRefObject<number>
  onMicMeshPainted?: () => void
  onSplashSceneReady?: () => void
}) {
  const animRef = useRef<THREE.Group>(null)
  const micDone = useRef(false)
  const envDone = useRef(false)
  const splashFired = useRef(false)
  const splashCbRef = useRef(onSplashSceneReady)
  splashCbRef.current = onSplashSceneReady

  const trySplashReady = () => {
    const cb = splashCbRef.current
    if (!cb || splashFired.current) return
    if (!micDone.current || !envDone.current) return
    splashFired.current = true
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(() => cb(), 120)
      })
    })
  }

  return (
    <>
      <KickFrames />
      <HeroMicCameraRig blendRef={layoutBlendRef} />
      <ambientLight intensity={0.55} />
      <hemisphereLight
        color="#f2eefc"
        groundColor="#2a2438"
        intensity={0.48}
      />
      <directionalLight position={[6, 6, 6]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-6, 5, -3]} intensity={0.6} color="#e4ecff" />
      <directionalLight position={[0, 4, 10]} intensity={0.55} color="#ffffff" />
      <directionalLight position={[-2, -1, 8]} intensity={0.35} color="#c8b8ff" />
      <pointLight position={[6, 7, 5]} intensity={1.15} color="#ffffff" />
      <pointLight position={[-5, 4, -6]} intensity={0.6} color="#b8acf5" />
      <Suspense fallback={null}>
        <HeroReflectionEnvironment
          url={heroEnvUrl}
          onReady={() => {
            envDone.current = true
            trySplashReady()
          }}
        />
      </Suspense>
      <Suspense fallback={null}>
        <MicMesh
          animGroupRef={animRef}
          reducedMotion={reducedMotion}
          variant={variant}
          pointerCtrlRef={pointerCtrlRef}
          layoutBlendRef={layoutBlendRef}
          onVisualReady={() => {
            micDone.current = true
            onMicMeshPainted?.()
            trySplashReady()
          }}
        />
      </Suspense>
    </>
  )
}

export type MicrophoneModelProps = {
  reducedMotion?: boolean
  /** `model1` — FBX из model_1; `shure` — прежний OBJ Shure 55 */
  variant?: MicrophoneVariant
  /** Меш + env отражений готовы — сплэш на desktop может закрыться без «засветов» */
  onSplashSceneReady?: () => void
}

export function MicrophoneModel({
  reducedMotion = false,
  variant = 'model1',
  onSplashSceneReady,
}: MicrophoneModelProps) {
  const layoutBlendRef = useHeroMicLayoutBlendRef()
  const layoutWide = useMinLg()
  const pointerCtrlRef = useRef<MicPointerControl>({
    active: false,
    nx: 0,
    ny: 0,
  })
  const [micPainted, setMicPainted] = useState(false)

  useEffect(() => {
    if (!layoutWide) pointerCtrlRef.current.active = false
  }, [layoutWide])

  const syncPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) return
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1
    pointerCtrlRef.current.nx = Math.max(-1, Math.min(1, nx))
    pointerCtrlRef.current.ny = Math.max(-1, Math.min(1, ny))
  }

  return (
    <div
      className={cn(
        'transform-gpu transition-[padding,transform,opacity] duration-700 ease-[cubic-bezier(0.45,0,0.15,1)] motion-reduce:transition-none',
        !layoutWide
          ? 'pointer-events-none absolute inset-0 z-0 flex min-h-0 items-center justify-center overflow-visible px-2 pb-[max(4.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-4 sm:pb-28'
          : // Ширина колонки влево (правый край у края окна); контент hero z-20 перекрывает при наложении
            'pointer-events-auto absolute inset-y-0 right-0 left-auto z-10 h-full max-h-full min-h-0 w-[min(78vw,58rem)] min-[1536px]:w-[min(85vw,72rem)] min-[1920px]:w-[min(90vw,92rem)] min-[2560px]:w-[min(94vw,120rem)] max-w-full overflow-hidden translate-y-3 xl:translate-y-5',
      )}
      onPointerEnter={
        layoutWide
          ? (e) => {
              pointerCtrlRef.current.active = true
              syncPointer(e)
            }
          : undefined
      }
      onPointerLeave={
        layoutWide ? () => { pointerCtrlRef.current.active = false } : undefined
      }
      onPointerMove={layoutWide ? syncPointer : undefined}
    >
      <div
        className={cn(
          'relative min-h-0 overflow-visible',
          !layoutWide
            ? 'box-border w-full max-w-[42rem] min-h-[min(86vh,48rem)] h-[min(86vh,48rem)] sm:max-w-[46rem] sm:min-h-[min(88vh,50rem)] sm:h-[min(88vh,50rem)]'
            : 'h-full w-full min-w-0',
        )}
      >
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 z-[1] transition-opacity duration-[720ms] ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none',
            micPainted ? 'opacity-0' : 'opacity-100',
            layoutWide
              ? 'bg-gradient-to-l from-studio-bg from-[28%] via-studio-bg/93 via-[50%] to-transparent'
              : 'bg-[radial-gradient(ellipse_at_50%_58%,rgba(9,9,12,0.58)_0%,rgba(9,9,12,0.18)_48%,transparent_70%)]',
          )}
        />
        <Canvas
          className={cn(
            'touch-none brightness-[1.04] saturate-[0.97] contrast-[1.02]',
            !layoutWide && 'opacity-[0.94]',
          )}
          frameloop="always"
          shadows={false}
          dpr={!layoutWide ? [1, 1.15] : [1, 1.25]}
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
            position: [-0.02, 0.3, 7.05],
            fov: CAM_FOV_SIDE,
            near: 0.1,
            far: 100,
          }}
        >
          <Scene
            reducedMotion={reducedMotion}
            variant={variant}
            pointerCtrlRef={pointerCtrlRef}
            layoutBlendRef={layoutBlendRef}
            onMicMeshPainted={() => setMicPainted(true)}
            onSplashSceneReady={onSplashSceneReady}
          />
        </Canvas>
      </div>
    </div>
  )
}

export default MicrophoneModel
