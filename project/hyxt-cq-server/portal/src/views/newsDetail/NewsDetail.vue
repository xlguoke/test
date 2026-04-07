<template>
  <div class="page-content card">
    <div class="news-content">
      <h2 class="title">{{ formData.title }}</h2>
      <ul class="file-info">
        <!-- <li>来源：xxxxx</li> -->
        <li>浏览量：{{ formData.flowRate }}</li>
        <li>发布日期：{{ formatDate(formData.publishDate) }}</li>
        <li>
          字体：【
          <span
            v-for="(s, i) in sizeList"
            :key="i"
            :class="`${i == activeInd ? 'active' : ''}`"
            @click="setFontSize(i)"
          >
            {{ s.name }}
          </span>
          】
        </li>
      </ul>
      <div class="content" :style="`font-size:${sizeList[activeInd].size}px`">
        <div v-html="formData.content"></div>
      </div>
      <p class="files-box">
        <a
          v-for="(file, i) in formData.attachments"
          :key="i"
          class="file-item"
          @click="downloadByNameOrUrl(file.url, true)"
        >
          {{ file.name }}
        </a>
      </p>
      <p class="handle">
        <span @click="closeWindow">【关闭窗口】</span>
        <span @click="goTop">【返回顶部】</span>
        <span @click="printPage">【打印文章】</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import { useRoute } from "vue-router"
import { getNewsDetail } from "@/api/home.api"
import { formatDate } from "@/assets/js/utils"
import { downloadByNameOrUrl } from "@/config/minio.config.js"
const route = useRoute()
const activeInd = ref<number>(1)
const sizeList = reactive<
  Array<{
    name: string
    size: number
  }>
>([
  { name: "大", size: 20 },
  { name: "中", size: 16 },
  { name: "小", size: 12 }
])
const setFontSize = (i) => {
  activeInd.value = i
}

onMounted(() => {
  getDatas()
})

interface filesType {
  id: string
  name: string
  url: string
}

const formData = ref({
  id: "",
  title: "",
  type: null,
  content: "",
  publishDate: "",
  auditedTime: "",
  isTop: false,
  topExpirationDate: "",
  isPicture: false,
  isInWebsite: false,
  attachments: <filesType[]>[],
  flowRate: 0
})
const getDatas = () => {
  const id = route.query.id as string
  getNewsDetail(id).then(async (res) => {
    if (!res) return
    formData.value = res
  })
}

// 关闭窗口
const closeWindow = () => {
  window.opener = null
  window.open("", "_self")
  window.close()
}

// 返回顶部
const goTop = () => {
  document.body.scrollTop = document.documentElement.scrollTop = 0
}

// 打印
const printPage = () => {
  window.print()
}
</script>

<style scoped lang="less">
.page-content {
  margin-top: 12px;
  overflow: hidden;

  .news-content {
    margin: 60px auto;
    width: 824px;

    .title {
      font-size: 18px;
      font-weight: 700;
      text-align: center;
    }

    .file-info {
      padding: 16px 0 28px;
      font-size: 12px;
      color: #666;
      text-align: center;

      li {
        display: inline-block;

        &:not(:first-child) {
          margin-left: 20px;
        }

        span {
          margin: 0 5px;
          cursor: pointer;
        }

        .active {
          color: @theme_color;
        }
      }
    }

    .content {
      padding: 30px 0;
      border-top: 1px dashed #dcdcdc;
      border-bottom: 1px dashed #dcdcdc;

      * {
        font-size: inherit !important;
        word-wrap: break-word;
      }
    }

    .files-box {
      margin-top: 15px;
      color: @theme_color;

      .file-item {
        display: block;
        line-height: 23px;

        &:hover {
          color: @theme_color_hover;
        }
      }
    }

    .handle {
      margin-top: 50px;
      text-align: center;

      span {
        margin: 0 10px;
        cursor: pointer;

        &:hover {
          color: @theme_color_hover;
        }
      }
    }
  }
}
</style>
