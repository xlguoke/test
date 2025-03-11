<template>
  <a-modal
    v-model:open="open"
    title="定时任务"
    width="460px"
    :mask-closable="false"
    destroy-on-close
    :confirm-loading="submitLoading"
    centered
    @cancel="cancel"
  >
    <a-form
      ref="formRef"
      :rules="rules"
      :model="formState"
      class="pt-4 max-h-[70vh] overflow-auto"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="定时类型">
        <a-radio-group v-model:value="formState.laboratoryIotEqType" :disabled="isDetail">
          <a-radio
            v-for="item in LaboratoryIotEqTypeDict"
            :key="item.key"
            :value="item.key"
            :disabled="item.label === '调养箱'"
          >
            {{ item.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="功能室" name="laboratoryId" :rules="[{ required: true, message: '请选择功能室！' }]">
        <a-select
          v-model:value="formState.laboratoryId"
          :options="laboratoryOptions"
          placeholder="请选择功能室"
          :disabled="isDetail"
          @change="onSelectLab()"
        />
      </a-form-item>
      <a-form-item label="重复类型" name="restType" :rules="[{ required: true, message: '请选择重复类型！' }]">
        <a-select v-model:value="formState.restType" :disabled="isDetail">
          <a-select-option v-for="item in RestTypeDict" :key="item.key" :value="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        v-if="formState.restType === RestType.自定义"
        name="customValue"
        label="自定义重复"
        :rules="[{ required: true, message: '请选择自定义重复！' }]"
      >
        <a-tree-select
          v-model:value="formState.customValue"
          :tree-data="customDayTreeData"
          tree-checkable
          allow-clear
          tree-default-expand-all
          placeholder="请选择"
          :disabled="isDetail"
        />
      </a-form-item>
      <a-form-item label="时间" name="startDate" :rules="[{ required: true, message: '请选择时间！' }]">
        <a-date-picker
          v-model:value="formState.startDate"
          show-time
          class="w-full"
          value-format="YYYY-MM-DD HH:mm:ss"
          :disabled="isDetail"
          placeholder="请选择时间"
        />
      </a-form-item>
      <a-form-item label="控制类型" name="customType" :rules="[{ required: true, message: '请选择控制类型！' }]">
        <a-radio-group v-model:value="formState.customType" :disabled="isDetail">
          <a-radio v-for="item in CustomTypeDict" :key="item.key" :value="item.key">
            {{ item.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="formState.customType === CustomType.开启" label="温度（℃）" name="tem">
        <a-input-number v-model:value="formState.tem" placeholder="最小温度" :disabled="isDetail" />
      </a-form-item>
      <a-form-item v-if="formState.customType === CustomType.设置温湿度" label="目标温度（℃）" name="tem">
        <a-input-number
          v-model:value="formState.tem"
          placeholder="最小温度"
          :min="selectedLab.minConTem"
          :max="selectedLab.maxConTem"
          :disabled="isDetail"
        />
        ~
        <a-input-number
          v-model:value="formState.maxTem"
          placeholder="最大温度"
          :min="selectedLab.minConTem"
          :max="selectedLab.maxConTem"
          :disabled="isDetail"
        />
      </a-form-item>
      <a-form-item v-if="formState.customType === CustomType.设置温湿度" label="目标湿度（%RH）" name="hum">
        <a-input-number
          v-model:value="formState.hum"
          placeholder="最小湿度"
          :min="selectedLab.minConHum"
          :max="selectedLab.maxConHum"
          :disabled="isDetail"
        />
        ~
        <a-input-number
          v-model:value="formState.maxHum"
          placeholder="最大湿度"
          :min="selectedLab.minConHum"
          :max="selectedLab.maxConHum"
          :disabled="isDetail"
        />
      </a-form-item>
      <a-form-item label="启用状态" name="status">
        <a-switch
          v-model:checked="formState.status"
          :checked-value="StatusType.开启"
          :un-checked-value="StatusType.关闭"
          :disabled="isDetail"
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="cancel">
        {{ isDetail ? "关闭" : "取消" }}
      </a-button>
      <a-button
        v-if="!isDetail"
        type="primary"
        :loading="submitLoading"
        @click="onSubmit"
      >
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import type { PropType } from 'vue'
import dayjs from 'dayjs'
import type { Rule } from 'ant-design-vue/es/form'
import { CreateTimerSettingEntity, createHumitureTimer } from '../api/createHumitureTimer.ts'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import {
  CustomType,
  CustomTypeDict,
  LaboratoryIotEqTypeDict,
  RestType,
  RestTypeDict,
  StatusType,
  customDayTreeData,
} from '~/views/common/humiture/timer'
import { getLocalUserInfo } from '~/utils/getLocalUserInfo.ts'
import { editHumitureTimer } from '~/views/common/humiture/timer/api/editHumitureTimer.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  defaultLabId: {
    type: String,
    default: null,
  },
  dataSource: {
    type: Object as PropType<CreateTimerSettingEntity>,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const { laboratoryOptions } = useLaboratoryOptionsHook({ isIotLab: 1 })

const localUserInfo = getLocalUserInfo()

const open = computed(() => props.open)

const formRef = ref()

const submitLoading = ref(false)

const isDetail = computed(() => !!(props.dataSource && !props.dataSource.id))

const isEdit = computed(() => !!(props.dataSource && props.dataSource.id))

const selectedLab = ref({})

const formState = ref(new CreateTimerSettingEntity())
formState.value.createName = localUserInfo?.realName || ''

const rules: Record<string, Rule[]> = {
  tem: [{ required: true, validator: () => {
    if (formState.value.customType === CustomType.设置温湿度) {
      if (!isDefined(formState.value.tem) || !isDefined(formState.value.maxTem)) {
        return Promise.reject(new Error('请输入目标温度！'))
      }
    }

    if (formState.value.customType === CustomType.开启) {
      if (!isDefined(formState.value.tem)) {
        return Promise.reject(new Error('请输入目标温度！'))
      }
    }

    return Promise.resolve()
  } }],
  hum: [{ required: true, validator: () => {
    if (!isDefined(formState.value.hum) || !isDefined(formState.value.maxHum)) {
      return Promise.reject(new Error('请输入目标湿度！'))
    }
    return Promise.resolve()
  } }],
}

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    onOpen()
  }
})

function onOpen() {
  const defaultData = props.dataSource
  if (defaultData) {
    formState.value = defaultData
    formState.value.startDate = dayjs(formState.value.startDate).format('YYYY-MM-DD HH:mm:ss')
    formState.value.customValue = defaultData.customValue ? defaultData.customValue.split(',') : []
    onSelectLab(true)
  }
  else {
    formState.value = new CreateTimerSettingEntity()
    formState.value.createName = localUserInfo?.realName || ''

    if (props.defaultLabId) {
      formState.value.laboratoryId = props.defaultLabId
      onSelectLab()
    }
  }
}

function onSelectLab(isInit = false) {
  const item = laboratoryOptions.value.find(i => i.value === formState.value.laboratoryId)
  selectedLab.value = item || {}

  if (isInit === false && item) {
    formState.value.tem = item.minTemperature
    formState.value.maxTem = item.maxTemperature
    formState.value.hum = item.minHumidity
    formState.value.maxHum = item.maxHumidity

    if (formRef.value) {
      formRef.value.validate(['tem', 'maxTem', 'hum', 'maxHum'])
    }
  }
}

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    if (formState.value.customType === CustomType.设置温湿度) {
      if (formState.value.tem > formState.value.maxTem) {
        Modal.info({
          title: '提示',
          content: '目标温度，最小温度不能大于最大温度！',
        })
        return
      }

      if (formState.value.hum > formState.value.maxHum) {
        Modal.info({
          title: '提示',
          content: '目标湿度，最小湿度不能大于最大湿度！',
        })
        return
      }
    }

    if (formState.value.customType === CustomType.开启 || formState.value.customType === CustomType.关闭) {
      if (formState.value.customType === CustomType.关闭) {
        formState.value.tem = undefined
      }
      formState.value.maxTem = undefined
      formState.value.hum = undefined
      formState.value.maxHum = undefined
    }

    submitLoading.value = true

    if (isEdit.value) {
      await editHumitureTimer(props.dataSource.id, formState.value).finally(() => {
        submitLoading.value = false
      })
    }
    else {
      await createHumitureTimer(formState.value).finally(() => {
        submitLoading.value = false
      })
    }

    message.success('保存成功')
    emits('onSave')
    cancel()
  })
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  formRef.value.resetFields()
  formState.value = new CreateTimerSettingEntity()
  formState.value.createName = localUserInfo?.realName || ''
}
</script>
