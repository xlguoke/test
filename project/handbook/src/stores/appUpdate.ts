import { defineStore } from 'pinia'
import { getLogger } from '@ilis/cordova-plugin-log4c'
import { computed, ref } from 'vue'
import semver from 'semver'

const log = getLogger('appUpdate')

const APK_URL_KEY = 'updateApkUrl'

/** 下载版本类型 */
const versionType = __VERSION__.includes('-beta')
  ? 'ILIS_ELN_DEBUG'
  : 'ILIS_ELN'
// 文件下载地址
const downloadUrl = `https://auth.qdm123.com/api/ClientSetup/DownLoadSetupClient?PType=${versionType}`
// 获取文件地址
const getFileUrl = `https://auth.qdm123.com/api/ClientSetup/GetByType?ProductType=${versionType}`

export default defineStore(
  'appUpdate',
  () => {
    /** 是否已检查更新（只在打开程序时检查一次，避免取消更新后重复触发检查） */
    const isCheckUpdate = ref(false)
    /** 是否有新版本 */
    const isNewVersion = ref(false)
    /** 本地版本 */
    const localVersion = ref(__VERSION__)
    /** 服务端版本 */
    const serverVersion = ref('')
    /** 已下载的apk文件 */
    const localApkUrl = ref(localStorage.getItem(APK_URL_KEY) || '')
    /** 下载进度 */
    const percent = ref(0)
    const transfer = new (window as any).FileTransfer()

    /** apk文件名: uhb-v1.0.0.apk、uhb-1.0.0-beta.0.apk */
    const fileName = ref('')
    const savePath = computed(() =>
      fileName.value
        ? `${cordova.file.externalDataDirectory}${fileName.value}`
        : '',
    )

    /** 下载apk */
    function downloadApk(): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!savePath.value)
          return reject(new Error('存储路径错误'))

        // 下载进度
        transfer.onprogress = function (progressEvent: any) {
          if (progressEvent.lengthComputable) {
            percent.value = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            )
          }
        }

        // 下载apk
        transfer.download(
          downloadUrl,
          savePath.value,
          () => {
            localStorage.setItem(APK_URL_KEY, savePath.value)
            localApkUrl.value = savePath.value
            resolve(savePath.value)
          },
          (err: Error) => {
            console.error('下载更新包失败: ', err)
            log.error('下载更新包失败', err)
            reject(err)
          },
        )
      })
    }

    /** 打开apk安装 */
    function openApk(localApkUrl: string) {
      return new Promise((resolve, reject) => {
        const plugins = cordova.plugins as any
        if (plugins.fileOpener2) {
          plugins.fileOpener2.open(
            localApkUrl,
            'application/vnd.android.package-archive',
            {
              error(err: Error) {
                log.error('fileOpener2打开文件失败', err)
                reject(err)
              },
              success() {
                log.info('文件打开成功')
                resolve(true)
              },
            },
          )
        }
        else {
          console.warn('fileOpener2 不可用')
          log.warn('fileOpener2 不可用')
          reject(new Error('fileOpener2 不可用'))
        }
      })
    }

    /** 从文件路径中分离出名称和版本：uhb-v1.0.0.apk、uhb-1.0.0-beta.0.apk */
    function fileInfoByPath(path: string) {
      const match = path.match(/uhb-(?:v)?((\d+\.\d+\.\d+)(?:-.+)?)\.apk$/) || [
        '',
        '',
      ]
      return { name: match[0], version: match[1] }
    }

    /** 获取服务端版本信息 */
    async function getServerVersion() {
      try {
        const res = await fetch(getFileUrl)
        if (res.status === 200) {
          const path = await res.json()
          const { name, version } = fileInfoByPath(path)
          fileName.value = name
          serverVersion.value = version
        }
        else {
          throw new Error('获取服务端版本信息异常')
        }
      }
      catch (err) {
        console.error(err)
        log.error('获取服务端版本信息异常', err)
      }
    }

    /** 检查已下载apk是否是最新版本 */
    function lastVersionApk() {
      return new Promise((resolve) => {
        if (!localApkUrl.value || !fileName.value)
          return resolve(false)

        const { name } = fileInfoByPath(localApkUrl.value)
        if (name !== fileName.value) {
          deleteApk()
          return resolve(false)
        }

        // 检查文件是否实际存在
        window.resolveLocalFileSystemURL(
          localApkUrl.value,
          () => resolve(true),
          () => resolve(false),
        )
      })
    }

    /** 更新完成后，删除apk */
    function deleteApk() {
      if (!localApkUrl.value)
        return
      window.resolveLocalFileSystemURL(
        localApkUrl.value,
        (fileEntry) => {
          fileEntry.remove(
            () => {
              log.info(`APK文件删除成功${localApkUrl.value}`)
            },
            (error) => {
              log.error('APK文件删除失败', error)
            },
          )
        },
        (error) => {
          log.error('无法找到APK文件', error)
        },
      )
      localStorage.removeItem(APK_URL_KEY)
      localApkUrl.value = ''
    }

    function compareVersion(v1: string, v2: string) {
      if (!semver.valid(v1) || !semver.valid(v2))
        return false
      return semver.gt(v1, v2)
    }

    /** 检查版本 */
    async function checkAppVersion() {
      // 开发模式下不检查更新
      if (__DEV__ || isCheckUpdate.value)
        return
      // if (isCheckUpdate.value) return

      await getServerVersion()

      const v1 = serverVersion.value
      const v2 = localVersion.value
      isNewVersion.value = !!v1 && !!v2 && compareVersion(v1, v2)

      // 有新版本且存在已下载的apk时，验证该apk是否为最新版本，是的话无需再下载
      if (isNewVersion.value && !(await lastVersionApk())) {
        localApkUrl.value = ''
        localStorage.removeItem(APK_URL_KEY)
      }

      // 已是最新版，删除本地apk
      if (!isNewVersion.value && !!localApkUrl.value)
        deleteApk()

      return isNewVersion.value
    }

    /** 取消更新 */
    function cancelUpdate() {
      isCheckUpdate.value = true
      log.info('用户取消更新')
    }

    return {
      percent,
      localApkUrl,
      isNewVersion,
      isCheckUpdate,
      localVersion,
      serverVersion,
      checkAppVersion,
      downloadApk,
      openApk,
      cancelUpdate,
    }
  },
  {
    persist: false,
  },
)
