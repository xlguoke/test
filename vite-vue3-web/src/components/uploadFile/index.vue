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
import { message } from "ant-design-vue"
import type { UploadProps, UploadFile } from "ant-design-vue"
import request from "@/utils/request"
import { debounce, deepCopy } from "@/utils/index"
import { filesType } from "@/type/common/index"
import UploadFileList from "./uploadFileList.vue"

interface ConfigType {
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

interface ParamsType {
  foreignKey?: string
  foreignTable: string
  accessoryType: string
  readonly: boolean
}

const props = defineProps({
  value: {
    type: Array,
    default: () => []
  },
  config: {
    type: Object as PropType<ConfigType>,
    default: () => ({})
  },
  params: {
    type: Object as PropType<ParamsType>,
    default: () => ({})
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
    default: () => Boolean
  }
})
const emit = defineEmits(["update:value", "success", "failFileList"])

const _config = reactive<ConfigType>({
  btnName: props.btnName,
  btnType: props.btnType,
  listType: props.listType, // text、picture、picture-card
  multiple: props.multiple,
  hideFileList: props.hideFileList,
  hideDelete: props.hideDelete,
  isRandomName: false,
  loading: false,
  types: [],
  ...props.config
})

const _fileList = ref<filesType[]>([]) // 上传列表
const initFileList = async () => {
  if (props.value.length === 0) {
    _fileList.value = []
  } else {
    let list = deepCopy(props.value) as filesType[]
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
  (val) => {
    for (let k in val) {
      _config[k] = val[k]
    }
  }
)

// 上传文件格式
const fileTypes = {
  excel: ["xls", "xlsx"],
  word: ["doc", "docx"],
  image: ["jpg", "jpeg", "png", "bmp", "svg", "webp", "wmf", "gif", "apng"],
  video: ["mp4", "wmv", "flv", "avi", "mov", "m3u8"]
}

// 上传前文件类型判定
const _beforeUpload: UploadProps["beforeUpload"] = (file: UploadFile, fileList: UploadFile[]) => {
  debounce(() => {
    let volidType = reactive<string[]>([])
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
      uploadFun(fileList)
      return false
    }
    uploadFun(fileList)
  }, 300)
  return false
}
// 上传失败列表
const failFileList = ref<UploadProps["fileList"]>([])

// 文件上传前自定义事件及上传结果处理
const uploadFun = async (fileList: UploadFile[]) => {
  let res: any = props.beforeUpload && (await props.beforeUpload(fileList))
  failFileList.value = []
  if (res === false) return false
  if (res && res.fileList) {
    fileList = res.fileList
  }
  const formData = new FormData()
  for (let k in props.params) {
    formData.append(k, props.params[k])
  }
  _config.loading = true
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i]
    formData.append("file", file as any)
    try {
      // 上传
      const res: any = await request({
        url: "/api/services/app/FileService/uploadAccessory",
        method: "post",
        data: formData
      })
      const _file = {
        uid: file.uid,
        name: file.name,
        status: "done",
        size: file.size,
        url: res.result.url,
        id: res.result.id
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
      failFileList.value.push(file)
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

      .ant-upload {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
