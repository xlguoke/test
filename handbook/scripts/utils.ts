import fs from 'node:fs'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { Builder, Parser } from 'xml2js'
import colors from 'picocolors'
import type { ReleaseType } from 'semver/preload'
import semver from 'semver/preload'
import type { Options as ExecaOptions, ExecaReturnValue } from 'execa'
import { execa } from 'execa'
import mri from 'mri'

export const args = mri(process.argv.slice(2), { boolean: ['dry'] })

export const isDryRun = args.dry

const parser = new Parser()
const builder = new Builder({
  xmldec: {
    version: '1.0',
    encoding: 'UTF-8',
  },
})

export async function updateVersion(version: string) {
  await updateCordovaVersion(version)
  await updateProjectVersion(version)
}

export async function updateCordovaVersion(version: string) {
  const content = readContent('config.xml')
  const config: { widget: { $: { version: string } } } = await parser.parseStringPromise(content)
  config.widget.$.version = version
  const s = builder.buildObject(config)
  fs.writeFileSync('config.xml', s)
  console.log(colors.cyan(`Setting cordova config.xml version to ${version}.`))
}

export async function updateProjectVersion(version: string) {
  const json = getPackageInfo()
  json.version = version
  const pkg = `${JSON.stringify(json, null, 2)}\n`
  fs.writeFileSync('package.json', pkg)
  console.log(colors.cyan(`Setting package.json version to ${version}.`))
}

export function getPackageInfo() {
  const content = readContent('package.json')
  return JSON.parse(content) as { version: string }
}

export function step(msg: string | (() => string)): void {
  return console.log(typeof msg === 'string' ? colors.cyan(msg) : msg())
}

function readContent(path: string) {
  return fs.readFileSync(path, 'utf8')
}

interface VersionChoice {
  title: string
  value: string
}

export function getVersionChoices(currentVersion: string): VersionChoice[] {
  const currentBeta = currentVersion.includes('beta')
  const currentAlpha = currentVersion.includes('alpha')
  const isStable = !currentBeta && !currentAlpha

  function inc(i: ReleaseType, tag = currentAlpha ? 'alpha' : 'beta') {
    return semver.inc(currentVersion, i, tag)!
  }

  let versionChoices: VersionChoice[] = [
    {
      title: 'next',
      value: inc(isStable ? 'patch' : 'prerelease'),
    },
  ]

  if (isStable) {
    versionChoices.push(
      {
        title: 'beta-minor',
        value: inc('preminor'),
      },
      {
        title: 'beta-major',
        value: inc('premajor'),
      },
      {
        title: 'alpha-minor',
        value: inc('preminor', 'alpha'),
      },
      {
        title: 'alpha-major',
        value: inc('premajor', 'alpha'),
      },
      {
        title: 'minor',
        value: inc('minor'),
      },
      {
        title: 'major',
        value: inc('major'),
      },
    )
  }
  else if (currentAlpha) {
    versionChoices.push({
      title: 'beta',
      value: `${inc('patch')}-beta.0`,
    })
  }
  else {
    versionChoices.push({
      title: 'stable',
      value: inc('patch'),
    })
  }
  versionChoices.push({ value: 'custom', title: 'custom' })

  versionChoices = versionChoices.map((i) => {
    i.title = `${i.title} (${i.value})`
    return i
  })

  return versionChoices
}

export async function run(
  bin: string,
  args: string[],
  opts: ExecaOptions = {},
): Promise<ExecaReturnValue> {
  return execa(bin, args, { stdio: 'inherit', ...opts })
}

export async function dryRun(
  bin: string,
  args: string[],
  opts?: ExecaOptions,
): Promise<void> {
  return console.log(
    colors.blue(`[dryrun] ${bin} ${args.join(' ')}`),
    opts || '',
  )
}

export const runIfNotDry = isDryRun ? dryRun : run

export async function generateChangeLog() {
  const changelogArgs = [
    'conventional-changelog',
    '-p',
    'angular',
    '-i',
    'CHANGELOG.md',
    '-s',
    '--commit-path',
    '.',
  ]
  return run('npx', changelogArgs)
}

export async function buildApk() {
  await run('npm', ['run', 'build'])
  await run('cordova', ['build', 'android', '--release'])
}

export async function uploadApk(tag: string) {
  const form = new FormData()
  form.append('Content-Type', 'application/octect-stream')
  const buffer = await readFile('platforms/android/app/build/outputs/apk/release/app-release.apk')
  form.append('files', new Blob([buffer]))
  form.append('name', `uhb-${tag}.apk`)
  const res = await fetch(
    'https://auth.qdm123.com/Content/js/HitekPlugins/HitekUpload/HitekFileUpload.ashx?FileType=FileType&FileTypeTag=ILIS_ELN',
    {
      method: 'post',
      body: form,
    },
  )
  if (res.ok)
    console.log(colors.green('upload success, download link: https://auth.qdm123.com/api/ClientSetup/DownLoadSetupClient?PType=ILIS_ELN'))
  else
    console.log(colors.red('upload failed'), await res.text())
}
