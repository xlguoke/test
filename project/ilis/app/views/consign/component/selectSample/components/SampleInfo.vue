<template>
  <a-form :model="formData" :label-col="{ flex: '120px' }" :wrapper-col="{ flex: 'auto' }">
    <a-form-item v-if="mainController.sampleIndustryService.enableField.testSampleDisplayName" :label="term('样品名称')" name="testSampleDisplayName">
      <a-input
        v-model:value="formData.testSampleDisplayName"
        :disabled="isDetailPage"
        :placeholder="placeholder(`请输入${term('样品名称')}`)"
        @focus="bindSpecialCharacter(useSampleInfo.setSpecialCharacter('testSampleDisplayName'))"
      />
    </a-form-item>
    <a-form-item v-if="mainController.sampleIndustryService.enableField.standard" :label="term('规格型号')" name="standard">
      <a-input-group compact>
        <a-input
          v-model:value="formData.standard"
          :disabled="isDetailPage"
          readonly
          style="width: calc(100% - 48px)"
          :placeholder="placeholder('请选择规格型号')"
          @click="setSpecificationVisible(true)"
        />
        <a-button :disabled="!isSelectTestParams" style="width: 48px;" @click="setSpecificationVisible(true)">
          <BarsOutlined title="选择" style="display:inline-flex;font-size: 18px;" />
        </a-button>
      </a-input-group>
    </a-form-item>
    <a-form-item v-if="mainController.sampleIndustryService.enableField.testPart" :label="term('检测部位')" name="testPart">
      <a-input-group compact>
        <a-input
          v-model:value="formData.testPart"
          style="width: calc(100% - 48px)"
          :placeholder="placeholder('请选择检测部位')"
          readonly
          :disabled="isDetailPage"
          @click="setTestPartVisible(true)"
        />
        <a-button :disabled="isDetailPage || !isSelectTestParams" style="width: 48px;" @click="setTestPartVisible(true)">
          <BarsOutlined title="选择" style="display:inline-flex;font-size: 18px;" />
        </a-button>
      </a-input-group>
    </a-form-item>
    <a-form-item v-if="mainController.sampleIndustryService.enableField.projectPartAndUse" :label="term('工程部位/用途')" name="projectPartAndUse">
      <a-input-group compact>
        <a-input v-if="enableProjectPartBlindSample" disabled value="***" />
        <a-input
          v-else
          v-model:value="formData.projectPartAndUse"
          :style="{ width: useSampleInfo.Third_Party_BIM ? 'calc(100% - 48px)' : '100%' }"
          :placeholder="placeholder('请输入或选择工程部位/用途')"
          :disabled="isDetailPage"
          @focus="bindSpecialCharacter(useSampleInfo.setSpecialCharacter('projectPartAndUse'))"
          @change="useSampleInfo.setDataField('externalInfo', '')"
        />
        <a-button v-if="useSampleInfo.Third_Party_BIM" :disabled="isDetailPage" style="width: 48px;" @click="setEbsVisible(true)">
          <BarsOutlined title="选择" style="display:inline-flex;font-size: 18px;" />
        </a-button>
      </a-input-group>
    </a-form-item>
    <a-form-item v-if="mainController.sampleIndustryService.enableField.testObjectDescription" :label="term('样品描述')" name="description">
      <a-auto-complete
        v-model:value="formData.description"
        :options="useSampleInfo.descriptionOptions"
        :disabled="isDetailPage"
        :open="descriptionListOpen"
        @select="descriptionListOpen = false"
      >
        <template #option="item">
          {{ item.value }}
        </template>
        <a-input-group compact>
          <a-input
            v-model:value="formData.description"
            :disabled="isDetailPage"
            :placeholder="placeholder(`请输入${term('样品描述')}`)"
            style="width: calc(100% - 28px)"
            @focus="bindSpecialCharacter(useSampleInfo.setSpecialCharacter('description'))"
          />
          <a-button :disabled="isDetailPage || !useSampleInfo.descriptionOptions.length" @click="descriptionListOpen = !descriptionListOpen">
            <template #icon>
              <component :is="descriptionListOpen ? UpOutlined : DownOutlined" />
            </template>
          </a-button>
        </a-input-group>
      </a-auto-complete>
    </a-form-item>
    <a-form-item v-if="mainController.sampleIndustryService.enableField.sampleNum" :label="term('样品数量')">
      <a-row :gutter="8">
        <a-col :span="16">
          <a-input
            v-model:value="formData.sampleNumVal"
            :disabled="isDetailPage"
            class="!w-full"
            :placeholder="placeholder(`请输入${term('样品数量')}`)"
            @blur="checkFloatNumber('sampleNumVal')"
          />
        </a-col>
        <a-col :span="8">
          <a-auto-complete
            v-model:value="formData.sampleNumUnit"
            :options="useSampleInfo.sampleNumUnitOptions"
            :disabled="isDetailPage"
            :open="sampleNumUnitListOpen"
            @select="sampleNumUnitListOpen = false"
          >
            <a-input-group compact>
              <a-input
                v-model:value="formData.sampleNumUnit"
                :disabled="isDetailPage"
                :placeholder="placeholder('请输入单位')"
                style="width: calc(100% - 28px)"
                @blur="checkInputUnit('sampleNumUnit')"
              />
              <a-button :disabled="isDetailPage || !useSampleInfo.sampleNumUnitOptions.length" @click="sampleNumUnitListOpen = !sampleNumUnitListOpen">
                <template #icon>
                  <component :is="sampleNumUnitListOpen ? UpOutlined : DownOutlined" />
                </template>
              </a-button>
            </a-input-group>
          </a-auto-complete>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item v-if="mainController.sampleIndustryService.enableField.delegatesNum" :label="term('代表数量')">
      <a-row :gutter="8">
        <a-col :span="16">
          <a-input
            v-model:value="formData.delegatesNumVal"
            :disabled="isDetailPage"
            class="!w-full"
            :placeholder="placeholder('请输入代表数量')"
            @blur="checkFloatNumber('delegatesNumVal')"
          />
        </a-col>
        <a-col :span="8">
          <a-auto-complete
            v-model:value="formData.delegatesNumUnit"
            :options="useSampleInfo.sampleNumUnitOptions"
            :disabled="isDetailPage"
            :open="delegatesNumUnitListOpen"
            @select="delegatesNumUnitListOpen = false"
          >
            <a-input-group compact>
              <a-input
                v-model:value="formData.delegatesNumUnit"
                :disabled="isDetailPage"
                :placeholder="placeholder('请输入单位')"
                style="width: calc(100% - 28px)"
                @blur="checkInputUnit('delegatesNumUnit')"
              />
              <a-button :disabled="isDetailPage || !useSampleInfo.sampleNumUnitOptions.length" @click="delegatesNumUnitListOpen = !delegatesNumUnitListOpen">
                <template #icon>
                  <component :is="delegatesNumUnitListOpen ? UpOutlined : DownOutlined" />
                </template>
              </a-button>
            </a-input-group>
          </a-auto-complete>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item v-if="mainController.sampleIndustryService.enableField.sampleProcessMethod" :label="term('测后样品处理')" name="sampleProcessMethod">
      <a-select v-model:value="formData.sampleProcessMethod" :disabled="isDetailPage" :placeholder="placeholder(`请选择${term('测后样品处理')}`)">
        <a-select-option v-for="d in useSampleInfo.sampleProcessMethodOptions" :key="d.id" :value="d.typename">
          {{ d.typename }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="mainController.sampleIndustryService.enableField.retentionHowLong" :label="term('留样期限')">
      <a-row :gutter="8">
        <a-col :span="16">
          <a-input-number v-model:value="formData.retentionHowLong" :disabled="isDetailPage" :min="0" :placeholder="placeholder('请输入留样期限')" style="width: 100%;" />
        </a-col>
        <a-col :span="8">
          <a-select v-model:value="formData.retentionTimeUnit" :disabled="isDetailPage">
            <a-select-option value="D">
              日
            </a-select-option>
            <a-select-option value="M">
              月
            </a-select-option>
            <a-select-option value="Y">
              年
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item :label="term('样品存放位置')" name="repository">
      <a-auto-complete
        v-model:value="formData.repository"
        :options="useSampleInfo.repositoryOptions"
        :disabled="isDetailPage"
        :open="repositoryListOpen"
        @select="repositoryListOpen = false"
      >
        <a-input-group compact>
          <a-input
            v-model:value="formData.repository"
            :disabled="isDetailPage"
            :placeholder="placeholder(term('请输入样品存放位置'))"
            style="width: calc(100% - 28px)"
            @focus="bindSpecialCharacter(useSampleInfo.setSpecialCharacter('repository'))"
          />
          <a-button :disabled="isDetailPage || !useSampleInfo.repositoryOptions.length" @click="repositoryListOpen = !repositoryListOpen">
            <template #icon>
              <component :is="repositoryListOpen ? UpOutlined : DownOutlined" />
            </template>
          </a-button>
        </a-input-group>
      </a-auto-complete>
    </a-form-item>
    <a-form-item label="备注" name="remark">
      <a-textarea
        v-model:value="formData.remark"
        :disabled="isDetailPage"
        :placeholder="placeholder('请输入备注')"
        :rows="1"
        @focus="bindSpecialCharacter(useSampleInfo.setSpecialCharacter('remark'))"
      />
    </a-form-item>

    <ht-modal
      v-model:open="ebsVisible"
      title="设置工程部位/用途"
      width="800px"
      :mask-closable="false"
      destroy-on-close
      @cancel="setEbsVisible(false)"
    >
      <iframe ref="EBSIframe" width="100%" height="540px" src="/ilis2/view.do?page=editSampleProjectPartOrUse" frameborder="0"></iframe>
      <template #footer>
        <a-button @click="setEbsVisible(false)">
          关闭
        </a-button>
        <a-button type="primary" @click="getEbsData">
          确定
        </a-button>
      </template>
    </ht-modal>

    <!-- 规格型号 -->
    <SpecificationModal
      v-model:open="specificationVisible"
      :sample-id="testUnitTestSampleId"
      :specifications="specificationConfig"
      :view="specificationsView"
      :force-render="specificationsView === VIEW_TYPE.ADD"
      @after-render="afterRenderSpecification"
      @ok="onSaveSpecification"
    />

    <!-- 工程部位/用途 -->
    <EditTestPart v-model:open="testPartVisible" />
  </a-form>
</template>

<script setup lang='ts'>
import type { UseSampleInfo } from '../modules/UseSampleInfo'
import type { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type { TestOtherInfoMetaDataItem, UseTestOtherInfo } from '~/views/consign/component/selectSample/modules/UseTestOtherInfo.ts'
import type { UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import type { Specifications, SpecificationsInfo } from '~/views/consign/component/selectSpecification'
import { BarsOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { useIndustryStore } from '~/store/industryStore.ts'
import { useBlindSample } from '~/views/consign/component/selectSample/hooks/useBlindSample.ts'
import { SpecificationModal, VIEW_TYPE } from '~/views/consign/component/selectSpecification'
import EditTestPart from './EditTestPart.vue'

// 主入口
const mainController = inject('mainController') as MainController

// 基本信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo
// 样品信息
const useSampleInfo = inject('useSampleInfo') as UseSampleInfo
// 收样辅助信息
const useTestOtherInfo = inject('useTestOtherInfo') as UseTestOtherInfo
// 参数信息
const useTestParams = inject('useTestParams') as UseTestParams

// 特殊字符绑定
const bindSpecialCharacter = inject('bindSpecialCharacter') as (d: any) => void

// 工程部位/用途 选择EBS
const [ebsVisible, setEbsVisible] = useStateHooks(false)

// 工程部位/用途
const [testPartVisible, setTestPartVisible] = useStateHooks(false)

// 规格型号
const [specificationVisible, setSpecificationVisible] = useStateHooks(false)

const { term } = useIndustryStore()

const { enableProjectPartBlindSample } = useBlindSample(mainController.consginPageParam)

const EBSIframe = ref()

const formData = computed(() => useSampleInfo.data)

const testUnitTestSampleId = computed(() => useBasicInfo.data.testUnitTestSampleId)

const isSelectTestParams = computed(() => !!useTestParams.selectedRows.length)

const { isDetailPage } = mainController.pageState

const delegatesNumUnitListOpen = ref(false)

const sampleNumUnitListOpen = ref(false)

const repositoryListOpen = ref(false)

const descriptionListOpen = ref(false)

/** placeholder控制 */
function placeholder(text: string) {
  return isDetailPage ? '' : text
}

// 规格型号配置
const initSpecification = computed(() => {
  const specificationConfig = formData.value.specificationConfig || []

  if (isDetailPage) {
    return specificationConfig
  }

  const specInfo = useTestOtherInfo.mergeSpecifications(specificationConfig)
  return specInfo
})

// 通过watch监听赋值，避免计算属性多次触发更新
const specificationConfig = ref<Specifications[]>([])
watch(initSpecification, (newVal, oldVal) => {
  if (oldVal && oldVal.length && JSON.stringify(newVal) === JSON.stringify(oldVal))
    return
  specificationConfig.value = newVal as Specifications[]
}, {
  immediate: true,
})

const specificationsView = computed(() => {
  return useTestOtherInfo.specificationsView
})

// 监听表单输入变化，发送事件
watch(formData, (data) => {
  useSampleInfo.publishFieldChange('data', data)
}, { deep: true })

// 设置工程部位用途
function getEbsData() {
  const data = EBSIframe.value.contentWindow.getData()

  if (!data) {
    message.warn('请选择工程部位/用途')
    return
  }

  useSampleInfo.setDataField('projectPartAndUse', data.ebsName)
  useSampleInfo.setDataField('externalInfo', data.ebsId)
}

// 验证非0开头整数或小数
function validNum(val?: string) {
  if (!val)
    return ''
  // eslint-disable-next-line regexp/no-unused-capturing-group
  const reg = /^(0|[1-9](\d+)?)(\.\d+)?$/.test(val)
  if (reg)
    return val
  const num = Number.parseFloat(val)
  return Number.isNaN(num) ? '' : num.toString()
}

// 检查输入的浮点数
function checkFloatNumber(field: 'sampleNumVal' | 'delegatesNumVal') {
  let val = validNum(formData.value[field])
  if (val && Number(val) < 0)
    val = ''
  useSampleInfo.setDataField(field, val)
}

// 检查输入的单位
function checkInputUnit(field: 'sampleNumUnit' | 'delegatesNumUnit') {
  const val = formData.value[field] || ''
  const num = Number.parseInt(val)

  if (!Number.isNaN(num)) {
    message.warning('第一位不能为数字！')
    useSampleInfo.setDataField(field, val.replace(String(num), ''))
  }
}

// 获取规格型号
function onSaveSpecification(data: SpecificationsInfo) {
  // 保存输入的规格型号
  useSampleInfo.setDataField('standard', data.standard)
  useSampleInfo.setDataField('label', data.label)
  useSampleInfo.setDataField('model', data.model)
  useSampleInfo.setDataField('grade', data.grade)
  useSampleInfo.setDataField('specification', data.specification)
  useSampleInfo.setDataField('specificationConfig', data.specifications as TestOtherInfoMetaDataItem[])

  // 往收样辅助信息中写入规格型号字段
  useTestOtherInfo.updateValueByStandardConfig(data.specifications)

  nextTick(() => {
    useTestOtherInfo.specificationsView = VIEW_TYPE.EDIT
  })
}

// 强制渲染，更新规格型号
function afterRenderSpecification(data: SpecificationsInfo) {
  if (VIEW_TYPE.ADD !== specificationsView.value)
    return ''

  onSaveSpecification(data)
}
</script>
