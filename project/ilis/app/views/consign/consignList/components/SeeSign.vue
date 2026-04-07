<template>
  <ht-modal
    v-model:open="visible"
    title="查看签名"
    hide-confirm
    :loading="loading"
  >
    <div class="px-4">
      <div class="pt-3">
        委托人签名：
      </div>
      <p v-for="(d, i) in signUrl.CONSIGN" :key="i" class="img-box">
        <img v-if="d" :src="d" alt="" />
      </p>
      <p v-if="signUrl.CONSIGN.length === 0" class="img-box"></p>

      <div class="pt-3">
        建设单位见证人签名：
      </div>
      <p v-for="(d, i) in signUrl.BUILD" :key="i" class="img-box">
        <img v-if="d" :src="d" alt="" />
      </p>
      <p v-if="signUrl.BUILD.length === 0" class="img-box"></p>

      <div class="pt-3">
        监理单位见证人签名：
      </div>
      <p v-for="(d, i) in signUrl.SUPERVISING" :key="i" class="img-box">
        <img v-if="d" :src="d" alt="" />
      </p>
      <p v-if="signUrl.SUPERVISING.length === 0" class="img-box"></p>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { getSignatureApi } from '../api'

const props = defineProps<IDialogPropsParam<null, { consignId: string }>>()
const visible = ref(true)
const loading = ref(false)
const signUrl: any = ref({
  CONSIGN: [],
  BUILD: [],
  SUPERVISING: [],
})

getData()

async function getData() {
  try {
    const { data } = await getSignatureApi(props.param.consignId)
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      signUrl.value[d.signType].push(d.signUrl)
    }
  }
  catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.img-box{
  margin: 4px 0;
  padding: 8px;
  height: 120px;
  border: 1px solid #ccc;
}

.img-box img{
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
