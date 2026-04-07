import * as THREE from "three"
import { Floor3DScene, FloorOpts } from "../../../utils/3DScene/floor"
import fontStepIcon from "@/assets/images/footstep.png"

export class SecondFloor extends Floor3DScene {
  constructor(opts: FloorOpts) {
    super(opts)
    this.addHouses()
    this.addIcon(fontStepIcon, -18.8, 2.4, 1.5, 1.5, 1.5)
    this.addBackground()
  }

  addBackground() {
    const { scene } = this

    const bgWidth = 50
    const bgLength = 30
    const plane = new THREE.PlaneGeometry(bgWidth, bgLength)
    const material = new THREE.MeshPhongMaterial({
      color: 0x0a2475
    })
    const bg = new THREE.Mesh(plane, material)
    bg.rotation.x = -Math.PI / 2
    bg.position.x = -24 + bgWidth / 2
    bg.position.z = -16 + bgLength / 2
    scene.add(bg)
  }

  addIcon(icon, x, z, scaleX, scaleY, scaleZ) {
    const { scene } = this
    const spriteTexture = new THREE.TextureLoader().load(icon)
    const spriteMaterial = new THREE.SpriteMaterial({ map: spriteTexture })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.position.y = 1.5
    sprite.position.x = x
    sprite.position.z = z
    sprite.scale.set(scaleX, scaleY, scaleZ)
    scene.add(sprite)
  }

  addHouses() {
    const { scene } = this
    const spacing = 0.05
    let positionX = -20
    let positionZ = -15

    const houseArr1 = [
      { name: "203办公室", width: 3, length: 7, material: this.materialBlue },
      { name: "204办公室", width: 3, length: 6, material: this.materialBlue },
      { name: "205办公室", width: 3, length: 6, material: this.materialBlue },
      { name: "206会议室", width: 5, length: 6, material: this.materialBlue },
      { name: "207办公室", width: 3, length: 6, material: this.materialBlue },
      { name: "208办公室", width: 3, length: 6, material: this.materialBlue },
      // { width: 1, length: 7, material: this.materialWhite },
      { name: "209办公室", width: 5, length: 6, material: this.materialBlue },
      { name: "210办公室", width: 4, length: 6, material: this.materialBlue },
      { name: "211办公室", width: 4, length: 6, material: this.materialBlue },
      { name: "212办公室", width: 4, length: 6, material: this.materialBlue },
      { name: "213办公室", width: 4, length: 6, material: this.materialBlue }
    ]

    for (let i = 0; i < houseArr1.length; i++) {
      const item = houseArr1[i]
      const { name, width, length, material } = item

      scene.add(
        this.createHouse({
          name,
          x: positionX + width / 2,
          z: positionZ + length / 2,
          width,
          length,
          material
        })
      )
      positionX += width + spacing
    }

    positionX = -10.7
    positionZ = -6

    const houseArr2 = [
      { name: "225办公室", width: 31.8, length: 5, material: this.materialBlue3 },
      { name: "230交安室", text: "230\n交安室(二)", width: 5, length: 4, material: this.materialBlue3 },
      { name: "229交安室", text: "229\n交安室(一)", width: 6, length: 4, material: this.materialBlue3 },
      { name: "228消防检测室", width: 7.3, length: 4, material: this.materialBlue3 },
      { name: "227检测室", width: 7.3, length: 4, material: this.materialBlue3 },
      { name: "226检测室", width: 6, length: 4, material: this.materialBlue3 }
    ]

    for (let i = 0; i < houseArr2.length; i++) {
      const item = houseArr2[i]
      const { name, width, length, material, text } = item
      const house = this.createHouse({
        name,
        text,
        x: positionX + width / 2,
        z: positionZ + length / 2,
        width,
        length,
        material
      })
      scene.add(house)

      if (i == 0) {
        positionX = -10.7
        positionZ += 5 + spacing
      } else {
        positionX += width + spacing
      }
    }

    positionX = -20
    positionZ = 6

    const houseArr3 = [
      { name: "222化学室", width: 10, length: 6, material: this.materialYeelow },
      {
        name: "221环境检测室",
        text: "221\n环境\n检测室(二)",
        width: 3.5,
        length: 6,
        material: this.materialYeelow
      },
      { name: "220药品室", width: 3, length: 6, material: this.materialYeelow },
      { name: "219沥青室", text: "219\n沥青室(三)", width: 3, length: 6, material: this.materialYeelow },
      { name: "218沥青室", text: "218\n沥青室(二)", width: 4, length: 6, material: this.materialYeelow },
      { name: "217沥青室", text: "217\n沥青室(一)", width: 6, length: 6, material: this.materialYeelow },
      { name: "216稀浆混合料室", text: "216\n稀浆混合\n料室", width: 3.5, length: 6, material: this.materialYeelow },
      {
        name: "215沥青混合料室",
        text: "215\n沥青\n混合\n料室\n(三)",
        width: 2.5,
        length: 6,
        material: this.materialYeelow
      },
      { name: "214检测室", width: 2.5, length: 6, material: this.materialYeelow }
    ]

    for (let i = 0; i < houseArr3.length; i++) {
      const item = houseArr3[i]
      const { name, width, length, material, text } = item
      positionZ = 5.4

      scene.add(
        this.createHouse({
          name,
          x: positionX + width / 2,
          z: positionZ + length / 2,
          width,
          length,
          material,
          text
        })
      )
      positionX += width + spacing
    }

    positionX += 4

    scene.add(
      this.createHouse({
        name: "女卫生间",
        x: positionX,
        z: positionZ + 1.5,
        width: 3,
        length: 2.9,
        material: this.materialWhite
      })
    )

    scene.add(
      this.createHouse({
        name: "男卫生间",
        x: positionX,
        z: positionZ + 4.45,
        width: 3,
        length: 2.9,
        material: this.materialWhite
      })
    )

    scene.add(
      this.createHouse({
        name: "223盐雾室",
        x: -18.75,
        z: 4.1,
        width: 2.5,
        length: 2.5,
        material: this.materialYeelow
      })
    )

    scene.add(
      this.createComHouse(
        {
          name: "224检测室",
          x: -16.25,
          z: 2.35,
          material: this.materialYeelow
        },
        {
          width: 4.9,
          length: 6,
          x: -4.5 / 2 + 3.5
        },
        {
          width: 0.75,
          length: 2.5,
          x: -1.25,
          z: -1.75
        }
      )
    )

    scene.add(
      this.createHouse({
        name: "201标准物质间",
        x: -16 - 4 / 2,
        z: -2.9 - 5 / 2,
        width: 4,
        length: 5,
        material: this.materialBlue
      })
    )

    scene.add(
      this.createHouse({
        name: "202纤维室",
        x: -12.2 - 4 / 2,
        z: -2.9 - 5 / 2,
        width: 3.5,
        length: 5,
        material: this.materialBlue
      })
    )

    // scene.add(
    //   this.createHouse({
    //     name: "盐雾室",
    //     x: -19,
    //     z: 4.2,
    //     width: 2,
    //     length: 2,
    //     color: 0x89eda8
    //   })
    // )
  }
}
