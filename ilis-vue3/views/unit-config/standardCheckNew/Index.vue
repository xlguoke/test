<template>
  <ilis-container app-id="standard_check_new">
    <!-- 审核详情 -->
    <div v-if="showPage === 'auditDetail'" class="m-[-16px]">
      <RecordList :id="recordId" />
    </div>
    <!-- 查新登记列表 -->
    <RegisterList
      v-else-if="showPage === 'register'"
      :check-new-name="checkNewName"
      :check-new-id="checkNewId"
      :check-new-status="checkNewStatus"
    />
    <!-- 查新列表 -->
    <List v-else />
  </ilis-container>
</template>

<script setup lang='ts'>
import List from './components/List.vue'
import RegisterList from './register/List.vue'
import { CHECKNEW_STATUS } from './components/listEntity'
import RecordList from './components/RecordList.vue'
import { detailApi } from './components/api'

/**
 * 访问路由
 * 查新列表：/ilis2/standard/view/check-new.do
 * 登记列表：/ilis2/standard/view/check-new.do?page=register&id=xxx
 * 查看记录：/ilis2/standard/view/check-new.do?page=auditDetail&id=xxx
 */

const showPage = ref('')

// 查新列表的id，跳转查新登记页面时携带
// 查新名称
const checkNewName = ref('')
// 查询id
const checkNewId = ref('')
// 查询状态
const checkNewStatus = ref<CHECKNEW_STATUS>(CHECKNEW_STATUS.NOT_START)
// 记录id
const recordId = ref('')

const urlParam = new URLSearchParams(location.search)
showPage.value = urlParam.get('page') || ''
if (showPage.value === 'register') {
  // 显示查新登记页
  checkNewId.value = urlParam.get('id') || ''
  getDetailData()
}
else if (showPage.value === 'auditDetail') {
  // 审核详情页 - 显示查新记录列表
  recordId.value = urlParam.get('id') || ''
}

async function getDetailData() {
  await detailApi(checkNewId.value).then((res) => {
    checkNewName.value = res.data.name
    checkNewStatus.value = res.data.status
  })
}
</script>

<style>

</style>
