<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-4">
    <van-sticky>
      <MobileTitleBar
        title="使用记录"
        left-arrow
        @click-left="router.back()"
      />
    </van-sticky>

    <!-- 化学品信息 -->
    <div class="bg-white p-3 text-sm">
      <div class="flex items-center gap-4 mb-2">
        <span class="text-gray-500">化学品名称：</span>
        <span>{{ pageData.consumeDetail.chemicalName }}</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-gray-500">出库数量：{{ pageData.consumeDetail.outAmount }}</span>
        <span class="text-gray-500">返还数量：{{ pageData.consumeDetail.returnAmount }}</span>
        <span class="text-gray-500">计量单位：{{ pageData.consumeDetail.chemicalUnit }}</span>
      </div>
    </div>

    <!-- 使用记录列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="bg-white mt-2 mx-3 rounded-lg overflow-hidden"
        >
          <!-- 记录内容 -->
          <div class="p-3 text-sm">
            <div class="grid grid-cols-2 gap-y-2">
              <div class="text-gray-500">
                类型：
              </div>
              <div class="text-right">
                {{ item.type }}
              </div>

              <div class="text-gray-500">
                当次使用量：
              </div>
              <div class="text-right">
                {{ item.amount }}
              </div>

              <div class="text-gray-500">
                关联任务：
              </div>
              <div class="text-right">
                {{ item.testTaskCodes || '--' }}
              </div>

              <div class="text-gray-500">
                溶液名称：
              </div>
              <div class="text-right">
                {{ item.solutionNames || '--' }}
              </div>

              <div class="text-gray-500">
                备注：
              </div>
              <div class="text-right">
                {{ item.remark || '--' }}
              </div>

              <div class="text-gray-500">
                操作人：
              </div>
              <div class="text-right">
                {{ item.operationPerson }}
              </div>

              <div class="text-gray-500">
                操作时间：
              </div>
              <div class="text-right">
                {{ formatTime(item.operationTime) }}
              </div>
            </div>
          </div>

          <!-- 移除按钮 -->
          <div class="px-3 pb-3 flex justify-end">
            <van-button
              type="danger"
              size="small"
              @click="onDelete(item)"
            >
              移除
            </van-button>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import type { UseRecordItem, UseRecordResponse } from '~/views/mobileApp/types/chemical/use-registration'
import dayjs from 'dayjs'
import { showConfirmDialog, showDialog, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { deleteUseRecord, getUseRecordDetail } from '~/views/mobileApp/provides/api/chemical.api'

const router = useRouter()
const route = useRoute()

// 页面参数
const recordId = ref('')

// 页面数据
const pageData = reactive<{
  consumeDetail: UseRecordResponse['consumeDetail']
  inventoryOutRecordVOs: UseRecordItem[]
}>({
  consumeDetail: {
    chemicalName: '',
    outAmount: 0,
    returnAmount: 0,
    chemicalUnit: '',
  },
  inventoryOutRecordVOs: [],
})

// 列表数据
const list = ref<UseRecordItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 格式化时间 - 使用 dayjs，标准格式 YYYY-MM-DD HH:mm:ss
function formatTime(time: string) {
  if (!time)
    return '--'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 获取数据
async function fetchData() {
  loading.value = true

  try {
    const res = await getUseRecordDetail(recordId.value)

    if (res.code !== 20000) {
      throw new Error(res.message || '获取使用记录失败')
    }

    pageData.consumeDetail = res.data.consumeDetail
    pageData.inventoryOutRecordVOs = res.data.inventoryOutRecordVOs
    list.value = res.data.inventoryOutRecordVOs
    finished.value = true
  }
  catch (error) {
    showToast((error as Error).message || '获取使用记录失败')
    console.error(error)
    finished.value = true
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载数据
async function onLoad() {
  await fetchData()
}

// 刷新
async function onRefresh() {
  finished.value = false
  await fetchData()
}

// 删除记录
async function onDelete(item: UseRecordItem) {
  showConfirmDialog({
    title: '提示',
    message: '确定要移除该使用记录吗？',
  })
    .then(async () => {
      const loadingToast = showLoadingToast({
        message: '删除中...',
        forbidClick: true,
        duration: 0,
      })

      try {
        const res = await deleteUseRecord(item.id)

        if (res.code !== 20010) {
          showSuccessToast({
            message: '删除成功',
            forbidClick: true,
          })
          // 重新加载数据
          await fetchData()
        }
        else {
          showDialog({
            message: res.message || '删除失败',
          })
        }
      }
      catch (error: any) {
        console.error('删除失败:', error)
        showDialog({
          message: error?.message || '删除失败',
        })
      }
      finally {
        loadingToast.close()
      }
    })
    .catch(() => {
      // 取消删除
    })
}

onMounted(() => {
  const id = route.query.id as string
  if (id) {
    recordId.value = id
    fetchData()
  }
})
</script>
