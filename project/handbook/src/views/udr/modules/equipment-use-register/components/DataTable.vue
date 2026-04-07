<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, ref } from 'vue'
import CellSelect from './CellSelect.vue'
import { request } from '@/axios'
import NoData from '@/components/noData/index.vue'
import type { EquipmentUseLog } from '@/type/equipment-use-register'
import { formatDate } from '@/utils'
import SelectedDatePicker from '@/components/SelectedDatePicker.vue'
import type { User } from '@/stores/users'
import { useUserStore } from '@/stores/users'

const props = defineProps({
  datas: {
    type: Array as PropType<EquipmentUseLog[]>,
    default: () => [],
  },
  /** 显示维度：1-设备维度 2-参数维度 */
  displayType: {
    type: String,
    default: '1',
  },
})

const emits = defineEmits(['delete', 'edit', 'load'])

const { name: userName, id: userId } = useUserStore() as User

const cutomCol: any = {
  1: [
    {
      name: '检测参数',
      key: 'testParamDisplayName',
      width: '20%',
    },
  ],
  2: [
    {
      name: '设备名称',
      key: 'equipmentName',
      width: '12%',
    },
    {
      name: '设备编号',
      key: 'equipmentCode',
      width: '12%',
    },
  ],
}

const defColumns = [
  {
    name: '使用时间',
    key: 'useTime',
  },
  {
    name: '使用前状态',
    key: 'startUseState',
    width: '100px',
  },
  {
    name: '使用后状态',
    key: 'endUseState',
    width: '100px',
  },
  {
    name: '备注',
    key: 'remark',
    width: '120px',
  },
  {
    name: '操作',
    key: 'action',
    width: '70px',
  },
]

const columns = computed(() => {
  return [...cutomCol[props.displayType], ...defColumns]
})

const showPicker = ref(false)

// 格式化使用时间
function formatUseTime(row: EquipmentUseLog) {
  const start = row.startUseTime ? formatDate(row.startUseTime, 2).replace(/-/g, '.') : '--'
  const end = row.endUseTime ? formatDate(row.endUseTime, 2).replace(/-/g, '.') : '--'
  return `${start} ~ ${end}`
}

// 主设备产生的记录，没有结束使用时间，支持编辑
let editRow: EquipmentUseLog
function editUseTime(row: EquipmentUseLog) {
  if (!row.dataGatherId)
    return

  editRow = { ...row }
  showPicker.value = true
}
// 更新行使用结束时间
async function changeDate(date: string) {
  const d = new Date(date).getTime()
  editRow.endUseTime = d
  saveRequest(editRow)
}

// 更新行状态
async function updateRowStatus(key: 'startUseState' | 'endUseState', row: EquipmentUseLog, val: string) {
  const saveRow = { ...row }
  saveRow[key] = val
  saveRequest(saveRow)
}

async function saveRequest(saveRow: EquipmentUseLog) {
  const testObjectParamId = saveRow.testObjectParamId
  const params = {
    testObjectParamId,
    useEquipmentsJson: JSON.stringify([{
      ...saveRow,
      userId,
      userName,
    }]),
  }
  try {
    showLoadingToast({ forbidClick: true, duration: 0 })
    const res: any = await request({
      url: `/ilis2/equipmentController.do?doSaveUseEquipments`,
      method: 'POST',
      data: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    if (!res.success)
      throw new Error(res.msg || '更新失败')
    showToast({ type: 'success', message: '更新成功' })
    emits('load')
  }
  catch (err: any) {
    closeToast()
    showDialog({ title: '更新失败', message: err.message || err.msg })
  }
}
</script>

<template>
  <table class="data-table" style="border-right: none">
    <thead v-if="columns.length > 0">
      <tr>
        <th
          v-for="item in columns"
          :key="item.key"
          :style="{ width: item.width || 'auto' }"
        >
          {{ item.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, i) in datas" :key="item.id">
        <td v-for="col in columns" :key="col.key">
          <CellSelect
            v-if="col.key === 'startUseState' || col.key === 'endUseState'"
            :value="(item as any)[col.key]"
            @change="(v: string) => updateRowStatus(col.key, item, v)"
          />
          <template v-else-if="col.key === 'useTime'">
            <span @click="editUseTime(item)">{{ formatUseTime(item) }}</span>
          </template>
          <template v-else-if="col.key === 'action'">
            <van-icon
              v-if="!item.dataGatherId && item.sourceFrom !== 'IOT_AUTO_CREATE'" name="edit" size="1.6rem"
              @click="$emit('edit', item, i)"
            />
            <van-icon
              v-if="!item.dataGatherId"
              name="delete-o"
              size="1.6rem"
              style="margin-left: 1rem; color: #f00; cursor: pointer"
              @click="$emit('delete', item, i)"
            />
          </template>
          <template v-else>
            {{ (item as any)[col.key] || '--' }}
          </template>
        </td>
      </tr>
      <tr v-if="datas.length === 0">
        <td :colspan="columns.length" style="padding-bottom: 3rem">
          <NoData mini />
        </td>
      </tr>
    </tbody>
  </table>

  <SelectedDatePicker
    v-model:show="showPicker"
    title="选择使用结束时间"
    show-time
    @change="changeDate"
  />
</template>

<style scoped lang="less">
.data-table {
  width: 100%;
  border-collapse: collapse;
  color: #111;
  font-size: 1.6rem;

  thead tr {
    color: #666;
  }

  th,
  td {
    padding: 1rem 0.8rem;
    box-sizing: border-box;
    text-align: center;
    &:first-child {
      text-align: left;
    }
  }

  th {
    white-space: nowrap;
    font-weight: 500;
  }
}
</style>
