<!-- 流程退回弹窗 -->
<template>
  <HtModal
    v-model:open="showDialog"
    :after-close="onClosed"
    title="流程退回"
    width="450px"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
  >
    <IlisForm
      ref="formRef"
      :entity="RollBackEntity"
      :init-data="initData"
      :cols="1"
    >
      <template #target="{ data }">
        <IlisInput
          v-model="data.target"
          :entity="RollBackEntity"
          :options="showNode?.map(item => ({ label: item.name, value: item.value })) || []"
          field="target"
        ></IlisInput>
      </template>
    </IlisForm>
  </HtModal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent/index'
import { message } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { RollBackEntity } from './RollBackEntity'

interface IProps {
  /** # 源节点,回退起始节点,一般是调起该功能的节点 */
  source: string
  /** # 关联对象id,如报告id/任务id等 */
  sourceObjId: string
  /** # 退回目标节点,在撤回功能中,会指定退回的目标节点 */
  targetNode?: string
  /** # 报告类型,在综合报告回退时需要判定 */
  reportType: string
}

interface INode {
  name: string
  value: string
}

const props = defineProps<IDialogPropsParam<null, IProps>>()

const showDialog = ref(true)

const isSynthesisReport = ref(false)

const source = ref(props.param?.source || '')

const targetNode = ref(props.param?.targetNode || '')

const showNode = ref<INode[]>([])

const formRef = ref<IlisFormExpose<RollBackEntity>>()

const initData = ref(new RollBackEntity())

const confirmLoading = ref(false)

if (props.param?.reportType) {
  if (props.param?.reportType === 'synthesis' || props.param?.reportType === 'synthesis_Temp') {
    // 标记当前报告为综合报告
    isSynthesisReport.value = true
    // 容错性处理,如果综合报告要退回到试验检测,则自动矫正为退回到报告编制
    if (props.param?.targetNode === 'testTask') {
      targetNode.value = 'reportCompile'
    }
  }
}

if (source.value === 'reportPrint' || source.value === 'reportApprove' || source.value === 'reportAudit') {
  initData.value.target = 'testTask'
}

function initSelect() {
  // 定义所有流程节点
  const allNodes: INode[] = [
    { name: '委托', value: 'consign' },
    { name: '收费', value: 'fee' },
    { name: '任务分配', value: 'taskAssign' },
    { name: '分包', value: 'subcontract' },
    { name: '试验检测', value: 'testTask' },
    { name: '报告编制', value: 'reportCompile' },
    { name: '复核', value: 'review' },
    { name: '报告审核', value: 'reportAudit' },
    { name: '报告批准', value: 'reportApprove' },
    { name: '报告打印', value: 'reportPrint' },
  ]

  // 定义节点映射，用于快速查找节点索引
  const nodeIndexMap = new Map(allNodes.map((node, index) => [node.value, index]))

  // 定义不同节点可退回的目标节点配置
  const rollbackConfig: Record<string, { normal: string[], synthesis: string[] }> = {
    reportPrint: { normal: ['consign', 'testTask', 'reportAudit', 'reportApprove'], synthesis: ['reportCompile', 'reportAudit', 'reportApprove'] },
    reportApprove: { normal: ['consign', 'testTask', 'reportAudit'], synthesis: ['reportCompile', 'reportAudit'] },
    reportAudit: { normal: ['consign', 'testTask'], synthesis: ['reportCompile'] },
    review: { normal: ['testTask'], synthesis: ['testTask'] },
    testTask: { normal: ['consign', 'taskAssign'], synthesis: ['consign', 'taskAssign'] },
    subcontract: { normal: ['consign', 'taskAssign'], synthesis: ['consign', 'taskAssign'] },
    taskAssign: { normal: ['consign'], synthesis: ['consign'] },
    fee: { normal: ['consign'], synthesis: ['consign'] },
  }

  const currentSource = source.value
  const currentTargetNode = targetNode.value

  // 如果指定了目标节点
  if (currentTargetNode) {
    const sourceIndex = nodeIndexMap.get(currentSource) || -1
    const targetIndex = nodeIndexMap.get(currentTargetNode) || -1

    if (sourceIndex <= targetIndex) {
      message.error('退回目标节点不能在源节点之后')
      return
    }

    const targetNodeObj = allNodes.find(node => node.value === currentTargetNode)
    if (targetNodeObj) {
      showNode.value = [targetNodeObj]
    }
  }
  else {
    // 根据当前节点和报告类型获取可退回的目标节点值列表
    const config = rollbackConfig[currentSource]
    if (config) {
      const targetValues = isSynthesisReport.value ? config.synthesis : config.normal
      // 将目标节点值转换为节点对象列表，并处理显示名称
      showNode.value = targetValues.map((value) => {
        const node = allNodes.find(n => n.value === value)!
        // 对于非指定目标节点的情况，"委托"节点显示为"委托收样"
        return value === 'consign' ? { ...node, name: '委托收样' } : node
      })
    }
  }
}

async function handleOk() {
  const formData = await formRef.value?.getFormData()
  const params = {
    ...formData,
    source: source.value,
    sourceObjId: props.param?.sourceObjId || '',
  }
  confirmLoading.value = true
  await IlisApiHelper.postForm('businessRollbackController.do?rollback', params).finally(() => {
    confirmLoading.value = false
  })
  message.success('操作成功')
  showDialog.value = false
  props.onConfirm(null)
  window?.opener?.InitObj?.reloadDataGrid(false)
  setTimeout(() => {
    window.close()
  }, 1000)
}

onMounted(() => {
  initSelect()
})
</script>
