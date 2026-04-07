import qs from 'qs'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { qrCodeScanTool } from './qr-code-scan-tool'

class QrCodeScanModule {
  // 设备授权扫码
  // 调用地方太多，封装调用
  deviceAuthorization(vm) {
    qrCodeScanTool.scan((result: string) => {
      if (!result.includes('ilis2')) {
        const data = { qrCodeId: result }

        const loadingToast = showLoadingToast({
          duration: 0,
          forbidClick: true,
        })
        mRequest.post(api.verification.doAuth, qs.stringify(data)).then((res) => {
          if (res.data && res.data.equipmentVo && String(res.data.equipmentVo.rentStatus) === '0') {
            vm.$router.push({
              name: 'verification',
              query: { result },
            })
          }
          else {
            showDialog({
              title: '提示',
              message: res.msg,
            })
          }
        }).catch((_) => {
          // eslint-disable-next-line no-alert
          alert(JSON.stringify(_))
        }).finally(() => {
          loadingToast.close()
        })
      }
      else {
        const id = qrCodeScanTool.getParamByResult(result, 'id')
        const routeId = vm.$route.query.id
        const url = api.equipment.getIotDevice(id)
        const routeName = vm.$route.name
        const routeType = ['iotDeviceRecord', 'iotDeviceManger', 'iotDeviceScanResult'].includes(routeName) ? 'replace' : 'push'

        if (id === routeId) {
          return
        }

        const loadingToast = showLoadingToast({
          duration: 0,
          forbidClick: true,
        })
        mRequest.get(url).then(async (res) => {
          if (res.success === false) {
            showDialog({ message: res.message })
            return
          }

          const devices = res.devices
          const controllDeviceItem = devices.find(i => i.type === 'CONTROLLER')
          if (controllDeviceItem) {
            vm.$nextTick(() => {
              vm.$router[routeType]({
                name: 'iotDeviceManger',
                query: { id },
              })
            })
          }
          else {
            vm.$nextTick(() => {
              vm.$router[routeType]({
                name: 'iotDeviceScanResult',
                query: { id },
              })
            })
          }
        }).catch((err) => {
          vm.$nextTick(() => {
            vm.$router[routeType]({
              name: 'iotDeviceScanResult',
              query: {
                errorMsg: err.data.message || '网络异常，请重试',
              },
            })
          })
        }).finally(() => {
          loadingToast.close()
        })
      }
    })
  }
}

export const qrCodeScanModule = new QrCodeScanModule()
