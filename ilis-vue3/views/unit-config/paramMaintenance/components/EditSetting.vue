<template>
  <a-modal
    v-model:open="open"
    title="设置"
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
      class="pt-2 max-h-[70vh] overflow-auto"
      :label-col="{ span: 10 }"
      :wrapper-col="{ span: 14 }"
    >
      <a-form-item label="是否需要养护">
        <a-radio-group v-model:value="formState.box">
          <a-radio :value="false">
            否
          </a-radio>
          <a-radio :value="true">
            是
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="formState.box" label="养护温度范围（℃）" name="boxTemMin">
        <a-flex gap="middle" align="center">
          <a-input-number v-model:value="formState.boxTemMin" :min="0" :precision="0" />
          —
          <a-input-number v-model:value="formState.boxTemMax" :min="0" :precision="0" />
        </a-flex>
      </a-form-item>
      <a-form-item v-if="formState.box" label="养护湿度范围（%RH）" name="boxHumMin">
        <a-flex gap="middle" align="center">
          <a-input-number v-model:value="formState.boxHumMin" :min="0" :precision="0" />
          —
          <a-input-number v-model:value="formState.boxHumMax" :min="0" :precision="0" />
        </a-flex>
      </a-form-item>
      <a-form-item label="试验对温湿度是否有要求">
        <a-radio-group v-model:value="formState.house">
          <a-radio :value="false">
            否
          </a-radio>
          <a-radio :value="true">
            是
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="formState.house" label="试验温度范围（℃）" name="houseTemMin">
        <a-flex gap="middle" align="center">
          <a-input-number v-model:value="formState.houseTemMin" :min="0" :precision="0" />
          —
          <a-input-number v-model:value="formState.houseTemMax" :min="0" :precision="0" />
        </a-flex>
      </a-form-item>
      <a-form-item v-if="formState.house" label="试验湿度范围（%RH）" name="houseHumMin">
        <a-flex gap="middle" align="center">
          <a-input-number v-model:value="formState.houseHumMin" :min="0" :precision="0" />
          —
          <a-input-number v-model:value="formState.houseHumMax" :min="0" :precision="0" />
        </a-flex>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="onSubmit">
        保存
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import {
  SaveParamHumitureEntity,
  saveParamHumiture,
} from '~/views/unit-config/paramMaintenance/api/saveParamHumiture.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object as PropType<SaveParamHumitureEntity>,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const open = computed(() => props.open)

const formRef = ref()

const submitLoading = ref(false)

const formState = ref(new SaveParamHumitureEntity())

const rules: Record<string, Rule[]> = {
  boxTemMin: [{ required: true, validator: () => {
    if (!isDefine(formState.value.boxTemMin) || !isDefine(formState.value.boxTemMax)) {
      return Promise.reject(new Error('请输入养护温度范围！'))
    }
    return Promise.resolve()
  } }],
  boxHumMin: [{ required: true, validator: () => {
    if (!isDefine(formState.value.boxHumMin) || !isDefine(formState.value.boxHumMax)) {
      return Promise.reject(new Error('请输入养护湿度范围！'))
    }
    return Promise.resolve()
  } }],
  houseTemMin: [{ required: true, validator: () => {
    if (!isDefine(formState.value.houseTemMin) || !isDefine(formState.value.houseTemMax)) {
      return Promise.reject(new Error('请输入养护温度范围！'))
    }
    return Promise.resolve()
  } }],
  houseHumMin: [{ required: true, validator: () => {
    if (!isDefine(formState.value.houseHumMin) || !isDefine(formState.value.houseHumMax)) {
      return Promise.reject(new Error('请输入养护湿度范围！'))
    }
    return Promise.resolve()
  } }],
}

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    formState.value = props.dataSource
  }
})

function isDefine(val) {
  return val !== null && val !== undefined
}

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    if (formState.value.box) {
      if (formState.value.boxTemMax < formState.value.boxTemMin) {
        message.warn('养护温度范围最大温度不能低于最小温度！')
        return
      }

      if (formState.value.boxHumMax < formState.value.boxHumMin) {
        message.warn('养护湿度范围最大湿度不能低于最小湿度！')
        return
      }
    }

    if (formState.value.house) {
      if (formState.value.houseTemMax < formState.value.houseTemMin) {
        message.warn('试验温度范围最大温度不能低于最小温度！')
        return
      }

      if (formState.value.houseHumMax < formState.value.houseHumMin) {
        message.warn('试验湿度范围最大湿度不能低于最小湿度！')
        return
      }
    }

    submitLoading.value = true
    await saveParamHumiture(formState.value).finally(() => {
      submitLoading.value = false
    })
    message.success('保存成功')
    emits('onSave')
    cancel()
  })
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  formRef.value.resetFields()
  formState.value = new SaveParamHumitureEntity()
}
</script>
