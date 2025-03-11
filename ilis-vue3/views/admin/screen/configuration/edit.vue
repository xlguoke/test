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
          <a-input
            v-model:value="formState.sn"
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
      <a-form-item name="type" label="屏幕类型">
        <a-select
          v-model:value="formState.type"
          style="width: 100%;"
          placeholder="请选择屏幕类型"
        >
          <a-select-option v-for="(item) in screentType" :key="item.id" :value="item.typename">
            {{ item.typename }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item name="screenUrl" label="屏幕模板">
        <a-select
          v-model:value="formState.screenUrl"
          placeholder="请选择屏幕模板"
          @change="selectedScreenTemplate"
        >
          <a-select-option v-for="d in screenList" :key="d.url" :url="d.url">
            {{ d.title }}
          </a-select-option>
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

    <DeviceSelector v-model:show="deviceVisible" multiple @confirm="selectEquipment" />
    <SelectedLaboratory v-model:open="labVisible" @ok="selectLaboratory" />
  </ht-modal>
</template>

<script setup lang='ts'>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { SelectValue } from 'ant-design-vue/es/select'
import { addScreenConfig, editScreenConfig } from './api'
import { BindType, type ScreenConfigEntity, type ScreenTemplate, type ScreenTypeEntity, screenBaseUrl, screenList } from '.'
import type { IDeviceEntity } from '~/interface/IDeviceEntity'
import { ILISHTTPError } from '~/types'
import DeviceSelector from '~/components/DeviceSelector.vue'
import { type LaboratoryList, SelectedLaboratory } from '~/components/selectedLaboratory'

const props = defineProps<{
  callback: () => void
  screentType: ScreenTypeEntity[]
}>()

const isOpen = ref(false)

const formRef = ref()

const formState = ref({} as ScreenConfigEntity)

const loading = ref(false)

const rules: Record<string, Rule[]> = {
  sn: [
    { required: true, message: '请输入', trigger: 'change' },
  ],
  name: [
    { required: true, message: '请输入', trigger: 'change' },
  ],
  type: [
    { required: true, message: '请选择', trigger: 'change' },
  ],
  screenUrl: [
    { required: true, message: '请选择', trigger: 'change' },
  ],
  businessName: [
    { required: true, message: '请选择', trigger: 'change' },
  ],
}

/**
 * 选择屏幕模板
 */
const screenTemplate = ref<ScreenTemplate>()
const isLab = computed(() => screenTemplate.value?.bindType === BindType.LAB)
function selectedScreenTemplate(val: SelectValue) {
  screenTemplate.value = screenList.find(d => d.url === val)
  formState.value.businessId = ''
  formState.value.businessName = ''
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

/**
 * 选择设备
 */
function selectEquipment(data: IDeviceEntity[]) {
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
  labVisible.value = false
}

/**
 * 展示弹窗（外部调用）
 * @param data
 */
function show(data?: ScreenConfigEntity) {
  screenTemplate.value = undefined
  formState.value = data ? initDatas({ ...data }) : { enabled: true } as ScreenConfigEntity
  isOpen.value = true
}

/**
 * 编辑时回显数据
 */
function initDatas(data: ScreenConfigEntity) {
  if (data.url) {
    const item = screenList.find((d) => {
      return data.url.includes(d.url)
    })
    if (item) {
      screenTemplate.value = item
      data.screenUrl = item.url
    }
  }
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
      if (form.bindType) {
        urlParam = `?${screenTemplate.value?.paramKey}=${form.businessId}`
      }
      form.url = `${screenBaseUrl}${screenTemplate.value?.url}${urlParam}`

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
