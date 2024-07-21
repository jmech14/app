import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

/**
 * Debug
 */
const parameters = {
    materialColor: '#8e8585'
}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#000000')

// Layers
const GLASS_LAYER = 1
const BACKGROUND_LAYER = 2

// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

// Material
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

// Plane for background
const planeGeometry = new THREE.PlaneGeometry(20, 20)
const planeMaterial = new THREE.MeshBasicMaterial({ 
    color: '#000000',
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.rotation.x = 0
plane.position.y = 0
plane.position.z = -10
plane.layers.set(BACKGROUND_LAYER)
scene.add(plane)

// GLTFLoader
const gltfLoader = new GLTFLoader()
gltfLoader.load('/gltf/dbzw.glb', (gltf) => {
    gltf.scene.position.x = -3.6
    gltf.scene.position.z = -5

    // Improved Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1,
        opacity: 0.1,
        metalness: 0,
        roughness: 0,
        ior: 1.45,
        thickness: 0.5,
        specularIntensity: 10,
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide
    })

const light = new THREE.DirectionalLight(0xfff0dd, 20);
light.position.set(-3.6, 0, -5);
scene.add(light);

    // Apply glass material to all meshes and set to glass layer
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.material = glassMaterial
            child.layers.set(GLASS_LAYER)
        }
    })

    scene.add(gltf.scene)
})

// Lights
const ambientLight = new THREE.AmbientLight('#ffffff', 10.5)
ambientLight.layers.enable(GLASS_LAYER)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff', 10)
directionalLight.position.set(5, 5, 5)
directionalLight.layers.enable(GLASS_LAYER)
scene.add(directionalLight)

// Column of Point Lights
const numberOfLights = 50
const columnHeight = 20
const pointLights = []

for (let i = 0; i < numberOfLights; i++) {
    const light = new THREE.PointLight(0xffffff, 1, 10)
    light.position.set(-5, (i / (numberOfLights - 1) - 0.5) * columnHeight, 0)
    light.layers.enable(GLASS_LAYER)
    scene.add(light)
    pointLights.push(light)
}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 15
camera.position.y = 3
camera.layers.enable(GLASS_LAYER)
camera.layers.enable(BACKGROUND_LAYER)
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: false
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Scroll
let scrollY = window.scrollY
let scrollHeight = document.documentElement.scrollHeight - window.innerHeight
window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    scrollHeight = document.documentElement.scrollHeight - window.innerHeight
})

// Cursor
const cursor = { x: 0, y: 0 }
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Calculate scroll percentage
    const scrollPercentage = Math.min(Math.max(scrollY / scrollHeight, 0), 1)

    // Update light positions based on scroll
    const lightX = -5 + scrollPercentage * 10 // Move from -5 to 5
    pointLights.forEach(light => {
        light.position.x = lightX
    })

    // Animate camera
    camera.position.y = -scrollY / sizes.height + 3
    const parallaxX = cursor.x
    const parallaxY = -cursor.y
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()