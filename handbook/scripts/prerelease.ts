import fs from 'node:fs'
import { inc } from 'semver'
import { args, getPackageInfo } from './utils'

async function prepareVersion() {
  let version: string | null = args.version
  if (typeof version !== 'string') {
    version = getPackageInfo().version
    console.log('Haven\'t receive a valid version use the version in package.json instead.', version)
  }
  if (version.match(/v?\d+.\d+.\d+$/)) {
    console.log(`The current version: ${version} is not a pre-release version.`)
    version = inc(version, 'prerelease', 'beta')
  }
  else {
    version = inc(version, 'prerelease')
  }
  fs.writeFileSync('variables.env', `PRERELEASE_VERSION=${version}`)
}

prepareVersion().catch(console.error)
