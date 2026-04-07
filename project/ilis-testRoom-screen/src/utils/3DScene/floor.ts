import * as THREE from "three"
import { Base3DScene } from "./basic/base"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import * as TWEEN from "three/examples/jsm/libs/tween.module"

export interface configItem {
  id: string
  name: string
  sn: string
  url: string
}

export interface FloorOpts {
  dom: HTMLElement
  configList: configItem[]
  onclick: (name: string) => void
}

interface houseOpts {
  color?: number
  material?: THREE.MeshLambertMaterial
  x: number
  z: number
  length: number
  width: number
  name?: string
  text?: string
}

export class Floor3DScene extends Base3DScene {
  raycaster = new THREE.Raycaster()
  resetTimer
  onclick: (name: string) => void
  configList: configItem[] = []

  materialBlue = new THREE.MeshLambertMaterial({ color: 0x0066ec })
  materialBlue2 = new THREE.MeshLambertMaterial({ color: 0x3752ff })
  materialBlue3 = new THREE.MeshLambertMaterial({ color: 0x0bd6ff })
  materialYeelow = new THREE.MeshLambertMaterial({ color: 0xffa34d })
  materialWhite = new THREE.MeshLambertMaterial({ color: 0xffffff })

  textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

  constructor(opts: FloorOpts) {
    super(opts.dom)

    // this.cameraPosition.y = 35
    // this.cameraPosition.z = 25
    // this.cameraPosition.x = 0
    this.onclick = opts.onclick
    this.configList = opts.configList
    this.onClickHouse = this.onClickHouse.bind(this)
    this.onMousemoveHouse = this.onMousemoveHouse.bind(this)
    this.onResetPosition = this.onResetPosition.bind(this)

    document.addEventListener("click", this.onClickHouse)
    document.addEventListener("mousemove", this.onMousemoveHouse)

    document.addEventListener("mousedown", this.onResetPosition)
    document.addEventListener("mousemove", this.onResetPosition)
    document.addEventListener("touchstart", this.onResetPosition)
  }

  /**
   * 构建简陋的房子
   */
  createHouse(opts: houseOpts) {
    const { z, x, length, width, name, text, material } = opts
    const geometry = new THREE.BoxGeometry(width, 1, length)
    const house = new THREE.Mesh(geometry, material)
    if (name) {
      house.add(this.createHouseText(text || this.transformText(name)))
    }
    house.position.set(x, 0.5, z)
    if (name) {
      house.name = name
      if (!["风机房", "男卫生间", "女卫生间", "比表面积室"].includes(name)) {
        if (!!this.configList.find((i) => i.name == name)) {
          ;(house as any).isFunctionRoom = true
        }
      }
    }
    house.castShadow = true

    return house
  }

  /**
   * 构件组合房子
   */
  createComHouse(opts, box1, box2) {
    const group = new THREE.Group()
    const geometry1 = new THREE.BoxGeometry(box1.width, 1, box1.length)
    const geometry2 = new THREE.BoxGeometry(box2.width, 1, box2.length)

    const cube1 = new THREE.Mesh(geometry1, opts.material)
    const cube2 = new THREE.Mesh(geometry2, opts.material)

    box1.x && (cube1.position.x = box1.x)
    box1.z && (cube1.position.z = box1.z)
    box2.x && (cube2.position.x = box2.x)
    box2.z && (cube2.position.z = box2.z)

    if (opts.name) {
      cube1.add(this.createHouseText(opts.text || this.transformText(opts.name)))
    }

    group.add(cube1)
    group.add(cube2)

    group.position.set(opts.x, 0.5, opts.z)
    group.name = opts.name
    cube1.name = opts.name
    cube2.name = opts.name

    if (!!this.configList.find((i) => i.name == opts.name)) {
      ;(group as any).isFunctionRoom = true
      ;(cube1 as any).isFunctionRoom = true
      ;(cube2 as any).isFunctionRoom = true
    }

    group.castShadow = true

    return group
  }

  /**
   * 创建房间名
   */
  createHouseText(text) {
    const textGeometry = new TextGeometry(text, {
      font: this.font,
      size: 0.4,
      height: 0.05
    })
    textGeometry.center()
    const textMesh = new THREE.Mesh(textGeometry, this.textMaterial)
    textMesh.position.set(0, 0.8, 0)
    textMesh.rotation.x = -Math.PI / 2

    return textMesh
  }

  transformText(text) {
    const num = parseInt(text)

    if (!Number.isNaN(num)) {
      const a = text.split(num)
      a.unshift(num + "\n")
      return a.join("")
    }

    return text
  }

  /**
   * 点击
   */
  onClickHouse(event) {
    const raycaster = new THREE.Raycaster()
    const { dom, camera, scene } = this

    const mouse = new THREE.Vector2(0, 0)
    mouse.x = (event.offsetX / dom.offsetWidth) * 2 - 1
    mouse.y = -(event.offsetY / dom.offsetHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)

    const listenEventMesh = scene.children.filter((i) => (i as any).isFunctionRoom)
    const intersects = raycaster.intersectObjects(listenEventMesh)

    if (!this.onclick) {
      return
    }

    if (intersects && intersects.length) {
      for (let i = 0; i < intersects.length; i++) {
        const item = intersects[i]
        const object = item.object
        if (object && (object as any).isFunctionRoom) {
          this.onclick(object.name)
          break
        }
      }
    }
  }

  onMousemoveHouse(event) {
    const raycaster = new THREE.Raycaster()
    const { dom, camera, scene } = this
    const children = scene.children

    const mouse = new THREE.Vector2(0, 0)
    mouse.x = (event.offsetX / dom.offsetWidth) * 2 - 1
    mouse.y = -(event.offsetY / dom.offsetHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)

    const listenEventMesh = scene.children.filter((i) => (i as any).isFunctionRoom)
    const intersects = raycaster.intersectObjects(listenEventMesh)

    children.map((item) => {
      if ((item as any).isFunctionRoom) {
        new TWEEN.Tween(item.position).to({ y: 0.5 }, 300).start()
      }
    })

    if (intersects && intersects.length) {
      for (let i = 0; i < intersects.length; i++) {
        const item = intersects[i]
        const object = item.object
        if (object && (object as any).isFunctionRoom) {
          if (object.parent && object.parent.type == "Group") {
            new TWEEN.Tween(object.parent.position).to({ y: 1.5 }, 300).start()
          } else {
            new TWEEN.Tween(object.position).to({ y: 1.5 }, 300).start()
          }
          break
        }
      }
    }
  }

  onResetPosition() {
    const { camera, cameraPosition } = this

    if (this.resetTimer) {
      clearTimeout(this.resetTimer)
    }

    this.resetTimer = setTimeout(() => {
      new TWEEN.Tween(camera.position).to(cameraPosition, 1000).start()
    }, 30 * 1000)
  }

  removeEventListeners() {
    document.removeEventListener("click", this.onClickHouse)
    document.removeEventListener("mousemove", this.onMousemoveHouse)

    document.removeEventListener("mousedown", this.onResetPosition)
    document.removeEventListener("mousemove", this.onResetPosition)
    document.removeEventListener("touchstart", this.onResetPosition)
  }
}
