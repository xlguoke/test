import { message } from "ant-design-vue"
import { uuid } from "@/utils/index"
import http from "@/utils/request"
const bucket = "pub" // 公共桶
export const reportBucket = "reports" // 报告文件存储桶
// const isDev = import.meta.env.VITE_NODE_ENV === "development"

const minioPutObject = (file, isRandomName = false, bucketUri) => {
  const suffix = file.name.substring(file.name.lastIndexOf("."))
  let fileName = isRandomName ? uuid() + suffix : file.name
  console.log(`output->fileName`, fileName)
  const uri = `${bucketUri || bucket}/${fileName}`
  return new Promise((resolve, reject) => {
    http({
      url: `/s3/${uri}`,
      method: "POST",
      data: {
        file
      },
      headers: {
        "Content-type": "multipart/form-data"
        // "Content-Disposition": `form-data; filename=${fileName}`
      }
    }).then((res) => {
      console.log("🚀 ~ file: minio.config.js:22 ~ res", res)
      if (!res.etag) {
        return reject(res)
      }
      return resolve({
        url: uri,
        ...res
      })
    })
    return reject()
  })
}

// 获取minio服务器文件路径 —— 只能系统内部访问，需token验证
export const getMinioFileUrl = async (uri) => {
  if (!uri) return ""
  if (uri.indexOf("http://") !== -1) return uri
  try {
    const res = await http({
      url: `/s3/${uri}`,
      async: false,
      method: "get",
      responseType: "blob"
    })
    return URL.createObjectURL(new Blob([res]))
  } catch (err) {
    console.log("🚀 ~ 获取文件地址失败：", err)
    return ""
  }
}

// 获取minio服务器文件路径 —— 无需token验证，直接获取文件，可在系统外访问
export const getMinioFuleUrlPub = (uri) => {
  return window.location.origin + `/api/s3/${uri}`
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
  } catch (err) {
    console.log(err)
  }
}

export default minioPutObject

// const Minio = require("minio");
// const isDev = import.meta.env.VITE_NODE_ENV === "development"
// const endPoint = import.meta.env.VITE_ENDPOINT
// const port = Number(import.meta.env.VITE_MINIOPORT)

// // 上传服务器信息配置 - 开发环境
// const devConfig = {
//   endPoint,
//   port,
//   useSSL: false,
//   accessKey: "dev-public",
//   secretKey: "11111111",
// }

// // 上传服务器信息配置 - 生产环境
// const prodConfig = {
//   endPoint,
//   port,
//   useSSL: false,
//   accessKey: 'hitek-pub',
//   secretKey: 'hitek.999999'
// }

// // 通用配置
// const bucket = "pub"; // 桶
// const httpInfo = isDev ? devConfig : prodConfig;

// // 上传文件到文件服务器
// const mc = new Minio.Client(httpInfo);
// const minioPutObject_old = async (file, isRandomName = true, bucketUri = 'pub') => {
//   const suffix = file.name.substring(file.name.lastIndexOf("."));
//   const name = isRandomName ? uuid() + suffix : file.name;
//   return new Promise((resolve, reject) => {
//     let reader = new FileReader();
//     reader.readAsArrayBuffer(file);
//     reader.onload = async (e) => {
//       let res = e.target.result;
//       let buf = Buffer.from(res);
//       const cp = (bucket) => mc.putObject(bucket, name, buf);
//       try {
//         await cp(bucket);
//         const url = `http://${httpInfo.endPoint}/${httpInfo.port}/${bucket}/${name}`;
//         return resolve(url);
//       } catch (err) {
//         return reject(err)
//       }
//     };
//   })
// }
