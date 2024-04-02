<script setup lang="ts">
import { h, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CloseCircleOutlined } from '@ant-design/icons-vue'
import {
  Checkbox,
  CheckboxGroup,
  Modal,
  Progress,
  message,
  notification,
} from 'ant-design-vue'
import DataVersionItem from './DataVersionItem.vue'
import baseData from '@/stores/baseData'
import type { DataVersionDTO } from '@/type/common'

const router = useRouter()

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
  if (selectedType.value.length === 0)
    return message.warning('请选择需要更新的数据')

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
  return Number.parseInt(`${n}`)
}

// 后台更新
function backstageUpate() {
  updateLoading.value = false
  notification.info({
    message: '提示',
    description: h('div', {}, [
      h('span', '数据已在后台更新，可在“我的->离线数据更新”中查看更新情况！'),
      h(
        'span',
        {
          style: {
            color: '#0066ec',
          },
          onClick: () => {
            notification.destroy()
            router.push('/my/updateManage')
          },
        },
        '立即前往查看',
      ),
    ]),
  })
}
</script>

<template>
  <div>
    <!-- 更新类型 -->
    <Modal
      v-model:open="visible"
      :closable="false"
      :mask-closable="false"
      :keyboard="false"
      :force-render="true"
      centered
      class="home-update-modal"
      :footer="false"
    >
      <img class="update-bg" src="@/assets/images/home-update-bg.png" alt="">
      <h4 class="title">
        发现新内容
      </h4>
      <div class="update-content">
        <CheckboxGroup v-model:value="selectedType">
          <template v-for="item in dataVersions" :key="item.type">
            <DataVersionItem :item="item" />
          </template>
        </CheckboxGroup>
        <div style="width: 150px; margin: 0 auto">
          <Checkbox v-model:checked="isBackstage">
            后台更新
          </Checkbox>
        </div>
      </div>
      <p class="update-btn" @click="confirmUpdate">
        立即更新
      </p>
      <CloseCircleOutlined class="close-update-modal" @click="cancelUpdate" />
    </Modal>

    <Modal
      v-model:open="updateLoading"
      :closable="false"
      :mask-closable="false"
      :keyboard="false"
      centered
      class="home-update-loading"
      style="width: 80%; max-width: 500%"
      :footer="false"
    >
      <p style="margin-bottom: 1rem; font-size: 16px">
        同步数据
      </p>
      <Progress :percent="percent()" status="active" :stroke-width="12" />
      <p style="margin-top: 1rem">
        正在同步{{ updateLoadingMsg }}数据，请稍候...
      </p>
      <div class="modal-handle" @click="backstageUpate">
        后台更新
      </div>
    </Modal>
  </div>
</template>

<style scoped lang="less">
.home-update-modal {
  .update-bg {
    width: calc(100% + 6rem);
    margin-top: -62px;
    margin-left: -3rem;
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
  :deep(.ant-modal-content) {
    border-radius: 10px;
  }
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
