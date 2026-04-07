<template>
  <a-modal v-model:visible="visible" :title="props.title" width="900px" centered @ok="handleOk">
    <a-row justify="space-between" style="margin-bottom: 15px">
      <a-input-search
        v-model:value="queryKey"
        placeholder="请输入文件名称"
        enter-button
        style="width: 250px"
        @search="onSearch"
      />
      <uploadFile
        v-if="!props.details"
        :before-upload="beforeUploadInfo"
        :config="{
          hideFileList: true,
          multiple: true,
          loading: loading,
          types: ['png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'zip', 'rar']
        }"
        @successItem="uploadSuccessCB"
      />
    </a-row>
    <a-table
      :data-source="fileListView"
      :columns="otherPersonColumns"
      bordered
      size="small"
      row-key="id"
      style="min-height: 300px"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'handle'">
          <a-space>
            <a-button size="small" type="primary" @click="download(record)">下载</a-button>
            <a-button size="small" type="primary" @click="preview(record)">预览</a-button>
            <a-button
              v-if="!props.details"
              size="small"
              type="primary"
              danger
              @click="deleteFile(record)"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-modal>

  <a-modal v-model:visible="visibleView" title="图片查看">
    <div style="text-align: center">
      <a-image :width="400" :src="viewImgUrl" />
    </div>
    <template #footer>
      <a-button
        type="primary"
        @click="
          () => {
            visibleView = false
          }
        "
      >
        确定
      </a-button>
    </template>
  </a-modal>
</template>
<script setup lang="ts">
import { ref, toRaw, watch } from "vue"
import dayjs, { Dayjs } from "dayjs"
import uploadFile from "../uploadFile/index.vue"
import { showMinioFile, downMinioFile } from "../uploadFile/uploadCommon"
let visible = ref(false)
let queryKey = ref("")
let dataList = ref<any>([])
let fileListView = ref<any>([])

let loading = ref(false)

const props = defineProps({
  title: {
    type: String,
    default: "文件上传"
  },
  details: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(["callBack"])
const onSearch = () => {
  fileListView.value = dataList.value.filter((it: any) => {
    return it.name.includes(queryKey.value)
  })
}

let otherPersonColumns = [
  //   {
  //     title: "序号",
  //     dataIndex: "name",
  //     key: "name"
  //   },
  {
    title: "文件名称",
    dataIndex: "name",
    key: "name",
    width: 250,
    ellipsis: true
  },
  {
    title: "文件类型",
    dataIndex: "type",
    key: "type",
    width: 100,
    ellipsis: true
  },
  {
    title: "文件大小",
    dataIndex: "size",
    key: "size",
    width: 120,
    customRender: (r) => {
      return (r.value / 1024).toFixed(2) + " kb"
    }
  },
  {
    title: "上传日期",
    dataIndex: "uploadTime",
    key: "uploadTime",
    width: 150,
    customRender: (r) => {
      return dayjs(r.value).format("YYYY-MM-DD HH:mm:ss")
    }
  },
  {
    title: "操作",
    width: 170,
    key: "handle"
  }
]

watch(
  dataList,
  (newVal, oldV) => {
    fileListView.value = newVal
  },
  {
    deep: true, // 强制侦听器进入深层级模式
    immediate: true
  }
)

const uploadSuccessCB = (v: any) => {
  console.log(222, v)
  // fileList.value = v
  v.id = v.etag
  dataList.value.push(v)
}
//其他人员数据表格
const beforeUploadInfo = (f) => {
  console.log(f)
}
const download = (v): void => {
  downMinioFile(v)
}
let viewImgUrl = ref("")
let visibleView = ref(false)
const preview = (v) => {
  showMinioFile(v, viewImgUrl, visibleView)
}
const deleteFile = (v) => {
  dataList.value.forEach((it: any, index) => {
    if (v.id == it.id) {
      dataList.value.splice(index, 1)
    }
  })
}

const handleOk = () => {
  console.log("提交数据", toRaw(dataList.value))
  if (!props.details) {
    emit("callBack", toRaw(dataList.value))
  } else {
    visible.value = false
  }
}

defineExpose({
  visible,
  dataList
})
</script>

<style lang="less" scoped></style>
