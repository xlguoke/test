import path from 'node:path'
import fs from 'node:fs'
import { execa } from 'execa'

async function updateUdr() {
  const { stdout } = await execa('cordova', ['plugin', 'rm', 'cordova-plugin-udr'])
  console.log(stdout)
  const { stdout: add } = await execa('cordova', ['plugin', 'add', './udr/'])
  console.log(add)

  // 将浩哥提供的文件移动到指定目录下
  const sourceFile = path.join(__dirname, '../udr/src/android/MainActivity.java')
  const targetDir = path.join(__dirname, '../platforms/android/app/src/main/java/cn/ilis/uhb')
  const targetFile = path.join(targetDir, 'MainActivity.java')

  if (fs.existsSync(targetDir))
    fs.copyFileSync(sourceFile, targetFile)
}

updateUdr().catch(console.error)
