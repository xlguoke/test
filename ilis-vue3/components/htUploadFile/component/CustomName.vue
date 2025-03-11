<template>
  <ht-modal
    v-model:open="visible"
    title="自定义名称"
    width="450px"
    @ok="onConfirm"
  >
    <div class="p-4">
      <a-form ref="formRef" :model="form">
        <a-form-item name="name" :rules="[{ required: true, validator: validateName }]">
          <a-space>
            <a-input
              v-model:value="form.name"
              :maxlength="20"
              allow-clear
              placeholder="请输入自定义名称"
              class="w-[350px]"
            />
            {{ fileType ? `.${fileType}` : '' }}
          </a-space>
        </a-form-item>
      </a-form>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

interface Param {
  name?: string
  fileType?: string
}

const props = defineProps<IDialogPropsParam<string, Param>>()

const visible = ref(true)
const formRef = ref()
const fileType = ref(props.param?.fileType)
const form = reactive({
  name: props.param?.name || '',
})

function validateName(_rule: any, value: string) {
  if (!value)
    return Promise.reject(new Error('请输入自定义名称'))

  const reg = /^[\u4E00-\u9FA5\w-]+$/
  if (!(reg.test(value)))
    return Promise.reject(new Error('名称只能包含汉字、字母、数字、下划线、中划线中的一种或多种'))

  return Promise.resolve()
}

async function onConfirm() {
  try {
    await formRef.value.validateFields()
    visible.value = false
    props.onConfirm(form.name)
  }
  catch (err) {
    console.error(err)
  }
}
</script>

<style>

</style>
