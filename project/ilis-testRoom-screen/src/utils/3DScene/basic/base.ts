import * as THREE from "three"
import Stat from "three/examples/jsm/libs/stats.module"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import * as TWEEN from "three/examples/jsm/libs/tween.module"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import fontJSON from "@/assets/fonts/Microsoft YaHei_Regular.json"

export class Base3DScene {
  controls
  scene: any = new THREE.Scene()
  camera: any = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  // camera: any = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 1000)
  light = new THREE.DirectionalLight("#ffffff", 1)
  ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
  renderer: any = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  stat = Stat()
  font = new FontLoader().parse(fontJSON)
  cameraPosition = {
    x: 0,
    y: 25,
    z: 18
  }
  animationFrameId

  constructor(public dom) {
    this._init()
  }

  // 初始化场景
  _init() {
    const { camera, renderer, dom, scene, cameraPosition } = this

    this._addLight()
    // this._addHelper()
    // this._addStat()
    // this._addGUI()

    renderer.shadowMap.enabled = true
    renderer.setSize(dom.clientWidth, dom.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    dom.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.minDistance = 0
    controls.maxDistance = 40
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI / 4

    this.controls = controls

    // scene.fog = new THREE.Fog(0x050505, 2000, 3500)

    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
    // camera.position.set(10, 10, 10)
    // new TWEEN.Tween(camera.position).to(cameraPosition, 1000).start()
    this._render()
  }

  _resetCameraPosition() {
    new TWEEN.Tween(this.camera.position).to(this.cameraPosition, 1000).start()
  }

  _destroy() {
    const { animationFrameId, renderer, scene } = this

    try {
      cancelAnimationFrame(animationFrameId)
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.content = null
      let gl = renderer.domElement.getContext("webgl")
      if (gl && gl.getExtension("WEBGL_lose_context")) {
        const c = gl.getExtension("WEBGL_lose_context")
        c && c.loseContext()
      }
      this.renderer = null
      this.camera = null
      scene.traverse((child) => {
        if (child.material) {
          child.material.dispose()
        }
        if (child.geometry) {
          child.geometry.dispose()
        }
        child = null
      })
      this.scene = null
    } catch (e) {
      console.error("Failed to destroy threejs", e)
    }
  }

  _render() {
    const { renderer, scene, camera } = this

    this.animationFrameId = requestAnimationFrame(() => {
      this._render()
      TWEEN.update()
      this.controls.update()
    })

    renderer.render(scene, camera)
  }

  _registerHandleEvent(type, fn) {
    document.addEventListener(type, (event) => {
      const raycaster = new THREE.Raycaster()
      const { dom, camera, scene } = this

      const mouse = new THREE.Vector2(0, 0)
      mouse.x = (event.offsetX / dom.offsetWidth) * 2 - 1
      mouse.y = -(event.offsetY / dom.offsetHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      const listenEventMesh = scene.children.filter((i) => (i as any).isFunctionRoom)
      const intersects = raycaster.intersectObjects(listenEventMesh)
      fn && fn(intersects)
    })
  }

  _addLight() {
    const { light, ambientLight, scene } = this

    light.position.set(0, 20, -10)
    scene.add(light)
    scene.add(ambientLight)
  }

  // 坐标轴辅助线
  _addHelper() {
    const { scene } = this

    //网格辅助线
    // 7 网格大小 17网格数量 rgb(193,193,193) 网格颜色
    const gridHelper = new THREE.GridHelper(100, 100, "rgb(193,193,193)", "rgb(193,193,193)")
    // gridHelper.position.set(0, -.59, -.1); //设置网格颜色
    gridHelper.visible = true // 设置网格显示和隐藏
    scene.add(gridHelper)

    // 坐标轴辅助线
    const axesHelper = new THREE.AxesHelper(10)
    axesHelper.visible = true
    scene.add(axesHelper)
  }

  _addStat() {
    const { dom, stat } = this
    dom.appendChild(stat.dom)
  }

  _addGUI() {
    const { light, ambientLight, camera } = this
    const gui = new GUI()

    gui.domElement.style.right = "15px;"
    gui.domElement.style.top = "15px"

    gui.add(light.position, "x", 0, 100)
    gui.add(light.position, "y", 0, 100)
    gui.add(light.position, "z", 0, 100)

    gui.addColor(light, "color").onChange(function (value) {
      light.color.set(value)
    })

    gui.add(ambientLight.position, "x", 0, 100)
    gui.add(ambientLight.position, "y", 0, 100)
    gui.add(ambientLight.position, "z", 0, 100)

    gui.addColor(ambientLight, "color").onChange(function (value) {
      ambientLight.color.set(value)
    })

    gui.add(camera.position, "x", 0, 100)
    gui.add(camera.position, "y", 0, 100)
    gui.add(camera.position, "z", 0, 100)
  }
}
