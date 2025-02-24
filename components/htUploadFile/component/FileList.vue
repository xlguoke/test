<template>
  <div ref="fileListWrapper" class="file-list-wrapper">
    <a-table
      v-if="arrangeType === 1"
      :key="tableKey"
      :data-source="datas"
      :columns="columns"
      row-key="attachmentId"
      :pagination="false"
      :scroll="{ y: tableHeight, x: 800 }"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <p class="file-name-overflow" :title="text">
            {{ text }}
          </p>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-button
            v-if="isHandle(record) && (IS_PDF(record.format) || IS_IMAGE(record.format))"
            type="link"
            size="small"
            @click="previewFile(record)"
          >
            预览
          </a-button>
          <a-button
            v-if="isHandle(record)"
            type="link"
            size="small"
            @click="downloadFile(record)"
          >
            下载
          </a-button>
          <a-button
            v-if="isHandle(record)"
            type="link"
            size="small"
            style="color: red"
            @click="deleteFile(record)"
          >
            删除
          </a-button>
          <span v-if="!isHandle(record)" style="color:#ccc;">不可操作{{ businessTypeTxt[record.businessObj as string] }}附件</span>
        </template>
      </template>
    </a-table>
    <ul v-else class="file-list clearfix">
      <li
        v-for="item in (datas as any[])"
        :key="item.attachmentId"
        class="file-item"
        :title="item?.name"
      >
        <div class="file-item-content">
          <FileWordFilled v-if="IS_WORD(item.format)" class="file-type" />
          <FileExcelFilled v-else-if="IS_EXCEL(item.format)" class="file-type" />
          <FilePptFilled v-else-if="IS_PPT(item.format)" class="file-type" />
          <FilePdfFilled v-else-if="IS_PDF(item.format)" class="file-type" />
          <FileZipFilled v-else-if="IS_ZIP(item.format)" class="file-type" />
          <img v-else-if="IS_IMAGE(item.format)" class="file-image" :src="item.url">
          <div v-else-if="IS_VIDEO(item.format)" class="video-camera">
            <FileFilled class="file-type" />
            <VideoCameraFilled />
          </div>
          <FileUnknownFilled v-else class="file-type" />
          <p class="file-name">
            <span>{{ item?.name }}</span>
          </p>
          <div v-if="item.businessObj === businessType" class="file-handle">
            <EyeOutlined
              v-if="isHandle(item) && (IS_IMAGE(item.format) || IS_PDF(item.format))"
              class="file-type"
              @click="previewFile(item)"
            />
            <DownloadOutlined
              v-if="isHandle(item)"
              class="file-type"
              @click="downloadFile(item)"
            />
            <DeleteOutlined
              v-if="isHandle(item)"
              class="file-type"
              style="color: red"
              @click="deleteFile(item)"
            />
          </div>
        </div>
      </li>
      <li v-if="datas.length === 0" class="no-data">
        <img :src="`${fsStaticPath}/vueImage/h5-no-data.svg`" alt="">
        暂无数据
      </li>
    </ul>

    <UploadModal v-model="viewVisible" title="文件预览" destroy-on-close>
      <img :src="previewUrl" class="preview-img">
      <template #footer>
        <a-button @click="viewVisible = false">
          关闭
        </a-button>
      </template>
    </UploadModal>
  </div>
</template>

<script lang="ts" setup>
import { Modal } from 'ant-design-vue'
import type { ColumnsType } from 'ant-design-vue/es/table'
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileExcelFilled,
  FileFilled,
  FilePdfFilled,
  FilePptFilled,
  FileUnknownFilled,
  FileWordFilled,
  FileZipFilled,
  VideoCameraFilled,
} from '@ant-design/icons-vue'
import type { PropType } from 'vue'
import { useCommonUpload } from './commonUpload'
import { downloadQrFile } from './fileOperations'

const props = defineProps({
  recursion: Boolean,
  businessType: String,
  accept: Array as PropType<string[]>, // 接受上传的文件类型
  datas: {
    type: Array,
    default: () => [] as any[],
  },
  arrangeType: {
    type: Number,
    default: 1,
  },
})

const emits = defineEmits(['delete'])

const {
  IS_IMAGE,
  IS_PDF,
  IS_PPT,
  IS_EXCEL,
  IS_WORD,
  IS_ZIP,
  IS_VIDEO,
} = useCommonUpload({
  accept: props.accept,
})

const uploadWayText = {
  WEBPAGE: '本地',
  QR: '扫码',
  GPY: '高拍仪',
} as Record<string, any>

const columns: ColumnsType = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 60,
    customRender: ({ index }) => index + 1,
    ellipsis: true,
  },
  {
    title: '文件名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '文件格式',
    dataIndex: 'format',
    key: 'format',
    width: '10%',
    ellipsis: true,
  },
  {
    title: '文件大小',
    dataIndex: 'size',
    width: '10%',
    ellipsis: true,
  },
  {
    title: '上传人员',
    dataIndex: 'uploader',
    key: 'uploader',
    width: '10%',
    ellipsis: true,
  },
  {
    title: '上传方式',
    dataIndex: 'uploadWay',
    width: '10%',
    customRender: ({ text }: { text: string }) => uploadWayText[text],
    ellipsis: true,
  },
  {
    title: '上传时间',
    dataIndex: 'uploadTime',
    key: 'uploadTime',
    width: '18%',
    sorter: (a, b) => new Date(a.uploadTime).getTime() - new Date(b.uploadTime).getTime(),
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 130,
    fixed: 'right',
  },
]

const fileListWrapper = ref()

const fsStaticPath = window.$fsStaticPath

const tableHeight = ref(600)

const viewVisible = ref(false)

const previewUrl = ref('')

const businessTypeTxt = ref({
  CONSIGN: '委托',
  SAMPLE: '样品',
}) as Record<string, any>

const tableKey = ref(0)

function initTableHeight() {
  const el = document.getElementsByClassName('ht-upload-file-wrapper')[0]
  tableHeight.value = el.clientHeight - 200
  tableKey.value = Date.now()
}

/**
 * 是否可操作附件：递归查询当前二维码下所有的二维码的附件时，只可操作当前业务类型的附件
 * @param file
 */
function isHandle(file: any) {
  return !props.recursion || props.businessType === file.businessObj
}

function previewFile(file: any) {
  if (file.format === 'bmp') {
    const win = window.open('')
    if (win) {
      win.document.write(`<div style="height: calc(100% + 16px);display:flex;justify-content: center;align-items: center;background:#111;margin: -8px;"><img src="${file.url}"/></div>`)
    }
  }
  else {
    window.open(file.url, '_blank')
  }
}

function downloadFile(file: any) {
  downloadQrFile(file)
}

function deleteFile(file: any) {
  Modal.confirm({
    title: '提示',
    content: '确定要删除该文件吗？',
    onOk: () => {
      emits('delete', file)
    },
  })
}

onMounted(() => {
  nextTick(() => {
    initTableHeight()
  })
})
</script>

<style lang="less" scoped>
:deep(.ant-table-row) {
  &:nth-child(2n){
    background-color: #fafafa;
  }
}
.ant-btn-link {
  padding: 0 4px;
}
.file-list-wrapper {
  height: 100%;
  overflow-y: auto;
  .file-list {
    margin-top: 8px;
    .file-item {
      float: left;
      margin-bottom: 4px;
      width: 14.2%;
      min-width: 100px;
    }
    .file-item-content {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 0 2px;
      padding: 12px 8px 8px;
      border-radius: 4px;
      cursor: pointer;
      overflow: hidden;
      &:hover {
        background-color: #ebf6ff;
        .file-handle {
          bottom: 0;
        }
      }
    }
    .file-type {
      font-size: 50px;
      &.anticon-file-word {
        color: #476aeb;
      }
      &.anticon-file-excel {
        color: #50c76f;
      }
      &.anticon-file-ppt {
        color: #db6739;
      }
      &.anticon-file-pdf {
        color: #e35a5a;
      }
      &.anticon-file-zip {
        color: #7f2b2b;
      }
    }
    .video-camera {
      position: relative;
      width: 50px;
      height: 50px;
      .anticon-file {
        color: #7f49a5;
      }
      .anticon-video-camera {
        position: absolute;
        left: 15px;
        top: 20px;
        margin: auto;
        font-size: 20px;
        color: #fff;
      }
    }
    .file-image {
      display: block;
      width: 50px;
      height: 50px;
      border-radius: 2px;
    }
    .file-name {
      margin-top: 4px;
      display: flex;
      align-items: center;
      height: 30px;
      line-height: 16px;
      & > span {
        max-height: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
    .file-handle {
      position: absolute;
      left: 0;
      right: 0;
      bottom: -28px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      z-index: 10;
      height: 28px;
      background-color: rgba(1, 1, 1, 0.7);
      transition: 0.2s;
      color: #fff;
      .anticon {
        font-size: 16px;
      }
    }
  }
}

.preview-img {
  margin: auto;
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.file-name-overflow{
  max-height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.no-data{
  text-align: center;
  color: #aaa;
  img{
    margin: 0 auto;
    margin-bottom: 10px;
    width: 150px;
    display: block;
  }
}

@media screen and (max-width: 1100px) {
  .full-modal .file-list-wrapper .file-list .file-item {
    width: 20%;
  }
}

@media screen and (min-width: 1366px) {
  .full-modal .file-list-wrapper .file-list .file-item {
    width: 12.5%;
  }
}
@media screen and (min-width: 1500px) {
  .full-modal .file-list-wrapper .file-list .file-item {
    width: 11.11111111%;
  }
}
</style>
