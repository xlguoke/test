<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import { useRouter } from 'vue-router'
import type { Criterion, TaskStandard } from 'custodian'
import { useEditCheck } from './useEditCheck'
import selDataCached from '@/stores/selDataCached'

const props = defineProps({
  datas: {
    type: Array as PropType<TaskStandard[]>,
    default: () => [],
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '试验依据',
  },
  useType: {
    type: String as PropType<'1' | '2'>,
    default: '1',
  },
})

const emits = defineEmits(['changeData'])

const { editCheck } = useEditCheck()

const router = useRouter()
const { getSelData, addDefaultSelData } = selDataCached()

const standards = ref<TaskStandard[]>([])
watch(
  () => props.datas,
  (list) => {
    standards.value = list
  },
  {
    immediate: true,
  },
)

// 选择规程
const key = Number.parseInt(`${Math.random() * 100000000}`)
async function chooseStandard() {
  if (!(await editCheck()))
    return

  // 将已选规程数据缓存到store，用于SelStandard页面回显
  addDefaultSelData(
    'SelStandard',
    standards.value.map(d => ({
      id: d.baseStandardId,
      name: d.baseStandardName || '',
      publishCode: d.publishCode,
    })),
  )

  selDataCached().componentKey = key
  router.push({ name: 'SelStandard' })
}

watch(
  () => getSelData('SelStandard'),
  (list: any) => {
    const componentKey = selDataCached().componentKey
    if (!list || key !== componentKey)
      return
    selectedStandard(list)
  },
  {
    flush: 'post',
  },
)

// 选择规程
function selectedStandard(list: Criterion[]) {
  const newStandards: TaskStandard[] = []
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    newStandards.push({
      baseStandardId: item.standardId,
      baseStandardName: item.standardName,
      baseStandardUseType: props.useType,
      publishCode: item.publishCode || '',
    })
  }
  standards.value = newStandards
  emits('changeData', newStandards)
}

// 删除规程
async function delStandard(ind: number) {
  if (!(await editCheck()))
    return
  standards.value.splice(ind, 1)
  emits('changeData', standards.value)
}
</script>

<template>
  <div class="standard-box">
    <div class="standard-type">
      <h4 class="title">
        {{ title }}：
      </h4>
      <i v-if="isEdit" class="iconfont icon-bianji" @click="chooseStandard" />
    </div>
    <ul class="standard-datas">
      <li v-for="(d, i) in standards" :key="d.baseStandardId" class="item">
        <span>
          {{ d.baseStandardName }}
          <template v-if="d.publishCode">
            {{ `（${d.publishCode}）` }}
          </template>
        </span>
        <i
          v-if="isEdit"
          class="iconfont icon-a-zu902"
          @click="delStandard(i)"
        />
      </li>
      <li v-if="!isEdit && datas.length === 0" class="no-data">
        暂无数据
      </li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
.standard-box {
  .standard-type {
    margin: 2.5rem 0 1rem;

    .title {
      display: inline-block;
    }

    .iconfont {
      float: right;
      color: var(--primary-color);
    }
  }

  .standard-datas {
    .item {
      padding: 1rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 32px;
      font-size: 12px;

      .iconfont {
        margin-left: 2rem;
        margin-right: 0.5rem;
        color: var(--error-color);
        font-size: 14px;
      }
    }
    .no-data {
      color: #ccc;
      font-size: 12px;
      text-align: center;
    }
  }
}
</style>
