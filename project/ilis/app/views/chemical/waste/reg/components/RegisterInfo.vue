<template>
  <ht-modal
    v-model:open="open"
    :title="title"
    width="800px"
    :mask-closable="false"
    @cancel="cancel"
  >
    <div>
      <a-flex>
        <label class="font-bold">功能室名称：</label>
        <p v-if="baseInfo">
          {{ baseInfo.laboratoryName }}
        </p>
      </a-flex>
      <a-flex>
        <label class="font-bold">废物类型：</label>
        <p v-if="baseInfo">
          {{ getWasteTypeText(baseInfo.type) }}
        </p>
      </a-flex>
      <a-flex v-if="baseInfo && baseInfo.fluid">
        <label class="font-bold">PH值：</label>
        <p v-if="baseInfo">
          {{ baseInfo.phValue || '&nbsp;' }}
        </p>
      </a-flex>
      <a-flex>
        <label class="font-bold">总数量：</label>
        <p v-if="baseInfo">
          {{ baseInfo.totalValue }}
        </p>
      </a-flex>
    </div>

    <a-button v-if="!isDetail" class="mb-4" @click="onRegister">
      登记
    </a-button>

    <a-table
      row-key="id"
      :columns="columns"
      :data-source="registrationList"
      :pagination="false"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'Action'">
          <a-button v-if="!isDetail" type="link" @click="onEditReg(record)">
            编辑
          </a-button>
          <!--          <a-button type="link" @click="onPrintReg(record)"> -->
          <!--            打印 -->
          <!--          </a-button> -->
          <a-button v-if="!isDetail" danger type="link" @click="onDelReg(record)">
            删除
          </a-button>
        </template>
      </template>
    </a-table>

    <template #footer>
      <a-button @click="cancel">
        关闭
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type { IOption } from '~/interface/IOption.ts'
import type {
  ChemicalWasteDTO,
  ChemicalWasteMaterialRegistrationVO,
} from '~/views/chemical/waste/reg/api.ts'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'

import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import { getDictByCode, getListByGroupId } from '~/api/common.ts'
import {
  delChemicalWasteReg,
  getChemicalWasteDetail,
} from '~/views/chemical/waste/reg/api.ts'
import CreateRegisterForm from '~/views/chemical/waste/reg/components/CreateRegisterForm.vue'
import { useWasteRegHooks } from '~/views/chemical/waste/reg/useWasteRegHooks.ts'

const props = defineProps<IDialogPropsParam<null, {
  id: string
  isDetail?: boolean
}>>()

const { getWasteTypeText } = useWasteRegHooks()

const unitOptions = ref<IOption[]>([])

const hazardousIngredientsOptions = ref<IOption[]>([])

const id = computed(() => props.param.id)

const isDetail = computed(() => props.param.isDetail)

const open = ref(true)

const title = computed(() => isDetail.value ? '废物详情' : '废物登记')

const columns = ref([
  { title: '序号', dataIndex: 'index', align: 'center', customRender: ({ index }) => (index + 1), width: 65 },
  { title: '主要有害成分', dataIndex: 'hazardousIngredients', customRender: ({ text }) => {
    const item = hazardousIngredientsOptions.value.find(i => i.value === text)
    return item ? item.label : ''
  } },
  { title: '数量', dataIndex: 'quantity', width: 85 },
  { title: '投放日期', sorter: (a, b) => a.launchDate - b.launchDate, dataIndex: 'launchDate', customRender: ({ text }) => text ? dayjs(text).format(EDateFormatType.YYYY_MM_DD) : '', width: 120 },
  { title: '投放人', dataIndex: 'launchUserName', width: 120 },
  { title: '操作', dataIndex: 'Action', width: 120 },
])

const registrationList = ref<ChemicalWasteMaterialRegistrationVO[]>([])

const baseInfo = ref<ChemicalWasteDTO>()

getListByGroupId('chemical_measurement_unit_id').then((res) => {
  unitOptions.value = res.data.obj.map(item => ({
    label: item.typename,
    value: item.typename,
  }))
})

getDictByCode('chemicalHazardousIngredients').then((res) => {
  hazardousIngredientsOptions.value = res.data.map(item => ({
    label: item.typeName,
    value: item.typeCode,
  }))
})

if (id.value) {
  getDetail()
}

function onRegister() {
  AnyDialogHelper.showModel(CreateRegisterForm, {
    recordId: id.value,
    unit: baseInfo.value?.unit,
  }).then(() => getDetail())
}

function onEditReg(record: ChemicalWasteMaterialRegistrationVO) {
  AnyDialogHelper.showModel(CreateRegisterForm, {
    recordId: id.value,
    unit: baseInfo.value?.unit,
    id: record.id,
  }).then(() => getDetail())
}

// function onPrintReg(record: ChemicalWasteMaterialRegistrationVO) {
//   const print = new IlisPrintUdr()
//   print.commonPrint([record.id], PrintUdrTempleteType.废物登记打印)
// }

function onDelReg(record: ChemicalWasteMaterialRegistrationVO) {
  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: async () => {
      await delChemicalWasteReg(record.id)
      message.success('操作成功！')
      getDetail()
    },
  })
}

async function getDetail() {
  if (id.value) {
    const res = await getChemicalWasteDetail(id.value)
    baseInfo.value = res.data
    registrationList.value = res.data.registrationList
  }
}

// 关闭弹窗
function cancel() {
  open.value = false
  props.onConfirm(null)
}
</script>
