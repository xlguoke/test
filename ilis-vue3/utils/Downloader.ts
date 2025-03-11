import { Modal } from 'ant-design-vue'

class Downloader {
  /** blob对象转JSON对象 */
  static toJSON(blob: Blob) {
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
  async requestBlob(url: string, method = 'get') {
    const res = await fetch(url, {
      method,
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    }).catch((err) => {
      Modal.error({
        title: '提示',
        content: `下载失败：${err.message}`,
      })
    })

    if (res) {
      const blob = await res.blob()
      return {
        blob,
      }
    }
  }

  /**
   * 获取下载文件及文件名
   * @param {string | Blob} downloadData 下载数据（Blob或文件地址）
   * @param {string} [downloadFilename] 下载文件名
   */
  async getDownloadData(downloadData: string | Blob, downloadFilename: string) {
    if (downloadData instanceof Blob) {
      return {
        blob: downloadData,
        filename: downloadFilename,
      }
    }

    if (typeof (downloadData) === 'string') {
      // 为url地址时，获取请求数据后下载
      const res: any = await this.requestBlob(downloadData, 'get').catch((err) => {
        console.warn(err)
      })

      return {
        blob: res.blob,
        filename: decodeURIComponent(res.filename),
      }

      return {
        blob: res.blob,
        filename: res.filename ? decodeURIComponent(res.filename) : downloadFilename,
      }
    }

    return {
      blob: null,
      filename: downloadFilename,
    }
  }

  /**
   * 执行下载
   * @param {string | Blob} downloadData 下载数据（Blob或文件地址）
   * @param {string} [downloadFilename] 下载文件名
   */
  async excute(downloadData: string | Blob, downloadFilename: string = '') {
    const { blob, filename } = await this.getDownloadData(downloadData, downloadFilename)

    if (!blob) {
      throw new Error('未找到blob')
    }

    const link = document.createElement('a')
    const body = document.querySelector('body')

    if (body) {
      link.href = window.URL.createObjectURL(blob)
      link.download = filename

      // fix Firefox
      link.style.display = 'none'
      body.appendChild(link)

      link.click()
      body.removeChild(link)

      window.URL.revokeObjectURL(link.href)
    }
    else {
      throw new Error('未找到body节点')
    }
  }
}

const downloader = new Downloader()

export { downloader }
