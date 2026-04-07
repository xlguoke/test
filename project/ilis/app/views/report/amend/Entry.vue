<template>
  <IlisContainer app-id="amend_application">
    <!-- 通用审核详情需要通过路由访问：/ilis2/report/amend/application/view.do?detail=detailPage&businessKey=297e85c296770d0601967adb090f007a -->
    <Detail v-if="showDetail" :id="dataId" :disabled="disabled" :un-selected-report="unSelectedReport" />
    <List v-else />
  </IlisContainer>
</template>

<script setup lang='ts'>
import Detail from './components/AddEdit.vue'
import List from './list.vue'

const showDetail = ref(false)
const dataId = ref('')
const urlParam = new URLSearchParams(location.search)
showDetail.value = urlParam.get('detail') === 'detailPage'
dataId.value = urlParam.get('businessKey') as string

// 临时方案，vue2页面调用路由访问详情
const disabled = ref(true)
const unSelectedReport = ref(false)
if (urlParam.get('undisabled')) {
  disabled.value = false
  unSelectedReport.value = true
}
</script>
