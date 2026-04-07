<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="验收入库"
        left-arrow
        @click-left="router.go(-1)"
      >
        <template #right>
          <div class="text-white text-sm px-2 py-1" @click="openFilter">
            筛选
          </div>
        </template>
      </MobileTitleBar>

      <!-- 搜索栏 -->
      <van-search
        v-model="searchValue"
        placeholder="请输入采购登记号/登记人/验收人查询"
        @search="onSearch"
        @clear="onSearch"
      />
    </van-sticky>

    <!-- 验收登记列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        class="p-3 min-h-[200px]"
        @load="onLoad"
      >
        <ListCard
          v-for="item in list"
          :key="item.id"
          class="mb-3"
          :rows="[
            { label: '登记人', value: item.registrant },
            { label: '登记时间', value: item.registerTime },
            { label: '验收人', value: item.verifier || '--' },
            { label: '验收时间', value: item.verifyTime || '--' },
            { label: '验收结论', value: item.verifyConclusion || '--' },
          ]"
          @click="goDetail(item)"
        >
          <template #title>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-[#333]">
                {{ item.registerCode }}
              </span>
              <span
                class="text-xs"
                :class="getStatusClass(item.status)"
              >
                {{ getStatusText(item.status) }}
              </span>
            </div>
          </template>
          <template #footer>
            <div class="flex gap-2 justify-end pb-2">
              <van-button
                type="primary"
                size="small"
                @click.stop="goLog(item)"
              >
                日志
              </van-button>
              <van-button
                v-if="item.status === EPurchaseApplyStatus.IN_FILLING || item.status === EPurchaseApplyStatus.PENDING_SUBMIT || item.status === EPurchaseApplyStatus.NOT_APPROVED"
                type="primary"
                size="small"
                @click.stop="goEdit(item)"
              >
                编辑
              </van-button>
              <van-button
                v-if="item.status === EPurchaseApplyStatus.IN_FILLING"
                type="primary"
                size="small"
                @click.stop="goVerify(item)"
              >
                验收
              </van-button>
              <van-button
                v-if="item.status === EPurchaseApplyStatus.PENDING_SUBMIT"
                type="primary"
                size="small"
                @click.stop="onSubmit(item)"
              >
                提交
              </van-button>
              <van-button
                v-if="item.status === EPurchaseApplyStatus.UNDER_REVIEW"
                type="primary"
                size="small"
                @click.stop="onRevoke(item)"
              >
                撤回
              </van-button>
            </div>
          </template>
        </ListCard>
      </van-list>
    </van-pull-refresh>

    <!-- 底部新增按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <van-button type="primary" block class="!rounded" @click="goAdd">
        新增验收登记
      </van-button>
    </div>

    <!-- 筛选弹窗 -->
    <AcceptanceSearch
      v-model="filterVisible"
      :initial-data="filterData"
      @callback="onFilterConfirm"
    />

    <!-- 审核流程弹窗 -->
    <CommonAudit
      v-model:value="auditVisible"
      audit-type-id="371"
      @on-submit="onAuditSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import type { PurchaseListItem, PurchaseListQueryParams, PurchaseStatus } from '~/views/mobileApp/types/chemical/purchase'
import { showConfirmDialog, showDialog, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { EPurchaseApplyStatus } from '~/components/selectorViaMethodCall/entity/PurchaseApplySelectorEntity'
import CommonAudit from '~/views/mobileApp/components/commonAudit.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getPurchaseRegisterList, revokePurchaseRegister, submitPurchaseRegister } from '~/views/mobileApp/provides/api/chemical.api'
import AcceptanceSearch from './components/AcceptanceSearch.vue'

const router = useRouter()

// 搜索相关
const searchValue = ref('')

// 列表相关
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const list = ref<PurchaseListItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选相关
const filterVisible = ref(false)
const filterData = ref<Partial<PurchaseListQueryParams>>({})

// 审核相关
const auditVisible = ref(false)
const currentSubmitId = ref<string>('')

// 状态映射
const statusMap: Record<PurchaseStatus, { text: string, class: string }> = {
  IN_FILLING: { text: '填写中', class: 'text-[#1890ff]' },
  PENDING_SUBMIT: { text: '待提交', class: 'text-[#1890ff]' },
  UNDER_REVIEW: { text: '审核中', class: 'text-[#ff9800]' },
  NOT_APPROVED: { text: '未通过', class: 'text-[#f44336]' },
  COMPLETED: { text: '已通过', class: 'text-[#4caf50]' },
}

// 获取状态文本
function getStatusText(status: PurchaseStatus) {
  return statusMap[status]?.text || status
}

// 获取状态样式
function getStatusClass(status: PurchaseStatus) {
  return statusMap[status]?.class || 'text-[#999]'
}

// 组件挂载时加载数据
onMounted(() => {
  fetchList()
})

// 获取列表数据
async function fetchList(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    list.value = []
    finished.value = false
  }

  loading.value = true

  try {
    const params: PurchaseListQueryParams = {
      page: page.value,
      size: pageSize.value,
      q: searchValue.value,
      ...filterData.value,
    }

    const res = await getPurchaseRegisterList(params)
    const rows = res.rows || []
    list.value = isRefresh ? rows : [...list.value, ...rows]
    total.value = res.count || 0

    // 判断是否加载完成
    if (list.value.length >= total.value || rows.length === 0) {
      finished.value = true
    }
  }
  catch (error) {
    showToast((error as Error).message || '获取列表失败')
    console.error(error)
    finished.value = true
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
function onRefresh() {
  finished.value = false
  fetchList(true)
}

// 加载更多
function onLoad() {
  if (list.value.length > 0) {
    page.value++
  }
  fetchList()
}

function onSearch() {
  fetchList(true)
}

function openFilter() {
  filterVisible.value = true
}

function onFilterConfirm(data: Partial<PurchaseListQueryParams>) {
  filterData.value = data
  fetchList(true)
}

// 跳转详情
function goDetail(item: PurchaseListItem) {
  router.push(`/chemical/acceptance/verify/${item.id}?isReadonly=1`)
}

// 跳转日志
function goLog(item: PurchaseListItem) {
  router.push(`/chemical/acceptance/log/${item.id}`)
}

// 跳转验收
function goVerify(item: PurchaseListItem) {
  router.push(`/chemical/acceptance/verify/${item.id}`)
}

// 跳转编辑
function goEdit(item: PurchaseListItem) {
  router.push(`/chemical/acceptance/edit/${item.id}`)
}

// 提交审核（显示审核弹窗）
function onSubmit(item: PurchaseListItem) {
  currentSubmitId.value = item.id
  auditVisible.value = true
}

// 审核提交回调
async function onAuditSubmit(processUserTaskList: any[], formPropertyJson: any) {
  if (!currentSubmitId.value) {
    return
  }

  const loadingToast = showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const submitRes = await submitPurchaseRegister({
      ids: [currentSubmitId.value],
      presetAuditors: processUserTaskList,
      processForm: formPropertyJson,
    })

    if (submitRes.code !== 20010) {
      showSuccessToast({
        message: '提交成功',
        forbidClick: true,
      })
      auditVisible.value = false
      currentSubmitId.value = ''
      fetchList(true)
    }
    else {
      showDialog({
        message: submitRes.message || '提交失败',
      })
    }
  }
  catch (error: any) {
    console.error('提交失败:', error)
    showDialog({
      message: error?.message || '提交失败',
    })
  }
  finally {
    loadingToast.close()
  }
}

// 撤回申请
async function onRevoke(item: PurchaseListItem) {
  showConfirmDialog({
    title: '提示',
    message: '确定撤回该申请吗？',
  }).then(async () => {
    try {
      const res = await revokePurchaseRegister({ registerId: item.id, reason: '' })
      if (res.code !== 20010) {
        showToast('撤回成功')
        fetchList(true)
      }
      else {
        showToast(res.message || '撤回失败')
      }
    }
    catch (error) {
      showToast('撤回失败')
      console.error(error)
    }
  }).catch(() => {})
}

function goAdd() {
  router.push('/chemical/acceptance/add')
}
</script>
