<template>
  <a-card class="h-full flex flex-col" :body-style="{ 'display': 'flex', 'flex-direction': 'column', 'height': '100%', 'padding': '0' }">
    <header class="header-bar flex items-center justify-between gap-12">
      <div class="flex items-center">
        <div>
          <span class="mr-1">
            {{ term('样品/参数名称') }}:
            {{ mainController.sampleTestParamsName || `[${term('请选择样品')}]` }}
          </span>
          <a-button v-if="!pageState.isDetailPage && !pageState.isNoticeModifyConsign" type="primary" @click="onSelectParam">
            {{ term('选择样品') }}
          </a-button>
        </div>
        <a-button v-if="pageState.isDetailPage" class="ml-1" @click="setCheckSampleLevelVisible(true)">
          完整层级
        </a-button>
        <div class="ml-4 mr-2 flex items-center flex-wrap">
          <span class="mr-1">检测组数</span>
          <a-input-number
            v-model:value="useBasicInfo.data.sampleAmount"
            :min="1"
            :disabled="pageState.isDetailPage || pageState.isNoticeModifyConsign"
            @blur="(e: any) => {
              if (!e.target.value)
                useBasicInfo.data.sampleAmount = 1
              useBasicInfo.publishFieldChange('sampleAmount', e.target.value || 1)
            }"
          />
        </div>
        <SpecialCharacter v-if="!pageState.isDetailPage" @select="onSelectSpecialCharacter">
          <a-button>特殊字符</a-button>
        </SpecialCharacter>
      </div>
      <div v-if="!pageState.isDetailPage && !pageState.isCreateTest">
        <a-input-group v-if="useCodesInfo.enableTestObjectCode" compact>
          <a-input
            :disabled="pageState.isNoticeModifyConsign || genTestObjectCodeLoading"
            :addon-before="term('样品编号')"
            style="text-align: left;width: 320px;"
            readonly
            :value="useCodesInfo.data.testObjectCode"
            @click="setObjectCodeVisible(true)"
          />
          <a-button
            :loading="genTestObjectCodeLoading"
            :disabled="pageState.isNoticeModifyConsign"
            type="primary"
            @click="generateCode('sample')"
          >
            生成编号
          </a-button>
        </a-input-group>
        <a-input-group
          v-if="useCodesInfo.enableProvideToCustomerSampleCode && mainController.sampleIndustryService.enableField.provideToCustomerSampleCode"
          compact style="margin-top: 4px;"
        >
          <a-input
            :disabled="pageState.isNoticeModifyConsign || genProvideSampleCodeLoading"
            :addon-before="term('来样编号')"
            style="text-align: left;width: 320px;"
            readonly
            :value="useCodesInfo.data.provideToCustomerSampleCode"
            @click="setProvideObjectCodeVisible(true)"
          />
          <a-button
            :loading="genProvideSampleCodeLoading"
            :disabled="pageState.isNoticeModifyConsign"
            type="primary"
            @click="generateCode('provideToCustomerSample')"
          >
            生成编号
          </a-button>
        </a-input-group>
      </div>
    </header>

    <div class="flex-1 h-0 overflow-y-auto overflow-x-hidden mt-2 px-2 box-border">
      <div class="flex items-center gap-3 mb-2">
        <div v-if="SYSTEM_PARAM.SET_QUA_WITH_OBJECT" class="flex items-center">
          <span class="whitespace-nowrap">样品资质：</span>
          <a-input-group compact :title="useBasicInfo.selectedQualificationStr">
            <a-input v-model:value="useBasicInfo.selectedQualificationStr" class="w-[160px]" readonly placeholder="请点击设置" />
            <a-button class="qualificationRight" :disabled="!useTestParams.selectedRows.length" @click="setQualificationSelectorVisible(true)">
              设置
            </a-button>
          </a-input-group>
        </div>
        <div class="mr-2">
          <span class="whitespace-nowrap">{{ term('规程提供方') }}：</span>
          <a-select
            v-model:value="useBasicInfo.data.baseStandardProvider"
            class="w-[160px]"
            :disabled="pageState.isDetailPage"
            :placeholder="term('请选择规程提供方')"
            :dropdown-match-select-width="false"
          >
            <a-select-option v-for="d in useBasicInfo.baseStandardProviderOptions" :key="d.id" :value="d.typename">
              {{ d.typename }}
            </a-select-option>
          </a-select>
        </div>
        <div class="flex flex-wrap gap-1 items-center">
          <a-checkbox v-if="showIsNeedConclusion" v-model:checked="useBasicInfo.data.isNeedConclusion" :disabled="pageState.isDetailPage" @change="onChangeIsNeedConclusion">
            需要评定结果
          </a-checkbox>
          <a-checkbox v-model:checked="useBasicInfo.data.urgentStatus" :disabled="pageState.isDetailPage">
            加急检测
          </a-checkbox>
        </div>
      </div>

      <a-row :gutter="[8, 8]">
        <a-col :span="24">
          <a-collapse v-model:active-key="collapseState.检测参数">
            <a-collapse-panel key="1" :header="term('检测参数')">
              <TestParams />
            </a-collapse-panel>
          </a-collapse>
        </a-col>
        <a-col v-if="sampleIndustryService.config.samplingInfo?.selected" :span="12">
          <a-collapse v-model:active-key="collapseState.取样信息">
            <a-collapse-panel key="1" :header="sampleIndustryService.config.samplingInfo.fieldDisplayName">
              <SamplingInfo />
            </a-collapse-panel>
          </a-collapse>
        </a-col>
        <a-col v-if="sampleIndustryService.config.sampleReceivingRequirements?.selected" :span="12">
          <a-collapse v-model:active-key="collapseState.收样要求">
            <a-collapse-panel key="1" :header="sampleIndustryService.config.sampleReceivingRequirements.fieldDisplayName">
              <SampleRequirement v-if="useBasicInfo.data.testUnitTestSampleId" :sample-id="useBasicInfo.data.testUnitTestSampleId" :test-item-ids="useTestParams.testItemIds" />
            </a-collapse-panel>
          </a-collapse>
        </a-col>
        <a-col v-if="sampleIndustryService.config.sampleInfo?.selected" :span="24">
          <a-collapse v-model:active-key="collapseState.样品信息">
            <a-collapse-panel key="1" :header="sampleIndustryService.config.sampleInfo.fieldDisplayName">
              <template #extra>
                带<FlagFilled class="mx-1" style="color:#ff7744;font-size: 16px;" />为参与试验数据处理的信息，请填写完整
              </template>

              <a-row :gutter="48">
                <a-col :span="12">
                  <SampleInfo />
                </a-col>
                <a-col :span="12">
                  <TestOtherInfo />
                </a-col>
              </a-row>
            </a-collapse-panel>
          </a-collapse>
        </a-col>
        <a-col v-if="sampleIndustryService.config.additionalCharges?.selected" :span="24">
          <a-collapse v-model:active-key="collapseState.附加费用">
            <a-collapse-panel key="1" :header="sampleIndustryService.config.additionalCharges.fieldDisplayName">
              <AdditionalFee :data-source="useAdditionalFee.data" />
            </a-collapse-panel>
          </a-collapse>
        </a-col>
        <a-col v-if="sampleIndustryService.config.samplePreparationInf?.selected" :span="24">
          <a-collapse v-model:active-key="collapseState.制样信息">
            <a-collapse-panel key="1" :header="sampleIndustryService.config.samplePreparationInf.fieldDisplayName">
              <Period :data-source="usePeriod.data" />
            </a-collapse-panel>
          </a-collapse>
        </a-col>
        <a-col v-if="sampleIndustryService.config.sampleExtractionInfo?.selected" :span="24">
          <a-collapse v-model:active-key="collapseState.抽样信息">
            <a-collapse-panel key="1" :header="sampleIndustryService.config.sampleExtractionInfo.fieldDisplayName">
              <a-textarea
                v-model:value="useBasicInfo.data.samplingInfo"
                :rows="4"
                :disabled="pageState.isDetailPage"
                :placeholder="placeholder('请描述抽样日期，抽取地点，抽样程序，抽样依据及抽样过程中可能影响检测结果解释的环境条件情况等')"
              />
            </a-collapse-panel>
          </a-collapse>
        </a-col>
        <a-col v-if="sampleIndustryService.config.sampleAttachment?.selected" :span="24">
          <a-collapse v-model:active-key="collapseState.附件">
            <a-collapse-panel key="1" :header="sampleIndustryService.config.sampleAttachment.fieldDisplayName">
              <Attachment :is-reandonly="pageState.isDetailPage" />
            </a-collapse-panel>
          </a-collapse>
        </a-col>
      </a-row>
    </div>

    <!-- 选择参数 -->
    <!-- <SelectSampleParamModal v-model:open="selectParamVisible" @on-select="getSampleParams" /> -->

    <!-- 设置样品编号 -->
    <EditObjectCode v-model:open="objectCodeVisible" />

    <!-- 设置来样编号 -->
    <EditProvideSampleCode v-model:open="provideObjectCodeVisible" />

    <!-- 查看样品完整层级 -->
    <CheckSampleLevel v-model:open="checkSampleLevelVisible" />

    <!-- 资质 -->
    <QualificationSelector v-model:open="qualificationSelectorVisible" :selected="useBasicInfo.data.qualifications" @on-select="onSelectQulification" />
  </a-card>
</template>

<script setup lang='ts'>
import type { IConsginPageParam } from '../../consignDetail/interface'
import type { QualificationEntity } from '~/views/consign/component/selectSample/interface/Qualification.ts'
import type { SelectSampleParamEntity } from '~/views/consign/component/selectSampleParam'
import { FlagFilled } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import QualificationSelector from '~/components/QualificationSelector.vue'
import { SpecialCharacter } from '~/components/specialCharacter'
import { TopComponent } from '~/enum/TopComponent'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { getCategoryById } from '~/views/consign/component/selectSample/api.ts'
import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import { SelectSampleParamModal } from '~/views/consign/component/selectSampleParam'
import AdditionalFee from './components/AdditionalFee.vue'
import Attachment from './components/Attachment.vue'
import CheckSampleLevel from './components/CheckSampleLevel.vue'
import EditObjectCode from './components/EditObjectCode.vue'
import EditProvideSampleCode from './components/EditProvideSampleCode.vue'
import Period from './components/Period.vue'
import SampleInfo from './components/SampleInfo.vue'
import SampleRequirement from './components/SampleRequirement.vue'
import SamplingInfo from './components/SamplingInfo.vue'
import TestOtherInfo from './components/TestOtherInfo.vue'
import TestParams from './components/TestParams.vue'
import { useCollapseState } from './hooks/useCollapseState'

const props = defineProps<{
  consginPageParam: IConsginPageParam
}>()

/**
 * 页面核心逻辑：
 * 1.各模块尽量不再关注元数据的存储问题，处理各自模块的数据和业务逻辑，需要往元数据写入的属性在各自模块的getMetaData中处理构建
 * 2.元数据的输出由MainController模块控制，主要方法buildMetaData
 * 3.各个模块之间的通信或关联的业务逻辑，由MainController的initEmitCenter统一控制
 */

// 兼容处理
window.basePath = '/ilis2'

// 折叠面板控制
const { collapseState } = useCollapseState()

// 主模块
const mainController = new MainController(props.consginPageParam)
mainController.init()

// 领域控制服务
const sampleIndustryService = mainController.sampleIndustryService
const term = sampleIndustryService.term
// 基础信息
const useBasicInfo = mainController.useBasicInfo
// 编号信息
const useCodesInfo = mainController.useCodesInfo
// 检测参数
const useTestParams = mainController.useTestParams
// 取样信息
const useSamplingInfo = mainController.useSamplingInfo
// 样品信息
const useSampleInfo = mainController.useSampleInfo
// 收样辅助信息
const useTestOtherInfo = mainController.useTestOtherInfo
// 附加费用
const useAdditionalFee = mainController.useAdditionalFee
// 制样信息/龄期
const usePeriod = mainController.usePeriod
// 附件
const useAttachment = mainController.useAttachment

const { SYSTEM_PARAM, pageState, placeholder } = props.consginPageParam

provide('mainController', mainController)
provide('useBasicInfo', useBasicInfo)
provide('useCodesInfo', useCodesInfo)
provide('useSamplingInfo', useSamplingInfo)
provide('useSampleInfo', useSampleInfo)
provide('useTestOtherInfo', useTestOtherInfo)
provide('useTestParams', useTestParams)
provide('useAdditionalFee', useAdditionalFee)
provide('usePeriod', usePeriod)
provide('useAttachment', useAttachment)

// 选择样品参数弹窗状态控制
// const [selectParamVisible, openSelectParamModal] = useStateHooks(false)

// 设置样品编号弹窗状态控制
const [objectCodeVisible, setObjectCodeVisible] = useStateHooks(false)

// 设置来样编号弹窗状态控制
const [provideObjectCodeVisible, setProvideObjectCodeVisible] = useStateHooks(false)

// 查看样品完整层级
const [checkSampleLevelVisible, setCheckSampleLevelVisible] = useStateHooks(false)

// 选择资质
const [qualificationSelectorVisible, setQualificationSelectorVisible] = useStateHooks(false)

// 生成样品编号loading
const genTestObjectCodeLoading = ref(false)

// 生成来样编号loading
const genProvideSampleCodeLoading = ref(false)

// 展示 需要评定结果
const showIsNeedConclusion = computed(() => {
  return mainController.sampleIndustryService.enableField.isNeedConclusion
})

// 绑定特殊字符赋值
const bindSpecialCharacter = (function () {
  let fn: any = null
  return (arg: string | any) => {
    if (typeof (arg) === 'string') {
      if (fn && typeof (fn) === 'function') {
        fn(arg)
      }
    }
    else {
      fn = arg
    }
  }
})()
provide('bindSpecialCharacter', bindSpecialCharacter)

if (pageState.isAddPage) {
  openSelectParamModal()
}

/** 打开选择样品参数弹窗 */
async function openSelectParamModal() {
  const params = {
    industryId: props.consginPageParam.industryId,
    mainController,
  }
  if (top?.TopAnyDialogHelper) {
    const res = await top.TopAnyDialogHelper.showModel<SelectSampleParamEntity>(TopComponent.SelectSampleParamModal, params)
    getSampleParams(res)
  }
  else {
    const res = await AnyDialogHelper.showModel<SelectSampleParamEntity>(SelectSampleParamModal, params)
    getSampleParams(res)
  }
}

// 获取元数据
async function getMetaData(samplePageSave?: boolean) {
  const meta = await mainController.metaDataBuilder.getMetaData(samplePageSave)
  // eslint-disable-next-line no-console
  console.log(meta)
  return meta
}

// 选择样品/参数
async function getSampleParams(data: SelectSampleParamEntity) {
  // 更新选择样品信息
  useBasicInfo.updateSelectSampleInfo(data)

  // 初始化参数列表
  await useTestParams.initTestParamList({
    bigCategoryId: data.bigCategoryId,
    sampleId: data.testUnitTestSampleId,
    priceStandardId: props.consginPageParam.priceStandardId,
  }, data.testParams)
}

// 生成编号
async function generateCode(type: 'sample' | 'provideToCustomerSample') {
  if (type === 'sample') {
    genTestObjectCodeLoading.value = true
  }
  else {
    genProvideSampleCodeLoading.value = true
  }

  try {
    await useCodesInfo.generateCustomTestObjectCode(type, useBasicInfo, useTestParams)
  }
  finally {
    if (type === 'sample') {
      genTestObjectCodeLoading.value = false
    }
    else {
      genProvideSampleCodeLoading.value = false
    }
  }
}

// 选择样品/参数
async function onSelectParam() {
  if (useBasicInfo.data.bigCategoryId) {
    const res = await getCategoryById(useBasicInfo.data.bigCategoryId)

    if (res.data.isDeleted !== '1') {
      openSelectParamModal()
    }
    else {
      Modal.confirm({
        title: '提示',
        content: `当前样品所在大类“${useBasicInfo.data.bigCategoryNames || ''}”在系统中已被删除，若您重新选择样品和检测参数，原有样品信息将被覆盖，无法恢复！请谨慎选择！`,
        cancelText: '保持原信息',
        okText: '更换样品',
        onOk: () => {
          openSelectParamModal()
        },
      })
    }
  }
  else {
    openSelectParamModal()
  }
}

// 选择资质
function onSelectQulification(rows: QualificationEntity[]) {
  const ids = useTestParams.selectedRowKey
  mainController.qualificationManager.setQualifications(ids.join(','), rows)
}

// 选择特殊字符
function onSelectSpecialCharacter(val: string) {
  bindSpecialCharacter(val)
}

function onChangeIsNeedConclusion() {
  if (useTestParams.USING_RECOMMENDED_PARAMETER_STANDARD && useTestParams.selectedRows.length > 0) {
    if (!useBasicInfo.data.isNeedConclusion) {
      Modal.confirm({
        title: '提示',
        content: `不需要评定结果时，将会清空已选参数的评定标准，确认是否继续？`,
        onOk: () => {
          useTestParams.selectedRows.forEach((i) => {
            i.standards.forEach((j) => {
              j.selected = false
            })
          })
        },
        onCancel: () => {
          useBasicInfo.data.isNeedConclusion = true
        },
      })
    }
    else {
      Modal.info({
        title: '提示',
        content: '若存在未选评定标准的参数，需要重选评定标准！',
      })
    }
  }
}

defineExpose({
  checkFormData: mainController.checkFormData.bind(mainController),
  getMetaData,
})
</script>

<style lang="less">
:where(.css-dev-only-do-not-override-12igfc9).ant-checkbox-disabled+span,
.ant-select-disabled:where(.css-dev-only-do-not-override-12igfc9).ant-select:not(.ant-select-customize-input) .ant-select-selector,
:where(.css-dev-only-do-not-override-12igfc9).ant-input-disabled, :where(.css-dev-only-do-not-override-12igfc9).ant-input[disabled] {
  color: #666;
}
</style>

<style lang="less" scoped>
:deep(.ant-form-item) {
  margin-bottom: 8px;
}

:deep(.ant-form .ant-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.ant-collapse>.ant-collapse-item:last-child>.ant-collapse-header) {
  padding: 8px 12px;
}

:deep(.ant-collapse .ant-collapse-content>.ant-collapse-content-box) {
  padding: 8px;
}

.header-bar {
  width: 100%;
  z-index: 10;
  padding: 8px;
  border-bottom: solid 1px #e2e2e2;
  background: #fff;
}

.footer-bar {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 10;
  padding: 16px;
  border-top: solid 1px #e2e2e2;
  background: #fff;
  text-align: right;
  justify-content: end;
}
</style>
