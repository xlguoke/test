<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    title="引用设备购置计划"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="min-h-[50vh]">
      <a-space>
        <a-input
          v-model:value.trim="formState.quickQryParam"
          class="!w-[320px]"
          placeholder="请输入设备名称、申请人回车即可查询"
          allow-clear
        />
        <a-button type="primary" @click="handleSearch()">
          查询
        </a-button>
      </a-space>

      <a-table
        v-model:expanded-row-keys="expandedKeys"
        class="mt-2"
        bordered
        row-key="id"
        :loading="loading"
        :columns="columns2"
        :data-source="dataSource"
        :scroll="{ y: '50vh' }"
        :pagination="false"
        :custom-row="getCustomRow()"
        @expand="onExpand"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'amount'">
            <span> {{ text }} {{ record.amountUnit }} </span>
          </template>

          <template v-if="column.dataIndex === 'status'">
            <span>
              {{ getEnumKeyByValue(EquipmentBuyPlanStatus, text) }}
            </span>
          </template>
        </template>
        <template #expandedRowRender="{ record }">
          <a-table
            :columns="detailColumns2"
            :data-source="detailMap[record.id]"
            :pagination="false"
            :custom-row="getDetailCustomRow()"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'id'">
                <a-checkbox v-model:checked="checkedMap[record.id]"></a-checkbox>
              </template>
              <template v-if="column.dataIndex === 'amount'">
                <span> {{ text }} {{ record.amountUnit }} </span>
              </template>
            </template>
          </a-table>
        </template>
      </a-table>
      <div class="text-right mt-2">
        <a-pagination size="small" :current="page" :page-size="rows" :total="total" @change="onChange" />
      </div>
    </div>
  </ht-modal>
</template>

<script lang="ts" setup>
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import type { EquimentBuPlanDetailDTO, EquipmentBuyPlanDTO } from '~/api/equipment/buy-plan/type.ts'
import { message } from 'ant-design-vue'
import { getBuyPlanDetailList, getBuyPlanList } from '~/api/equipment/buy-plan'
import { EquipmentBuyPlanStatus } from '~/api/equipment/buy-plan/type.ts'
import { getEnumKeyByValue } from '~/utils/getEnumKeyByValue.ts'
import { columns, detailColumns } from '~/views/equipmentNew/buy/equipBuyPlanList/list/index.ts'

const props = defineProps<IDialogPropsSelector<EquipmentBuyPlanDTO>>()

const dataSource = ref<EquipmentBuyPlanDTO[]>([])

const detailMap = ref<Record<string, EquimentBuPlanDetailDTO[]>>({})

const checkedMap = ref<Record<string, boolean>>({})

const expandedKeys = ref<string[]>([])

const loading = ref(false)

const page = ref(1)

const rows = ref(10)

const total = ref(0)

const formState = ref({
  quickQryParam: '',
  status: EquipmentBuyPlanStatus.审批通过,
})

const internalOpen = ref(true)

const columns2 = columns.slice(0, columns.length - 1).map(i => ({
  ...i,
  width: '20%',
}))

const detailColumns2 = [{
  dataIndex: 'id',
  width: '85px',
}, ...detailColumns]

function getCustomRow() {
  return (record: EquipmentBuyPlanDTO) => {
    return {
      onClick: () => {
        if (expandedKeys.value.includes(record.id)) {
          expandedKeys.value = expandedKeys.value.filter(i => i !== record.id)
        }
        else {
          expandedKeys.value.push(record.id)
          onExpand(true, record)
        }
      },
    }
  }
}

function getDetailCustomRow() {
  return (record: EquimentBuPlanDetailDTO) => {
    return {
      onClick: () => {
        checkedMap.value[record.id] = !checkedMap.value[record.id]
      },
    }
  }
}

function handleSearch() {
  page.value = 1
  getList()
}

function onChange(p: number) {
  page.value = p
  getList()
}

async function getList() {
  loading.value = true
  const res = await getBuyPlanList({
    page: page.value,
    rows: rows.value,
    ...formState.value,
  }).finally(() => {
    loading.value = false
  })

  dataSource.value = res.data.rows
  total.value = res.data.total
}

async function onExpand(expanded: boolean, record: EquipmentBuyPlanDTO) {
  if (!expanded) {
    return
  }

  if (detailMap.value[record.id]) {
    return
  }

  const res = await getBuyPlanDetailList({
    buyPlanId: record.id,
  })
  detailMap.value[record.id] = res.data.rows
}

function getSelectedRows() {
  const result: EquimentBuPlanDetailDTO[] = []
  const allDetailRows: EquimentBuPlanDetailDTO[] = []

  for (const id in detailMap.value) {
    allDetailRows.push(...detailMap.value[id])
  }

  for (const detailId in checkedMap.value) {
    if (checkedMap.value[detailId]) {
      const item = allDetailRows.find(row => row.id === detailId)
      result.push(item)
    }
  }

  return result
}

/**
 * # 确认
 */
function handleConfirm() {
  const rows = getSelectedRows()

  if (!rows.length) {
    message.warning('请勾选数据！')
    return
  }

  props.onConfirm(rows)
  internalOpen.value = false
}

getList()
</script>
