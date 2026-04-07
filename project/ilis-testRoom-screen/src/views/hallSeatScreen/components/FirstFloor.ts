import * as THREE from "three"
import { Floor3DScene, FloorOpts } from "../../../utils/3DScene/floor"
import addressEnterIcon from "@/assets/images/address-green.png"
import addressOuterIcon from "@/assets/images/address-red.png"
import fontStepIcon from "@/assets/images/footstep.png"

export class FirstFloor extends Floor3DScene {
  constructor(opts: FloorOpts) {
    super(opts)
    this.addHouses()
    this.addIcon(addressEnterIcon, -22, -3, 3, 3, 3)
    this.addIcon(addressOuterIcon, -19, -7, 4.5, 3, 3)
    this.addIcon(fontStepIcon, -21, 2.9, 1.5, 1.5, 1.5)
    this.addBackground()
  }

  addBackground() {
    const { scene } = this

    const bgWidth = 52
    const bgLength = 36
    const plane = new THREE.PlaneGeometry(bgWidth, bgLength)
    const material = new THREE.MeshPhongMaterial({
      color: 0x0a2475
    })
    const bg = new THREE.Mesh(plane, material)
    bg.rotation.x = -Math.PI / 2
    bg.position.x = -26 + bgWidth / 2
    bg.position.z = -22 + bgLength / 2
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
    let positionX = -24
    let positionZ = -15

    scene.add(
      this.createHouse({
        name: "127支座及伸缩缝室",
        x: 0.1,
        z: -18.05,
        width: 48.2,
        length: 6,
        material: this.materialBlue
      })
    )

    const houseArr1 = [
      { name: "100智能力学室", width: 10, length: 8, material: this.materialBlue },
      { name: "101力学室", text: "101\n力学室(一)", width: 10, length: 8, material: this.materialBlue },
      { name: "102力学室", text: "102\n力学室(二)", width: 4, length: 8, material: this.materialBlue },
      { name: "103静载锚固室", width: 10, length: 8, material: this.materialBlue },
      { name: "104松弛室", width: 3.9, length: 3.9, material: this.materialBlue },
      { name: "105装饰材料室", width: 4, length: 8, material: this.materialBlue },
      { name: "106土工合成材料室", width: 10, length: 8, material: this.materialBlue }
    ]

    for (let i = 0; i < houseArr1.length; i++) {
      const item = houseArr1[i]
      const { name, width, length, material, text } = item
      positionZ = -15

      if (name == "104松弛室") {
        positionX -= 4
        positionZ = -10.8
        scene.add(
          this.createHouse({
            name,
            x: positionX + width / 2,
            z: positionZ + length / 2 - 0.1,
            width,
            length,
            material
          })
        )
        positionX += 0.05
      } else if (name == "103静载锚固室") {
        scene.add(
          this.createComHouse(
            {
              ...item,
              x: positionX + width / 2,
              z: positionZ + length / 2
            },
            {
              width: 6,
              length: 8,
              x: -6 / 2 + 1
            },
            {
              width: 4,
              length: 4,
              x: 6 / 2,
              z: -4 / 2
            }
          )
        )
      } else {
        scene.add(
          this.createHouse({
            name,
            text,
            x: positionX + width / 2,
            z: positionZ + length / 2,
            width,
            length,
            material
          })
        )
      }
      positionX += width + spacing
    }

    positionX -= 6 + spacing
    positionZ += 7.8 + spacing

    const houseArr2 = [
      { name: "107标准养护室", text: "107\n标准养护室(一)", width: 6, length: 4.5, material: this.materialBlue2 },
      { width: 1.4, length: 1, material: this.materialWhite },
      { name: "108标准养护室", text: "108\n标准养护室(二)", width: 6, length: 4.5, material: this.materialBlue2 },
      { name: "109水泥混凝土室", text: "109\n水泥混凝土室(一)", width: 6, length: 3, material: this.materialBlue2 },
      { name: "女卫生间", width: 6, length: 4, material: this.materialWhite},
      { name: "男卫生间", width: 6, length: 4, material: this.materialWhite }
    ]

    for (let i = 0; i < houseArr2.length; i++) {
      const item = houseArr2[i]
      const { name, width, length, material, text } = item

      if (!name) {
        scene.add(
          this.createHouse({
            name,
            x: positionX + width / 2,
            z: positionZ + length / 2 - 0.2,
            width,
            length,
            material
          })
        )
        positionZ -= width - spacing
      } else if (name == "107标准养护室") {
        scene.add(
          this.createComHouse(
            {
              ...item,
              x: positionX + width / 2,
              z: positionZ + length / 2
            },
            {
              width: 6,
              length: 4
            },
            {
              width: 4.5,
              length: 0.5,
              x: 0.75,
              z: 2.2
            }
          )
        )
      } else if (name == "108标准养护室") {
        scene.add(
          this.createComHouse(
            {
              ...item,
              x: positionX + width / 2,
              z: positionZ + length / 2
            },
            {
              width: 6,
              length: 4,
              z: 0.8
            },
            {
              width: 4.5,
              length: 0.7,
              x: 0.75,
              z: -1.35
            }
          )
        )
        positionZ += 0.55
      } else {
        scene.add(
          this.createHouse({
            name,
            text,
            x: positionX + width / 2,
            z: positionZ + length / 2,
            width,
            length,
            material
          })
        )
      }
      positionZ += length + spacing
    }

    positionX = -23.2
    positionZ = 6

    const houseArr3 = [
      { name: "117沥青混合料室", text: "117\n沥青混合料室(二)", width: 6, length: 8, material: this.materialYeelow },
      { name: "116沥青混合料室", text: "116\n沥青混合料室\n(一)", width: 4.5, length: 8, material: this.materialYeelow },
      { name: "115高温室", width: 3, length: 8, material: this.materialYeelow },
      { name: "114掺合料室", width: 4, length: 8, material: this.materialYeelow },
      { name: "113水泥室", width: 7, length: 8, material: this.materialYeelow },
      { name: "比表面积室", text: "比表\n面积\n室", width: 1.9, length: 2.9, material: this.materialWhite },
      { name: "112加工室", width: 3, length: 8, material: this.materialYeelow },
      {
        name: "111环境检测室",
        text: "111\n环境\n检测室(一)",
        width: 3,
        length: 8,
        material: this.materialYeelow
      },
      { name: "110水泥混凝土室", text: "110\n水泥混凝土室(二)", width: 8, length: 8, material: this.materialYeelow }
    ]

    // 风机房
    scene.add(
      this.createHouse({
        name: "风机房",
        x: positionX + 2,
        z: positionZ - 1.5,
        width: 4,
        length: 2,
        material: this.materialWhite
      })
    )

    for (let i = 0; i < houseArr3.length; i++) {
      const item = houseArr3[i]
      const { name, width, length, material, text } = item
      positionZ = 5.4

      if (name == "比表面积室") {
        positionX -= 7.05
        positionZ = 10.46

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
        positionX += 5.1
      } else if (name == "113水泥室") {
        scene.add(
          this.createComHouse(
            {
              ...item,
              x: positionX + width / 2,
              z: positionZ + length / 2
            },
            {
              width: 5,
              length: 8,
              x: -5 / 2 + 3.5
            },
            {
              width: 2,
              length: 5,
              x: -2.5,
              z: -5 / 2 + 1
            }
          )
        )
      } else {
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
      }
      positionX += width + spacing
    }

    positionX = -14
    positionZ = -5

    const houseArr4 = [
      { name: "119无机结合料室", width: 10.85, length: 3, material: this.materialBlue3 },
      { name: "120管材室", text: "120\n管材室(一)", width: 9.45, length: 4, material: this.materialBlue3 },
      { name: "121管材室", text: "121\n管材室(二)", width: 9.45, length: 4, material: this.materialBlue3 },
      { name: "126土工室", text: "126\n土工室(二)", width: 5.4, length: 6, material: this.materialBlue3 },
      { name: "125土工室", text: "125\n土工室(一)", width: 5.4, length: 6, material: this.materialBlue3 },
      { name: "124集料室", text: "124\n集料室(二)", width: 6.8, length: 5, material: this.materialBlue3 },
      { name: "123集料室", text: "123\n集料室(一)", width: 6.8, length: 5, material: this.materialBlue3 },
      { name: "122水泥混凝土室", text: "122\n水泥混凝土室(三)", width: 5.2, length: 5, material: this.materialBlue3 }
    ]

    for (let i = 0; i < houseArr4.length; i++) {
      const item = houseArr4[i]
      const { name, width, length, material, text } = item
      const house = this.createHouse({
        name,
        x: positionX + width / 2,
        z: positionZ + length / 2,
        width,
        length,
        text,
        material
      })
      scene.add(house)

      if (i == 2) {
        positionX = -14
        positionZ += 3 + spacing
      } else {
        positionX += width + spacing
      }

      if (i == 4) {
        positionZ += 1
      }
    }

    scene.add(
      this.createHouse({
        name: "118力学室",
        text: "118\n力学室(三)",
        x: -22 + 3,
        z: -1 + 1.5,
        width: 6,
        length: 2.5,
        material: this.materialBlue3
      })
    )
  }
}
