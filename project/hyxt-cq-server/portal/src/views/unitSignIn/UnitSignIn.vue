<template>
  <div class="page-content card">
    <div class="left-tabs">
      <QueryList isTabs />
    </div>
    <!-- <div class="news-content" v-show="step == 1">
      <h2 class="title">主标题</h2>
      <ul class="file-info">
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
        内容
      </div>
      <div class="handle-box">
        <a-button type="primary" @click="step = 2">
          本人已仔细阅读并知悉具体要求 <i class="iconfont icon-arrowRight"></i>
        </a-button>
      </div>
      <p class="handle">
        <span @click="closeWindow">【关闭窗口】</span>
        <span @click="goTop">【返回顶部】</span>
        <span>【打印文章】</span>
      </p>
    </div> -->
    <div class="news-content" v-show="step == 2">
      <SignInForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import QueryList from "@/components/queryList/QueryList.vue"
import SignInForm from "./SignInForm.vue"
sessionStorage.setItem("queryListKey", "UnitSignin")
const step = ref<number>(2)

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
</script>

<style scoped lang="less">
.card {
  display: flex;
}
.page-content {
  margin-top: 12px;
  overflow: hidden;
  .left-tabs {
    width: 280px;
    border-right: 1px solid #dbe8fa;
  }
  .news-content {
    flex: 1;
    padding: 30px 20px;
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
  .handle-box {
    padding-top: 30px;
    text-align: center;
  }
}
</style>
