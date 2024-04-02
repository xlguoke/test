import { execa } from 'execa'

async function updateUdr() {
  const { stdout } = await execa('cordova', ['plugin', 'rm', 'cordova-plugin-udr'])
  console.log(stdout)
  const { stdout: add } = await execa('cordova', ['plugin', 'add', './udr/'])
  console.log(add)
}

updateUdr().catch(console.error)
