<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    width="80%"
    :body-style="{ height: '80vh', overflowY: 'auto' }"
    :title="data.id ? (isDetail ? '查看送检登记' : '编辑送检登记') : '新增送检登记'"
    :keyboard="false"
    :mask-closable="false"
  >
    <template #footer>
      <a-space v-if="!isDetail">
        <a-button @click="handleCancel()">
          取消
        </a-button>
        <a-button type="primary" :loading="loading" @click="handleConfirm()">
          确定
        </a-button>
      </a-space>

      <a-button v-else type="primary" @click="handleCancel()">
        关闭
      </a-button>
    </template>
    <BaseTitle>送检基本信息</BaseTitle>
    <a-form
      ref="formRef"
      :model="formState"
      :disabled="isDetail"
      :rules="rules"
      :label-col="{ span: 7 }"
    >
      <div class="grid grid-cols-3 gap-4">
        <a-form-item label="送检批号" name="batchNumber">
          <a-input v-model:value="formState.batchNumber" />
        </a-form-item>
        <a-form-item label="检校单位" name="unit">
          <a-input v-model:value="formState.unit" />
        </a-form-item>
        <a-form-item label="送检日期" name="sendTime">
          <a-date-picker v-model:value="formState.sendTime" class="w-full" value-format="YYYY-MM-DD" />
        </a-form-item>
        <a-form-item label="计划取回日期" name="planRetrieveTime">
          <a-date-picker v-model:value="formState.planRetrieveTime" class="w-full" value-format="YYYY-MM-DD" />
        </a-form-item>
        <a-form-item label="备注说明" name="remark">
          <a-input v-model:value="formState.remark" />
        </a-form-item>
        <a-form-item label="送检状态" name="status">
          <span :style="{ color: CheckSendStatusDict.getColorByKey(formState.status || CheckSendStatus.WAIT_SEND) }">{{ CheckSendStatusDict.getLabelByKey(formState.status || CheckSendStatus.WAIT_SEND) }}</span>

          <!-- <a-radio-group v-model:value="formState.status" name="status">
            <a-radio
              v-for="item in CheckSendStatusDict.exclude([CheckSendStatus.APPROVAL, CheckSendStatus.SEND_FAIL])"
              :key="(item.key as string)"
              :value="item.key"
            >
              {{ item.label }}
            </a-radio>
          </a-radio-group> -->
        </a-form-item>
      </div>
    </a-form>

    <BaseTitle>送检设备信息</BaseTitle>
    <a-space direction="vertical">
      <a-space v-if="!isDetail">
        <a-button type="primary" @click="showPlanModal = true">
          引用送检计划
        </a-button>
        <a-button type="primary" @click="showDeviceSelector = true">
          添加设备
        </a-button>
      </a-space>
      <a-table
        row-key="id"
        :data-source="dataSource"
        :columns="addColumns"
        :loading="loading"
        :pagination="false"
        class=" w-full"
      >
        <template #bodyCell="{ column, record, text, index }">
          <template v-if="['checkItemName', 'checkReference', 'testSpecifications', 'remark'].includes(column.dataIndex as string)">
            <div>
              <!-- 项目/参数 -->
              <div v-if="editableData[`${record.id}${index}`] && column.dataIndex === 'checkItemName'">
                <template v-for="(tag, tagIndex) in (editableData[`${record.id}${index}`]?.checkItemName ? editableData[`${record.id}${index}`]?.checkItemName?.split(',') : [])" :key="tagIndex">
                  <a-tooltip v-if="tag.length > 5" :title="tag">
                    <a-tag closable @close.prevent="handleClose(tagIndex, editableData[`${record.id}${index}` ] as PlanDeviceEntity)">
                      {{ `${tag.slice(0, 5)}...` }}
                    </a-tag>
                  </a-tooltip>
                  <a-tag v-else closable @close.prevent="handleClose(tagIndex, editableData[`${record.id}${index}`] as PlanDeviceEntity)">
                    {{ tag }}
                  </a-tag>
                </template>
                <a-tag
                  class=" bg-white border-dashed cursor-pointer"
                  @click="handleAddParams(editableData[`${record.id}${index}`] as PlanDeviceEntity)"
                >
                  <PlusOutlined />
                </a-tag>
              </div>
              <!-- 其他的 -->
              <a-input
                v-else-if="editableData[`${record.id}${index}`]"
                v-model:value="editableData[`${record.id}${index}`][column.dataIndex as string]"
                style="margin: -5px 0"
              />
              <template v-else>
                {{ text }}
              </template>
            </div>
          </template>
          <template v-if="column.dataIndex === 'operation' && !isDetail">
            <a-space v-if="editableData[`${record.id}${index}`]" size="small">
              <a-button type="link" size="small" @click="save(record.id, index)">
                保存
              </a-button>
              <a-button type="link" size="small" @click="cancel(`${record.id}${index}`)">
                取消
              </a-button>
            </a-space>
            <a-space v-else size="small">
              <a-button type="link" size="small" @click="edit(record.id, index)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleDelete(index)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-space>
    <DeviceSelector
      v-model:show="showDeviceSelector"
      multiple
      @confirm="handleSelectDevice($event)"
    />
    <PlanModal
      v-model:show="showPlanModal"
      @confirm="handleSelectPlanDevice($event)"
    />
    <ParamsSelector
      v-model:show="showParamsSelector"
      multiple
      :checked-ids="checkedParamsIds"
      :device-id="paramsSelectorDeviceId"
      @confirm="handleParamsSelectorConfirm"
    />
  </a-modal>
</template>

<script lang="ts" setup>
import { type FormInstance, Modal, message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { UnwrapRef } from 'vue'
import { cloneDeep } from '@unovis/ts'
import { PlusOutlined } from '@ant-design/icons-vue'
import { type CheckSendEntity, CheckSendStatus, CheckSendStatusDict, addColumns } from '..'
import { addCheckSend, getCheckSendDetail, getCheckSendDetailDeviceList, getParamsByDeviceId } from '../api'
import PlanModal from './PlanModal.vue'
import type { PlanDeviceEntity } from './plan'
import DeviceSelector from '~/components/DeviceSelector.vue'
import type { IDeviceEntity } from '~/interface/IDeviceEntity'
import type { IParamsEntity } from '~/interface/IParamsEntity'

const props = defineProps({
  /**
   * # 是否展示弹窗
   */
  show: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<CheckSendEntity>,
    default: () => ({} as CheckSendEntity),
  },
  /**
   * # 是否为详情展示
   */
  isDetail: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
}>()

const internalOpen = ref(props.show)

const showDeviceSelector = ref(false)

const showParamsSelector = ref(false)

const paramsSelectorDeviceId = ref('')

const showPlanModal = ref(false)

const formRef = ref<FormInstance>()

const loading = ref(false)

const dataSource = ref([] as any)

const checkedParamsIds = ref([] as string[])

const editableData: UnwrapRef<Record<string, Record<string, any>>> = reactive({})

/** 当前正在执行添加设备参数的设备明细行数据 */
const currentEditDeviceDetail = ref({} as PlanDeviceEntity)

const formState = ref({
  ...props.data,
} as unknown as any)

watch(() => props.show, (val) => {
  internalOpen.value = val
  if (val) {
    init()
  }
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

const rules: Record<string, Rule[]> = {
  batchNumber: [
    { max: 200, message: '最多200个字符', trigger: 'change' },
  ],
  unit: [
    { max: 200, message: '最多200个字符', trigger: 'change' },
  ],
  remark: [
    { max: 200, message: '最多200个字符', trigger: 'change' },
  ],
}

/**
 * # 选择设备
 */
function handleSelectDevice(data: IDeviceEntity[]) {
  const addDatas = data.map(async (item: IDeviceEntity) => {
    const { data } = await getParamsByDeviceId(item.id)
    return {
      id: item.id,
      equipmentId: item.id,
      equipmentSn: item.equipmentSn,
      name: item.name,
      standard: item.standard,
      departName: item.departName,
      checkItemName: data.rows?.length ? data.rows.map((item: any) => item.name).join(',') : '',
      checkItemId: data.rows?.length ? data.rows.map((item: any) => item.id).join(',') : '',
      checkItemArr: data.rows?.length ? data.rows : [],
      checkReference: '',
      testSpecifications: '',
      remark: item.remark,
    }
  })
  Promise.all(addDatas).then((res) => {
    dataSource.value.push(...res)
    showDeviceSelector.value = false
  })
  // dataSource.value.push(...addDatas)
}

/**
 * 引用送检计划设备
 */
function handleSelectPlanDevice(data: PlanDeviceEntity[]) {
  const addDatas = data.map(async (item) => {
    const { data } = await getParamsByDeviceId(item.equipmentId)
    return {
      id: item.id,
      equipmentId: item.equipmentId,
      equipmentSn: item.equipmentSn,
      name: item.name,
      standard: item.standard,
      departName: item.departName,
      checkItemName: data.rows?.length ? data.rows.map((item: any) => item.name).join(',') : '',
      checkItemId: data.rows?.length ? data.rows.map((item: any) => item.id).join(',') : '',
      checkItemArr: data.rows?.length ? data.rows : [],
      checkReference: item.checkReference,
      testSpecifications: item.testSpecifications,
      remark: item.remark,
    }
  })
  Promise.all(addDatas).then((res) => {
    dataSource.value.push(...res)
    showPlanModal.value = false
  })
}

/**
 * # 确认
 */
async function handleConfirm() {
  formRef.value?.validate().then(async () => {
    loading.value = true
    dataSource.value.forEach((item: any) => {
      delete item.checkItemArr
    })
    formState.value.sendDetailStr = JSON.stringify(dataSource.value)
    await addCheckSend(formState.value, loading)
    message.success('操作成功')
    loading.value = false
    internalOpen.value = false
    emits('confirm')
  })
}

/**
 * # 取消
 */
function handleCancel() {
  internalOpen.value = false
  formRef.value?.resetFields()
}

/**
 * # 删除设备明细
 */
function handleDelete(index: number) {
  Modal.confirm({
    title: '删除设备',
    content: '确定要删除选中的设备吗？',
    onOk: async () => {
      dataSource.value.splice(index, 1)
    },
  })
}

/**
 * # 编辑设备明细
 */
function edit(key: string, index: number) {
  editableData[`${key}${index}`] = cloneDeep(dataSource.value.filter((item: any) => key === item.id)[0])
}

/**
 * # 保存设备明细
 */
function save(key: string, index: number) {
  Object.assign(dataSource.value.filter((item: any) => key === item.id)[0], editableData[`${key}${index}`])
  delete editableData[`${key}${index}`]
}

/**
 * # 取消编辑设备明细
 */
function cancel(key: string) {
  delete editableData[key]
}

/**
 * # 删除项目/参数tag
 */
function handleClose(tagIndex: number, editData: PlanDeviceEntity) {
  // editData.checkItemName = editData.checkItemName.split(',').filter(item => item !== tag).join(',')
  const checkItemNameArr = editData.checkItemName.split(',')
  const checkItemIdArr = editData.checkItemId.split(',')
  checkItemNameArr.splice(tagIndex, 1)
  checkItemIdArr.splice(tagIndex, 1)
  editData.checkItemName = checkItemNameArr.join(',')
  editData.checkItemId = checkItemIdArr.join(',')
}

/**
 * # 确认选择参数
 */
function handleParamsSelectorConfirm(rows: IParamsEntity[]) {
  showParamsSelector.value = false
  // const oldCheckItemNameArr = currentEditDeviceDetail.value?.checkItemName ? currentEditDeviceDetail.value.checkItemName.split(',') : []
  // const oldCheckItemIdArr = currentEditDeviceDetail.value?.checkItemId ? currentEditDeviceDetail.value.checkItemId.split(',') : []
  currentEditDeviceDetail.value.checkItemName = rows.map(item => item.name).join(',')
  currentEditDeviceDetail.value.checkItemId = rows.map(item => item.id).join(',')
}

/**
 * # 添加参数
 */
function handleAddParams(row: PlanDeviceEntity) {
  currentEditDeviceDetail.value = row
  paramsSelectorDeviceId.value = row.equipmentId
  checkedParamsIds.value = row.checkItemId.split(',')
  showParamsSelector.value = true
}

/**
 * # 初始化
 */
async function init() {
  if (props.data?.id) {
    const { data } = await getCheckSendDetail(props.data.id)
    formState.value = data.obj
    formState.value.sendTime = AnyDateTimeHelper.format(data.obj.sendTime, EDateFormatType.YYYY_MM_DD)
    formState.value.planRetrieveTime = AnyDateTimeHelper.format(data.obj.planRetrieveTime, EDateFormatType.YYYY_MM_DD) || null
    const { data: deviceList } = await getCheckSendDetailDeviceList(props.data)
    dataSource.value = deviceList.rows
  }
  else {
    formState.value = {} as CheckSendEntity
    dataSource.value = []
  }
}
</script>
