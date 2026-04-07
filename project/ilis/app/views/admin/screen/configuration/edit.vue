<template>
  <ht-modal
    v-model:open="isOpen"
    :title="formState.id ? '编辑' : '新增'"
    :loading="loading"
    width="600px"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
    >
      <a-form-item name="sn" label="屏幕编号">
        <a-flex align="center" :gap="8">
          <a-auto-complete
            v-model:value="formState.sn"
            :options="snOptions"
            placeholder="请输入屏幕编号"
            allow-clear
          />
          <a-tooltip>
            <template #title>
              请安装屏幕智慧屏APP并启动APP获取屏幕编号
            </template>
            <QuestionCircleOutlined style="color: orange;font-size: 14px;" />
          </a-tooltip>
        </a-flex>
      </a-form-item>

      <a-form-item name="name" label="屏幕名称">
        <a-input
          v-model:value="formState.name"
          placeholder="请输入屏幕名称"
          allow-clear
        />
      </a-form-item>
      <!-- <a-form-item name="type" label="屏幕类型">
        <a-select
          v-model:value="formState.systemType"
          style="width: 100%;"
          placeholder="请选择屏幕类型"
        >
          <a-select-option v-for="(item) in ScreenTemplateTypeDict" :key="item.key" :value="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item> -->
      <a-form-item name="templateId" label="屏幕模板">
        <a-select
          v-model:value="formState.templateId"
          placeholder="请选择屏幕模板"
          show-search
          :filter-option="filterOption"
          :options="AnyDataTransformHelper.recordListToOptions(templateList, ['name', 'id'])"
          @change="selectedScreenTemplate"
        >
        </a-select>
      </a-form-item>

      <template v-if="screenTemplate?.bindType">
        <a-form-item name="businessName" :label="`${isLab ? '功能室' : '设备'}`">
          <a-flex gap="8">
            <a-input
              v-model:value="formState.businessName"
              readonly
              :placeholder="`请选择${isLab ? '功能室' : '设备'}`"
              @click="chooseBindObject"
            />
            <a-button type="primary" @click="chooseBindObject">
              选择
            </a-button>
          </a-flex>
        </a-form-item>
      </template>

      <a-form-item name="enabled" label="屏幕状态">
        <a-radio-group v-model:value="formState.enabled">
          <a-radio :value="true">
            启用
          </a-radio>
          <a-radio :value="false">
            停用
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item name="frequencyRefresh" label="刷新频率">
        <a-input-number
          v-model:value="formState.frequencyRefresh"
          placeholder="请输入刷新频率"
          allow-clear
          :min="0"
          :default-value="0"
          style="width: 100%;"
        >
          <template #addonAfter>
            s
          </template>
        </a-input-number>
      </a-form-item>
      <a-form-item name="frequencyCarousel" label="轮播频率">
        <a-input-number
          v-model:value="formState.frequencyCarousel"
          placeholder="请输入轮播频率"
          allow-clear
          :min="0"
          :default-value="0"
          style="width: 100%;"
        >
          <template #addonAfter>
            s
          </template>
        </a-input-number>
      </a-form-item>
    </a-form>

    <DeviceSelector
      v-model:show="deviceVisible"
      multiple
      is-cache-select
      :checked-ids="formState.businessId?.split(',')?.filter(i => i) ?? []"
      @confirm="selectEquipment"
    />
    <SelectedLaboratory v-model:open="labVisible" @ok="selectLaboratory" />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { Rule } from 'ant-design-vue/es/form'
import type { SelectValue } from 'ant-design-vue/es/select'
import type { ScreenConfigEntity } from '.'
import type { ScreenTemplateEntity } from '../templateManagement/ScreenTemplateEntity'
import type { LaboratoryList } from '~/components/selectedLaboratory'
import type { IOption } from '~/interface/IOption.ts'
import type { DeviceEntity } from '~/views/equipment/DeviceEntity'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import DeviceSelector from '~/components/DeviceSelector.vue'
import { SelectedLaboratory } from '~/components/selectedLaboratory'
import { ILISHTTPError } from '~/types'
import { BindType, screenBaseUrl, screenList } from '.'
import { getScreenTemplateList } from '../templateManagement/api'
import { ScreenTemplateType } from '../templateManagement/ScreenTemplateEntity'
import { addScreenConfig, editScreenConfig, getUnused } from './api'

const props = defineProps<{
  callback: () => void
}>()

const isOpen = ref(false)

const formRef = ref()

const formState = ref({} as ScreenConfigEntity)

const loading = ref(false)

const templateList = ref<ScreenTemplateEntity[]>([])

const rules: Record<string, Rule[]> = {
  sn: [
    { required: true, message: '请输入', trigger: 'change' },
  ],
  name: [
    { required: true, message: '请输入', trigger: 'change' },
  ],
  systemType: [
    { required: true, message: '请选择', trigger: 'change' },
  ],
  templateId: [
    { required: true, message: '请选择', trigger: 'change' },
  ],
  businessName: [
    { required: true, message: '请选择', trigger: 'change' },
  ],
}

/**
 * 选择编号下拉
 */
const snOptions = ref<IOption[]>()

async function getSnOptions() {
  const res = await getUnused()
  snOptions.value = res.data.map(i => ({
    label: i.sn,
    value: i.sn,
  }))
}

/**
 * 选择屏幕模板
 */
const screenTemplate = ref<ScreenTemplateEntity>()
const isLab = computed(() => screenTemplate.value?.bindType === BindType.LAB)
function selectedScreenTemplate(val: SelectValue) {
  screenTemplate.value = templateList.value.find(d => d.id === val)
  formState.value.businessId = ''
  formState.value.businessName = ''
}

async function getTempList() {
  const { data } = await getScreenTemplateList({ size: 9999 })
  templateList.value = data?.rows || [] as ScreenTemplateEntity[]
}

/**
 * 选择绑定对象
 */
const deviceVisible = ref(false)
const labVisible = ref(false)
function chooseBindObject() {
  if (isLab.value) {
    labVisible.value = true
  }
  else {
    deviceVisible.value = true
  }
}
function filterOption(input: string, option: any) {
  return option.label.toLowerCase().includes(input.trim().toLowerCase())
}

/**
 * 选择设备
 */
function selectEquipment(data: DeviceEntity[]) {
  if (data.length > 30) {
    Modal.warning({
      title: '提示',
      content: '最多只支持设置30个设备，请重新选择',
      okText: '确定',
    })
    return
  }
  formState.value.businessId = data.map(d => d.id).join(',')
  formState.value.businessName = data.map(d => d.name).join(',')
  deviceVisible.value = false
}

/**
 * 选择功能室
 */
function selectLaboratory(data: LaboratoryList[]) {
  formState.value.businessId = data.map(d => d.id).join(',')
  formState.value.businessName = data.map(d => d.name).join(',')
  formState.value.name = data.map(d => d.name).join(',')
  labVisible.value = false
}

/**
 * 展示弹窗（外部调用）
 * @param data
 */
async function show(data?: ScreenConfigEntity) {
  getSnOptions()
  await getTempList()
  screenTemplate.value = undefined
  formState.value = data ? initDatas({ ...data }) : { enabled: true } as ScreenConfigEntity
  isOpen.value = true
}

/**
 * 编辑时回显数据
 */
function initDatas(data: ScreenConfigEntity) {
  screenTemplate.value = templateList.value.find(item => item.id === data.templateId)
  data.screenUrl = screenTemplate.value?.url || ''
  return data
}

/**
 * 提交
 */
function handleConfirm() {
  formRef.value.validate().then(async () => {
    // loading.value = true
    try {
      const form: any = { ...formState.value }
      let urlParam = ''
      form.bindType = screenTemplate.value?.bindType || undefined
      const paramKey = screenList.find(i => i.url === screenTemplate.value?.url)?.paramKey
      const readOnly = screenTemplate.value?.systemType === ScreenTemplateType.DISPLAY_SYSTEM ? '1' : '0'
      if (form.bindType) {
        urlParam = `?${paramKey}=${form.businessId}&readOnly=${readOnly}`
      }
      form.url = `${screenBaseUrl}${screenTemplate.value?.url}${urlParam}`
      form.templateName = screenTemplate.value?.name

      if (form.id) {
        await editScreenConfig(form)
        message.success('编辑成功')
      }
      else {
        await addScreenConfig(form)
        message.success('新增成功')
      }
      isOpen.value = false
      loading.value = false
      // 重置表单
      formRef.value.resetFields()
      // 回调
      if (props.callback) {
        props.callback()
      }
    }
    catch (error: any) {
      loading.value = false
      if (error instanceof ILISHTTPError) {
        message.error(error.message)
      }
      else {
        throw error
      }
    }
  })
}

function handleCancel() {
  isOpen.value = false
  // 重置校验状态
  formRef.value.clearValidate()
}

defineExpose({
  show,
})
</script>

<style>

</style>
