<template>
  <HtModal
    v-model:open="visible"
    :title="param.id ? '编辑' : '新增'"
    width="400px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <IlisForm
      :key="initData.rentType"
      ref="ilisFormRef"
      :cols="1"
      :entity="ScreenTemplateEntity"
      :init-data="initData"
    >
    </IlisForm>
  </HtModal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import { BindType, ScreenRouter } from '../../configuration/index.ts'
import { addScreenTemplate, editScreenTemplate } from '../api.ts'
import { ScreenTemplateEntity } from '../ScreenTemplateEntity'

const props = defineProps<IDialogPropsParam<null, ScreenTemplateEntity>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref<ScreenTemplateEntity>(ScreenTemplateEntity.fromJSON(props.param || {}))

const ilisFormRef = ref<IlisFormExpose<ScreenTemplateEntity>>()

async function handleOk() {
  const formData = await ilisFormRef.value!.getFormData()
  loading.value = true
  let api
  if (props.param.id) {
    api = editScreenTemplate
  }
  else {
    // 新增时 默认访问路由、绑定类型、可配置（只会新增室内屏的，区别在于能否操作）
    api = addScreenTemplate
    formData.url = ScreenRouter.FunctionRoom2
    formData.bindType = BindType.LAB
    formData.configurable = true
  }
  await api(formData!).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
