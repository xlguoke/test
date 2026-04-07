import qs from 'qs'
import { showLoadingToast, showNotify } from 'vant'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

let _vue: any = null // vue对象
const SignerObj = {
  _type: '', // 签字（signature）或签章（stamp）
  reportData: {},
  timer: null,
  signType: '',
  submitUrl: '',
  isReload: false,
  // 签章确认提示
  /*
    * @params dataObj [Object]
    *    context [Object] —— vue对象
    *    signerServerType [String] —— 签章类型 signature/stamp
    *    reportData [Object] —— 当前签名的报告数据
    */
  signConfirm(dataObj: any) {
    const { context, signerServerType, reportData } = dataObj
    _vue = context
    this._type = signerServerType
    this.reportData = reportData
    this.submitUrl = api.report[this._type === 'signature' ? 'submitSign' : 'submitStampSign']
    this.isReload = false
    const tName = signerServerType === 'stamp' ? '签章' : '签名'
    showConfirmDialog({
      title: `电子${tName}提示`,
      message: `是否确定进行电子${tName}？`,
      confirmButtonColor: '#1989fa',
    }).then(() => {
      this.getSignerServerType()
      if (this._type === 'signature') {
        this.getSignType()
      }
    })
  },
  // 签审合一时，报告审核/批准通过时自动执行签名逻辑
  goSign(dataObj: any) {
    const { context, reportData, signType } = dataObj
    _vue = context
    this._type = 'signature'
    this.reportData = reportData
    this.submitUrl = api.report.submitSign
    this.signType = signType
    this.isReload = true
    this.getSignerServerType()
  },
  // 获取签字类型
  getSignType() {
    mRequest.post(api.report.getSignInfo).then((res) => {
      this.signType = res.data[0]
    })
  },
  // 获取签章类型
  async getSignerServerType() {
    const toast = showLoadingToast({
      duration: 0,
      forbidClick: true,
    })
    const res = await mRequest.get(api.report.signerServerType + this._type).finally(() => {
      toast.close()
    })

    if (res.code === 20000) {
      const needSendAuthCode = this.reportData.eleNum > 0 || this.reportData.crossNum > 0
      // USBKey签名在PC端处理
      if (res.data === 'baseSign') {
        showDialog({
          title: '提示',
          message: '本单位电子签名方式为UK签名，请前往PC端进行操作',
        }).then(() => {
          if (this.isReload) {
            _vue.reloadPageData()
          }
        })
      }
      else if (res.data === 'creditSign') {
        // eslint-disable-next-line style/no-mixed-operators
        if (this._type === 'signature' || this._type === 'stamp' && needSendAuthCode) {
          this.openCodePopup()
        }
        else {
          this.submitSignature()
        }
      }
      else if (this._type === 'signature' && res.data === 'deedLock') {
        this.openDeedLockSign()
      }
      else {
        // 其余直接提交
        this.submitSignature()
      }
    }
    else {
      // 错误
      showDialog({
        title: '提示',
        message: res.message,
      })
    }
  },
  // 短信验证码弹窗
  async openCodePopup() {
    await this.sendCode()
    _vue.showSendCode = true
    // _vue.isReady = false;
    // showDialog({
    //     title: '提示',
    //     message: '短信验证码已发送至您手机，请注意查收'
    // })
    // this.timer && clearInterval(this.timer);
    // this.timer = setInterval(() => {
    //     _vue.downTime--;
    //     if (_vue.downTime <= 0) {
    //         _vue.downTime = 60;
    //         clearInterval(this.timer)
    //         _vue.isReady = true;
    //     }
    // }, 1000)
  },
  // 发送验证码
  async sendCode() {
    const toast = showLoadingToast({
      duration: 0,
      forbidClick: true,
    })
    try {
      const res = await mRequest.post(
        api.report.getAuthCode,
        qs.stringify({ code: 'contract/batchSign' }),
      ).finally(() => {
        toast.close()
      })

      if (res.code === 20000) {
        return Promise.resolve()
      }
      else {
        showDialog({
          title: '提示',
          message: res.msg || '获取短信验证码失败',
        })
        return Promise.reject(res)
      }
    }
    catch (err) {
      showDialog({
        title: '提示',
        message: (res && res.msg) || '获取短信验证码失败',
      })
      _vue.$hideLoading()
      return Promise.reject(err)
    }
  },
  // 契约锁签字
  openDeedLockSign() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    mRequest.post(api.report.validUserAuth + userInfo.userId).then((res) => {
      if (res.code === 20000) {
        if (res.data.deedUserStatus === 'AUTH_SUCCESS') {
          this.submitSignature()
        }
        else {
          showConfirmDialog({
            title: '提示',
            message: '契约锁签字需要实名认证，你还未实名认证，无法进行签字，是否去认证？',
          }).then(() => {
            window.open(res.data.authUrl)
          })
        }
      }
      else {
        // 错误
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    })
  },
  // 提交电子签名
  async submitSignature() {
    const businessKey = this.guid()
    const params = {
      reportIds: [this.reportData.reportId],
      authCode: _vue.authCode,
      businessKey,
    }
    if (this._type === 'stamp') {
      params.signType = this.signType
    }

    const toast = showLoadingToast({
      duration: 0,
      forbidClick: true,
    })
    return await mRequest.post(
      this.submitUrl,
      params,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then((res) => {
      if (res.code === 20000) {
        _vue.reloadPageData()
        showNotify({ type: 'success', message: this._type === 'signature' ? '签字成功' : '签章成功' })
        return Promise.resolve(res)
      }
      else {
        // 错误
        showDialog({
          title: '提示',
          message: res.message || '签名失败',
        })
        return Promise.reject(res)
      }
    }).catch((err) => {
      showDialog({
        title: '提示',
        message: err.message || '签名失败',
      })
      return Promise.reject(err)
    }).finally(() => {
      toast.close()
    })
  },
  // 生成uuid
  guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },
  // 数组去重
  unique(arr: any[]) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] === arr[j]) { // 第一个等同于第二个，splice方法删除第二个
          arr.splice(j, 1)
          j--
        }
      }
    }
    return arr
  },
}

export default SignerObj
