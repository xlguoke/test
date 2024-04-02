import type { Device } from 'src/device.ts'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    /**
     *  A global property that represents a `Cordova` application running on some device
     */
    $device: Device
  }
}

export {}
