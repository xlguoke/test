class QrCodeScanTool {
  /**
   * 从扫描结果的url中获取参数
   */
  getParamByResult(result, key) {
    try {
      const url = new URL(result, location.origin)
      const val = url.searchParams.get(key)

      return val
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
      return null
    }
  }

  /**
   * 开始扫描
   */
  async scan(cb, config) {
    window.$ilisQRCodeScan(cb, config)
  }
}

export const qrCodeScanTool = new QrCodeScanTool()
