<template>
  <div class="clearfix">
    <UploadFileList
      v-if="!_config.hideFileList && _config.listType === 'picture-card'"
      :datas="_fileList"
      list-type="picture-card"
      @remove-file="removeFile"
    />
    <a-upload
      v-model:file-list="_fileList"
      :before-upload="_beforeUpload"
      :multiple="_config.multiple"
      :show-upload-list="false"
      :class="`upload-warp ${_config.listType === 'picture-card' ? 'upload-warp-inline' : ''}`"
    >
      <slot>
        <a-button
          v-if="_config.listType != 'picture-card'"
          :type="_config.btnType"
          :disabled="_config.disabled"
          :loading="_config.loading"
        >
          <upload-outlined></upload-outlined>
          {{ _config.btnName }}
        </a-button>
        <plus-outlined v-else style="font-size: 30px; color: #ddd" />
      </slot>
      <UploadFileList
        v-if="!_config.hideFileList && _config.listType !== 'picture-card'"
        :datas="_fileList"
        :list-type="_config.listType"
        @remove-file="removeFile"
      />
    </a-upload>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, PropType } from "vue"
import { UploadOutlined, PlusOutlined } from "@ant-design/icons-vue"
import type { UploadProps } from "ant-design-vue"
import { message } from "ant-design-vue"
import { debounce, deepCopy } from "@/utils"
import minioPutObject, { getMinioFileUrl } from "@/utils/minio.config.js"
import type { filesType } from "@/type/common"
import UploadFileList from "./uploadFileList.vue"
import { isImage } from "./uploadCommon"

interface configType {
  multiple?: boolean //多选
  hideFileList?: boolean // 隐藏列表
  hideDelete?: boolean // 隐藏列表的删除图标
  disabled?: boolean // 禁用
  loading?: boolean // loading状态
  isRandomName?: boolean // 是否生成随机名称
  types?: string[] // 上传文件类型
  listType?: string // 列表样式  text、picture、picture-card
  btnName?: string // 按钮名称
  btnType?: string // 按钮类型
  bucketUri?: string // minio桶名称与文件路径拼接字符串
}

const props = defineProps({
  value: {
    type: Array as PropType<filesType[]>,
    default: function (d: filesType[]) {
      return d || []
    }
  },
  config: {
    type: Object as PropType<configType>,
    default: function (d: configType) {
      return d || {}
    }
  },
  btnName: {
    type: String,
    default: "点击上传"
  },
  // 按钮类型
  btnType: {
    type: String,
    default: "primary"
  },
  // 列表展示类型
  listType: {
    type: String,
    default: "picture" // text、picture、picture-card
  },
  multiple: {
    type: Boolean,
    default: true
  },
  hideFileList: Boolean,
  hideDelete: Boolean,
  // 返回 false 或 Promise.reject 时拦截上传
  beforeUpload: {
    type: Function,
    default: undefined
  }
})
const emit = defineEmits(["update:value", "success", "failFileList"])

interface configKeyType {
  [key: string]: any
}
const _config: configKeyType = reactive<configType>({
  btnName: props.btnName,
  btnType: props.btnType,
  listType: props.listType, // text、picture、picture-card
  multiple: props.multiple,
  hideFileList: props.hideFileList,
  hideDelete: props.hideDelete,
  isRandomName: false,
  loading: false,
  bucketUri: "",
  types: [],
  ...props.config
})
const _fileList = ref<filesType[]>([]) // 上传列表
const initFileList = async () => {
  if (props.value.length === 0) {
    _fileList.value = []
  } else {
    let list = deepCopy(props.value) as filesType[]
    for (let i = 0; i < list.length; i++) {
      let f = list[i]
      f.loading = false
      if (isImage(f.name) && !f.blobUrl) {
        try {
          list[i].blobUrl = await getMinioFileUrl(list[i].url)
        } catch (err) {
          list[i].blobUrl = ""
        }
      }
    }
    _fileList.value = list
  }
}

watch(
  () => props.value,
  () => {
    initFileList()
  },
  {
    immediate: true
  }
)

watch(
  () => props.config,
  (val: configKeyType) => {
    for (let k in val) {
      _config[k] = val[k]
    }
  }
)
interface filesKey {
  [key: string]: string[]
}
// 上传文件格式
const fileTypes: filesKey = {
  excel: ["xls", "xlsx"],
  word: ["doc", "docx"],
  image: ["jpg", "jpeg", "png", "bmp", "svg", "webp", "wmf", "gif", "apng"],
  video: ["mp4", "wmv", "flv", "avi", "mov", "m3u8"]
}

// 上传前文件类型判定、上传前自定义事件
const _beforeUpload: UploadProps["beforeUpload"] = (file, fileList) => {
  debounce(() => {
    let volidType = []
    if (_config.types && _config.types.length > 0) {
      for (let i = 0; i < _config.types.length; i++) {
        const ftype = _config.types[i].toLowerCase()
        if (fileTypes[ftype]) {
          volidType.push(...fileTypes[ftype])
        } else {
          volidType.push(ftype)
        }
      }

      for (let j = 0; j < fileList.length; j++) {
        const ind = fileList[j].name.lastIndexOf(".") + 1
        const _type = ind != -1 ? fileList[j].name.substring(ind).toLowerCase() : ""
        if (!volidType.includes(_type)) {
          const typeStr = volidType.join(",")
          const n = _fileList.value?.findIndex((d) => d.uid == fileList[j].uid) as number
          _fileList.value?.splice(n, 1)
          emit("update:value", _fileList.value)
          j--
          message.error(`上传文件格式不符合要求，只支持${typeStr}格式文件`)
          return false
        }
      }
      uploadFun(fileList as any)
      return false
    }
    uploadFun(fileList as any)
  }, 300)
  return false
}

// 文件上传结果处理
const failFileList = ref<UploadProps["fileList"]>([]) // 上传失败列表
const uploadFun = async (fileList: Array<filesType>) => {
  let res: any = props.beforeUpload && (await props.beforeUpload(fileList))
  failFileList.value = []
  if (res === false) return false
  if (res && res.fileList) {
    fileList = res.fileList
  }
  _config.loading = true
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i]
    const bucketUri = file.bucketUri || _config.bucketUri
    file.bucketUri && delete file.bucketUri
    try {
      // 上传
      const { url, etag } = await minioPutObject(file, _config.isRandomName, bucketUri)
      let _file = {
        uid: file.uid,
        name: file.name,
        status: "done",
        size: file.size,
        url,
        etag
      }
      if (_config.multiple) {
        let ind = _fileList.value?.findIndex((d) => d.uid == file.uid) || 0
        if (ind !== -1) {
          _fileList.value?.splice(ind, 1, _file)
        } else {
          _fileList.value?.push(_file)
        }
      } else {
        _fileList.value = [_file]
      }
      _config.loading = false
    } catch (err) {
      console.log(`第${i + 1}个上传异常：`, err)
      console.log("异常文件：", fileList[i])
      failFileList.value.push(file as any)
      let ind = _fileList.value?.findIndex((d) => d.uid == file.uid) || 0
      if (ind !== -1) {
        _fileList.value?.splice(ind, 1)
      }
    }
  }
  _config.loading = false
  if (_fileList.value && _fileList.value.length > 0) {
    updateFileList()
  }
  emit("failFileList", failFileList.value)
}

// 删除 - 组件内置方法，此处只需更新上传列表
const removeFile = (ind: number) => {
  _fileList.value.splice(ind, 1)
  setTimeout(() => {
    updateFileList()
  }, 0)
  return true
}

const updateFileList = () => {
  const files = _fileList.value.map((f) => ({
    id: f.id || "",
    blobUrl: f.blobUrl,
    name: f.name,
    url: f.url
  }))
  emit("update:value", files)
  emit("success", _fileList.value)
}
</script>

<style lang="less" scoped>
// .upload-file-item {
//   width: 50%;
//   padding: 10px;
//   display: inline-flex;
//   align-items: center;
//   border: 1px solid #eee;
//   border-radius: 4px;
//   box-sizing: border-box;
//   float: left;

//   &:nth-child(2n) {
//     margin-left: 20px;
//   }

//   :deep(.ant-image) {
//     width: 36px;
//     height: 36px;

//     img {
//       widows: 100%;
//       height: 100%;
//     }
//   }
// }

.upload-warp {
  display: block;

  :deep(.ant-upload.ant-upload-select) {
    display: block;
  }

  &.upload-warp-inline {
    display: inline-block;
    width: auto;

    :deep(.ant-upload.ant-upload-select) {
      width: 104px;
      height: 104px;
      line-height: 104px;
      border: 1px dashed #d9d9d9;
      border-radius: 2px;
      text-align: center;
      cursor: pointer;

      &:hover {
        border-color: @theme_color;
        color: @theme_color;
      }
    }
  }
}

// .upload-list-inline :deep(.ant-upload-list-picture-container) {
//   width: 100%;

//   &:nth-child(2n) .ant-upload-list-item {
//     margin-left: 12px;
//   }
// }

// .upload-list-inline :deep(.ant-upload-list-item) {
//   width: calc(100% - 12px);
// }

// .hide-delete {
//   :deep(.ant-upload-list-item-card-actions) {
//     display: none;
//   }
// }
</style>
