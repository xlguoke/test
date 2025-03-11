<template>
  <div>
    <a-modal
      v-model:open="open"
      title="附加费用管理"
      width="680px"
      :mask-closable="false"
      @cancel="handleCancel"
    >
      <a-space class="my-4">
        <a-input-search
          enter-button
          placeholder="请输入附加费用名称查询"
          @press-enter="onQueryList"
          @search="onQueryList"
        ></a-input-search>
        <a-button @click="setAddVisible(true)">
          添加
        </a-button>
        <a-button :loading="delLoading" @click="onDel">
          删除
        </a-button>
      </a-space>

      <a-table
        row-key="id"
        size="small"
        :columns="columns"
        :data-source="list"
        :row-selection="rowSelection()"
        :pagination="false"
        :loading="tableLoading"
        bordered
        :scroll="{ y: 380 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'displayName'">
            <span :class="`${record.isSearch ? 'text-orange-500' : ''}`">
              {{ record.displayName }}
            </span>
          </template>
        </template>
      </a-table>

      <template #footer>
        <a-button @click="handleCancel">
          取消
        </a-button>
        <a-button type="primary" @click="handleOk">
          确定
        </a-button>
      </template>
    </a-modal>

    <AdditionalFeeMgtAdd v-model:open="addVisible" @on-save="getList(true)" />
  </div>
</template>

<script setup lang='ts'>
import type { ColumnsType } from 'ant-design-vue/es/table'
import { Modal, message } from 'ant-design-vue'
import type { AdditionalFeeItem, UseAdditionalFee } from '../modules/UseAdditionalFee'
import { additionalFeesDel, getAdditionalFees } from '../api'
import AdditionalFeeMgtAdd from './AdditionalFeeMgtAdd.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:open', 'onSelect'])

const useAdditionalFee = inject('useAdditionalFee') as UseAdditionalFee

const [addVisible, setAddVisible] = useStateHooks(false)

const delLoading = ref(false)
const tableLoading = ref(false)
const selectedRowKeys = ref<AdditionalFeeItem['id'][]>([])
const selectedRows = ref<AdditionalFeeItem[]>([])
const list = ref<AdditionalFeeItem[]>([])
const listCache = ref<AdditionalFeeItem[]>([])

const columns: ColumnsType = [
  { title: '附加费用名称', dataIndex: 'name', width: '25%' },
  { title: '单价（元）', dataIndex: 'price', width: '25%' },
  { title: '单位', dataIndex: 'priceUnit', width: '25%' },
  { title: '备注', dataIndex: 'remark', width: '25%' },
]

const rowSelection = function () {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[], rows: AdditionalFeeItem[]) => {
      selectedRowKeys.value = keys
      selectedRows.value = rows
    },
  }
}

const open = computed(() => props.open)

/** 本地查询 */
const onQueryList = function (val) {
  if (!val) {
    list.value = [...listCache.value]
    return
  }

  list.value = listCache.value.filter(item => item.name.includes(val.trim()))
}

/** 获取附加费用列表 */
const getList = async function (isForceRefresh = false) {
  // 此处做缓存逻辑，若之前已请求过列表接口，不再请求，除非操作了新增和删除后
  if (!isForceRefresh && !!listCache.value.length) {
    return
  }

  tableLoading.value = true
  const res = await getAdditionalFees({
    testParamIds: '402882c192284703019228641a9c0025,402882c192284703019228641a9d0029',
  }).finally(() => {
    tableLoading.value = false
  })

  listCache.value = res.data.rows as AdditionalFeeItem[]
  // 设置费用所有数据，后续要存到元数据中
  useAdditionalFee.setDataField('additionalFeesData', listCache.value)
  // 查询下，用本地查询逻辑渲染界面
  onQueryList('')
}

/** 设置用户上次选中项 */
const setSelected = function () {
  const data = useAdditionalFee.getData()
  const keys = data.additionalFees.map(i => i.id)

  selectedRowKeys.value = keys
  selectedRows.value = listCache.value.filter(i => keys.includes(i.id))
}

/** 删除附加费用 */
const onDel = async function () {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要删除的附加费用')
    return
  }

  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: async () => {
      await additionalFeesDel(selectedRowKeys.value.join(','))
      message.success('操作成功！')
      getList(true)
    },
  })
}

const handleCancel = function () {
  emits('update:open', false)
  selectedRowKeys.value = []
  selectedRows.value = []
}

const handleOk = function () {
  if (!selectedRows.value.length) {
    message.warning('请选择附加费用')
    return
  }

  emits('onSelect', selectedRows.value)
  handleCancel()
}

watch(open, async (val) => {
  if (val) {
    await getList()
    // 回显上次用户选中项
    setSelected()
  }

  emits('update:open', val)
})
</script>
