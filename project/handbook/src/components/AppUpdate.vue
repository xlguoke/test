<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { showConfirmDialog } from 'vant'
import { storeToRefs } from 'pinia'
import appUpdateStore from '@/stores/appUpdate'

const { checkAppVersion, downloadApk, openApk, cancelUpdate } = appUpdateStore()
const {
  percent,
  localApkUrl,
  isNewVersion,
  isCheckUpdate,
  localVersion,
  serverVersion,
} = storeToRefs(appUpdateStore())

const visible = computed(() => {
  return isNewVersion.value && !isCheckUpdate.value
})

const updateLoading = ref(false)
const backstageUpateShow = ref(false)

onMounted(async () => {
  await checkAppVersion()
})

// 确认更新
async function confirmUpdate() {
  try {
    isCheckUpdate.value = true
    let apkUrl = localApkUrl.value
    if (!apkUrl) {
      updateLoading.value = true
      apkUrl = await downloadApk()
      updateLoading.value = false
    }
    showConfirmDialog({
      title: '提示',
      message: '应用下载完成，是否立即更新？',
      confirmButtonText: '打开',
      cancelButtonText: '取消',
    })
      .then(() => {
        openApk(apkUrl).catch((err) => {
          showDialog({
            title: '安装失败',
            message: err.message || '安装失败，请重新下载最新安装包',
          })
        })
      })
      .catch(() => {
        cancelUpdate()
      })
  }
  catch (err) {
    updateLoading.value = false
    showDialog({
      title: '下载失败',
      message: (err as Error).message || '更新包下载失败',
    })
  }
}

// 取消更新
function noUpdate() {
  cancelUpdate()
}

function toggleBackstage(type: 1 | 0) {
  if (type) {
    updateLoading.value = false
    backstageUpateShow.value = true
  }
  else {
    updateLoading.value = true
    backstageUpateShow.value = false
  }
}
</script>

<template>
  <div v-if="isNewVersion">
    <!-- 更新提示 -->
    <van-popup
      v-model:show="visible"
      class="home-update-modal"
      :z-index="9999"
      :closeable="false"
      :close-on-click-overlay="false"
    >
      <div class="update-content">
        <h4 class="title">
          发现新版本，是否更新？
        </h4>
        <p>当前版本：{{ localVersion }}</p>
        <p>待更新版本：{{ serverVersion }}</p>
      </div>
      <div class="update-btn-box">
        <p class="update-btn cancel" @click="noUpdate">
          暂不更新
        </p>
        <p class="update-btn" @click="confirmUpdate">
          立即更新
        </p>
      </div>
    </van-popup>

    <!-- 下载进度 -->
    <van-popup
      v-model:show="updateLoading"
      class="home-update-loading"
      style="width: 80%; max-width: 500px"
      :z-index="9999"
      :closeable="false"
      :close-on-click-overlay="false"
    >
      <p style="margin-bottom: 2rem">
        正在下载更新，请稍候...
      </p>
      <van-progress :percentage="percent" stroke-width="12" />
      <div class="modal-handle" @click="toggleBackstage(1)">
        后台下载
      </div>
    </van-popup>

    <!-- 后台下载 -->
    <van-floating-bubble
      v-if="backstageUpateShow && percent < 100 && !localApkUrl"
      style="z-index: 9999"
      axis="xy"
      magnetic="x"
      @click.stop="toggleBackstage(0)"
    >
      <div class="bubble-content">
        <div class="bubble-icon">
          <van-icon name="down" />
        </div>
        <div>{{ percent }}%</div>
      </div>
    </van-floating-bubble>
  </div>
</template>

<style scoped lang="less">
.home-update-modal {
  overflow: visible;
  border-radius: 16px;

  .title {
    margin-bottom: 1rem;
    text-align: center;
    font-size: 18px;
    color: var(--primary-color);
  }

  .update-content {
    padding: 30px 40px;
    text-align: center;
    font-size: 16px;
    line-height: 24px;
  }

  .update-btn-box {
    padding: 0 20px;
    display: flex;
    column-gap: 10px;
  }

  .update-btn {
    display: block;
    margin: 0 auto 16px;
    width: 80%;
    line-height: 35px;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    background: linear-gradient(84deg, #79bdff 0%, #79bdff 0%, #0f62fd 100%);
    transition: 0.2s;
    cursor: pointer;

    &:active {
      opacity: 0.8;
    }

    &.cancel {
      background: #aaa;
    }
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
    cursor: pointer;
    &:active {
      background-color: #eee;
    }
  }
}

@media screen and (max-width: 414px) {
  .home-update-modal {
    .title {
      font-size: 16px;
    }
  }
}

.bubble-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .bubble-icon {
    margin-bottom: 2px;
    height: 12px;
    overflow: hidden;
  }
  :deep(.van-icon-down) {
    animation: bounce 2s infinite;
  }
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(14px);
  }
  1% {
    transform: translateY(-14px);
  }
}
</style>
