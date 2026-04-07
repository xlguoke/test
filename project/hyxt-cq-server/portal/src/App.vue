<template>
  <a-config-provider :locale="zhCN">
    <router-view />

    <!-- 要闻 / 重要通知 -->
    <BriefingLayer v-if="showImportantNotice && importantNotices.length" :list="importantNotices" />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, provide, reactive, ref } from "vue"
import zhCN from "ant-design-vue/es/locale/zh_CN"
import "dayjs/locale/zh-cn"
import type { PaginationProps } from "ant-design-vue"
import BriefingLayer from "./views/home/components/BriefingLayer.vue"
import { getHomeNoticeList } from "./api/home.api"
import { useRoute } from "vue-router"

const route = useRoute()

// 重要通知
const importantNotices = ref<
  {
    title: string
    id: string
    publishDate: string
    pictureUrl: string
    isTop: boolean
  }[]
>([])

// 重要通知展示
const showImportantNotice = computed(() => !route.path.includes("/phone/"))

const pagination = reactive<PaginationProps>({
  current: 1,
  pageSize: 10,
  total: 0,
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total: number, range: number[]) =>
    `显示${range[0]}-${range[1]}条记录，检索到 ${total} 条记录`
})

getHomeNoticeList().then(async (res: any) => {
  if (!res) return
  importantNotices.value = res.briefing || []
})

provide("commonPagination", pagination)
</script>

<style lang="less">
.query-form {
  .ant-form-inline .ant-form-item-with-help,
  .ant-form-item {
    margin-bottom: 0;
    min-height: 56px;
  }
}
.ant-image {
  vertical-align: sub;
  img {
    display: block;
  }
}
.ant-modal-body {
  padding: 15px !important;
  max-height: calc(100vh - 260px);
  overflow: auto;
}
</style>
