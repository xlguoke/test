<template>
  <a-form :label-col="{ flex: '120px' }" :wrapper-col="{ flex: 'auto' }">
    <template v-for="item in otherInfos">
      <a-form-item v-if="!useTestOtherInfo.hideFields.includes(item.systemFieldName) && !item.isJoinSpecification" :key="item.attributeId" :name="item.attributeId">
        <template #label>
          <div class="w-[120px] break-all whitespace-normal">
            <FlagFilled v-if="item.testDataProcess || item.isNotNull" style="color:#ff7744;font-size: 16px;margin-right: 4px;" />
            <span v-if="item.customized" class="text-gray-400">（自定义）</span>
            <span :title="getLabel(item)">{{ getLabel(item) }}</span>
          </div>
        </template>

        <template v-if="item.dataType === 2">
          <a-input v-if="enableBlindSample && !item.isShowTest" disabled value="***" />
          <a-date-picker
            v-else
            v-model:value="item.value"
            value-format="YYYY-MM-DD"
            allow-clear
            :disabled="readonly"
            :placeholder="placeholder('请选择')"
            style="width: 100%;"
          />
        </template>
        <template v-else>
          <a-input v-if="enableBlindSample && !item.isShowTest" disabled value="***" />
          <a-auto-complete
            v-else
            v-model:value="item.value"
            :options="getInputOptions(item)"
            style="width: 100%"
            :disabled="readonly"
            :placeholder="placeholder('请输入')"
            @focus="bindSpecialCharacter(useTestOtherInfo.setSpecialCharacter(item.attributeId))"
          />
        </template>
      </a-form-item>
    </template>
  </a-form>
</template>

<script setup lang='ts'>
import { FlagFilled } from '@ant-design/icons-vue'
import type { TestOtherInfoItem, UseTestOtherInfo } from '../modules/UseTestOtherInfo'
import { usePageState } from '~/views/consign/component/selectSample/hooks/usePageState.ts'
import { useBlindSample } from '~/views/consign/component/selectSample/hooks/useBlindSample.ts'

const useTestOtherInfo = inject('useTestOtherInfo') as UseTestOtherInfo

const { readonly, placeholder } = usePageState()

const { enableBlindSample } = useBlindSample()

const otherInfos = computed(() => useTestOtherInfo.data.otherInfos)

// 特殊字符绑定
const bindSpecialCharacter = inject('bindSpecialCharacter')

watch(otherInfos, (data) => {
  useTestOtherInfo.publishFieldChange('otherInfos', data)
}, { deep: true })

function getLabel(item: TestOtherInfoItem) {
  return item.alias || item.displayName || item.name || ''
}

/**
 * ## 处理待选项
 */
function fixInputHistory(inputHistory?: string | string[]): string[] {
  if (!inputHistory)
    return []
  if (typeof (inputHistory) === 'string') {
    return inputHistory.split(';').filter(d => !!d)
  }
  return inputHistory.filter(d => !!d)
}

// 初始化下拉数据
function initInputHistory(item: TestOtherInfoItem) {
  const history = fixInputHistory(item.inputHistory) || []
  const sysList = item.listValue ? item.listValue.split(';').filter(d => !!d) : []
  const options = []
  for (let i = 0; i < sysList.length; i++) {
    const item = sysList[i]
    const ind = history.findIndex(d => d === item)
    if (ind !== -1) {
      history.splice(ind, 1)
    }
  }

  // 分组
  if (sysList.length > 0) {
    options.push({
      label: '系统字段',
      options: sysList.filter(d => !!d).map(d => ({ label: d, value: d })),
    })
  }
  if (history.length > 0) {
    options.push({
      label: '历史记录',
      options: history.filter(d => !!d).map(d => ({ label: d, value: d })),
    })
  }
  return options
}

// 格式化下拉数据
const getInputOptions = function (item: TestOtherInfoItem) {
  const options = initInputHistory(item)

  // 为输入框时，下拉项包含配置的listValue和历史输入数据
  if (item.dataType === 1) {
    // 合并并去重
    return options
  }

  // 为下拉框时，下拉项只来源于listValue
  // 注：根据之前的逻辑，下拉框也是可选可输入的
  if (item.dataType === 5) {
    return [options[0]]
  }

  return [options[1]]
}
</script>
