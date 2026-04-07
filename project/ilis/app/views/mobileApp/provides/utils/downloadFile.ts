import { showNotify } from 'vant'

/**
 * 根据url下载文件
 * downloadFile(url)
 * url 下载的文件地址，或下载接口
 * filename 下载文件名
 * notOpen 完成后不打开文件，默认完成后会打开下载的文件
 */

export function downloadFile(url: string, filename: string, notOpen?: boolean) {
  if (window._appPlus) {
    window._appPlus.nativeUI.showWaiting()
    // filename: `file:///storage/emulated/0/Download/ilis/${filename}`,
    const dtask = window._appPlus.downloader.createDownload(
      // `/ilis2/FolderController.do?downloadFile&fileUrl=${url}&fileName=${filename}`,
      url,
      {
        method: 'GET',
        filename: `_downloads/Download/ilis/${filename}`,
      },
      (d: any, status: number) => {
        window._appPlus.nativeUI.closeWaiting()
        if (d.state === 4) {
          // 下载完成
          if (status === 200) {
            showNotify({ type: 'primary', message: '下载成功' })
            if (!notOpen) {
              window._appPlus.runtime.openFile(d.filename, {}, () => {
                window._appPlus.nativeUI.alert('无法打开此文件')
              })
            }
          }
          else {
            showNotify({ type: 'primary', message: '下载失败' })
          }
        }
      },
      (e: any) => {
        // eslint-disable-next-line no-alert
        alert(e)
        // eslint-disable-next-line no-alert
        alert(JSON.stringify(e))
      },
    )

    // dtask.addEventListener("statechanged",function(duixiang,status){
    //   alert(JSON.stringify(duixiang));
    //   alert(JSON.stringify(status));
    // });

    dtask.start()
  }
  else {
    // const fileUrl = `/ilis2/FolderController.do?downloadFile&fileUrl=${url}&fileName=${filename}`
    const fileUrl = url
    window.open(fileUrl)
  }
}

// 抛给pdfjs调用
window.downloadFile = downloadFile
