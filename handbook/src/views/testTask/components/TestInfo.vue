<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { Button, Modal, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import type { Param, TaskParam, TaskStandard } from 'custodian'
import { useEditCheck } from './useEditCheck'
import { TestInfoStandard } from './index'
import selDataCached from '@/stores/selDataCached'
import type { TaskBaseInfoDTO } from '@/type/testTask'

const props = defineProps({
  params: {
    type: Array as PropType<TaskParam[]>,
    default: () => [],
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
})

const { editCheck } = useEditCheck()

const { getSelData } = selDataCached()

const router = useRouter()

const formData = ref(inject('formData') as TaskBaseInfoDTO)
const taskParams = ref<TaskParam[]>([])

watch(() => props.params, (list) => {
  taskParams.value = list
})

// 选择参数
async function addParams() {
  const { testItemId, sampleId } = formData.value

  if (!await editCheck())
    return

  if (!testItemId)
    return message.warning('请先选择模板')
  else if (!sampleId)
    return message.warning('请先选择样品')

  router.push({
    name: 'SelParam',
    query: {
      testItemId,
      sampleId,
    },
  })
}
watch(
  () => getSelData('SelParam'),
  (list: Param[]) => {
    if (!list)
      return

    const addParam: any = {}
    for (let i = 0; i < taskParams.value.length; i++)
      addParam[taskParams.value[i].testParamId] = taskParams.value[i]

    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (!addParam[item.id]) {
        taskParams.value.push({
          testItemId: item.testItemId,
          testItemName: item.testItemName,
          testParamId: item.id,
          testParamName: item.name || '',
          testParamDisplayName: item.displayName,
          standards: [],
        })
      }
    }
  },
)

async function delTaskParams(ind: number) {
  if (!await editCheck())
    return
  const item = taskParams.value[ind]
  if (item.standards?.length === 0) {
    delHandle(ind)
    return
  }
  Modal.confirm({
    title: '提示',
    content: '确定删除该参数吗？',
    centered: true,
    onOk: () => delHandle(ind),
  })
}

function delHandle(ind: number) {
  taskParams.value.splice(ind, 1)
}

function initStandards(list: TaskStandard[], type: string) {
  return list.filter(
    d => d.baseStandardUseType === type || d.baseStandardUseType === '3',
  )
}

function updateStandard(ind: number, list: TaskStandard[], useType: string) {
  let standards = taskParams.value[ind].standards || []
  if (standards.length === 0) {
    taskParams.value[ind].standards = list
    return
  }
  standards = standards.filter(d => d.baseStandardUseType !== useType)
  for (let i = 0; i < standards.length; i++) {
    const item = standards[i]
    const _ind = list.findIndex(
      d =>
        d.baseStandardId === item.baseStandardId
        && d.baseStandardName === item.baseStandardName,
    )
    if (_ind !== -1) {
      if (item.baseStandardUseType !== '3')
        item.baseStandardUseType = '3'

      list.splice(_ind, 1)
    }
    else if (item.baseStandardUseType === '3') {
      item.baseStandardUseType = useType === '1' ? '2' : '1'
    }
  }
  taskParams.value[ind].standards = [...standards, ...list]
}

function getTaskParams() {
  return taskParams.value
}

defineExpose({
  getTaskParams,
})
</script>

<template>
  <div>
    <div
      v-for="(par, i) in taskParams"
      :key="par.testParamId"
      class="parmas-item"
    >
      <p class="params-name">
        {{ par.testParamName }}
        <i
          v-if="isEdit"
          class="iconfont icon-a-zu902"
          @click="delTaskParams(i)"
        />
      </p>
      <div class="standard-warp">
        <TestInfoStandard
          title="试验依据"
          use-type="1"
          :datas="initStandards(par.standards || [], '1')"
          :is-edit="isEdit"
          @change-data="(v:TaskStandard[]) => updateStandard(i, v, '1')"
        />
        <TestInfoStandard
          title="评定标准"
          use-type="2"
          :is-edit="isEdit"
          :datas="initStandards(par.standards || [], '2')"
          @change-data="(v:TaskStandard[]) => updateStandard(i, v, '2')"
        />
      </div>
    </div>
    <div class="add-param-btn">
      <Button class="line-primary" block @click="addParams">
        +添加参数
      </Button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.parmas-item {
  padding: 1rem;
  margin-bottom: 10px;
  border-radius: 2px;
  background-color: #fafafa;
}
.params-name {
  margin-bottom: 0.5rem;
  line-height: 28px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  .iconfont {
    color: var(--error-color);
  }
}
.add-param-btn {
  margin: 3rem auto 0;
  width: 50%;
  max-width: 300px;
}
</style>
