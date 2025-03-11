<template>
  <a-form :model="formData" :label-col="{ flex: '120px' }" :wrapper-col="{ flex: 'auto' }">
    <a-form-item label="样品名称" name="testSampleDisplayName">
      <a-input
        v-model:value="formData.testSampleDisplayName"
        :disabled="readonly"
        :placeholder="placeholder('请输入样品名称')"
        @focus="bindSpecialCharacter(useSampleInfo.setSpecialCharacter('testSampleDisplayName'))"
      />
    </a-form-item>
    <a-form-item label="规格型号" name="standard">
      <a-input-group compact>
        <a-input
          v-model:value="formData.standard"
          :disabled="readonly"
          readonly
          style="width: calc(100% - 48px)"
          :placeholder="placeholder('请输入规格型号')"
          @click="setSpecificationVisible(true)"
        />
        <a-button :disabled="!isSelectTestParams" style="width: 48px;" @click="setSpecificationVisible(true)">
          <BarsOutlined style="display:inline-flex;font-size: 18px;" />
        </a-button>
      </a-input-group>
    </a-form-item>
    <a-form-item label="检测部位" name="testPart">
      <a-input-group compact>
        <a-input
          v-model:value="formData.testPart"
          style="width: calc(100% - 48px)"
          :placeholder="placeholder('请输入检测部位')"
          readonly
          :disabled="readonly"
          @click="setTestPartVisible(true)"
        />
        <a-button :disabled="readonly || !isSelectTestParams" style="width: 48px;" @click="setTestPartVisible(true)">
          <BarsOutlined style="display:inline-flex;font-size: 18px;" />
        </a-button>
      </a-input-group>
    </a-form-item>
    <a-form-item label="工程部位/用途" name="projectPartAndUse">
      <a-input-group compact>
        <a-input v-if="enableProjectPartBlindSample" disabled value="***" />
        <a-input
          v-else
          v-model:value="formData.projectPartAndUse"
          :style="{ width: useSampleInfo.Third_Party_BIM ? 'calc(100% - 48px)' : '100%' }"
          :placeholder="placeholder('请输入工程部位/用途')"
          :disabled="readonly"
          @focus="bindSpecialCharacter(useSampleInfo.setSpecialCharacter('projectPartAndUse'))"
          @change="useSampleInfo.setDataField('externalInfo', '')"
        />
        <a-button v-if="useSampleInfo.Third_Party_BIM" :disabled="readonly" style="width: 48px;" @click="setEbsVisible(true)">
          <BarsOutlined style="display:inline-flex;font-size: 18px;" />
        </a-button>
      </a-input-group>
    </a-form-item>
    <a-form-item label="样品描述" name="description">
      <a-auto-complete
        v-model:value="formData.description"
        :options="useSampleInfo.descriptionOptions"
        :placeholder="placeholder('请输入样品描述')"
        :disabled="readonly"
        @focus="bindSpecialCharacter(useSampleInfo.setSpecialCharacter('description'))"
      >
        <template #option="item">
          {{ item.value }}
        </template>
      </a-auto-complete>
    </a-form-item>
    <a-form-item label="样品数量">
      <a-row :gutter="8">
        <a-col :span="16">
          <a-input-number v-model:value="formData.sampleNumVal" :disabled="readonly" class="w-full" :min="0" :placeholder="placeholder('请输入样品数量')" />
        </a-col>
        <a-col :span="8">
          <a-auto-complete
            v-model:value="formData.sampleNumUnit"
            :options="useSampleInfo.sampleNumUnitOptions"
            :placeholder="placeholder('请输入单位')"
            :disabled="readonly"
            @blur="checkInputUnit('sampleNumUnit')"
          />
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="代表数量">
      <a-row :gutter="8">
        <a-col :span="16">
          <a-input-number v-model:value="formData.delegatesNumVal" :disabled="readonly" class="w-full" :min="0" :placeholder="placeholder('请输入代表数量')" />
        </a-col>
        <a-col :span="8">
          <a-auto-complete
            v-model:value="formData.delegatesNumUnit"
            :options="useSampleInfo.sampleNumUnitOptions"
            :placeholder="placeholder('请输入单位')"
            :disabled="readonly"
            @blur="checkInputUnit('delegatesNumUnit')"
          />
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="测后样品处理" name="sampleProcessMethod">
      <a-select v-model:value="formData.sampleProcessMethod" :disabled="readonly" :placeholder="placeholder('请选择测后样品处理')">
        <a-select-option v-for="d in useSampleInfo.sampleProcessMethodOptions" :key="d.id" :value="d.typename">
          {{ d.typename }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="留样期限">
      <a-row :gutter="8">
        <a-col :span="16">
          <a-input-number v-model:value="formData.retentionHowLong" :disabled="readonly" :min="0" :placeholder="placeholder('请输入留样期限')" style="width: 100%;" />
        </a-col>
        <a-col :span="8">
          <a-select v-model:value="formData.retentionTimeUnit" :disabled="readonly">
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
    <a-form-item label="样品存放位置" name="repository">
      <a-auto-complete
        v-model:value="formData.repository"
        :options="useSampleInfo.repositoryOptions"
        :disabled="readonly"
        :placeholder="placeholder('请输入样品存放位置')"
        @focus="bindSpecialCharacter(useSampleInfo.setSpecialCharacter('repository'))"
      />
    </a-form-item>
    <a-form-item label="备注" name="remark">
      <a-input
        v-model:value="formData.remark"
        :disabled="readonly"
        :placeholder="placeholder('请输入备注')"
        @focus="bindSpecialCharacter(useSampleInfo.setSpecialCharacter('remark'))"
      />
    </a-form-item>

    <a-modal
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
    </a-modal>

    <!-- 规格型号 -->
    <SpecificationModal
      ref="specificationModalRef"
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
import { BarsOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UseSampleInfo } from '../modules/UseSampleInfo'
import EditTestPart from './EditTestPart.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { usePageState } from '~/views/consign/component/selectSample/hooks/usePageState.ts'
import type { Specifications, SpecificationsInfo } from '~/views/consign/component/selectSpecification'
import { SpecificationModal, VIEW_TYPE } from '~/views/consign/component/selectSpecification'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import type { TestOtherInfoMetaDataItem, UseTestOtherInfo } from '~/views/consign/component/selectSample/modules/UseTestOtherInfo.ts'
import type { UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import { useBlindSample } from '~/views/consign/component/selectSample/hooks/useBlindSample.ts'

// 基本信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo
// 样品信息
const useSampleInfo = inject('useSampleInfo') as UseSampleInfo
// 收样辅助信息
const useTestOtherInfo = inject('useTestOtherInfo') as UseTestOtherInfo
// 参数信息
const useTestParams = inject('useTestParams') as UseTestParams

// 特殊字符绑定
const bindSpecialCharacter = inject('bindSpecialCharacter')

const { readonly, placeholder } = usePageState()

// 工程部位/用途 选择EBS
const [ebsVisible, setEbsVisible] = useStateHooks(false)

// 工程部位/用途
const [testPartVisible, setTestPartVisible] = useStateHooks(false)

// 规格型号
const [specificationVisible, setSpecificationVisible] = useStateHooks(false)

const { enableProjectPartBlindSample } = useBlindSample()

const EBSIframe = ref()

const formData = computed(() => useSampleInfo.data)

const testUnitTestSampleId = computed(() => useBasicInfo.data.testUnitTestSampleId)

const isSelectTestParams = computed(() => !!useTestParams.selectedRows.length)

// 规格型号配置
const initSpecification = computed(() => {
  const specificationConfig = formData.value.specificationConfig || []

  if (MainController.isDetailPage) {
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
const specificationModalRef = ref()
function afterRenderSpecification(data: SpecificationsInfo) {
  if (VIEW_TYPE.ADD !== specificationsView.value)
    return ''

  /**
   * 兼容处理：样品层级规格型号未维护完，导致样品层级还是有规格型号数据，所以选择的是规格型号，需要将默认值改为当前选择的样品名称
   * 样品层级维护完成，样品树中不存在规格型号数据时，可将该逻辑移除
   */
  if (useTestOtherInfo.standardFields.includes(useSampleInfo.sampleLevelName)) {
    for (let i = 0; i < data.specifications.length; i++) {
      const item = data.specifications[i]
      if (item.systemFieldName === useSampleInfo.sampleLevelName) {
        item.value = useSampleInfo.sampleAttributeName
        break
      }
    }
    setStandardInfo(data, useSampleInfo.sampleAttributeName)
    data.standard = specificationModalRef.value.previewSpecification(data.specifications)
  }
  onSaveSpecification(data)
}

/**
 * 样品层级更新前的规格型号判断依据：系统字段值为型号、规格、等级、标号的表示规格型号
 * 样品层级更新后的规格型号判断依据：isJoinSpecification 为true的表示规格型号
 */
function setStandardInfo(data: SpecificationsInfo, sampleName: string) {
  switch (useSampleInfo.sampleLevelName) {
    case '型号':
      data.model = sampleName
      return
    case '规格':
      data.specification = sampleName
      return
    case '等级':
      data.grade = sampleName
      return
    case '标号':
      data.label = sampleName
      return
    default:
      return ''
  }
}
</script>
