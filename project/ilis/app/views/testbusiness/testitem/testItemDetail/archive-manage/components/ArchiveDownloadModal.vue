<!-- 下载档案文件弹窗 - 与 JSP 完全一致 -->
<template>
  <HtModal
    v-model:open="visible"
    title="请选择需要下载的内容"
    width="400px"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-[16px]">
      <!-- 下载模式选择 -->
      <a-radio-group v-model:value="downloadMode" class="flex gap-[20px]">
        <a-radio value="selected">
          按选中数据下载
        </a-radio>
        <a-radio value="query">
          按查询数据下载
        </a-radio>
      </a-radio-group>

      <!-- 下载类型选择 -->
      <div class="flex flex-col gap-[8px]">
        <label class="cursor-pointer">
          <a-checkbox v-model:checked="downloadAll" @change="handleAllChange">
            全选
          </a-checkbox>
        </label>
        <div class="flex flex-col gap-[4px] pl-[24px]">
          <label
            v-for="option in downloadTypeOptions"
            :key="String(option.key)"
            class="cursor-pointer flex items-center gap-[8px]"
          >
            <a-checkbox
              v-model:checked="selectedDownloadTypes[String(option.key)]"
              @change="handleTypeChange"
            >
              {{ option.label }}
            </a-checkbox>
          </label>
        </div>
      </div>
    </div>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import sseRequestProgress from '~/components/sseRequestProgress'
import { DownloadTypeDict, EDownloadType } from '../entity/EDownloadType'

/**
 * # 下载参数接口 ⚙️
 */
interface IDownloadParams {
  /** 选中的报告ID列表 */
  reportIds?: string[]
  /** 查询参数 */
  queryParams?: Record<string, any>
  /** 下载类型列表 */
  downloadTypes: string[]
}

/**
 * # 弹窗参数接口 ⚙️
 */
interface IArchiveDownloadModalParam {
  /** 选中的行数据 */
  selectedRows: any[]
  /** 当前查询参数 */
  queryParams: Record<string, any>
}

/**
 * # 组件名称 ⚙️
 */
defineOptions({
  name: 'ArchiveDownloadModal',
})

const props = defineProps<IDialogPropsParam<string, IArchiveDownloadModalParam>>()

// 从 param 中获取参数
const { selectedRows, queryParams } = props.param

/** # 弹窗可见性 📝 */
const visible = ref(true)

/** # 下载模式 📝 */
const downloadMode = ref<'selected' | 'query'>('selected')

/** # 是否全选 📝 */
const downloadAll = ref(true)

/** # 下载类型选项 📝 */
const downloadTypeOptions = DownloadTypeDict

/** # 选中的下载类型 📝 */
const selectedDownloadTypes = ref<Record<string, boolean>>({
  [EDownloadType.REPORT]: true,
  [EDownloadType.RECORD]: true,
  [EDownloadType.ATTACHMENT]: true,
  [EDownloadType.APPROVAL]: true,
  [EDownloadType.CONSIGN]: true,
  [EDownloadType.TASK_ASSIGN]: true,
})

/**
 * # 处理全选变更 ☑️
 * @param e 变更事件
 */
function handleAllChange(e: any) {
  const checked = e.target?.checked ?? e
  Object.keys(selectedDownloadTypes.value).forEach((key) => {
    selectedDownloadTypes.value[key] = checked
  })
}

/**
 * # 处理类型变更 📝
 */
function handleTypeChange() {
  const allChecked = Object.values(selectedDownloadTypes.value).every(v => v)
  downloadAll.value = allChecked
}

/**
 * # 处理确认下载 ✅
 */
function handleConfirm() {
  // 获取选中的下载类型
  const downloadTypes = Object.entries(selectedDownloadTypes.value)
    .filter(([, checked]) => checked)
    .map(([key]) => key)

  if (downloadTypes.length === 0) {
    message.error('请选择需要下载的内容！')
    return
  }

  // 按选中下载需要检查选中行
  if (downloadMode.value === 'selected' && !selectedRows?.length) {
    message.error('请至少选择一条记录进行下载！')
    return
  }

  // 构建请求参数
  const params: IDownloadParams = {
    downloadTypes,
  }

  if (downloadMode.value === 'selected') {
    params.reportIds = selectedRows.map(row => row.reportId)
  }
  else {
    params.queryParams = queryParams
  }

  // 使用 SSE 进度请求
  sseRequestProgress.show({
    api: '/archiveDownloadController/download/from/query',
    method: 'post',
    data: params,
    onComplete: (res: string) => {
      if (!res) {
        message.error('下载失败：未获取到下载链接')
        return
      }
      message.success('下载成功')
      // 创建 a 标签触发下载
      const a = document.createElement('a')
      a.target = '_blank'
      a.href = res
      a.click()
      // 关闭弹窗并返回下载链接
      visible.value = false
      props.onConfirm(res)
    },
    onTimeout: (hide: () => void) => {
      hide()
      message.info('要下载的文件可能较大,服务器正在压缩中,压缩完成后将通过系统消息通知您.请注意该消息并从其中获取下载地址！')
    },
  })
}
</script>
