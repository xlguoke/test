<template>
  <div class="relative overflow-hidden w-[250px] h-[268px] bg-[var(--colorBgContainer)] rounded-[var(--borderRadius)]">
    <div v-if="innerFile.hide" class="absolute top-[0px] right-[0px] border-[30px] border-[transparent] border-t-[var(--colorPrimary)] border-r-[var(--colorPrimary)]">
      <span class=" absolute -top-[22px] -right-[22px] text-white text-[14px] transform rotate-[45deg]">隐藏</span>
    </div>

    <div class="custom-file-card relative h-[196px] w-full mb-[8px] p-[16px] flex justify-center items-center">
      <img v-if="isImage(innerFile.format)" :src="innerFile.url" class="w-full h-full object-contain" alt="">
      <img v-else :src="getIcon(innerFile.format)" class="w-[108px] h-[126px] object-contain" />
      <!-- 遮罩操作层 -->
      <div class="custom-file-card-action cursor-pointer absolute inset-0 hidden">
        <div class="w-full h-full flex items-center justify-between px-[35px] bg-[rgba(0,0,0,0.4)]">
          <a-tooltip
            v-if="hasPermission('fileManageFileVisble')"
            :title="innerFile.hide ? '取消隐藏' : '点击可隐藏文件（隐藏文件：通过分享查看文件的用户，用户无法查看已被设置为隐藏的文件）。'"
          >
            <a-button
              :icon="innerFile.hide ? h('i', { class: 'iconfont icon-interactive-button_eye-invisible1 text-white !text-[24px]' }) : h('i', { class: 'iconfont icon-interactive-button_eye1  text-white !text-[24px]' })"
              :loading="hiddenSwitchLoading"
              type="ghost"
              @click.stop="handleHide"
            >
            </a-button>
          </a-tooltip>
          <a-tooltip
            v-if="hasPermission('fileManageMove')"
            title="移动"
          >
            <a-button
              :icon="h('i', { class: 'iconfont icon-yidong1 text-white !text-[24px]' })"
              type="ghost"
              @click.stop="handleMove"
            >
            </a-button>
          </a-tooltip>
          <a-tooltip
            v-if="hasPermission('fileManageDownload')"
            title="下载"
          >
            <a-button
              :icon="h('i', { class: 'iconfont icon-icon_xiazai1 text-white !text-[24px]' })"
              :loading="downloadLoading"
              type="ghost"
              @click.stop="handleDownload"
            >
            </a-button>
          </a-tooltip>
          <a-popconfirm
            v-if="hasPermission('fileManageDel')"
            title="确认删除该文件吗?"
            @confirm="handleDelete"
          >
            <a-tooltip title="删除">
              <a-button
                type="ghost"
                :icon="h('i', { class: 'iconfont icon-a-Frame28592 text-white !text-[24px]' })"
              >
              </a-button>
            </a-tooltip>
          </a-popconfirm>
        </div>
      </div>
    </div>
    <div class="px-[16px]">
      <div class="text-[14px] mb-[4px] w-full">
        <BaseText>{{ innerFile.name }}</BaseText>
      </div>
      <div class="text-[14px] text-[#999999] mb-[12px] w-full">
        <BaseText>添加时间：{{ dayjs(innerFile.uploadTime).format('YYYY-MM-DD HH:mm:ss') }}</BaseText>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IFileEntity } from '../api'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { usePermissionStore } from '~/store/permissionStore'
import { getIcon, isImage } from '~/utils/fileUtils'
import { deleteFile, hideFile } from '../api'
import FileMoveModal from './FileMoveModal.vue'

const props = defineProps<{
  file: IFileEntity
  qrKey?: string
}>()

const emit = defineEmits<{
  (e: 'change'): void
}>()

const { hasPermission } = usePermissionStore()

const innerFile = ref(props.file)

const hiddenSwitchLoading = ref(false)

const downloadLoading = ref(false)

watch(() => props.file, (newVal) => {
  innerFile.value = newVal
}, { deep: true })

async function handleHide() {
  hiddenSwitchLoading.value = true
  await hideFile({
    docIds: [innerFile.value.attachmentId],
    hide: !innerFile.value.hide,
  }).finally(() => {
    hiddenSwitchLoading.value = false
  })
  innerFile.value.hide = !innerFile.value.hide
  message.success('操作成功!')
}

async function handleMove() {
  await AnyDialogHelper.showModel(FileMoveModal, innerFile.value)
  emit('change')
}

async function handleDownload() {
  downloadLoading.value = true
  await downloader.excute(props.file.url).finally(() => {
    downloadLoading.value = false
  })
}

async function handleDelete() {
  await deleteFile({
    key: innerFile.value.uploadQrKey || '',
    attachmentId: innerFile.value.attachmentId,
  })
  message.success('删除成功')
  emit('change')
}

defineExpose({
  handleHide,
})
</script>

<style scoped>
.custom-file-card:hover .custom-file-card-action {
  display: block;
}
</style>
