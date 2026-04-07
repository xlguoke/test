import { Modal } from 'ant-design-vue'

export class Downloader {
  /**
   * blob对象转JSON对象
   */
  toJSON(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsText(blob, 'utf-8')
      reader.onload = function () {
        resolve(reader.result)
      }
    })
  }

  /**
   * 请求获取blob对象
   * @param {string} url 请求地址
   * @param {"get" | "post"} method 请求方式 get|post
   */
  requestBlob(url, method = 'get') {
    return new Promise((resolve) => {
      fetch(url, {
        method,
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      })
        .then(res => res.blob())
        .then((blob) => {
          resolve({ blob })
        })
        .catch((err) => {
          Modal.error({
            title: '提示',
            content: `下载失败：${err.message}`,
          })
        })
    })
  }

  /**
   * 获取下载文件及文件名
   * @param {string | Blob | { url: string, method?: "get" | "post", data?: object }} downloadData 下载数据（Blob或文件地址）
   * @param {string} [downloadFilename] 下载文件名
   */
  async getDownloadData(downloadData, downloadFilename) {
    let blob = downloadData
    let filename = downloadFilename

    if (downloadData instanceof Blob) {
      return { blob, filename }
    }

    if (typeof downloadData === 'string') {
      // 为url地址时，获取请求数据后下载
      await this.requestBlob(downloadData, 'get', null)
        .then((res) => {
          blob = res.blob
          res.filename && (filename = decodeURIComponent(res.filename))
        })
        .catch((err) => {
          console.warn(err)
          blob = null
        })
    }
    else {
      // 为对象时，根据配置请求数据后下载
      await this.requestBlob(
        downloadData.url,
        downloadData.method,
        downloadData.data,
      )
        .then((res) => {
          blob = res.blob
          res.filename && (filename = decodeURIComponent(res.filename))
        })
        .catch((err) => {
          console.warn(err)
          blob = null
        })
    }

    return { blob, filename }
  }

  /**
   * 执行下载
   * @param {string | Blob | { url: string, method?: "get" | "post", data?: object }} downloadData 下载数据（Blob或文件地址）
   * @param {string} [downloadFilename] 下载文件名
   */
  excute(downloadData, downloadFilename) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const { blob, filename } = await this.getDownloadData(
        downloadData,
        downloadFilename,
      )

      if (!blob) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject()
        return
      }

      if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename)
        resolve(true)
      }
      else {
        const link = document.createElement('a')
        const body = document.querySelector('body')

        link.href = window.URL.createObjectURL(blob)
        link.download = filename

        // fix Firefox
        link.style.display = 'none'
        body.appendChild(link)

        link.click()
        body.removeChild(link)

        window.URL.revokeObjectURL(link.href)

        resolve(true)
      }
    })
  }
}
