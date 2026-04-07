<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { getTestTaskDetailPageUrl } from './openTestTaskDetailPage'

const route = useRoute()

const url = ref('')

// 参照pc端逻辑组装访问地址
// dataType为数据类型：1.检测中，2.复核中，3.报告审批中，4.报告已审批
async function init(dataType: number) {
  const testTaskId = route.query.testTaskId as string
  const href = await getTestTaskDetailPageUrl(testTaskId, dataType)

  if (href) {
    url.value = href
  }
  else {
    showDialog({
      title: '提示',
      message: '打开失败！',
    })
  }
}

init(1)
</script>

<template>
  <div class="test-task-pc show-title-bar">
    <TitleBar />
    <iframe v-if="url" :src="url"></iframe>
  </div>
</template>

<style lang="less" scoped>
.test-task-pc {
  display: flex;
  flex-direction: column;

  iframe {
    border: 0;
    width: 100%;
    min-height: 0;
    flex: 1;
  }
}
</style>
