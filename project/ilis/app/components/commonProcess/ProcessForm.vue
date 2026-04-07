<template>
  <a-form
    ref="formRef"
    v-bind="$attrs"
    :model="formState"
    :rules="rules"
    :disabled="disabled"
    :label-col="labelCol"
  >
    <slot name="formBefore" />
    <a-form-item name="presetAuditers" label="审核人员">
      <ProcessPerson
        v-model="formState.presetAuditers"
        :process-type="processType"
        :disabled="disabled"
        :disabled-audit-nodes="disabledAuditNodes"
        :default-auditers="defaultAuditers"
      />
    </a-form-item>
    <a-form-item
      v-for="item in formLayoutData"
      :key="item.id"
      :name="['formPropertyJson', item.id]"
    >
      <template #label>
        <span style="max-width: calc(100% - 20px);">
          <BaseText>{{ item.name }}</BaseText>
        </span>
      </template>
      <ProcessFormInput
        v-model="formState.formPropertyJson[item.id]"
        :item="item"
        :default-copyto="defaultCopyto"
        @change="changeFormInput"
      />
    </a-form-item>
    <a-form-item v-if="!hideRemark" name="remark" label="备注">
      <a-textarea v-model:value="formState.remark" :rows="3" />
    </a-form-item>
    <slot name="formAfter" />
  </a-form>
</template>

<script lang="ts" setup>
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import type { CopyToPerson, IProcessFormConfig, IProcessUserNode, ProcessType } from '.'
import type { ChangeParam } from './ProcessFormInput.vue'
import type { IDefaultAuditers } from './ProcessPerson.vue'
import { getProcessForm } from './api'
import ProcessFormInput from './ProcessFormInput.vue'
import ProcessPerson from './ProcessPerson.vue'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    processType: ProcessType
    hideRemark?: boolean
    labelCol?: object
    /** 默认抄送人 */
    defaultCopyto?: CopyToPerson[]
    /** # 默认指定节点人员 */
    defaultAuditers?: Record<string, IDefaultAuditers[]>
    /** # 禁用审核节点 */
    disabledAuditNodes?: string[]
  }>(),
  {
    disabled: false,
    hideRemark: false,
    labelCol: () => ({ style: { width: '74px' } }),
  },
)

const inputRef = ref<any>()

const formRef = ref<FormExpose>()

const formState = ref({
  presetAuditers: [] as IProcessUserNode[],
  formPropertyJson: {} as Record<string, any>,
  remark: '',
} as Record<string, any>)

const formLayoutData = ref([] as IProcessFormConfig[])

const rules = computed(() => {
  const requiredItem = formLayoutData.value.filter(item => item.required)
  return {
    formPropertyJson: requiredItem.reduce((acc, cur) => {
      acc[cur.id] = [{ required: true, message: `${cur.name}为必选项!`, trigger: 'blur' }]
      return acc
    }, {} as Record<string, any>),
  }
})

const copyToPersons = ref<CopyToPerson[]>([])
function changeFormInput(obj: ChangeParam) {
  if (obj.item.id === 'copyTo') {
    copyToPersons.value = obj.data.map((it: any) => ({
      id: it.id,
      account: it.account,
      name: it.name,
    }))
  }
}

/**
 * # 获取审批表单配置
 */
async function getFormConfig() {
  const { data } = await getProcessForm(props.processType)
  formLayoutData.value = data
}

/**
 * # 初始化
 */
function init() {
  // getUserConfig()
  getFormConfig()
}

init()

/**
 * # 获取流程表单数据
 * @returns Promise<Record<string, any>>
 * @example
 * const data = await getProcessFormData()
 */
async function getProcessFormData() {
  return new Promise((resolve, reject) => {
    formRef.value?.validate().then(async (res) => {
    // TODO: 提交数据
      resolve({ ...res, copyToPersons: copyToPersons.value })
    }).catch((err) => {
      reject(err)
    })
  })
}

onMounted(() => {
  // 找到inputRef下的input元素，设置readonly属性为true
  inputRef.value?.$el?.firstElementChild?.firstElementChild?.setAttribute('readonly', 'true')
})

defineExpose({
  getProcessFormData,
})
</script>

<style scoped>
:deep(.ant-form-item .ant-form-item-label >label){
  width: 100%;
  justify-content: flex-end;
}
</style>
