<template>
  <HtModal
    v-model:open="visible"
    :title="modalTitle"
    :width="1600"
    :mask-closable="false"
    :hide-confirm="true"
    :after-close="onClosed"
  >
    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane key="purchase" tab="购置登记" :disabled="!hasPermission('ref_purchase_accept_add')" />
      <a-tab-pane key="acceptance" tab="验收登记" :disabled="!hasAcceptancePermission" />
    </a-tabs>

    <PurchaseRegistrationTab
      v-show="activeTab === 'purchase' && hasPermission('ref_purchase_accept_add')"
      :id="props.param.id"
      ref="purchaseTabRef"
      :mode="mode"
    />

    <AcceptanceRegistrationTab
      v-show="activeTab === 'acceptance' && hasAcceptancePermission"
      :id="props.param.id"
      ref="acceptanceTabRef"
    />

    <template #footer>
      <div class="flex justify-end gap-2">
        <template v-if="activeTab === 'purchase'">
          <a-button @click="onClosed">
            取消
          </a-button>
          <a-button type="primary" :loading="saveLoading" @click="handlePurchaseConfirm">
            确认
          </a-button>
        </template>

        <template v-if="activeTab === 'acceptance'">
          <a-button @click="onClosed">
            取消
          </a-button>
          <a-button type="primary" :loading="confirmLoading" @click="handleAcceptanceConfirm">
            确认
          </a-button>
        </template>
      </div>
    </template>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { usePermissionStore } from '~/store/permissionStore'
import { getCurrentUser } from '../api'
import AcceptanceRegistrationTab from './AcceptanceRegistrationTab.vue'
import PurchaseRegistrationTab from './PurchaseRegistrationTab.vue'

const props = defineProps<IDialogPropsParam<null, { mode: 'add' | 'edit' | 'detail', id: string, accepterId?: string }>>()

const { hasPermission } = usePermissionStore()
const visible = ref(true)
const saveLoading = ref(false)
const confirmLoading = ref(false)
const activeTab = ref('purchase')
interface UserInfo {
  id: string
  ssoName: string // 系统名称
  realName: string
}

const currentUserInfo = ref<UserInfo>()

const purchaseTabRef = ref<InstanceType<typeof PurchaseRegistrationTab>>()
const acceptanceTabRef = ref<InstanceType<typeof AcceptanceRegistrationTab>>()
const hasAcceptancePermission = computed(() => {
  const userId = getLocalUserInfo()?.userId || currentUserInfo.value?.id || ''
  const isAccepter = props.param?.accepterId === userId
  return isAccepter && hasPermission('ref_purchase_accept_register') && hasPermission('ref_purchase_accept_edit')
})

const mode = computed(() => props.param.mode)
const isDetailMode = computed(() => props.param.mode === 'detail')
const modalTitle = computed(() => {
  if (isDetailMode.value)
    return '购置验收详情'
  if (activeTab.value === 'purchase')
    return '购置登记'
  return '验收登记'
})

// 购置登记确认
async function handlePurchaseConfirm() {
  await purchaseTabRef.value?.validate()
  saveLoading.value = true
  await purchaseTabRef.value?.handlePurchaseConfirm().finally(() => {
    saveLoading.value = false
  })
  message.success('购置登记成功')
  visible.value = false
  props.onConfirm(null)
}

// 验收登记确认
async function handleAcceptanceConfirm() {
  await acceptanceTabRef.value?.validate()
  confirmLoading.value = true
  await acceptanceTabRef.value?.handleAcceptanceConfirm().finally(() => {
    confirmLoading.value = false
  })
  message.success('验收登记成功')
  visible.value = false
  props.onConfirm(null)
}

onMounted(async () => {
  try {
    const { data } = await getCurrentUser()
    currentUserInfo.value = data.obj as UserInfo
  }
  catch (error) {
    console.error('获取当前用户信息失败:', error)
  }
})
</script>
