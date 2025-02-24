import { Modal, message } from 'ant-design-vue'

interface IGpyConfig {
  cancelCallback?: () => void
}

export function useGpyCallback(config: IGpyConfig) {
  // 文件类型列表
  const fileTypeDatas = ref([
    { title: 'jpg', value: 0 },
    { title: 'png', value: 1 },
    // { title: "tif", value: 2 },
    { title: 'pdf', value: 3 },
  ])
  // 颜色模式列表
  const colorModeDatas = ref([
    { title: '彩色', value: 0 },
    { title: '灰度', value: 1 },
    { title: '黑白', value: 2 },
  ])
  // 扫描模式列表
  const scanModeDatas = ref([
    { title: '手动', value: 0 },
    { title: '自动', value: 1 },
  ])
  // 扫描页面列表
  const scanPageDatas = ref([
    { title: '单页', value: 0 },
    { title: '多页', value: 1 },
  ])
  // 裁切模式列表
  const cutModeDatas = ref([
    { title: '不裁切', value: 0 },
    { title: '自动裁切', value: 1 },
    { title: '手动裁切', value: 2 },
  ])

  const debounce = (() => {
    let timer = null as any
    return (func: () => void, wait: number) => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(func, wait)
    }
  })()

  const loading = ref(false)

  const loadingText = ref('')

  const openSuccess = ref(false)// 摄像头是否打开成功

  const form = reactive({
    resolution: '',
    fileType: 0,
    colorMode: 0,
    scanMode: 0,
    scanPage: 0,
    cutMode: 0,
  })

  const resolutionArr = ref([] as any[])// 分辨率列表

  const readonlyScanPage = ref(true)// 是否只读

  const fileFolder = ref('') // 拍摄结果存储位置

  const camW = ref(0) // 摄像头宽度

  const camH = ref(0) // 摄像头高度

  const camDatas = ref([] as any[]) // 设备列表（可能同时连接多个设备）

  const tempScanResult = ref([] as any[]) // PDF模式，临时存储扫描结果

  const scanResultDatas = ref([] as any[]) // 扫描结果，合成的pdf

  const selectedFileIds = ref([] as any[]) // 选择需要合成pdf的文件

  const handleControl = ref(false) // 操作控制，防止重复操作

  const deleteInd = ref(-1) // 当前删除文件的下标

  const deleteType = ref(2) // 当前删除的列表 1-左边待合成列表 2-右边已拍摄列表

  const CameraCtl = ref()

  // 合成后的pdf文件路径——临时保存，合成文件并保存后清空
  const tempCombinePath = ref('')
  const timer = ref(-1)

  // 是否为多页模式
  const isMultipage = computed(() => {
    return form.scanPage === 1
  })

  // 根据文件名称获取文件类型
  function getFileType(name: string) {
    const _type = name.split('.').pop()
    return _type?.toLowerCase()
  }

  function getCamSize() {
    const dom = CameraCtl.value
    camW.value = dom.offsetWidth
    camH.value = dom.offsetHeight
    return dom
  }

  // 初始化控件
  function initControl() {
    loading.value = true
    loadingText.value = '正在启动摄像头...'
    openSuccess.value = false
    const dom = getCamSize()
    window.Cam_ControlInit(dom, camW.value, camH.value, getCurrentInstance()?.appContext)
  }

  // 断开连接
  function Cam_CloseConnect() {
    if (!openSuccess.value)
      return
    Modal.confirm({
      title: '连接中断',
      content: '高拍仪连接中断！请检查设备或被其他任务占用！',
      centered: true,
      okText: '重新连接',
      onOk: () => {
        initControl()
      },
      onCancel: () => {
        if (config.cancelCallback) {
          config.cancelCallback()
        }
      },
    })
  }

  // 切换分辨率
  function toSetResolution() {
    loading.value = true
    const restr = resolutionArr.value[form.resolution as any]?.title
    const pos = restr.split('*')
    const width = Number.parseInt(pos[0])
    const height = Number.parseInt(pos[1])
    window.Cam_Open(0, width, height)
  }

  /**
   * 返回获取的设备数目及设备名称
   * @param {number} _devCount 设备数目
   * @param {Array} devNameArr 设备名称数组
   */
  function GetDevCountAndNameResultCB(_devCount: number, devNameArr: any[]) {
    const devArr = []
    for (let i = 0; i < devNameArr.length; i++) {
      devArr.push({
        title: devNameArr[i],
        value: i,
      })
    }
    camDatas.value = devArr
    window.Cam_GetDevResolution(0)
    // 获取电脑驱动盘符，指定文件存放位置
    window.GetDrives()
  }

  /**
   * 返回获取的设备分辨率信息
   * @param {number} resCount 分辨率数目
   * @param {Array} resArr 分辨率数组
   */
  function GetResolutionResultCB(resCount: number, resArr: any[]) {
    if (resCount === 0) {
      return console.error('获取设备分辨率信息失败')
    }
    const _resolutionArr = []
    for (let i = 0; i < resArr.length; i++) {
      _resolutionArr.push({
        title: resArr[i],
        value: i,
      })
    }
    resolutionArr.value = _resolutionArr
    form.resolution = Math.ceil(_resolutionArr.length / 3).toString()
    nextTick(() => {
      toSetResolution()
    })
  }

  /**
   * 获取驱动盘符
   * @param {string} driveStr 驱动盘符
   */
  function GetDriveResultCB(driveStr: string) {
    let drive = 'C'
    if (driveStr) {
      const arr = driveStr.split(':\\')
      drive = arr.length > 1 ? arr[1] : arr[0]
    }
    fileFolder.value = `${drive}:\\IlisGpyPhoto\\`
    window.IlisGpyPhotoFolder = fileFolder.value
  }

  /**
   * 返回摄像头开启状态
   * @param {number} status 0表示关闭，1表示开启
   */
  function GetCameraOnOffStatus(status: number) {
    // console.log('摄像头开启状态：', status)
    loading.value = false
    loadingText.value = ''
    if (status) {
      openSuccess.value = true
      return
    }

    Modal.error({
      title: '开启摄像头失败',
      content:
        '请检查高拍仪是否正常连接，或摄像头是否被占用，然后重新启动高拍仪，若任无法开启摄像头，请重新启动高拍仪插件后重试。',
      centered: true,
      okText: '确定',
    })
  }

  /**
   * 拍照结果
   * @param {number} flag 0表示拍照成功，2表示拍照失败
   * @param {string} path 图片路径
   * @param {string} base64Str 图片base64字符串
   */
  function GetCaptrueImgResultCB(flag: number, path: string, base64Str: string) {
    if (flag !== 0) {
      message.error('拍摄失败')
      return
    }
    const name = path.substring(fileFolder.value.length)
    const obj = {
      src: `data:;base64,${base64Str}`,
      base64Str,
      path,
      name,
      type: getFileType(name),
      id: name,
    }
    if (isMultipage.value) {
      tempScanResult.value.push(obj)
      selectedFileIds.value.push(name)
    }
    else {
      scanResultDatas.value.push(obj)
    }
  }

  /**
   * 添加合并PDF文件结果返回
   * @param {number} flag 0表示添加成功，2表示添加失败
   * @param {string} _base64Str 图片base64字符串
   */
  function AddImgFileToPDFResultCB(flag: number, _base64Str: string) {
    if (flag !== 0) {
      message.error('添加合并文件失败')
      return
    }
    tempCombinePath.value = `${fileFolder.value + formatDate()}.pdf`
    window.Cam_CombinePDF(tempCombinePath.value)
  }

  /**
   * 合并PDF结果返回
   * @param {number} flag 0表示合并成功，2表示合并失败
   * @param {string} PdfBase64Str 合并后的PDF文件base64字符串
   */
  function PdfCombineResultCB(flag: number, PdfBase64Str: string) {
    if (flag !== 0) {
      message.error('导出pdf失败')
      return
    }
    const name = tempCombinePath.value.substring(fileFolder.value.length)
    scanResultDatas.value.push({
      src: `data:;base64,${PdfBase64Str}`,
      base64Str: PdfBase64Str,
      path: tempCombinePath.value,
      name,
      type: 'pdf',
    })
    tempCombinePath.value = ''
    tempScanResult.value = tempScanResult.value.filter(d => !selectedFileIds.value.includes(d.id))
    selectedFileIds.value = []
  }

  /**
   * 身份证信息返回 （暂不对接）
   */
  function GetIdCardInfoResultCB() {}
  /**
   * 身份证信息及证件合并照片信息返回（暂不对接）
   */
  function GetIdCardInfoAndImgResultCB() {}

  /**
   * 删除文件
   * @param {number} flag 0表示删除成功，2表示删除失败
   */
  function GetDeleteFileResultCB(flag: number) {
    if (!handleControl.value)
      return
    if (flag === 0) {
      message.success('删除成功')
      if (deleteType.value === 1) {
        tempScanResult.value.splice(deleteInd.value, 1)
      }
      else {
        scanResultDatas.value.splice(deleteInd.value, 1)
      }
    }
    else {
      message.error('删除失败')
    }
    setHandleControl(false)
  }

  function setHandleControl(val: any) {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
      handleControl.value = val
    }, 500) as any
  }

  function formatDate() {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const min = date.getMinutes()
    const sec = date.getSeconds()
    const newTime
          = year
          + (month < 10 ? `0${month}` : month).toString()
          + (day < 10 ? `0${day}` : day)
          + (hour < 10 ? `0${hour}` : hour)
          + (min < 10 ? `0${min}` : min)
          + (sec < 10 ? `0${sec}` : sec)
    return newTime
  }

  return {
    fileTypeDatas,
    colorModeDatas,
    resolutionArr,
    scanModeDatas,
    scanPageDatas,
    cutModeDatas,
    CameraCtl,
    camW,
    camH,
    form,
    toSetResolution,
    isMultipage,
    fileFolder,
    openSuccess,
    loading,
    loadingText,
    scanResultDatas,
    tempScanResult,
    tempCombinePath,
    selectedFileIds,
    handleControl,
    timer,
    deleteType,
    deleteInd,
    getFileType,
    debounce,
    readonlyScanPage,
    GetDevCountAndNameResultCB,
    Cam_CloseConnect,
    GetResolutionResultCB,
    GetDriveResultCB,
    GetCameraOnOffStatus,
    GetCaptrueImgResultCB,
    AddImgFileToPDFResultCB,
    PdfCombineResultCB,
    GetIdCardInfoResultCB,
    GetIdCardInfoAndImgResultCB,
    GetDeleteFileResultCB,
  }
}
