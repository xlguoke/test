<template>
  <AppProvider>
    <div class=" px-3">
      <IlisForm
        ref="formRef"
        disabled
        :entity="TrainPlanEntity"
        :cols="1"
        :init-data="detail"
      ></ILisForm>
      <!-- 自定义属性部分 -->
      <IlisCustomPropertiesForm
        v-if="customizeValues?.length"
        ref="customizeFormRef"
        disabled
        is-detail
        customize-type="trainPlan"
        :default-value="customizeValues"
      >
      </IlisCustomPropertiesForm>
    </div>
  </AppProvider>
</template>

<script lang="ts" setup>
import { TrainPlanEntity } from '../TrainPlanEntity'
import { getTrainPlanDetail } from '../api'
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'
import AppProvider from '~/components/AppProvider.vue'
import { IlisCustomPropertiesForm, IlisForm } from '~/components/ilisComponent'

const props = defineProps<{
  id?: string
}>()

const formRef = ref()

const customizeFormRef = ref()

const detail = ref(new TrainPlanEntity())

const customizeValues = ref<ICustomProperties[]>([])

// 从url获取指定参数
function getQueryVariable(variable: string) {
  const query = window.location.search.substring(1)
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] === variable) {
      return decodeURI(pair[1])
    }
  }
  return ('')
}

async function getDetail(id: string) {
  const { data } = await getTrainPlanDetail(id)
  detail.value = TrainPlanEntity.fromJSON(data.obj)
  customizeValues.value = data?.attributes?.customizeValues
}

// getQueryVariable('businessKey') 这种是给vue2、jsp页面调用的
const id = props.id || getQueryVariable('businessKey')
if (id) {
  getDetail(id)
}
</script>
