<template>
  <HtModal
    v-model:open="visible"
    title="签章位置调整"
    width="1200px"
    fixed-height
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <HtDrag :min-width="460" class="flex-1">
      <HtDragItem width="460px">
        <!-- 文件列表 -->
        <BaseTitle>报告列表</BaseTitle>
        <SealPositionFileTree
          ref="treeRef"
          v-model="selected"
          :report-list="param.reportList"
        >
          <template #title="val">
            <div class="flex-1 flex items-center">
              <BaseText class="flex-1">
                {{ val.title }}
              </BaseText>
              <a-tooltip title="设置报告印章">
                <a-button
                  v-if="!val.isLeaf"
                  v-permission="'reportSetReportFileQua'"
                  :icon="h(SettingOutlined)"
                  type="text"
                  size="small"
                  @click.stop="handleSelectQualification(val)"
                />
              </a-tooltip>
              <a-tooltip title="设置签章页码">
                <a-button
                  v-if="!val.isLeaf"
                  v-permission="'setQualificationSeal'"
                  :icon="h(FileTextOutlined)"
                  type="text"
                  size="small"
                  @click.stop="handleSetBatchQualificationData(val)"
                />
              </a-tooltip>
              <a-tooltip title="重置印章位置">
                <a-button
                  v-if="val.isLeaf && changedReportFileIds.includes(val.reportFileId)"
                  :icon="h(UndoOutlined)"
                  type="text"
                  size="small"
                  @click.stop="handleReset(val.reportFileId)"
                />
              </a-tooltip>
            </div>
          </template>
        </SealPositionFileTree>
      </HtDragItem>
      <HtDragItem>
        <!-- 签章位置设置 -->
        <BaseTitle>签章预览</BaseTitle>
        <SealPositionFileSetting
          v-if="selected"
          ref="settingRef"
          v-model:changed-report-file-ids="changedReportFileIds"
          :report-file="selected"
        ></SealPositionFileSetting>
      </HtDragItem>
    </HtDrag>
  </HtModal>
</template>

<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree'
import type { IReportSignature } from '..'
import type { IReportSignatureFile, ISetSignaturePositionDTO } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { FileTextOutlined, SettingOutlined, UndoOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import { setSignaturePosition } from '../api'
import { selectQualification, setBatchQualificationData } from '../composables/useSignature'
import SealPositionFileSetting from './SealPositionFileSetting.vue'
import SealPositionFileTree from './SealPositionFileTree.vue'

const props = defineProps<IDialogPropsParam<null, { reportList: IReportSignature[] }>>()

const settingRef = ref()
const treeRef = ref()

const loading = ref(false)

const visible = ref(true)

const selected = ref<IReportSignatureFile>()

const changedReportFileIds = ref<string[]>([])

function handleReset(reportFileId: string) {
  Modal.confirm({
    title: '确认重置该文件下的签章位置吗？',
    okText: '确认',
    centered: true,
    onOk: () => {
      settingRef.value?.resetSealPosition(reportFileId)
    },
  })
}

/** # 处理设置报告印章，完成后重新加载树节点数据 */
async function handleSelectQualification(val: DataNode & { title: string, key: string, isLeaf: boolean }) {
  await selectQualification([val as any])
  treeRef.value?.init()
}

/** # 处理设置签章页码，完成后重新加载树节点数据 */
async function handleSetBatchQualificationData(val: DataNode & { title: string, key: string, isLeaf: boolean }) {
  await setBatchQualificationData([val as any])
  treeRef.value?.init()
}

async function handleOk() {
  // 收集所有修改过的印章位置数据
  const positionsAll: ISetSignaturePositionDTO[] = settingRef.value?.getTransformChangedSealPosition() || []
  if (positionsAll?.length) {
    loading.value = true
    await setSignaturePosition(positionsAll).finally(() => {
      loading.value = false
    })
  }
  visible.value = false
  props.onConfirm(null)
}
</script>
