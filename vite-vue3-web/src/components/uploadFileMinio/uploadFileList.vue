<template>
  <div
    class="file-list-box"
    :style="`display:${
      listType === 'picture-card' ? 'inline-block;vertical-align:top;padding-top:0;' : 'block'
    }`"
    @click.stop="() => {}"
  >
    <!-- 文本样式 -->
    <ul v-if="listType === 'text'" class="upload-text-list">
      <li v-for="(file, i) in fileDatas" :key="i" class="file-item">
        <span class="file-name font-1" @click="showFile(file)">
          {{ file.name }}
        </span>
        <a-button v-if="file.loading" type="link" primary size="small">
          <loading-outlined />
        </a-button>
        <a-button
          v-if="!hideDelete && !file.loading"
          type="link"
          danger
          size="small"
          @click="removeFile(i)"
        >
          <delete-outlined />
        </a-button>
      </li>
    </ul>
    <!-- 正方形卡片样式 -->
    <ul v-else-if="listType === 'picture-card'" class="upload-card-list clearfix">
      <li v-for="(file, i) in fileDatas" :key="i" class="file-item">
        <file-pdf-outlined v-if="fileType(file.name) == 'pdf'" class="icon-file-pdf" />
        <a-image
          v-else-if="isImage(file.name)"
          :preview="false"
          :src="file.blobUrl || fallback"
          :fallback="fallback"
          width="100%"
          height="100%"
        ></a-image>
        <file-text-outlined v-else />
        <p v-if="!file.loading" class="preview-box">
          <eye-outlined @click="showFile(file)" />
          <delete-outlined v-if="!hideDelete" @click="removeFile(i)" />
        </p>
        <p v-else class="loading-box"><loading-outlined /></p>
      </li>
    </ul>
    <!-- 横向矩形样式 -->
    <ul v-else class="show-file-list clearfix">
      <li v-for="(file, i) in fileDatas" :key="i" class="file-item" @click="showFile(file)">
        <file-pdf-outlined v-if="fileType(file.name) == 'pdf'" class="icon-file-pdf" />
        <a-image
          v-else-if="isImage(file.name)"
          :preview="false"
          :src="file.blobUrl || fallback"
          :fallback="fallback"
          width="50px"
          height="50px"
        ></a-image>
        <file-text-outlined v-else />
        <span class="font-1 file-name">{{ file.name }}</span>
        <a-button v-if="file.loading" type="link" primary size="small">
          <loading-outlined />
        </a-button>
        <a-button
          v-if="!hideDelete && !file.loading"
          type="link"
          danger
          size="small"
          @click.stop="removeFile(i)"
        >
          <delete-outlined />
        </a-button>
      </li>
    </ul>
    <div style="display: none">
      <a-image-preview-group :preview="{ visible, onVisibleChange: (vis: any) => (visible = vis) }">
        <a-image :src="viewImgUrl" />
      </a-image-preview-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import type { filesType } from "@/type/common"
import {
  LoadingOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileTextOutlined
} from "@ant-design/icons-vue"
import { isImage, fileType, showMinioFile } from "./uploadCommon"
const fallback = ref(
  "data:image/png;base64,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"
)
const props = defineProps({
  datas: {
    type: Array,
    default: function (d: Array<filesType>) {
      return d || []
    }
  },
  listType: {
    type: String,
    default: "picture" // text、picture、picture-card
  },
  // 是否隐藏删除图标
  hideDelete: Boolean
})
const emit = defineEmits(["removeFile"])

const fileDatas = ref<filesType[]>([])
watch(
  () => props.datas,
  (list: any) => {
    for (let i = 0; i < list.length; i++) {
      list[i].loading = false
    }
    fileDatas.value = list
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

// 删除文件
const removeFile = (ind: number) => {
  emit("removeFile", ind)
}
</script>

<style lang="less" scoped>
.file-list-box {
  padding-top: 10px;

  .upload-text-list {
    max-width: 500px;

    .file-item {
      display: flex;
      padding-left: 5px;
      min-width: 200px;
      line-height: 26px;
      border-bottom: 1px dashed #eee;

      &:hover {
        background-color: #f5f5f5;
      }

      .file-name {
        flex: 1;
        width: 0;
        margin-right: 10px;
        cursor: pointer;
        color: @theme_color;
      }
    }
  }

  .upload-card-list {
    .file-item {
      float: left;
      position: relative;
      padding: 8px;
      margin-right: 10px;
      margin-bottom: 10px;
      width: 104px;
      height: 104px;
      border-radius: 2px;
      box-sizing: border-box;
      border: 1px solid @border1_color;
      text-align: center;
      overflow: hidden;

      & > .anticon {
        display: block;
        margin-top: 18px;
        font-size: 50px;
        color: @theme_color;

        &.icon-file-pdf {
          color: #fe6550;
        }
      }

      .preview-box,
      .loading-box {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        line-height: 104px;
        background-color: rgba(1, 1, 1, 0.5);
        opacity: 0;
        transition: 0.2s;
        border-radius: 2px;

        &:hover {
          opacity: 1;
        }
        .anticon {
          margin: 0 6px;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
        }
      }
      .loading-box {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.5);
        font-size: 20px;
        .anticon {
          color: @theme_color;
        }
      }
    }
  }

  .show-file-list {
    .file-item {
      float: left;
      display: inline-flex;
      align-items: center;
      margin-bottom: 8px;
      padding: 8px;
      width: calc(50% - 10px);
      min-width: 300px;
      height: 68px;
      border: 1px solid @border1_color;
      border-radius: 4px;
      box-sizing: border-box;
      line-height: 24px;
      cursor: pointer;

      &:nth-child(2n-1) {
        margin-right: 20px;
      }

      .file-name {
        flex: 1;
        margin: 0 10px;
        width: 0;
        color: @theme_color;
      }
    }

    .anticon {
      font-size: 18px;
    }
    .anticon-file-text,
    .anticon-file-pdf {
      font-size: 32px;
    }

    .icon-file-pdf {
      color: #fe6550;
    }

    .icon-shiyongshouce {
      color: @theme_color;
    }
  }
}
</style>
