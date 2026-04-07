<template>
  <HtModal
    v-model:open="visible"
    title="签字设置"
    :width="isFull ? '100vw' : '80vw'"
    :body-style="bodystyle"
    :confirm-loading="confirmLoading"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="visible = false">
        取消
      </a-button>
      <a-button v-if="activeKey === 1" type="primary" @click="activeKey = 2">
        下一步
      </a-button>
      <a-button v-if="activeKey === 2" type="primary" @click="activeKey = 1">
        上一步
      </a-button>
      <a-button v-if="activeKey === 2 && !param.isReadOnly" type="primary" @click="handleOk">
        确认
      </a-button>
      <a-button v-if="activeKey === 2 && param.isReadOnly" type="primary" @click="visible = false">
        确认
      </a-button>
    </template>
    <a-tabs v-model:active-key="activeKey">
      <a-tab-pane :key="1" tab="签字项设置">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="SignStaffEntity"
          :table-height="tableHeight"
          :custom-row="getCustomRow()"
          :pagination="false"
          :row-selection="getRowSelection({
            getCheckboxProps: () => ({
              disabled: props.param.isReadOnly,
            }),
          })"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a-button v-if="!param.isReadOnly" type="link" @click.stop="handleSetSingUser(record as SignStaffEntity)">
                设置人员
              </a-button>
            </template>
          </template>
        </IlisTable>
      </a-tab-pane>
      <a-tab-pane :key="2" tab="签字位置设置">
        <SignPanel
          v-model="signDataLocal"
          :files="props.param.files"
          :sign-tag-list="sortedSelData"
          :is-read-only="param.isReadOnly"
        />
      </a-tab-pane>
    </a-tabs>
  </HtModal>
</template>

<script lang="ts" setup>
import type { SignOrderConfigEntity } from '../SignOrderConfigEntity'
import type { SignPostionConfigEntity } from '../SignPostionConfigEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
/**
 * heigth：无效
 */
import { Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import VMCallPersonSelector from '~/components/selectorViaMethodCall/VMCallPersonSelector.vue'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import { getSignOrderConfigList } from '../api'
import { SignStaffEntity, SignStaffType, SignStaffTypeQueryType } from '../SignStaffEntity'
import SignPanel from './SignPanel.vue'

const props = defineProps<IDialogPropsParam<{
  signData: SignPostionConfigEntity[]
  signItem: SignStaffEntity[]
  staffData: SignStaffEntity[]
}, IParam>>()
interface IParam {
  files: any[]
  signData: SignPostionConfigEntity[]
  isReadOnly?: boolean
  signItem: SignStaffEntity[]
  staffData: SignStaffEntity[]
  /** 不获取签名配置 */
  unInitSignOrderConfig?: boolean
}

const visible = ref(true)

const confirmLoading = ref(false)

const activeKey = ref(1)

props.param?.signData?.forEach((i, index) => {
  // 生成一个唯一id
  const id = `${Date.now()}${index}`
  i.id = id
})

const signDataLocal = ref<SignPostionConfigEntity[]>(props.param.signData)

const tableData = ref<SignStaffEntity[]>([])

const signOrderConfig = ref<SignOrderConfigEntity[]>([])

/** # 固定可以进行多选的类型 4:审核 6:检测人员 9:项目负责人 */
const multiplePersonType = [
  SignStaffType.AUDIT,
  SignStaffType.DETECTION_PERSONNEL,
  SignStaffType.PROJECT_PRINCIPAL,
]

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  tableHeight,
  getRowSelection,
  getCustomRow,
} = useLocalTableHooks<SignStaffEntity>({
  dataSource: tableData,
})
const isFull = ref(false)
const bodystyle = computed(() => {
  return { // 官方属性
    height: isFull.value ? 'calc(100vh - 180px)' : 'auto', // HtModal已固定最大高度
    overflow: 'hidden',
    overflowY: 'scroll',
  }
})
watch(activeKey, (newValue) => {
  if (newValue === 2) {
    isFull.value = true
  }
  else {
    isFull.value = false
  }
})
const sortedSelData = ref([] as SignStaffEntity[])

function filterSignData() {
  const selKeysArr = selectedRows.value?.map((i) => {
    return i.staffname?.map((j) => {
      return `${i.signTag}-${j.id}`
    })
  }) as [][]
  const selKeys = [].concat(...selKeysArr) as string[]
  signDataLocal.value = signDataLocal.value.filter((i) => {
    const key = `${i.tag}-${i.userId}`
    return selKeys.includes(key)
  })
}

/**
 * 初始化选中项
 */
function initSelectedRows() {
  if (props.param.signItem?.length) {
    nextTick(() => {
      const tableIds = tableData.value?.map(i => i.id)
      selectedRowKeys.value = props.param?.signItem?.map(i => i.id)?.filter(i => tableIds.includes(i))
      selectedRows.value = tableData.value?.filter(i => selectedRowKeys.value?.includes(i.id))
      filterSignData()
    })
  }
  else {
    nextTick(() => {
      selectedRows.value.push(...tableData.value?.filter(i => i.staffname?.length))
      selectedRowKeys.value.push(...tableData.value?.filter(i => i.staffname?.length).map(i => i.id))
      sortedSelData.value = [...getSortedSelData()]
      filterSignData()
    })
  }
}

async function getSignOrderConfigListData() {
  const { data } = await getSignOrderConfigList()
  signOrderConfig.value = data

  Promise.all(props.param?.staffData?.map(async (i) => {
    const signItem = signOrderConfig.value.find(j => j.reportPersonType === i.type)
    i.signMode = signItem?.signMode
    i.signTag = signItem?.signTag
    i.disabled = props.param.isReadOnly
    // 固定多选的类型
    if (multiplePersonType.includes(i.type)) {
      i.isMultiple = true
    }
    // 批准 能否多选受系统控制参数控制
    if (i.type === SignStaffType.APPROVE) {
      i.isMultiple = await getBusinessParam('REPORT_MANAGE_42')
    }
    return i
  })).then((res) => {
    const transfromData = res.filter((i) => {
      return ['electronic', 'picture'].includes(i.signMode || '')
      // return i
    })
    tableData.value.push(...transfromData)
    initSelectedRows()
  })
}

if (!props.param.unInitSignOrderConfig) {
  getSignOrderConfigListData()
}
else {
  tableData.value.push(...props.param.staffData)
  initSelectedRows()
}

watch(() => [selectedRows.value, dataSource.value], () => {
  sortedSelData.value = [...getSortedSelData()]
}, { deep: true, immediate: true })

function getSortedSelData() {
  const ids = dataSource.value.map(i => i.id)
  return selectedRows.value.sort((a, b) => {
    const aIndex = ids.indexOf(a.id)
    const bIndex = ids.indexOf(b.id)
    return aIndex - bIndex
  })
}

async function handleSetSingUser(record: SignStaffEntity) {
  const res = await AnyDialogHelper.showSelector<IUserSelectVoEntity>(VMCallPersonSelector, {
    multiple: record.isMultiple,
    payload: {
      isCreateReport: 1,
      type: SignStaffTypeQueryType[record.type],
    },
    checkedRows: record.staffname,
  })
  record.staffname = res
  if (!selectedRowKeys.value.includes(record.id)) {
    selectedRows.value.push(record)
    selectedRowKeys.value.push(record.id)
    filterSignData()
  }
  else {
    const index = selectedRows.value.findIndex(i => i.id === record.id)
    selectedRows.value.splice(index, 1, record)
    filterSignData()
  }
}

function sortAndSetIndex(data: SignPostionConfigEntity[]) {
  const sorted = [...data].sort((a, b) => {
    // 第一优先级：页码
    if (a.pageNo !== b.pageNo)
      return a.pageNo - b.pageNo

    // 第二优先级：标签类型
    if (a.tag !== b.tag)
      return a.tag.localeCompare(b.tag)

    // 第三优先级：附件ID
    if (a.attachmentId !== b.attachmentId)
      return a.attachmentId!.localeCompare(b.attachmentId!)

    // 组内排序：Y轴降序（从上到下）→ X轴升序（从左到右）
    return b.signY - a.signY || a.signX - b.signX
  })

  // 动态生成索引（基于三个条件分组）
  // let currentIndex = 0
  // let currentGroupKey: string
  // sorted.forEach((item) => {
  //   const groupKey = `${item.pageNo}-${item.tag}-${item.attachmentId}`
  //   if (groupKey !== currentGroupKey) {
  //     currentGroupKey = groupKey
  //     currentIndex = 1
  //   }
  //   else {
  //     currentIndex++
  //   }
  // item.index = currentIndex
  // })

  return sorted
}

function handleOk() {
  const unSetData = signDataLocal.value?.filter(i => Number.isNaN(Number(i.signX)) || Number.isNaN(Number(i.signY)))
  if (unSetData?.length) {
    // 按照attachmentId分组
    const groupedData = unSetData.reduce((acc, cur) => {
      const attachmenttitle = props.param.files.find(i => i.id === cur.attachmentId)?.attachmenttitle
      const key = attachmenttitle
      if (!acc[key])
        acc[key] = []
      acc[key].push(cur)
      return acc
    }, {} as Record<string, SignPostionConfigEntity[]>)
    Modal.warning({
      title: '提示',
      content: () =>
        h('div', { style: { maxHeight: '60vh', overflow: 'auto' } }, [...Object.keys(groupedData).map((item: string) => {
          const tagArr = groupedData[item]?.map(i => `${i.tag}`) || []
          const string = Array.from(new Set(tagArr)).join('、')
          return h('p', `${item}：【${string}】未设置签名位置，请设置后再保存`)
        })]),
      centered: true,
    })
    return
  }

  const keepStaffData = props.param?.staffData?.filter((i) => {
    return !['electronic', 'picture'].includes(i.signMode || '')
  }) || []
  props.onConfirm({
    signData: sortAndSetIndex(signDataLocal.value),
    signItem: selectedRows.value,
    staffData: [...keepStaffData, ...tableData.value],
  })
  // console.log('onConfirm',);

  visible.value = false
}
</script>

<style scoped>

</style>
