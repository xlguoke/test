<!--
  动态表单
  尽量不要将业务代码写在该页面，若某个表单项存在特殊业务逻辑，将其抽离成独立组件，在组件内部实现，然后在领域管理中将该表单项数据源改为组件
  领域管理：[单位配置->机构管理->单位管理->领域管理->字段配置->委托布局属性配置]
  可参考组件：MailingInfo.vue - 邮寄信息  ConsignCode.vue - 委托编号

  新增组件配置说明：
  1. 添加组件映射：./formInput/index.ts
  2. 添加组件对应字段映射: ./formInput/index.ts
  3. 在领域管理修改配置
-->
<template>
  <a-form ref="formRef" :model="formData" :label-col="{ style: 'width: 120px' }">
    <!-- 使用 CSS Grid 布局，与配置界面保持一致 -->
    <div class="dynamic-form-grid">
      <template v-for="item in layoutDatas" :key="item.i">
        <div
          v-show="!morePrev || item.y <= morePrev.y || (showMore && item.y > morePrev.y)"
          class="dynamic-form-item"
          :style="getGridItemStyle(item)"
        >
          <a-form-item
            :rules="initFormRule(item)"
            :name="item.i"
          >
            <template #label>
              <span class="whitespace-pre-wrap leading-4">
                {{ term(item.fieldName) }}
              </span>
            </template>
            <slot :name="item.i" :layout="item" :form-data="formData">
              <!-- 选择器类型表单：如委托单位、工程项目 -->
              <InputSelector
                v-if="item.formType === EFormItemDynamicType.INPUT_SELECTOR"
                v-model="formData[item.i]"
                :layout-item="item"
                :disabled="isDisabled(item)"
                :consign-processor="consignProcessor"
                :business-config="businessConfig"
                :display-value="getDisplayValue(item)"
                @change="(v:any) => {
                  handleChange(v, item)
                }"
              />
              <!-- 上传附件：若后续新增其他附件，或新增特殊逻辑，将组件提取到单独的组件中处理 -->
              <HtUploadFile
                v-else-if="item.formType === EFormItemDynamicType.UPLOAD"
                :business-id="formData.id || consignProcessor.pageStateService.consignId"
                :business-type="BUSINES_TYPE.CONSIGN"
                recursion
                :is-reandonly="isDisabled(item) && isAttachmentDisabled()"
                @init-complete="data => {
                  formData[item.i] = data.qrCodeKey
                }"
              />
              <!-- 存在特殊逻辑的表单，抽离成独立组件，已有组件见： ../formInput/index.ts -->
              <FormInput
                v-else-if="item.dataFrom === OPTIONS_DATA_SOURCE.COMPONENT"
                v-model="formData[item.i]"
                :layout-item="item"
                :disabled="isDisabled(item)"
                :consign-detail="formData"
                @click="$emit('click', item)"
                @change="(v:any) => {
                  handleChange(v, item)
                }"
              />
              <!-- 无特殊逻辑的表单项 -->
              <CustomInput
                v-else
                v-model="formData[item.i]"
                class="w-full !min-w-10"
                :controls="false"
                :disabled="isDisabled(item)"
                :form-field-config="{
                  formType: item.formType,
                  dateFormat: initDateFormat(item, consignProcessor.systemParams.TIME_ACCURACY),
                  placeholder: initPlaceholder(item),
                  options: item.options,
                  treeData: item.options,
                  multiple: item.formType === EFormItemDynamicType.SELECT_MULTIPLE,
                }"
                standard-date-format
                @change="(v:any) => handleChange(v, item)"
                @click="$emit('click', item, $event)"
              />
            </slot>
          </a-form-item>
          <div v-if="morePrev && item.i === morePrev.i">
            <a-divider orientation="right" orientation-margin="12px" class="!mt-0">
              <div class="text-colorPrimary cursor-pointer select-none" @click="showMore = !showMore">
                <template v-if="!showMore">
                  <DownCircleOutlined /> 展开更多
                </template>
                <template v-else>
                  <UpCircleOutlined /> 隐藏更多
                </template>
              </div>
            </a-divider>
          </div>
        </div>
      </template>
    </div>
  </a-form>
</template>

<script setup lang='ts'>
import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { IBusinessConfig, IConsignUnitProject } from '~/views/consign/consignDetail/interface'
import { DownCircleOutlined, UpCircleOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from '@unovis/ts'
import { message } from 'ant-design-vue'
import CustomInput from '~/anyThing/components/input/CustomInput.vue'
import { EFormItemDynamicType } from '~/anyThing/enum/EFormItemType'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { useGjzxDataHandler } from '~/views/consign/consignDetail/composables/useGjzxDataHandler.ts'
import { OPTIONS_DATA_SOURCE } from '~/views/unit-config/industryConfig'
import { useConsignProcessor } from '../../composables/useProviderInject'
import { initDateFormat, initPlaceholder, initRuleMessage } from '../../utils/formTools'
import FormInput from './formInput/Input.vue'
import InputSelector from './formInput/InputSelector.vue'

const props = defineProps<{
  layoutConfigs: IndustryLayoutConfig[]
  /** 触发事件之前的处理逻辑，key为字段属性 - fieldCode */
  businessConfig?: IBusinessConfig
}>()

const emits = defineEmits<{
  (e: 'ready'): void
  (e: 'click', layoutItem: IndustryLayoutConfig, event?: Event): void
  (e: 'change', value: any, field: string, options?: any[]): void
}>()

const { consignProcessor } = useConsignProcessor()

const { term } = consignProcessor.industryStore

const { getGjzxHandleData, enableGjzxDataHandler } = useGjzxDataHandler()

const formData: any = reactive(consignProcessor.data)

const formRef = ref()
const layoutDatas = ref<IndustryLayoutConfig[]>([])
const showMore = ref(false)

/** 计算 grid 布局样式 - 与 grid-layout-plus 保持一致 */
function getGridItemStyle(item: IndustryLayoutConfig) {
  // grid-layout-plus 使用 12 列布局，转换为 CSS Grid
  // grid-column: start / end (end = start + span)
  const startCol = item.x + 1 // CSS Grid 从 1 开始计数
  const endCol = item.x + item.w + 1
  return {
    gridColumn: `${startCol} / ${endCol}`,
    gridRow: item.y + 1, // CSS Grid 从 1 开始计数
  }
}

// 选择的委托单位/工程项目数据
const selectedConsignUnitData = ref<IConsignUnitProject>()

// 附件布局信息 - 附件以下的默认隐藏（同行数据需展示）
const morePrev = ref<IndustryLayoutConfig>()
let isReady = false

const { readonly, notConsignPage, isTaskRedirect } = consignProcessor.pageStateService

watch(showMore, (v) => {
  emits('change', v, 'showMore')
})

// 国检中心数据处理
function initGjzxHandleData() {
  if (!enableGjzxDataHandler) {
    return
  }

  const snTypeItem = layoutDatas.value.find(i => i.fieldCode === 'snTypeId')
  const checkTypeItem = layoutDatas.value.find(i => i.fieldCode === 'checkTypeId')

  if (snTypeItem && checkTypeItem) {
    const { checkTypeId, checkTypeOptions } = getGjzxHandleData({
      checkTypeItem,
      checkTypeId: formData.checkTypeId,
      snTypeItem,
      snTypeId: formData.snTypeId,
    })

    formData.checkTypeId = checkTypeId
    checkTypeItem.options = checkTypeOptions
  }
}

/** 初始化表单验证规则 */
function initFormRule(item: IndustryLayoutConfig) {
  const ruleConfig = props.businessConfig?.[item.i]?.rules
  if (!ruleConfig) {
    return [{ required: item.required, message: initRuleMessage(item) }]
  }

  const rules = ruleConfig(item)
  const isRequired = rules.find(d => d.required)
  if (isRequired)
    return rules

  return [{ required: item.required, message: initRuleMessage(item) }, ...rules]
}

function initPage() {
  if (props.layoutConfigs.length === 0)
    return

  // 深拷贝并重新计算布局 - 移除隐藏字段后，其他字段上移填充空白
  const layouts = recalculateLayout(cloneDeep(props.layoutConfigs))

  setDefaultValue(layouts)
  attachmentNext(layouts)
  layoutDatas.value = layouts

  initGjzxHandleData()

  // eslint-disable-next-line no-console
  console.log('布局配置', layouts)

  if (isReady)
    return

  isReady = true

  nextTick(() => {
    emits('ready')
  })
}

watch(() => props.layoutConfigs, () => {
  initPage()
}, {
  immediate: true,
  deep: true,
})

async function saveData() {
  try {
    await formRef.value.validate()
    return cloneDeep(formData)
  }
  catch (err) {
    console.error('必填项未填写完整', err)
    const msgs = (err as any).errorFields || []
    if (msgs[0])
      message.error(msgs[0].errors[0])
    return null
  }
}

// 通知修改委托时,禁用表单项
const disabeldField = [
  'qualificationTypeId',
  'testType',
  'snTypeId',
  'consignCode',
  'checkTypeId',
  'sampleSource',
  'consignUnit',
  'project',
  'sampleSender',
  'sampleSenderPhone',
  'unitProject',
]

// 通知修改委托时,禁用表单项 - 更正报告情况，允许修改委托单位
const disabeldFieldReport = [
  'qualificationTypeId',
  'testType',
  'snTypeId',
  'consignCode',
  'checkTypeId',
  'sampleSource',
  'unitProject',
]

// 有样品退回,只可修改委托日期、送样日期
const unDisabled = [
  'consignDate',
  'sampleSendDate',
]

/** 禁用表单 */
function isDisabled(item: IndustryLayoutConfig) {
  let unEdit = false
  if (!consignProcessor.pageStateService.cloneReport) {
    if (consignProcessor.isNoticeModifyConsign) {
      if (consignProcessor.consignConstructParams?.hasRevisedReport) {
        unEdit = disabeldFieldReport.includes(item.fieldCode)
      }
      else {
        unEdit = disabeldField.includes(item.fieldCode)
      }
    }
    else if (consignProcessor.consignSampleProcessor.sampleRollback) {
      unEdit = !unDisabled.includes(item.fieldCode)
    }
  }

  if (item.fieldCode === 'attachmentQrKey' && (readonly || consignProcessor.consignSampleProcessor.sampleRollback)) {
    if (!notConsignPage && !isTaskRedirect) {
      unDisabled.push('attachmentQrKey')
    }
  }

  return readonly || props.businessConfig?.[item.i]?.disabled || unEdit
}

/** 禁用附件 */
function isAttachmentDisabled() {
  const pageState = consignProcessor.pageStateService

  if (!consignProcessor.consignConstructParams?.taskRedirect && !pageState.isTaskAssigned && !pageState.notConsignPage)
    return false

  return true
}

/** 初始化表单数据 */
function setDefaultValue(configs: IndustryLayoutConfig[]) {
  // 新增状态下，设置默认值
  if (!consignProcessor.pageStateService.readonly && !formData.status) {
    configs.forEach((item) => {
      if (item.defaultValue) {
        formData[item.i] = item.defaultValue || ''
      }
      else {
        formData[item.i] = formData[item.i] || ''
      }
    })
  }
}

/**
 * 重新计算布局 - 移除隐藏字段后，同列字段上移填充空白
 * 附件保持在当前位置，附件之前和之后的字段分别处理上移
 * @param configs 原始布局配置
 * @returns 重新计算后的布局配置
 */
function recalculateLayout(configs: IndustryLayoutConfig[]): IndustryLayoutConfig[] {
  // 先按配置行排序
  configs.sort((a, b) => {
    const n = a.y - b.y
    if (n === 0)
      return a.x - b.x
    return n
  })

  // 过滤出显示的字段
  const visibleConfigs = configs.filter(item => item.isShow && !item.disabled)

  // 找到附件的位置
  const attachmentIndex = visibleConfigs.findIndex(item => item.i === 'attachmentQrKey')
  const hasAttachment = attachmentIndex !== -1

  // 分离附件前和附件后的字段
  const beforeAttachment = hasAttachment ? visibleConfigs.slice(0, attachmentIndex) : visibleConfigs
  const afterAttachment = hasAttachment ? visibleConfigs.slice(attachmentIndex + 1) : []
  const attachmentItem = hasAttachment ? { ...visibleConfigs[attachmentIndex] } : null

  // 处理附件前的字段：自上而下紧凑排布（避免重叠并上移填充空行）
  const beforeResult = compactPlace(beforeAttachment, 0)

  // 计算附件的行号（附件前字段的最大行号 + 1）
  let attachmentRow = 0
  if (beforeResult.length > 0) {
    attachmentRow = Math.max(...beforeResult.map(item => item.y)) + 1
  }

  // 处理附件后的字段：从附件的下一行开始紧凑排列
  const afterResult = compactPlace(afterAttachment, attachmentRow + (attachmentItem ? 1 : 0))

  // 调整附件位置
  if (attachmentItem) {
    attachmentItem.x = 0
    attachmentItem.y = attachmentRow
    attachmentItem.w = 12
  }

  // 合并结果（附件后的字段已经在 processColumnGroups 中设置了正确的行号）
  const result = [...beforeResult]
  if (attachmentItem) {
    result.push(attachmentItem)
  }
  result.push(...afterResult)

  return result
}

/**
 * 将字段按原始顺序自上而下紧凑排布：
 * - 维护每一行 12 列的占用情况
 * - 对于每个字段，寻找从 startRow 开始的第一个可容纳其列范围的位置
 * - 避免上下行字段在列范围上的重叠
 */
function compactPlace(configs: IndustryLayoutConfig[], startRow = 0): IndustryLayoutConfig[] {
  if (!configs?.length)
    return []

  // 按原始 y、x 排序，保持视觉阅读顺序
  const sorted = [...configs].sort((a, b) => (a.y - b.y) || (a.x - b.x))

  // 行 -> 12 列占用情况
  const occupied: Record<number, boolean[]> = {}
  const result: IndustryLayoutConfig[] = []

  function isFree(row: number, x: number, w: number) {
    const cols = occupied[row]
    if (!cols)
      return true
    for (let c = x; c < x + w; c++) {
      if (cols[c])
        return false
    }
    return true
  }

  function occupy(row: number, x: number, w: number) {
    if (!occupied[row])
      occupied[row] = Array.from({ length: 12 }).fill(false) as boolean[]
    for (let c = x; c < x + w; c++)
      occupied[row][c] = true
  }

  for (const it of sorted) {
    const item = { ...it }
    // 以原始行作为起点，保证相对顺序；不允许小于起始行
    let y = Math.max(startRow, item.y)
    // 若当前行冲突，则向下寻找最近的可放置行
    while (!isFree(y, item.x, item.w)) y++
    // 已找到可放置行后，按规则尝试上移：只要上一行未被占用就继续上移；遇到上一行被占用则停止
    while (y > startRow && isFree(y - 1, item.x, item.w)) y--
    item.y = y
    occupy(y, item.x, item.w)
    result.push(item)
  }

  return result
}

/** 找到附件所在行的最后一个字段，用于显示展开/收起按钮 */
function attachmentNext(configs: IndustryLayoutConfig[]) {
  const attachmentItem = configs.find(item => item.i === 'attachmentQrKey')
  if (!attachmentItem) {
    morePrev.value = undefined
    return
  }
  // 找到附件所在行的最后一个字段
  const sameRowItems = configs.filter(item => item.y === attachmentItem.y)
  morePrev.value = sameRowItems[sameRowItems.length - 1]
}

const relatefields = ['consignUnit', 'project', 'sampleSender', 'sampleSenderPhone']
function handleChange(v: any, item: IndustryLayoutConfig) {
  emits('change', v, item.i, item.options)

  if (item.fieldCode === 'snTypeId') {
    initGjzxHandleData()
  }

  // 工程项目
  if (item.fieldCode === 'project') {
    selectedConsignUnitData.value = v
  }

  // 部分表单异步验证,无法获取最新的值,延迟重新触发验证
  setTimeout(() => {
    if (relatefields.includes(item.i))
      formRef.value.validateFields(relatefields)
    else
      formRef.value.validateFields([item.i])
  }, 0)
}

// 自定义显示内容
function getDisplayValue(item: IndustryLayoutConfig) {
  // 工程项目
  if (item.i === 'project') {
    // 优先从用户主动选择的数据中获取外部项目用于展示
    if (selectedConsignUnitData.value) {
      if (selectedConsignUnitData.value.project.consignProject?.externalProjectName) {
        return `${formData.project.name}【${selectedConsignUnitData.value.project.consignProject?.externalProjectName}】`
      }
    }
    else if (!consignProcessor.pageStateService.consignId) {
      // 【新增委托】直接从缓存里获取外部项目
      const data = consignProcessor.consignUnitProcessor.getConsignUnitStorage()
      if (data?.project.consignProject?.id === formData.project.projectId && data?.project.consignProject?.externalProjectName) {
        return `${formData.project.name}【${data.project.consignProject.externalProjectName}】`
      }
    }
    else {
      // 【编辑/查看委托】从接口中获取外部项目
      const consignConstructParams = consignProcessor.consignConstructParams

      if (consignConstructParams?.consignInfo?.project.externalProjectName) {
        return `${formData.project.name}【${consignConstructParams?.consignInfo?.project.externalProjectName}】`
      }
    }

    return formData.project.name
  }

  return undefined
}

defineExpose({
  saveData,
})
</script>

<style scoped>
/* CSS Grid 布局 - 与 grid-layout-plus 配置界面保持一致 */
.dynamic-form-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* 12 列布局 */
  gap: 8px;
}

:deep(.ant-form-item){
  margin-bottom: 0;
}
:deep(.ant-form-item-explain-error){
  display: none;
}
</style>
