<template>
  <HtModal
    v-model:open="visible"
    :title="title"
    width="800px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="onClose"
  >
    <div class="mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :loading="loading"
        :scroll="{ y: 420 }"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'count'">
            <span
              class="text-blue-500 underline cursor-pointer"
              :class="{
                'text-red-500': record.personStatus === '1',
              }"
              @click="onCheckUser(record)"
            >{{ record.count }}</span>
          </template>
          <template v-if="column.dataIndex === 'Action'">
            <a-button
              type="link"
              @click="onPrint(record)"
            >
              打印
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { ColumnType } from 'ant-design-vue/es/table'
import type { EquipmentAuthEntity } from '../EquipmentAuthEntity.ts'
import type { AuthRecordEntity } from '../api'
import { getAuthRecord } from '../api'
import PrintTypeSelector from './PrintTypeSelector.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import CheckAuthUser from '~/views/equipment/auth/component/CheckAuthUser.vue'
import { IlisPrintUdr } from '~/utils/IlisPrintUdr.ts'

const props = defineProps<IDialogPropsParam<null, EquipmentAuthEntity>>()

const ilisPrintUdr = new IlisPrintUdr()

const visible = ref(true)

const rowData = ref<EquipmentAuthEntity>(props.param)

const title = computed(() => {
  if (rowData.value.equipmentSn) {
    return `${rowData.value.name}（${rowData.value.equipmentSn}）授权记录`
  }
  return `${rowData.value.name}授权记录`
})

const loading = ref(false)

const dataSource = ref([])

const columns: ColumnType[] = [
  {
    title: '提交人',
    dataIndex: 'createName',
    width: 85,
  },
  {
    title: '提交日期',
    dataIndex: 'createTime',
    width: 120,
    sorter: {
      compare: (a, b) => a.createTime - b.createTime,
    },
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '授权日期',
    dataIndex: 'effectiveDate',
    width: 120,
    sorter: {
      compare: (a, b) => a.effectiveDate - b.effectiveDate,
    },
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '授权人数',
    dataIndex: 'count',
    width: 80,
  },
  {
    title: '操作',
    dataIndex: 'Action',
    width: 60,
  },
]

getList()

async function getList() {
  loading.value = true
  const res = await getAuthRecord(rowData.value.id).finally(() => {
    loading.value = false
  })

  dataSource.value = res.data.rows
}

function onClose() {
  visible.value = false
}

function onCheckUser(record) {
  AnyDialogHelper.showModel(CheckAuthUser, {
    ...props.param,
    _processId: record.processId,
  })
}

async function onPrint(record: AuthRecordEntity) {
  const { isIncludeOutUser } = await AnyDialogHelper.showModel(PrintTypeSelector)

  const jsonParam: unknown = {}

  if (isIncludeOutUser === '1') {
    jsonParam.type = '3'
  }
  else {
    jsonParam.type = '1'
  }

  ilisPrintUdr.commonPrint([record.processId], PrintUdrTempleteType.设备授权台账打印, { jsonParam })
}
</script>
