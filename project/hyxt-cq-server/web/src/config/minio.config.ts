import { message } from "ant-design-vue"
import { uuid } from "@/assets/js/common"
import http from "@/config/http.config"
import { filesType } from "@/type/common/common"
const bucket = "pub" // 公共桶
export const reportBucket = "reports" // 报告文件存储桶

const getUnit = () => {
  const data = JSON.parse(localStorage.getItem("userInfo") as any) || {}
  return data.userInfo.orgName || "超级管理员"
}

const minioPutObject = (file: filesType, isReport = false, bucketUri?: string): Promise<any> => {
  // const suffix = file.name.substring(file.name.lastIndexOf("."))
  // let fileName = !isReport && bucketUri !== "template" ? uuid() + suffix : file.name
  const fileName = encodeURIComponent(file.name)
  // 机构名称
  const unitName = getUnit()
  // 自定义路径
  let customPath = `${unitName}/${bucketUri ? bucketUri + "/" : ""}${uuid()}/`
  // 模板文件放到根目录
  if (bucketUri == "template") {
    customPath = ""
  }
  // 上传路径
  const uri = `${isReport ? reportBucket : bucket}/${customPath}${fileName}`
  // 保存到数据库的路径
  const saveUrl = `${isReport ? reportBucket : bucket}/${customPath}${file.name}`
  return new Promise(async (resolve, reject) => {
    try {
      const res: any = await http({
        url: `/s3/${uri}`,
        method: "POST",
        data: {
          file
        },
        headers: {
          "Content-type": "multipart/form-data"
        }
      })
      console.log("🚀 ~ file: minio.config.js:22 ~ res", res)
      if (!res.etag) {
        return reject(res)
      }
      return resolve({
        url: saveUrl,
        ...res
      })
    } catch (err) {
      console.log("🚀 ~ file: minio.config.js:27 ~ err", err)
      return reject(err)
    }
  })
}

// 获取minio服务器文件路径 —— 只能系统内部访问，需token验证
export const getMinioFileUrl = async (uri: string) => {
  if (!uri) return ""
  if (uri.indexOf("http://") !== -1) return uri
  if (uri.indexOf("https://") !== -1) return uri
  try {
    let uriArr = uri.split("/")
    uriArr[uriArr.length - 1] = encodeURIComponent(uriArr[uriArr.length - 1]) //解决文件中带有特殊符号问题
    uri = uriArr.join("/")

    const res = await http({
      url: `/s3/${uri}`,
      async: false,
      method: "get",
      responseType: "blob"
    } as any)
    return URL.createObjectURL(new Blob([res as any]))
  } catch (err) {
    console.log("🚀 ~ 获取文件地址失败：", err)
    return ""
  }
}

// 获取minio服务器文件路径 —— 无需token验证，直接获取文件，可在系统外访问
export const getMinioFuleUrlPub = (uri: string) => {
  let isSygcjc = window.location.pathname.indexOf("sygcjc") > -1 ? "/sygcjc" : ""
  return window.location.origin + `${isSygcjc}/api/s3/${uri}`
}

// 通过文件名称或uri下载文件
// @params
// nameOrUri  string   文件名称或文件uri（后台存的文件路径）
// isUri      boolean  第一个参数为uri时，该参数传true
export const downloadByNameOrUrl = async (nameOrUri: string, isUri = false) => {
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
    a.download = nameOrUri.substring(nameOrUri.lastIndexOf("/") + 1)
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(href)
    document.body.removeChild(a)
  } catch (err) {}
}

export default minioPutObject
