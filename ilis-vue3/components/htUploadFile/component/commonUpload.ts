import { Modal, message } from 'ant-design-vue'
import { commonUpload } from '~/api/common'

export interface ICommonUploadConfig {
  /**
   * 二维码key
   */
  qrCodeKey?: Ref<string>

  /**
   * WEBPAGE-(网页直接上传), QR-(二维码上传), GPY-(高拍仪上传),
   */
  uploadWay?: 'WEBPAGE' | 'QR' | 'GPY'

  /**
   * 上传成功后的执行回调
   */
  uploadSuccessCallback?: (q: any) => void

  /**
   * 接受文件类型
   */
  accept?: string[]
}
export function useCommonUpload(config?: ICommonUploadConfig) {
  const FILE_SIZE = ref(1024 * 1024 * 500)

  const ACCEPT = ref(config?.accept || [
    'jpg',
    'jpeg',
    'png',
    'bmp',
    'pdf',
    'xls',
    'xlsx',
    'doc',
    'docx',
    'zip',
    'rar',
    'mp4',
  ])

  const ACCEPT_STR = ref(ACCEPT.value.join('、'))

  const count = ref(0) // 已上传文件

  const totalFile = ref(0) // 当前上传文件总数

  const validFail = ref([] as any[]) // 类型大小验证失败的文件

  const uploadError = ref({} as Record<string, any>) // 上传失败的文件

  const errorLen = ref(0) // 上传失败的文件数量

  const loading = ref(false)

  function IS_IMAGE(type: string) {
    return ['jpg', 'jpeg', 'png', 'bmp'].includes(type.toLowerCase())
  }
  function IS_PDF(type: string) {
    return ['pdf'].includes(type.toLowerCase())
  }
  function IS_PPT(type: string) {
    return ['ppt'].includes(type.toLowerCase())
  }
  function IS_EXCEL(type: string) {
    return ['xls', 'xlsx'].includes(type.toLowerCase())
  }
  function IS_WORD(type: string) {
    return ['doc', 'docx'].includes(type.toLowerCase())
  }
  function IS_ZIP(type: string) {
    return ['zip', 'rar'].includes(type.toLowerCase())
  }
  function IS_VIDEO(type: string) {
    return ['mp4'].includes(type.toLowerCase())
  }

  // 获取上传人
  function getUploader() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.realName || userInfo.username
  }

  // 上传请求
  async function httpUpload(file: any) {
    const formData = new FormData()
    formData.append('file', file)
    if (config?.qrCodeKey) {
      formData.append('qrKey', config.qrCodeKey?.value)
    }
    if (config?.uploadWay) {
      formData.append('uploadWay', config.uploadWay)
    }
    formData.append('uploader', getUploader())
    // return this.$ajax({
    //   url: `/rest/uploadController.do?upload`,
    //   method: 'post',
    //   data: formData,
    // })
    return commonUpload(formData)
  }

  function beforeUpload(file: any, fileList: any[]) {
    const _type = getFileType(file?.name)
    let validType = 1
    let validSize = 1
    // 判断文件类型
    if (!ACCEPT.value.includes(_type)) {
      validType = 0
      validFail.value.push({
        type: 'type',
        fileName: file?.name,
      })
    }
    // 判断文件大小
    if (file.size > FILE_SIZE) {
      validSize = 0
      validFail.value.push({
        type: 'size',
        fileName: file?.name,
      })
    }

    totalFile.value = fileList.length
    if (!validType || !validSize) {
      // 上传结束时才加1
      count.value++
      uploadFinish()
      return false
    }
    handleUpload(file)
    return true
  }

  // 根据文件名称，获取文件类型
  function getFileType(name: string) {
    const _type = name.split('.').pop()
    return _type?.toLowerCase() || ''
  }

  // 上传文件
  function handleUpload(file: any) {
    loading.value = true
    httpUpload(file)
      .then(({ data }) => {
        if (config?.uploadSuccessCallback) {
          config.uploadSuccessCallback(data)
        }
        count.value++
        uploadFinish()
      })
      .catch((err) => {
        count.value++
        addErrorMsg(err, file?.name)
        uploadFinish()
      })
  }

  // 全部上传完成
  function uploadFinish() {
    function _reset() {
      validFail.value = []
      uploadError.value = {}
      errorLen.value = 0
      count.value = 0
      totalFile.value = 0
    }

    if (count.value >= totalFile.value) {
      if (validFail.value.length > 0 || JSON.stringify(uploadError.value) !== '{}') {
        Modal.error({
          title: '上传失败!',
          content: () => renderContent(),
          centered: true,
          okText: '确定',
          onOk: () => {
            _reset()
          },
        })
      }
      else {
        message.success('上传成功！')
        _reset()
      }
      loading.value = false
    }
  }

  function addErrorMsg(err: any, fileName: string) {
    const msg: string = err.msg || err.message || '因系统异常，上传失败：'
    if (!uploadError.value[msg])
      uploadError.value[msg] = []
    uploadError.value[msg].push(fileName)
    errorLen.value++
  }

  function renderContent() {
    const sizeMsg = []
    const typeMsg = []
    const failLength = validFail.value.length + errorLen.value

    for (let i = 0; i < validFail.value.length; i++) {
      const d = validFail.value[i]
      if (d.type === 'size') {
        sizeMsg.push(h('p', d.fileName))
      }
      else if (d.type === 'type') {
        typeMsg.push(h('p', d.fileName))
      }
    }
    const totalLen = totalFile.value
    const msg = [
      h(
        'p',
        `本次上传${totalLen}个文件，成功${totalLen - failLength}个，失败${failLength}个，其中：`,
      ),
    ]
    if (typeMsg.length) {
      msg.push(h('p', { style: 'margin-top: 8px' }, `因格式不支持，无法上传：`))
      msg.push(...typeMsg)
    }
    if (sizeMsg.length) {
      msg.push(h('p', { style: 'margin-top: 8px' }, `因大小超过上限，无法上传：`))
      msg.push(...sizeMsg)
    }

    for (const k in uploadError.value) {
      const v = uploadError.value[k]
      msg.push(h('p', { style: 'margin-top: 8px' }, k))
      if (v.length > 1) {
        v.forEach((item: string) => {
          msg.push(h('p', item))
        })
      }
    }

    return h('div', { style: 'max-height: 64vh;overflow-y: auto;' }, msg)
  }

  /**
   * 创建js
   * @param jsname
   */
  function createScript(jsname: string): Promise<void> {
    const baseUrl = import.meta.env.VITE_ILIS_DRIVERS

    return new Promise((resolve) => {
      const _id = jsname.replace('.', '')
      if (document.getElementById(_id))
        return resolve()
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `${baseUrl}/${jsname}`
      script.id = _id
      document.body.appendChild(script)
      script.onload = () => {
        resolve()
      }
    })
  }

  return {
    FILE_SIZE,
    ACCEPT,
    ACCEPT_STR,
    count,
    totalFile,
    validFail,
    uploadError,
    errorLen,
    loading,
    IS_IMAGE,
    IS_PDF,
    IS_PPT,
    IS_EXCEL,
    IS_WORD,
    IS_ZIP,
    IS_VIDEO,
    getUploader,
    getFileType,
    addErrorMsg,
    httpUpload,
    beforeUpload,
    handleUpload,
    uploadFinish,
    renderContent,
    createScript,
  }
}
