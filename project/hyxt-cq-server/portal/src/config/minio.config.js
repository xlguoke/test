import { uuid } from "@/assets/js/utils"
import http from "@/config/request"
const bucket = "pub" // 公共桶
export const reportBucket = "pub" // 报告文件存储桶 reports
const isDev = import.meta.env.VITE_USER_NODE_ENV === "development"

const minioPutObject = (file, bucketUri) => {
  // const suffix = file.name.substring(file.name.lastIndexOf("."))
  const fileName = encodeURIComponent(file.name)
  const _uuid = uuid()
  bucketUri = bucketUri ? bucketUri + "/" : ""
  // 上传路径
  const uri = `${bucket}/${bucketUri}${_uuid}/${fileName}`
  // 保存到数据库的路径
  const saveUrl = `${bucket}/${bucketUri}${_uuid}/${file.name}`
  return new Promise(async (resolve, reject) => {
    try {
      const res = await http({
        url: `/s3/${uri}`,
        method: "POST",
        data: {
          file
        },
        headers: {
          "Content-type": "multipart/form-data"
          // "Content-Disposition": `form-data; filename=${fileName}`
        }
      })
      console.log("🚀 ~ file: minio.config.js:22 ~ res", res)
      // const url = await getMinioFileUrl(saveUrl)
      return resolve({
        url: saveUrl,
        ...res
      })
    } catch (err) {
      console.log("🚀 ~ minio.config.js:71：", err)
      return reject(err)
    }
  })
}

// 获取minio服务器文件路径
export const getMinioFileUrl = async (uri) => {
  if (!uri) return ""
  if (uri.indexOf("http://") !== -1) return uri
  return getMinioFuleUrlPub(uri)
  // try {
  //   const res = await http({
  //     url: `/s3/${uri}`,
  //     async: false,
  //     method: 'get',
  //     responseType: 'blob',
  //   })
  //   return URL.createObjectURL(new Blob([res]))
  // } catch (err) {
  //   console.log('🚀 ~ 获取文件地址失败：', err);
  //   return '';
  // }
}

// 获取minio服务器文件路径 —— 无需token验证，直接获取文件，可在系统外访问
export const getMinioFuleUrlPub = (uri) => {
  let uriArr= uri.split("/")
  uriArr[uriArr.length-1]= encodeURIComponent(uriArr[uriArr.length-1])
  uri=uriArr.join("/")

  let isSygcjc=window.location.pathname.indexOf("sygcjc")>-1?'/sygcjc':'';
  
  return window.location.origin + isSygcjc + `${isDev ? "" : "/api"}/s3/${uri}`
}

// 通过文件名称或uri下载文件
export const downloadByNameOrUrl = async (nameOrUri, isUri = false) => {
  if (!nameOrUri) {
    message.error("文件名称或路径不存在")
    return
  }
  const isHttpUrl = nameOrUri.indexOf("http://") !== -1 // 兼容旧数据
  let url = isUri ? nameOrUri : `${bucket}/${nameOrUri}`
  try {
    const href = isHttpUrl ? nameOrUri : await getMinioFileUrl(url)
    if (!href) return
    const a = document.createElement("a")
    a.href = href
    a.target = "_blank"
    a.download = isUri ? nameOrUri.substring(nameOrUri.lastIndexOf("/") + 1) : nameOrUri
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(href)
    document.body.removeChild(a)
  } catch (err) {}
}

export default minioPutObject
