<template>
  <ht-modal
    title="审核流程"
    :open="processVisible"
    :loading="loading"
    width="500px"
    cancel-text="关闭"
    hide-confirm
    @cancel="processVisible = false"
  >
    <div class="process-container">
      <div>
        <span>{{ processName }}</span>
      </div>
      <a-steps
        progress-dot
        direction="vertical"
      >
        <a-step v-for="node in processNodes" :key="node.id" :status="node.status">
          <template #title>
            <span>{{ node.title }}</span>
          </template>
          <template #description>
            <div>
              <!-- 完成节点无操作人，操作时间 -->
              <span v-if="node.processed && !['process_end'].includes(node.id)">{{ node.lastProcessRecord.userRealName }}</span>
              <span v-else>{{ node.candidates }}</span>
              <!-- 开始节点与完成节点无是否通过 -->
              <span v-if="node.processed === true && !['process_start', 'process_end'].includes(node.id)" class=" ml-2">
                {{ node.lastProcessRecord.isPass ? '通过' : '不通过' }}
              </span>
            </div>
            <span v-if="node.processed === true && !['process_end'].includes(node.id)">
              {{ node.lastProcessRecord.processTime }}
            </span>
          </template>
        </a-step>
      </a-steps>
    </div>
  </ht-modal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { getProcess } from '../api'

const props = defineProps<IDialogPropsParam<null, {
  processInstanceId: string
}>>()

onMounted(() => {
  initProcess()
})
const processName = ref('')
const ended = ref(false)

const processVisible = ref(true)
const loading = ref(false)
const processNodes = ref<any[]>([])
async function initProcess() {
  loading.value = true
  const { data } = await getProcess(props.param.processInstanceId).finally(() => {
    loading.value = false
  })
  ended.value = data?.ended
  processName.value = data?.processName
  processNodes.value = data?.processNodes?.map((item: any) => {
    const lastProcessRecord = item.processRecords?.length ? item.processRecords[item.processRecords.length - 1] : null // 最新操作记录
    let status = ''
    if (item.id === 'process_end' && item.processed) { // 完成节点-已经完成
      status = 'finish'
    }
    else if (item.processed) { // 开始节点预以及中间节点
      // 中间节点中可能isPass字段可能为null，目前默认为通过
      if (lastProcessRecord.isPass === null) {
        status = 'finish'
      }
      else {
        status = lastProcessRecord.isPass ? 'finish' : 'process'
      }
    }
    return {
      id: item.id,
      title: item.name,
      candidates: item.candidates?.join(','),
      processed: item.processed,
      lastProcessRecord: {
        userRealName: lastProcessRecord?.userRealName,
        processTime: lastProcessRecord?.processTime,
        isPass: lastProcessRecord?.isPass ?? true, // 旧数据中isPass字段可能为null，目前默认为通过
      },
      status,
    }
  })
}
</script>

<style lang="less" scoped>
.process-container {
  min-height: 350px;
  padding: 12px;
  font-size: 14px;
}
</style>
