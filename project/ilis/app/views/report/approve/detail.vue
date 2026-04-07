<template>
  <IlisContainer
    app-id="report_approve_detail"
    :body-style="{ flex: 1, height: 0, padding: '0px', overflowY: 'auto' }"
  >
    <div class="w-full h-full flex flex-col">
      <DetailHeader
        title="报告批准详情"
        :sub-title="`（报告编号：${detailInfo?.reportNumber || ''}）`"
      >
        <template #right>
          <ComparisonViewTypeControll
            v-model:view-type="viewType"
            @select-keep-side="handleSelectKeepSide"
          ></ComparisonViewTypeControll>
        </template>
      </DetailHeader>

      <!-- 盲样文件缺失警告 -->
      <a-alert
        v-if="showBlindSampleWarning"
        message="系统要求批准阶段盲样，但本报告未生成盲样pdf，故无盲样文件可展示。（tips: 如需展示，请退回检测，并重新提交以生成盲样PDF。）"
        type="warning"
        show-icon
      />
      <div class="w-full flex-1 h-0 flex overflow-hidden p-[12px] ">
        <div class="relative  shrink-0 h-full mr-[12px] bg-[var(--colorBgContainer)] ">
          <div
            class="relative h-full w-[300px] transition-all overflow-hidden bg-[var(--colorBgContainer)]"
            :class="{ '!w-[40px] ': isCollapsed }"
          >
            <VueDraggable
              v-model="list"
              :animation="300"
              handle=".handle"
              class="absolute inset-0 w-[300px] overflow-y-auto transition-all bg-[var(--colorBgContainer)]"
              :class="{ '-left-[1000px]': isCollapsed }"
            >
              <div v-for="item in list" :key="item.title">
                <ComparisonInfoCard
                  :title="item.title"
                  :options="item.options"
                />
              </div>
            </VueDraggable>
          </div>
          <ComparisonContainerToggleBar
            v-model="isCollapsed"
            class="absolute top-1/2 right-0 z-10 transform -translate-y-1/2 translate-x-1/2"
          />
        </div>
        <div class="flex-1 w-0">
          <IlisComparison
            :action-items="actionItems"
            :file-items="fileItems"
            :view-type="viewType"
            :keep-side="keepSide"
          >
            <template #action-after="{ direction }">
              <div class="bg-[var(--colorBgContainer)] p-[8px] flex" :class="[direction === 'vertical' ? 'w-full flex-col mt-[14px]' : 'h-full flex-row ml-[16px]']">
                <div
                  v-if="approveStatus !== '3' && reportStatus !== EReportStatus.APPROVED_PASSED"
                  v-permission="'reportApproveRollback'"
                  class="text-[#fff] cursor-pointer flex items-center justify-center rounded-[4px] bg-[#FF6666] "
                  :class="[direction === 'vertical' ? 'w-full h-[100px] mb-[8px] px-[18px]' : 'w-[100px] h-full mr-[8px]']"
                  @click="goBack"
                >
                  退回
                </div>
                <div
                  v-if="approveStatus !== '3' && reportStatus !== EReportStatus.APPROVED_PASSED"
                  v-permission="'reportApprovePass'"
                  class="text-[#fff] cursor-pointer flex items-center justify-center rounded-[4px] bg-colorPrimary"
                  :class="[direction === 'vertical' ? 'w-full h-[100px] px-[18px]' : 'w-[100px] h-full']"
                  @click="auditPass"
                >
                  批准通过
                </div>
              </div>
            </template>
          </IlisComparison>
        </div>
      </div>
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import type { IReportInfo } from './api'
import type { IActionItem } from '~/components/ilisComponent/comparison/interface/IActionItem'
import type { IComparisonInfoCardOption } from '~/components/ilisComponent/comparison/interface/IComparisonInfoCardOption'
import type { IComparisonViewType } from '~/components/ilisComponent/comparison/interface/IComparisonViewType'
import type { IComparisonFile } from '~/components/ilisComponent/comparison/interface/IConparisonFile'
import { h, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import ComparisonInfoCard from '~/components/ilisComponent/comparison/components/ComparisonInfoCard.vue'
import DataCenterForDebugModal from '~/components/ilisComponent/dataCenter/DataCenterForDebugModal.vue'
import { usePermissionStore } from '~/store/permissionStore'
import { userStore } from '~/store/userStore'
import { getBusinessParam } from '~/utils/getBusinessParam'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { getApproveReportRelatedInfoDetail, getComprehensiveTestScheme, getOfflineReportFile, getReportConvertStatus, getReportFile, isOfflineReportFun, ReportTypeDict } from './api'
import DetailHeader from './components/DetailHeader.vue'
import { EReportStatus, useReportApprove } from './composables/useReportApprove'

const DetailBtnImg = new URL('~/assets/img/ilisConparison/detail_btn.png', import.meta.url).href
const EditBtnImg = new URL('~/assets/img/ilisConparison/edit_btn.png', import.meta.url).href
const NoticeBtnImg = new URL('~/assets/img/ilisConparison/notice_btn.png', import.meta.url).href

const { hasPermission } = usePermissionStore()
const { userInfo } = userStore()

const {
  reportId,
  reportType,
  reportStatus,
  approveStatus,
  auditPass,
  goBack,
  editApproval,
  noticeEntrust,
  testTaskId,
} = useReportApprove()

const viewType = ref<IComparisonViewType>('1')

/** 保留的页面侧边 */
const keepSide = ref<'left' | 'right' | null>(null)

const isCollapsed = ref<boolean>(true)

const detailInfo = ref<IReportInfo>()

/** # localStorage key 前缀 用于保存卡片顺序 */
const LIST_ORDER_KEY_PREFIX = 'report_list_order'

const list = ref<{ title: string, options: IComparisonInfoCardOption[] }[]>([])
const actionItems = ref<IActionItem[]>([
  {
    label: '编辑复核审批意见',
    onClick: editApproval,
    icon: () => h('img', { src: EditBtnImg }),
  },
  {
    label: '查看日志',
    onClick: () => AnyDialogHelper.showModel(LogModalByApi, {
      id: reportId,
      logType: '3',
      relationQry: true,
    }),
    icon: () => h('img', { src: DetailBtnImg }),
  },
  {
    label: '通知修改委托',
    onClick: noticeEntrust,
    icon: () => h('img', { src: NoticeBtnImg }),
    isShow: () => String(approveStatus) !== '3' && String(reportStatus) !== EReportStatus.APPROVED_PASSED && !reportType.includes('synthesis'),
  },
  {
    label: '数据中心',
    onClick: () => AnyDialogHelper.showModel(DataCenterForDebugModal, {
      reportId,
    }),
    icon: () => h('img', { src: DetailBtnImg }),
    isShow: () => hasPermission('reportDataCenterBtn'),
  },
])
/** 文件列表 */
const fileItems = ref<IComparisonFile[]>([])

/** 是否显示盲样文件缺失警告 */
const showBlindSampleWarning = ref<boolean>(false)

/** # 获取报告附件信息并转换为fileItems格式 */
async function getReportAttachments() {
  const fileList: IComparisonFile[] = []
  // 用于排序的临时数组：priorityFiles存储type=1或5的文件，normalFiles存储其他类型
  const priorityFiles: IComparisonFile[] = []
  const normalFiles: IComparisonFile[] = []

  // 检查是否需要显示线下出具报告
  const isOfflineReport = await isOfflineReportFun(testTaskId)
  if (isOfflineReport) {
    const { data } = await getOfflineReportFile()
    if (data) {
      // 线下出具报告直接添加到fileList，确保它始终显示在最前面
      fileList.push({
        id: data.id,
        reportFileId: data.reportFileId,
        title: '线下出具报告',
        subTitle: '',
        url: data.realpath,
        icon: () => h('i', { class: 'iconfont icon-a-jianqudingceng40' }),
        // 添加转换状态信息
        convertStatus: data.convertStatus || '',
      })
    }
  }

  // 获取报告附件信息
  const { data } = await getReportFile(reportId)
  let hasPriorityFile = false // 是否有优先显示的文件（type=1或5）

  if (data?.obj) {
    const reportFileObj = data.obj
    reportFileObj.forEach((item: any) => {
      let title = ''
      let subTitle = ''
      let url = ''

      // 根据类型设置标题和URL
      switch (item.type) {
        case '1': // 报告
        case '3': // 记录
        case '5': // 盲样报告
        case '7': // 盲样记录
          title = item.fileName || item.name || ''
          if (item.type === '1') {
            subTitle = '报告文件'
          }
          else if (item.type === '3') {
            subTitle = '记录文件'
          }
          else if (item.type === '5') {
            subTitle = '盲样报告文件'
          }
          else if (item.type === '7') {
            subTitle = '盲样记录文件'
          }
          // PDF查看URL，使用项目中的PDF查看器
          url = `${import.meta.env.VITE_ILIS_BASE}/plug-in/pdfjs/web/viewer.html?file=${encodeURIComponent(`${import.meta.env.VITE_ILIS_BASE}/reportController.do?displayPDF&attachmentId=${item.id}`)}&reportFileId=${item.id}&fileId=${item.reportFileId}`
          break
        case '4': // 委托
          title = '委托信息'
          subTitle = '内部链接'
          // 委托信息页面URL
          url = `${import.meta.env.VITE_ILIS_BASE}/testTaskController.do?goConsignEdit&id=${item.id}&isTaskRedirect=false&requestFrom=audit_detail&detail=detailPage&openType=3`
          break
        default:
          title = item.fileName || item.name || '未知文件'
          subTitle = item.code || ''
          url = `${import.meta.env.VITE_ILIS_BASE}/reportController.do?displayPDF&attachmentId=${item.id}`
      }

      // 将文件添加到不同的列表，以便后续排序
      const fileItem = {
        id: item.id,
        reportFileId: item.reportFileId,
        title,
        subTitle,
        url,
        icon: () => h('i', { class: 'iconfont icon-a-jianqudingceng40' }),
        // 添加转换状态信息
        convertStatus: item.convertStatus || '',
      }

      // 根据类型将文件添加到不同的列表
      if (item.type === '1' || item.type === '5') {
        // 优先显示的文件类型
        hasPriorityFile = true
        priorityFiles.push(fileItem)
      }
      else {
        // 普通文件类型
        normalFiles.push(fileItem)
      }
    })

    // 合并文件列表：先保留已有的fileList（包含线下出具报告），然后添加优先显示的文件，最后添加普通文件
    fileItems.value = [...fileList, ...priorityFiles, ...normalFiles]
  }
  else {
    // 如果没有获取到报告附件信息，直接使用fileList
    fileItems.value = fileList
  }

  // 添加"查看检测详情"作为最后一个文件项
  await addDetailViewToFileItems()

  // 检查是否需要显示盲样文件缺失警告
  // 条件：1. 没有优先显示的文件（type=1或5） 2. 不是线下出具报告 3. 系统要求批准阶段盲样
  // 使用系统参数判断是否需要盲样
  const isNeedBlindSample = await getBusinessParam('TEST_DETECTION_39')

  showBlindSampleWarning.value = !hasPriorityFile && !isOfflineReport && isNeedBlindSample

  // 获取报告转换状态
  await getReportConvertInfo()
}

/** # 添加"查看检测详情"到文件列表 ⚙️ */
async function addDetailViewToFileItems() {
  let detailUrl = ''

  // 根据报告类型生成不同的查看检测详情URL
  if (reportType === 'synthesis' || reportType === 'synthesis_temp' || reportType === 'synthesis_Temp') {
    // 综合报告 查看检测详情即打开报告编制中的报告详情
    detailUrl = `${import.meta.env.VITE_ILIS_BASE}/reportCreateController.do?goEditPage&detectionDetail=detectionDetail&reportId=${reportId}&detail=detailPage`
  }
  else if (reportType.includes('synthesis')) {
    detailUrl = `${import.meta.env.VITE_ILIS_BASE}/reportCreateController.do?goEditPage`
  }
  else {
    // 获取任务ID
    const { data } = await IlisApiHelper.postForm<{ obj: string[] }>('reportAuditController.do?getTaskIds', { reportId })
    const taskIds = data.obj

    if (taskIds && taskIds.length > 1) {
      // 综合报告
      detailUrl = `${import.meta.env.VITE_ILIS_BASE}/reportCreateController.do?goEditPage`
    }
    else {
      // 原材料报告
      detailUrl = `${import.meta.env.VITE_ILIS_BASE}/testTaskController.do?goTestTaskDetail&id=${taskIds[0]}&reportId=${reportId}&readType=2&udrReadOnly=1&rid=${reportId}`
    }
  }

  // 创建查看检测详情的文件项
  const detailFileItem: IComparisonFile = {
    id: 'detail_view', // 唯一ID
    reportFileId: '', // 报告文件ID
    title: '检测详情',
    subTitle: '内部链接',
    url: detailUrl,
    icon: () => h('i', { class: 'iconfont icon-a-jianqudingceng40' }),
    convertStatus: '', // 不需要转换状态
  }

  // 将查看检测详情添加到文件列表的最后
  fileItems.value.push(detailFileItem)
}

// 获取报告转换状态 ⚙️
async function getReportConvertInfo() {
  try {
    const res = await getReportConvertStatus(reportId)

    if (res?.data) {
      const isNeedRefresh = updateConvertStatus(res.data)
      // 如果有需要刷新的状态，2秒后再次检查
      if (isNeedRefresh) {
        setTimeout(() => {
          getReportConvertInfo()
        }, 2000)
      }
    }
  }
  catch (error) {
    console.error('获取报告转换状态失败:', error)
  }
}

/** # 更新报告转换状态 ⚙️ */
function updateConvertStatus(convertInfoList: any[]) {
  let isNeedRefresh = false

  convertInfoList.forEach((info: any) => {
    if (info.attachId && info.convertStatus) {
      const fileItem = fileItems.value.find(item => item.id === info.attachId)
      if (fileItem) {
        // 更新转换状态
        fileItem.convertStatus = info.convertStatus

        // 如果转换未成功，需要继续刷新
        if (info.convertStatus !== '转换成功') {
          isNeedRefresh = true
        }
      }
    }
  })

  return isNeedRefresh
}
/**
 * 处理选择保留页面事件
 * @param side 选择的侧边
 */
function handleSelectKeepSide(side: 'left' | 'right') {
  keepSide.value = side
}

async function getDetailInfo() {
  const { data } = await getApproveReportRelatedInfoDetail(reportId)
  detailInfo.value = data
  // 综合检测方案信息

  // 渲染所需信息
  const defaultList = [
    createConsignInfo(data),
    createSampleInfo(data),
    createTaskInfo(data),
    createReportInfo(data),
  ]

  /** # 创建渲染所需综合检测方案信息 */
  const comprehensiveTestSchemeInfo = await createComprehensiveTestSchemeInfo()
  if (comprehensiveTestSchemeInfo) {
    defaultList.push(comprehensiveTestSchemeInfo)
  }

  // 应用保存的顺序
  list.value = applyListOrder(defaultList)

  // 获取报告附件信息
  await getReportAttachments()
}

/** # 获取当前用户的 localStorage key 👤 */
function getListOrderKey(): string {
  const userId = userInfo.userId || 'anonymous'
  return `${LIST_ORDER_KEY_PREFIX}_${userId}`
}

/** # 保存列表顺序到 localStorage 📝 */
function saveListOrder() {
  try {
    const order = list.value.map(item => item.title)
    localStorage.setItem(getListOrderKey(), JSON.stringify(order))
  }
  catch (error) {
    console.error('保存列表顺序失败:', error)
  }
}

/** # 从 localStorage 恢复列表顺序 🔄 */
function applyListOrder(defaultList: { title: string, options: IComparisonInfoCardOption[] }[]): { title: string, options: IComparisonInfoCardOption[] }[] {
  try {
    const savedOrder = localStorage.getItem(getListOrderKey())
    if (!savedOrder) {
      return defaultList
    }

    const order: string[] = JSON.parse(savedOrder)
    // 根据保存的顺序重新排列
    const orderedList: { title: string, options: IComparisonInfoCardOption[] }[] = []
    const remainingItems = [...defaultList]

    // 按照保存的顺序添加项目
    order.forEach((title) => {
      const index = remainingItems.findIndex(item => item.title === title)
      if (index !== -1) {
        orderedList.push(remainingItems[index])
        remainingItems.splice(index, 1)
      }
    })

    // 添加新出现的项目（不在保存顺序中的）
    return [...orderedList, ...remainingItems]
  }
  catch (error) {
    console.error('恢复列表顺序失败:', error)
    return defaultList
  }
}

/** 创建渲染所需委托信息 */
function createConsignInfo(detailInfo: IReportInfo): { title: string, options: IComparisonInfoCardOption[] } {
  // 委托信息
  const signDefaultCss = 'w-[20px] h-[20px] inline-block text-center rounded-[4px] text-[#fff] mr-[8px]'
  const consign = detailInfo?.consign
  const consignInfo = {
    title: '委托信息',
    options: [
      { label: '委托单位', value: consign?.consignUnitName || '' },
      { label: '工程项目', value: consign?.consignUnitName || '' },
      { label: '委托日期', value: consign?.consignDate || '' },
      { label: '送样日期', value: consign?.sampleSendDate || '' },
      { label: '资质类型', value: consign?.qualificationTypeNames || '' },
      { label: '检测类别', value: consign?.checkTypeName || '' },
      { label: '样品来源', value: consign?.sampleSource || '' },
      { label: '收样人员', value: consign?.sampleAcceptorName || '' },
      { label: '签字情况', value: () => h('span', { class: 'flex items-center' }, [
        h('span', { class: `${signDefaultCss} ${consign?.consignSigned ? 'bg-colorPrimary' : 'bg-[#BDC5D1]'}` }, '委'),
        h('span', { class: `${signDefaultCss} ${consign?.supervisingSigned ? 'bg-colorPrimary' : 'bg-[#BDC5D1]'}` }, '监'),
        h('span', { class: `${signDefaultCss} ${consign?.buildSigned ? 'bg-colorPrimary' : 'bg-[#BDC5D1]'}` }, '建'),
      ]) },
    ],
  }
  return consignInfo
}

/** # 创建渲染所需样品信息 */
function createSampleInfo(detailInfo: IReportInfo): { title: string, options: IComparisonInfoCardOption[] } {
  // 样品信息
  const sample = detailInfo?.testObject
  const sampleInfo = {
    title: '样品信息',
    options: [
      { label: '样品名称', value: sample?.testSampleDisplayName || '' },
      { label: '规格型号', value: sample?.standard || '' },
      { label: '样品编号', value: sample?.testObjectCodes || '' },
      { label: '样品数量', value: sample?.sampleNum || '' },
      { label: '检测部位', value: sample?.testPart || '' },
      { label: '工程部位/用途', value: sample?.projectPartAndUse || '' },
      { label: '检测参数', value: sample?.testParamNames || '' },
    ],
  }
  return sampleInfo
}

/** # 创建渲染所需任务信息 */
function createTaskInfo(detailInfo: IReportInfo): { title: string, options: IComparisonInfoCardOption[] } {
  // 任务信息
  const testTaskSummary = detailInfo?.testTaskSummary
  let taskOptions: IComparisonInfoCardOption[]
  if (testTaskSummary?.assignType === '0') {
    // 按样品分配只有一个任务
    const task = testTaskSummary?.testTasks?.[0]
    taskOptions = [
      { label: '任务分配模式', value: '按样品分配' },
      { label: '按样品出具报告', value: testTaskSummary?.needMergeReport ? '是' : '否' },
      { label: '分配日期', value: task?.allocDate || '' },
      { label: '分配人员', value: task?.assigner || '' },
      { label: '任务编号', value: task?.testTaskCode || '' },
      { label: '记录编号', value: task?.testRecordCode || '' },
      { label: '检测人员', value: task?.testUsersName || '' },
      { label: '检测参数', value: task?.testParamNames || '' },
      { label: '试验日期', value: task?.testDate || '' },
      { label: '复核人员', value: testTaskSummary?.reviewUsersName || '' },
      { label: '复核日期', value: testTaskSummary?.reviewDate || '' },
    ]
  }
  else {
    taskOptions = []
    taskOptions.push({ label: '任务分配模式', value: '按任务分配' })
    taskOptions.push({ label: '按样品出具报告', value: testTaskSummary?.needMergeReport ? '是' : '否' })
    testTaskSummary?.testTasks?.forEach((task, index) => {
      const sigleTaskOptions: IComparisonInfoCardOption[] = [
        { label: '分配日期', value: task?.allocDate || '' },
        { label: '分配人员', value: task?.assigner || '' },
        { label: '任务编号', value: task?.testTaskCode || '' },
        { label: '记录编号', value: task?.testRecordCode || '' },
        { label: '检测人员', value: task?.testUsersName || '' },
        { label: '检测参数', value: task?.testParamNames || '' },
        { label: '试验日期', value: task?.testDate || '' },
      ]
      taskOptions.push({ label: `试验任务${index + 1}`, customRender(_props) {
        return h(ComparisonInfoCard, {
          options: sigleTaskOptions,
          class: 'rounded-[4px] bg-[#F1F4F9] !p-[12px]',
        }, {
          title: () => h('div', { class: 'mb-[8px] text-[#666]' }, `试验任务${index + 1}`),
        })
      } })
      taskOptions.push({ label: '复核人员', value: testTaskSummary?.reviewUsersName || '' })
      taskOptions.push({ label: '复核日期', value: testTaskSummary?.reviewDate || '' })
    })
  }
  const taskInfo = {
    title: '任务信息',
    options: taskOptions,
  }
  return taskInfo
}

/** # 创建渲染所需报告信息 */
function createReportInfo(detailInfo: IReportInfo): { title: string, options: IComparisonInfoCardOption[] } {
  // 报告信息
  const reportInfo = {
    title: '报告信息',
    options: [
      { label: '报告编号', value: detailInfo?.reportNumber || '' },
      { label: '报告类型', value: ReportTypeDict.getLabelByKey(detailInfo?.reportType) || '' },
      { label: '资质类型', value: detailInfo?.qualificationTypesName || '' },
      { label: '报告印章', value: detailInfo?.sealsName || '' },
      { label: '报告参数', value: detailInfo?.testParamsName || '' },
      { label: '审核人员', value: detailInfo?.auditUsersName || '' },
      { label: '审核日期', value: detailInfo?.auditDate || '' },
      { label: '批准人员', value: detailInfo?.approveUsersName || '' },
      { label: '批准日期', value: detailInfo?.signDate || '' },
    ],
  }
  return reportInfo
}

/** # 创建综合检测方案渲染所需信息 */
async function createComprehensiveTestSchemeInfo(): Promise<{ title: string, options: IComparisonInfoCardOption[] } | null> {
  const { data } = await getComprehensiveTestScheme(reportId)
  if (!data?.length) {
    return null
  }
  // 综合检测方案信息
  const comprehensiveTestSchemeInfo = {
    title: '综合检测方案',
    options: data?.map((i: any) => {
      return {
        label: i?.fileName,
        customRender() {
          return h('a', {
            class: 'block text-colorPrimary cursor-pointer hover:bg-[#EDF5FF] p-[12px]',
            href: i?.fileUrl,
            target: '_blank',
          }, i?.fileName)
        },
      }
    }) as IComparisonInfoCardOption[],
  }
  return comprehensiveTestSchemeInfo
}

getDetailInfo()

// 监听 list 变化，保存顺序到 localStorage
watch(() => list.value.map(item => item.title), (newOrder, oldOrder) => {
  // 只在顺序真正改变时保存（避免初始化时的空数组触发保存）
  if (oldOrder && oldOrder.length > 0 && newOrder.length > 0) {
    saveListOrder()
  }
}, { deep: true })
</script>

<style scoped>
::-webkit-scrollbar {
  width: 2px;
}
*{
  font-family: Source Han Sans,Microsoft YaHei;
}
</style>
