<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue'
import type {
  AppTask,
} from 'custodian'
import {
  TaskQuery,
  countTask,
  findTasks,
} from 'custodian'
import { message } from 'ant-design-vue'
import RollingLoading from '@/components/rollingLoading/index.vue'
import { translateError } from '@/utils/translateError'

const uploadDatas = ref<AppTask[]>([])
const loading = ref(false)
const dataLength = computed(() => uploadDatas.value.length)
const total = ref(0)

// rollingloading 组件使用
provide('loading', loading)
provide('total', dataLength)
provide('dataLength', dataLength)

const query = new TaskQuery()
async function getDatas(flag?: boolean) {
  loading.value = true
  if (flag)
    query.page++
  else query.page = 1

  try {
    const res = await findTasks(query)
    uploadDatas.value = res
  }
  catch (err: any) {
    console.error('', err)
    const error = translateError(err)
    message.error(error.message)
  }
  loading.value = false
}

async function getCount() {
  const count = await countTask(query)
  total.value = count
}

function refreshData() {
  getDatas()
  getCount()
}

onMounted(() => {
  query.size = 50
  query.status = ['uploaded']
  refreshData()
})
defineExpose({
  refreshData,
})
</script>

<template>
  <div class="upload-data-list">
    <RollingLoading @load="getDatas(true)">
      <div class="pd-lr">
        <div
          v-for="item in uploadDatas"
          :key="item.testTaskId"
          class="common-media-wrap my-list"
        >
          <div style="width: 100%;">
            <p class="sample-name">
              {{ item.sampleName }}
            </p>
            <p class="task-code">
              <span>任务编号：{{ item.testTaskCode }}</span>
              <!-- <span>{{ item.uploadTime }}</span> -->
            </p>
          </div>
        </div>
      </div>
    </RollingLoading>
  </div>
</template>

<style scoped lang="less">
.upload-data-list {
  flex: 1;
  padding-top: 14px;
  height: 0;
  display: flex;
  flex-direction: column;
  .sample-name{
    margin-bottom: 1rem;
    font-weight: bold;
    font-size: 14px;
  }
  .task-code{
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }
}
</style>
