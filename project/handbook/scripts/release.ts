import prompts from 'prompts'
import colors from 'picocolors'
import semver from 'semver/preload'
import {
  args,
  generateChangeLog,
  getPackageInfo,
  getVersionChoices,
  isDryRun,
  run,
  runIfNotDry,
  step,
  updateVersion,
} from './utils'

async function release() {
  if (args.skipGitCheck) {
    step('Skipping Git checks')
  }
  else {
    const { stdout } = await run('git', ['status', '--porcelain'], { stdio: 'pipe' })
    if (stdout) {
      const { ok }: { ok: boolean } = await prompts({
        type: 'confirm',
        name: 'ok',
        message: `
${colors.yellow(stdout)}
You have uncommitted changes. Are you sure you want to release?`,
      })
      if (!ok) {
        step(() => colors.dim('Release aborted.'))
        return
      }
    }
  }
  let targetVersion: string | undefined
  const pkg = getPackageInfo()
  if (!targetVersion) {
    const { release }: { release: string } = await prompts({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: getVersionChoices(pkg.version),
    })

    if (release === 'custom') {
      const res: { version: string } = await prompts({
        type: 'text',
        name: 'version',
        message: 'Input custom version',
        initial: pkg.version,
      })
      targetVersion = res.version
    }
    else {
      targetVersion = release
    }
  }

  if (!semver.valid(targetVersion))
    throw new Error(`invalid target version: ${targetVersion}`)

  const tag = `v${targetVersion}`

  const { yes }: { yes: boolean } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing ${colors.yellow(tag)} Confirm?`,
  })
  if (!yes)
    return

  step('Updating package version...')
  await updateVersion(targetVersion)
  step('Updating package-lock')
  await run('npm', ['install', '--package-lock-only'])
  step('Generating changelog...')
  await generateChangeLog()
  step('Committing changes...')
  await runIfNotDry('git', ['add', '-A'])
  await runIfNotDry('git', ['commit', '-m', `release: ${tag}`])
  await runIfNotDry('git', ['tag', tag])

  step('Pushing to GitLab...')
  await runIfNotDry('git', ['push', 'origin', `refs/tags/${tag}`])
  await runIfNotDry('git', ['push'])

  if (isDryRun) {
    step(() => colors.green(`Dry run finished - run git diff to see package changes.`))
  }
  else {
    step(
      () => colors.green(
        `
Pushed, releasing should starts shortly on CI.
http://192.168.2.31/ilis2/uhbs/handbook/-/pipelines`,
      ),
    )
  }
}

release().catch(console.error)
