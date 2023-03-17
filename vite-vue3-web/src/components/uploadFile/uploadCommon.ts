import { message } from "ant-design-vue"
import { Ref } from "vue"
import { getMinioFileUrl, downloadByNameOrUrl } from "@/utils/minio.config.js"
import { previewPDF } from "@/utils"
import type { filesType } from "@/type/common"

export const fileType = (name: string) => {
  if (!name) return ""
  const ind = name.lastIndexOf(".")
  const type = name.substring(ind + 1)
  return type
}

export const imgTypes = ["jpg", "jpeg", "png", "bmp", "svg", "webp", "wmf", "gif", "apng"]
export const isImage = (name: string) => {
  if (!name) return false
  const type = fileType(name).toLowerCase()
  return imgTypes.includes(type)
}

export const showMinioFile = async (
  file: filesType,
  viewImgUrl: Ref<string>,
  visible: Ref<boolean>
) => {
  let { blobUrl, url, name } = file
  const type = fileType(name)
  if (file.loading) return
  file.loading = true
  if (type == "pdf") {
    try {
      !blobUrl && (blobUrl = await getMinioFileUrl(url))
      blobUrl && previewPDF(blobUrl)
    } catch (err) {
      message.error("获取文件资源失败")
    }
  } else if (imgTypes.includes(type)) {
    viewImgUrl.value = blobUrl || ""
    visible.value = true
  } else {
    downloadByNameOrUrl(url, true)
  }
  file.loading = false
}

export const downMinioFile = (file: filesType) => {
  downloadByNameOrUrl(file.url, true)
}

// export const downMinioFile = async (file) => {
//     let { blobUrl, url, name } = file;
//     !blobUrl && (blobUrl = await getMinioFileUrl(url));
//     const a = document.createElement("a");
//     a.href = blobUrl;
//     a.download = name;
//     a.target = '_blank';
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(blobUrl)
//     document.body.removeChild(a);
// }
