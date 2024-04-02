import { args, updateVersion } from './utils'

(function () {
  const version = args.version
  updateVersion(version).catch(console.error)
})()
