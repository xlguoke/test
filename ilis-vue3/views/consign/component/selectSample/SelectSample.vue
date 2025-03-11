<template>
  <AppProvider>
    <a-card class="h-full flex flex-col" :body-style="{ flex: 1, height: 0, padding: '0 0 16px 0', overflowY: 'auto' }">
      <div class="header-bar">
        <a-flex align="center" justify="space-between">
          <a-space>
            <div>
              样品/参数名称：
              {{ mainController.sampleTestParamsName || '[请选择样品]' }}
            </div>
            <a-button v-if="!readonly && !isNoticeModifyConsign" type="primary" @click="onSelectParam">
              选择样品
            </a-button>
            <a-button v-if="readonly" @click="setCheckSampleLevelVisible(true)">
              完整层级
            </a-button>
            <a-space class="ml-2">
              检测组数
              <a-input-number
                v-model:value="useBasicInfo.data.sampleAmount"
                :min="1"
                :disabled="readonly || isNoticeModifyConsign"
                @change="(val) => { useBasicInfo.publishFieldChange('sampleAmount', val) }"
              />
            </a-space>
            <SpecialCharacter v-if="!readonly" @select="onSelectSpecialCharacter">
              <a-button>特殊字符</a-button>
            </SpecialCharacter>
          </a-space>
          <div v-if="!readonly && !isCreateTestPage">
            <a-input-group v-if="useCodesInfo.enableTestObjectCode" compact class="text-right flex-1">
              <a-input
                :disabled="isNoticeModifyConsign || genTestObjectCodeLoading"
                addon-before="样品编号"
                style="text-align: left;width: 420px;"
                readonly
                :value="useCodesInfo.data.testObjectCode"
                @click="setObjectCodeVisible(true)"
              />
              <a-button
                :loading="genTestObjectCodeLoading"
                :disabled="isNoticeModifyConsign"
                type="primary"
                @click="generateCode('sample')"
              >
                生成编号
              </a-button>
            </a-input-group>
            <a-input-group v-if="useCodesInfo.enableProvideToCustomerSampleCode" compact class="text-right flex-1 mt-2">
              <a-input
                :disabled="isNoticeModifyConsign || genProvideSampleCodeLoading"
                addon-before="来样编号"
                style="text-align: left;width: 420px;"
                readonly
                :value="useCodesInfo.data.provideToCustomerSampleCode"
                @click="setProvideObjectCodeVisible(true)"
              />
              <a-button
                :loading="genProvideSampleCodeLoading"
                :disabled="isNoticeModifyConsign"
                type="primary"
                @click="generateCode('provideToCustomerSample')"
              >
                生成编号
              </a-button>
            </a-input-group>
          </div>
        </a-flex>
      </div>

      <div class="px-2 mt-2 pb-10" :style="{ paddingTop: pagePaddingTop }">
        <div class="mb-2">
          <a-space>
            <div v-if="SET_QUA_WITH_OBJECT" class="mr-2">
              <a-space>
                样品资质：
                <a-space :size="0">
                  <div class="qualificationLeft" :title="useBasicInfo.selectedQualificationStr">
                    <template v-if="useBasicInfo.selectedQualificationStr">
                      {{ useBasicInfo.selectedQualificationStr }}
                    </template>
                    <span v-else class="text-gray-400">请点击设置</span>
                  </div>
                  <a-button class="qualificationRight" :disabled="!useTestParams.selectedRows.length" @click="setQualificationSelectorVisible(true)">
                    设置
                  </a-button>
                </a-space>
              </a-space>
            </div>
            <div class="mr-2">
              规程提供方：
              <a-select
                v-model:value="useBasicInfo.data.baseStandardProvider"
                class="w-[240px]"
                :disabled="readonly"
                placeholder="请选择评定标准"
              >
                <a-select-option v-for="d in useBasicInfo.baseStandardProviderOptions" :key="d.id" :value="d.typename">
                  {{ d.typename }}
                </a-select-option>
              </a-select>
            </div>
            <a-checkbox v-model:checked="useBasicInfo.data.isNeedConclusion" :disabled="readonly" @change="onChangeIsNeedConclusion">
              需要评定结果
            </a-checkbox>
            <a-checkbox v-model:checked="useBasicInfo.data.urgentStatus" :disabled="readonly">
              加急检测
            </a-checkbox>
          </a-space>
        </div>

        <a-row :gutter="[8, 8]">
          <a-col :span="24">
            <a-collapse v-model:active-key="collapseState.检测参数">
              <a-collapse-panel key="1" header="检测参数">
                <TestParams />
              </a-collapse-panel>
            </a-collapse>
          </a-col>
          <a-col :span="12">
            <a-collapse v-model:active-key="collapseState.取样信息">
              <a-collapse-panel key="1" header="取样信息">
                <SamplingInfo />
              </a-collapse-panel>
            </a-collapse>
          </a-col>
          <a-col :span="12">
            <a-collapse v-model:active-key="collapseState.收样要求">
              <a-collapse-panel key="1" header="收样要求">
                <SampleRequirement v-if="useBasicInfo.data.testUnitTestSampleId" :sample-id="useBasicInfo.data.testUnitTestSampleId" :test-item-ids="useTestParams.testItemIds" />
              </a-collapse-panel>
            </a-collapse>
          </a-col>
          <a-col :span="24">
            <a-collapse v-model:active-key="collapseState.样品信息">
              <a-collapse-panel key="1" header="样品信息">
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
          <a-col :span="24">
            <a-collapse v-model:active-key="collapseState.附加费用">
              <a-collapse-panel key="1" header="附加费用">
                <AdditionalFee :data-source="useAdditionalFee.data" />
              </a-collapse-panel>
            </a-collapse>
          </a-col>
          <a-col :span="24">
            <a-collapse v-model:active-key="collapseState.制样信息">
              <a-collapse-panel key="1" header="制样信息">
                <Period :data-source="usePeriod.data" />
              </a-collapse-panel>
            </a-collapse>
          </a-col>
          <a-col :span="24">
            <a-collapse v-model:active-key="collapseState.抽样信息">
              <a-collapse-panel key="1" header="抽样信息">
                <a-textarea
                  v-model:value="useBasicInfo.data.samplingInfo"
                  :rows="4"
                  :disabled="readonly"
                  :placeholder="placeholder('请描述抽样日期，抽取地点，抽样程序，抽样依据及抽样过程中可能影响检测结果解释的环境条件情况等')"
                />
              </a-collapse-panel>
            </a-collapse>
          </a-col>
          <a-col :span="24">
            <a-collapse v-model:active-key="collapseState.附件">
              <a-collapse-panel key="1" header="附件">
                <Attachment />
              </a-collapse-panel>
            </a-collapse>
          </a-col>
        </a-row>
      </div>

      <a-space class="footer-bar">
        <template v-if="MainController.isDetailPage">
          <a-button @click="onClose">
            关闭
          </a-button>
        </template>
        <template v-else>
          <a-button @click="onClose">
            取消
          </a-button>
          <a-button type="primary" @click="onSubmit">
            确定
          </a-button>
        </template>
      </a-space>
    </a-card>

    <!-- 选择参数 -->
    <SelectSampleParamModal v-model:open="selectParamVisible" @on-select="getSampleParams" />

    <!-- 设置样品编号 -->
    <EditObjectCode v-model:open="objectCodeVisible" />

    <!-- 设置来样编号 -->
    <EditProvideSampleCode v-model:open="provideObjectCodeVisible" />

    <!-- 查看样品完整层级 -->
    <CheckSampleLevel v-model:open="checkSampleLevelVisible" />

    <!-- 资质 -->
    <QualificationSelector v-model:open="qualificationSelectorVisible" :selected="useBasicInfo.data.qualifications" @on-select="onSelectQulification" />
  </AppProvider>
</template>

<script setup lang='ts'>
import { FlagFilled } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import { useCollapseState } from './hooks/useCollapseState'

import SamplingInfo from './components/SamplingInfo.vue'
import SampleRequirement from './components/SampleRequirement.vue'
import SampleInfo from './components/SampleInfo.vue'
import TestOtherInfo from './components/TestOtherInfo.vue'
import AdditionalFee from './components/AdditionalFee.vue'
import Period from './components/Period.vue'
import Attachment from './components/Attachment.vue'
import TestParams from './components/TestParams.vue'
import EditObjectCode from './components/EditObjectCode.vue'
import EditProvideSampleCode from './components/EditProvideSampleCode.vue'
import CheckSampleLevel from './components/CheckSampleLevel.vue'

import { UseSamplingInfo } from './modules/UseSamplingInfo'
import { UseSampleInfo } from './modules/UseSampleInfo'
import { UseTestOtherInfo } from './modules/UseTestOtherInfo'
import { UseAdditionalFee } from './modules/UseAdditionalFee'
import { UsePeriod } from './modules/UsePeriod'
import { UseBasicInfo } from './modules/UseBasicInfo'
import { UseAttachment } from './modules/UseAttachment.ts'
import QualificationSelector from '~/components/QualificationSelector.vue'
import SpecialCharacter from '~/components/specialCharacter/Index.vue'
import { SelectSampleParamModal } from '~/views/consign/component/selectSampleParam'
import type { SelectSampleParamEntity } from '~/views/consign/component/selectSampleParam'
import { UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { usePageState } from '~/views/consign/component/selectSample/hooks/usePageState.ts'
import { usePageParams } from '~/views/consign/component/selectSample/hooks/usePageParams.ts'
import { UseCodesInfo } from '~/views/consign/component/selectSample/modules/UseCodesInfo.ts'
import { getCategoryById } from '~/views/consign/component/selectSample/api.ts'
import type { QualificationEntity } from '~/views/consign/component/selectSample/interface/Qualification.ts'

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

const { readonly, placeholder, isNoticeModifyConsign, isCreateTestPage } = usePageState()

const { SET_QUA_WITH_OBJECT } = usePageParams()

// 基础信息
const useBasicInfo: UseBasicInfo = reactive(new UseBasicInfo())
// 编号信息
const useCodesInfo: UseCodesInfo = reactive(new UseCodesInfo())
// 检测参数
const useTestParams: UseTestParams = reactive(new UseTestParams(useBasicInfo))
// 取样信息
const useSamplingInfo: UseSamplingInfo = reactive(new UseSamplingInfo())
// 样品信息
const useSampleInfo: UseSampleInfo = reactive(new UseSampleInfo())
// 收样辅助信息
const useTestOtherInfo: UseTestOtherInfo = reactive(new UseTestOtherInfo())
// 附加费用
const useAdditionalFee: UseAdditionalFee = reactive(new UseAdditionalFee())
// 制样信息/龄期
const usePeriod: UsePeriod = reactive(new UsePeriod())
// 附件
const useAttachment: UseAttachment = reactive(new UseAttachment())

useBasicInfo.init()
useCodesInfo.init()

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
const [selectParamVisible, setSelectParamVisible] = useStateHooks(false)

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

// 无法在每个模块独立处理的复杂业务逻辑，可以在该模块中处理
const mainController = new MainController({
  useBasicInfo,
  useCodesInfo,
  useTestParams,
  useSamplingInfo,
  useSampleInfo,
  useTestOtherInfo,
  useAdditionalFee,
  usePeriod,
  useAttachment,
})

const pagePaddingTop = computed(() => {
  if (MainController.isDetailPage) {
    return '48px'
  }
  return useCodesInfo.enableProvideToCustomerSampleCode ? '88px' : '48px'
})

// 绑定特殊字符赋值
const bindSpecialCharacter = (function () {
  let fn = null
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

/** 抛给委托页面调用 */
window.validateSpecifications = mainController.validateSpecifications.bind(mainController)
window.checkFormData = mainController.checkFormData.bind(mainController)
window.getMetaData = getMetaData

if (MainController.isAddPage) {
  setSelectParamVisible(true)
}

// 获取元数据
async function getMetaData() {
  const meta = await mainController.getMetaData()
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

  await useCodesInfo.generateCustomTestObjectCode(type, useBasicInfo, useTestParams)

  if (type === 'sample') {
    genTestObjectCodeLoading.value = false
  }
  else {
    genProvideSampleCodeLoading.value = false
  }
}

// 选择样品/参数
async function onSelectParam() {
  if (useBasicInfo.data.bigCategoryId) {
    const res = await getCategoryById(useBasicInfo.data.bigCategoryId)

    if (res.data.isDeleted !== '1') {
      setSelectParamVisible(true)
    }
    else {
      Modal.confirm({
        title: '提示',
        content: `当前样品所在大类“${useBasicInfo.data.bigCategoryNames || ''}”在系统中已被删除，若您重新选择样品和检测参数，原有样品信息将被覆盖，无法恢复！请谨慎选择！`,
        cancelText: '保持原信息',
        okText: '更换样品',
        onOk: () => {
          setSelectParamVisible(true)
        },
      })
    }
  }
  else {
    setSelectParamVisible(true)
  }
}

// 选择资质
function onSelectQulification(rows: QualificationEntity[]) {
  const ids = useTestParams.selectedRowKey
  mainController.setQualifications(ids.join(','), rows)
}

// 选择特殊字符
function onSelectSpecialCharacter(val) {
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

// 提交
function onSubmit() {
  MainController.consignWindow.handleSampleYes()
}

// 关闭
function onClose() {
  const index = parent.layer.getFrameIndex(window.name)
  parent.layer.close(index)
}
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

.qualificationLeft {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  height: 32px;
  line-height: 30px;
  border: solid 1px #e2e2e2;
  padding: 0 8px;
  border-right: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 600px;
  min-width: 180px;
}

.qualificationRight {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.header-bar {
  position: fixed;
  top: 0;
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
