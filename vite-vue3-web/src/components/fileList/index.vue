<template>
  <div>
    <div v-if="dataList.length > 0">
      <ul v-if="listType !== 'text'" class="show-file-list clearfix">
        <li v-for="(file, i) in dataList" :key="i" class="file-item">
          <i v-if="fileType(file.name) == 'pdf'" class="iconfont icon-file-pdf"></i>
          <a-image
            v-else-if="isImage(file.name)"
            :preview="false"
            :fallback="fallback"
            :src="file.blobUrl"
            width="36px"
            height="36px"
          ></a-image>
          <i v-else class="iconfont icon-shiyongshouce"></i>
          <span class="font-1 file-name">{{ file.name }}</span>
          <a-button type="link" primary size="small" @click="downMinioFile(file)">下载</a-button>
          <a-button
            v-if="fileType(file.name) == 'pdf' || isImage(file.name)"
            type="link"
            primary
            size="small"
            @click="showFile(file)"
          >
            查看
          </a-button>
          <a-button v-if="showdel" type="link" danger size="small">删除</a-button>
        </li>
      </ul>
      <ul v-if="listType === 'text'" class="text-file-list">
        <li v-for="item in dataList" :key="item.id" class="item">
          <i style="color: #72b174" class="iconfont icon-a-wendang1"></i>
          <span class="file-name" @click="showFile(item)">{{ item.name }}</span>
          <a-button type="link" primary size="small" @click="downMinioFile(item)">下载</a-button>
        </li>
      </ul>
    </div>
    <p v-else style="color: #aaa">暂无文件信息</p>
    <div style="display: none">
      <a-image-preview-group :preview="{ visible, onVisibleChange: (vis: any) => (visible = vis) }">
        <a-image :src="viewImgUrl" />
      </a-image-preview-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, PropType } from "vue"
import { getMinioFileUrl } from "@/utils/minio.config.js"
import type { filesType } from "@/type/common"
import { downMinioFile, showMinioFile } from "../uploadFile/uploadCommon"
const fallback = ref(
  "data:image/png;base64,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"
)
const props = defineProps({
  datas: {
    type: Array as PropType<filesType[]>,
    default: function (d: filesType[]) {
      return d || []
    }
  },
  showdel: Boolean,
  listType: {
    type: String,
    default: ""
  }
})

const fileType = (name: string) => {
  if (!name) return ""
  const ind = name.lastIndexOf(".")
  const type = name.substring(ind + 1)
  return type
}

const imgTypes = ["jpg", "jpeg", "png", "bmp", "svg", "webp", "wmf", "gif", "apng"]
const isImage = (name: string) => {
  const type = fileType(name).toLowerCase()
  return imgTypes.includes(type)
}

const dataList = ref<filesType[]>([])

const initDatas = async () => {
  let list = props.datas
  if (!list) return
  for (let i = 0; i < list.length; i++) {
    let f = list[i]
    f.loading = false
    if (isImage(f.name)) {
      try {
        list[i].blobUrl = await getMinioFileUrl(list[i].url)
      } catch (err) {
        list[i].blobUrl = ""
      }
    }
  }
  dataList.value = list
}

watch(
  () => props.datas,
  () => {
    initDatas()
  },
  {
    immediate: true
  }
)

const visible = ref(false)
const viewImgUrl = ref("")
const showFile = async (file: filesType) => {
  showMinioFile(file, viewImgUrl, visible)
}
</script>

<style scoped lang="less">
.show-file-list {
  .file-item {
    display: inline-flex;
    align-items: center;
    margin-bottom: 8px;
    padding: 8px;
    width: calc(50% - 10px);
    height: 54px;
    border: 1px solid @border1_color;
    border-radius: 4px;
    box-sizing: border-box;

    &:nth-child(2n) {
      float: right;
    }

    .file-name {
      flex: 1;
      margin: 0 10px;
      width: 0;
    }
  }

  .iconfont {
    font-size: 23px;
  }

  .icon-file-pdf {
    color: #fe6550;
  }

  .icon-shiyongshouce {
    color: @theme_color;
  }
}

.text-file-list {
  .item {
    display: flex;
    flex: 1;

    .file-name {
      margin: 0 5px;
      cursor: pointer;
      &:hover {
        color: @theme_color;
      }
    }
  }
}
</style>
