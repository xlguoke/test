<template>
  <VanNavBar
    :title="title"
    :fixed="true"
    clickable
    placeholder
    :left-arrow="true"
    @click-left="onBack"
  />
  <div p16 pb100>
    <van-cell-group inset>
      <van-form class="mb-12" @submit="onSubmit">
        <InnerForm ref="innerFormRef" :init-data="query"></InnerForm>
        <div class="fixed-box flex-x gap12">
          <van-button size="small" block type="primary" native-type="submit">
            提交
          </van-button>
        </div>
      </van-form>
    </van-cell-group>
  </div>
</template>

<script lang="ts" setup>
import { createHumitureRes, editHumitureRes } from '.'
import type { IPreTask } from '../preTask'
import { closeToast, showLoadingToast, showSuccessToast } from 'vant'
import InnerForm from './innerForm.vue'

const router = useRouter()
const route = useRoute()
const title = ref('新增预约任务')

const innerFormRef = ref()

const query = route.query as unknown as IPreTask

if (query.id) {
  title.value = '编辑预约任务'
}

async function onSubmit() {
  const form = await innerFormRef.value?.getFormData()
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  if (query.id) {
    await editHumitureRes({ ...form, id: query.id as string }).finally(() => {
      closeToast()
    })
  }
  else {
    await createHumitureRes(form).finally(() => {
      closeToast()
    })
  }
  showSuccessToast('操作成功')
  router.back()
}

function onBack() {
  if (window.history.state.back)
    history.back()
  else
    router.replace('/')
}
</script>

<route lang="json">
  {
    "name": "addOrEditPreTask",
    "meta": {
      "hiddenNavBar": true
    }
  }
</route>
