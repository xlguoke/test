<template>
  <div class="page-content card">
    <p class="card-title">
      <i class="iconfont icon-a-jishufuwu1"></i>
      技术交流
    </p>
    <div class="detail">
      <a-descriptions bordered :column="1" size="small">
        <a-descriptions-item label="咨询标题">{{ form.title }}</a-descriptions-item>
        <a-descriptions-item label="咨询内容">{{ form.content }}</a-descriptions-item>
        <a-descriptions-item label="咨询单位">{{ form.unitName }}</a-descriptions-item>
        <a-descriptions-item label="咨询时间">{{ formatDate(form.createdAt, 2) }}</a-descriptions-item>
      </a-descriptions>

      <ul class="data-list">
        <li v-for="d in form.replies" :key="d.id" class="item">
          <p v-if="d.adopt" class="is-adopt"></p>
          <p class="question">{{ d.content }}</p>
          <p class="result">回答单位：{{ d.unitName }} [{{ formatDate(d.replyTime, 2) }}]</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { technicalDetail } from "@/api/home.api"
import { formatDate } from "@/assets/js/utils"
const route = useRoute()
onMounted(() => {
  getDatas()
})

const form = ref<any>({})
const getDatas = () => {
  const _id = (route.query.id as string) || ""
  technicalDetail(_id).then((res) => {
    form.value = res
  })
}
</script>

<style lang="less" scoped>
.card {
  margin-top: 12px;
  .card-title {
    padding: 0 15px;
    line-height: 48px;
    font-size: 18px;
    color: @theme_color;
    background-color: #edf4fc;
    .iconfont {
      font-size: 24px;
      vertical-align: middle;
    }
  }
  .detail {
    padding: 20px;
  }
}
:deep(.ant-descriptions-item-label) {
  width: 120px;
}
.data-list {
  .item {
    position: relative;
    padding: 10px;
    margin-top: 15px;
    border-radius: 4px;
    background-color: #edf4fc;
    .question {
      margin-bottom: 5px;
      font-weight: 700;
      border-bottom: 1px dashed #ccc;
    }

    .is-adopt {
      position: absolute;
      right: 10px;
      top: 15px;
      width: 40px;
      height: 40px;
      background: url("@/assets/images/ycn.png") no-repeat center/100%;
    }
  }
}
</style>
