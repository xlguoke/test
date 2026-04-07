<template>
  <ht-modal
    v-model:open="visible"
    title="密码重置"
    width="600px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="onSubmit"
  >
    <div class="pt-8 min-h-[300px]">
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="密码" name="password">
          <a-input-password v-model:value="form.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="确认密码" name="repassword">
          <a-input-password v-model:value="form.repassword" placeholder="请确认密码" />
        </a-form-item>
      </a-form>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { RuleObject } from 'ant-design-vue/es/form'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useValidPassword } from '~/hooks/useValidPassword'
import { resetUserPwdApi } from '../api'

interface PropParam {
  userId: string
}
const props = defineProps<IDialogPropsParam<null, PropParam>>()

const visible = ref(true)
const form = ref({
  password: '',
  repassword: '',
})
const formRef = ref()
const { validPassword, validRePassword } = useValidPassword()

const rules: { [key: string]: RuleObject[] } = {
  password: [
    { required: true, message: '请输入密码', trigger: 'change' },
    { validator: (_rule, v: string) => validPassword(v), trigger: 'change' },
  ],
  repassword: [
    { required: true, message: '请输入确认密码', trigger: 'change' },
    { validator: (_rule, v) => validRePassword(v, form.value.password), trigger: 'change' },
  ],
}

const loading = ref(false)
async function onSubmit() {
  try {
    await formRef.value.validateFields()
    loading.value = true
    const { data } = await resetUserPwdApi({
      id: props.param.userId,
      password: form.value.password,
    })
    message.success(data.msg || '重置成功')
    visible.value = false
    props.onConfirm(null)
  }
  catch (err) {
    loading.value = false
    console.error(err)
  }
}
</script>

<style lang="less" scoped>

</style>
