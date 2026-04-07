import { ref } from 'vue'
import { uuid } from '@/utils'

const DEVICE_ID = 'deviceId'

export function useDeviceInfo() {
  let usedDeviceId = localStorage.getItem(DEVICE_ID)

  /**
   * 1.优先从本地取设备唯一标识符
   * 2.本地没有缓存设备唯一标识符时，根据cordova获取设备唯一标识符
   * 3.cordova获取不到唯一标识符时（可能），前端生成设备唯一标识符
   * 4.不管哪种方式获取到的设备唯一标识，存入本地缓存中
   */
  if (!usedDeviceId) {
    usedDeviceId = device.uuid

    if (!usedDeviceId)
      usedDeviceId = uuid()

    localStorage.setItem(DEVICE_ID, usedDeviceId as string)
  }

  // 设备唯一标识符
  const deviceId = ref(usedDeviceId)

  return {
    deviceId,
  }
}
