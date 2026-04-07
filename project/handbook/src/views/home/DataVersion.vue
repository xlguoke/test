<script setup lang="ts">
import { provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataVersionItem from './DataVersionItem.vue'
import baseData from '@/stores/baseData'
import type { DataVersionDTO } from '@/type/common'
import CustomNotify from '@/components/CustomNotify.vue'

const router = useRouter()

const showNotify = ref(false)

// 更新检查
const visible = ref<boolean>(false)
const dataVersions = ref<DataVersionDTO[]>([])
const selectedType = ref<string[]>([])
function checkDataVersion() {
  if (baseData().isCheckUpdate)
    return
  dataVersions.value = baseData().dataVersions
}

defineExpose({
  checkDataVersion,
})

const isOpenModal = ref(false)
const startUpdate = ref(0)
provide('isOpenModal', isOpenModal)
provide('startUpdate', startUpdate)
provide('selectedType', selectedType)

// 选择更新数据
const updateLoading = ref(false)
const updateLoadingMsg = ref('')
const isBackstage = ref(true)

async function confirmUpdate() {
  if (selectedType.value.length === 0) {
    showToast({
      type: 'fail',
      message: '请选择需要更新的数据',
    })
  }

  baseData().updateProcess = 0
  baseData().updateTotal = selectedType.value.length
  startUpdate.value++

  cancelUpdate()
  if (isBackstage.value)
    return backstageUpate()
  updateLoading.value = true
}

// 关闭弹窗
function closeModal() {
  visible.value = false
  isOpenModal.value = false
}

// 取消更新
function cancelUpdate() {
  closeModal()
  baseData().isCheckUpdate = true
}

// 有更新时，延迟打开弹窗，避免内容项一条一条的出现
watch(
  () => isOpenModal.value,
  (newVal) => {
    if (!newVal)
      return
    setTimeout(() => {
      visible.value = true
    }, 500)
  },
)

// 更新进度
function percent() {
  const process = baseData().updateProcess
  const n = (process / selectedType.value.length) * 100
  if (n >= 100)
    updateLoading.value = false
  return Number.parseInt(`${n}`) || 0
}

// 后台更新
function backstageUpate() {
  updateLoading.value = false
  showNotify.value = true
}
</script>

<template>
  <div>
    <!-- 更新类型 -->
    <van-popup
      v-model:show="visible"
      class="home-update-modal"
      lock-scroll
      :z-index="1900"
      :lazy-render="false"
      :closeable="false"
      :close-on-click-overlay="false"
    >
      <img class="update-bg" src="@/assets/images/home-update-bg.png" alt="">
      <h4 class="title">
        发现新内容
      </h4>
      <div class="update-content">
        <van-checkbox-group v-model="selectedType">
          <DataVersionItem v-for="item in dataVersions" :key="item.type" :item="item" />
        </van-checkbox-group>
        <div style="width: 150px; margin: 0 auto">
          <van-checkbox v-model="isBackstage" shape="square">
            后台更新
          </van-checkbox>
        </div>
      </div>
      <p class="update-btn" @click="confirmUpdate">
        立即更新
      </p>
      <van-icon name="close" class="close-update-modal" @click="cancelUpdate" />
    </van-popup>

    <!-- 更新进度 -->
    <van-popup
      v-model:show="updateLoading"
      class="home-update-loading"
      style="width: 80%; max-width: 500%"
      lock-scroll
      :z-index="1900"
      :closeable="false"
      :close-on-click-overlay="false"
    >
      <p style="margin-bottom: 2rem; font-size: 16px">
        同步数据
      </p>
      <van-progress :percentage="percent()" stroke-width="12" />
      <p style="margin-top: 2rem">
        正在同步{{ updateLoadingMsg }}数据，请稍候...
      </p>
      <div class="modal-handle" @click="backstageUpate">
        后台更新
      </div>
    </van-popup>

    <!-- 后台更新提示 -->
    <CustomNotify v-model="showNotify">
      <span>数据已在后台更新，可在“我的->离线数据更新”中查看更新情况！</span>
      <span style="color: var(--primary-color);" @click="showNotify = false;router.push('/my/updateManage')">立即前往查看</span>
    </CustomNotify>
  </div>
</template>

<style scoped lang="less">
.home-update-modal {
  overflow: visible;
  border-radius: 16px;

  .van-checkbox{
    width: 150px;
    margin: 0 auto;
    margin-bottom: 10px
  }
  .update-bg {
    width: calc(100% );
    transform: translateY(-28%);
  }

  .title {
    margin-top: 2rem;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 18px;
    color: var(--primary-color);
  }

  .update-btn {
    display: block;
    margin: 3.5rem auto 10px;
    width: 80%;
    line-height: 35px;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    background: linear-gradient(84deg, #79bdff 0%, #79bdff 0%, #0f62fd 100%);
    transition: 0.2s;

    &:active {
      opacity: 0.8;
    }
  }

  .close-update-modal {
    position: absolute;
    left: 50%;
    bottom: -40px;
    margin-left: -13px;
    color: #fff;
    font-size: 26px;
  }
}

.home-update-loading {
  border-radius: 10px;
  padding: 20px;
  overflow: hidden;
  .modal-handle {
    padding: 15px 0;
    text-align: center;
    border-top: 1px solid #f2f2f2;
    font-size: 16px;
    margin: 20px -24px -20px;
    &:active {
      background-color: #eee;
    }
  }
}

@media screen and (max-width: 414px) {
  .home-update-modal{
    .title{
      font-size: 16px;
    }
  }
}
</style>
