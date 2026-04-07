<template>
  <a-form :label-col="{ flex: '140px' }" :wrapper-col="{ flex: 'auto' }">
    <template v-for="item in otherInfos">
      <a-form-item v-if="!useTestOtherInfo.hideFields.includes(item.systemFieldName) && !item.isJoinSpecification" :key="item.attributeId" :name="item.attributeId">
        <template #label>
          <div class="flex items-center w-[140px] justify-end">
            <FlagFilled v-if="item.testDataProcess || item.isNotNull" style="color:#ff7744;font-size: 16px;margin-right: 4px;" />
            <span :title="getLabel(item)" class="max-w-[110px] leading-[14px] whitespace-pre-wrap max-h-[28px] overflow-hidden">
              <span v-if="item.customized" class="text-gray-400">(自定义)</span>
              {{ getLabel(item) }}
            </span>
          </div>
        </template>

        <template v-if="item.dataType === 2">
          <a-input v-if="enableBlindSample && !item.isShowTest" disabled value="***" />
          <a-date-picker
            v-else
            v-model:value="item.value"
            value-format="YYYY-MM-DD"
            allow-clear
            :disabled="pageState.isDetailPage"
            :placeholder="placeholder('请选择')"
            style="width: 100%;"
          />
        </template>
        <template v-else>
          <a-input v-if="enableBlindSample && !item.isShowTest" disabled value="***" />
          <a-auto-complete
            v-else
            v-model:value="(item.value as string)"
            :open="item.listOpen || false"
            :options="getInputOptions(item)"
            style="width: 100%"
            @select="item.listOpen = false"
          >
            <template #default>
              <a-input-group compact>
                <a-input
                  v-model:value="(item.value as string)"
                  :disabled="pageState.isDetailPage"
                  :placeholder="placeholder('请输入')"
                  style="width: calc(100% - 28px)"
                  @focus="bindSpecialCharacter(useTestOtherInfo.setSpecialCharacter(item.attributeId))"
                  @blur="checkOtherInfoValue(item)"
                />
                <a-button :disabled="pageState.isDetailPage || !getInputOptions(item).length" @click="item.listOpen = !item.listOpen">
                  <template #icon>
                    <component :is="item.listOpen ? UpOutlined : DownOutlined" />
                  </template>
                </a-button>
              </a-input-group>
            </template>
          </a-auto-complete>
        </template>
      </a-form-item>
    </template>
  </a-form>
</template>

<script setup lang='ts'>
import type { MainController } from '../modules/MainController'
import type { TestOtherInfoItem } from '../modules/UseTestOtherInfo'
import { DownOutlined, FlagFilled, UpOutlined } from '@ant-design/icons-vue'
import { useBlindSample } from '~/views/consign/component/selectSample/hooks/useBlindSample.ts'
import { checkBatchNumberUnique } from '../api'
import { UseTestOtherInfo } from '../modules/UseTestOtherInfo'

// 主入口
const mainController = inject('mainController') as MainController
const useTestOtherInfo = inject('useTestOtherInfo') as UseTestOtherInfo

const { pageState, placeholder } = mainController.consginPageParam

const { enableBlindSample } = useBlindSample(mainController.consginPageParam)

const otherInfos = computed(() => useTestOtherInfo.data.otherInfos)

// 特殊字符绑定
const bindSpecialCharacter = inject('bindSpecialCharacter') as (d: any) => unknown

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
      options: sysList.filter(d => !!d).map((d) => {
        return {
          label: UseTestOtherInfo.getListValueLabel(d),
          value: UseTestOtherInfo.getListValueValue(d),
        }
      }),
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
function getInputOptions(item: TestOtherInfoItem) {
  const options = initInputHistory(item)

  // 为输入框时，下拉项包含配置的listValue和历史输入数据
  if (item.dataType === 1) {
    // 合并并去重
    return options
  }
  // 为下拉框时，下拉项只来源于listValue
  // 注：根据之前的逻辑，下拉框也是可选可输入的
  if (item.dataType === 5) {
    return options[0] ? [options[0]] : []
  }

  return options[1] ? [options[1]] : []
}

/** ## 用于校验批号的唯一性 */
let oldBatchNumber = ''
async function checkOtherInfoValue(item: TestOtherInfoItem) {
  if (oldBatchNumber === item.value)
    return
  oldBatchNumber = item.value as string

  if (item.systemFieldName !== '批号')
    return
  if (!item.value)
    return

  // 用于校验批号的唯一性
  const { data } = await checkBatchNumberUnique(item.value as string)
  if (data.success) {
    if (data.obj && data.obj.length > 0) {
      const msg = data.obj.map((d: any) => h('div', {}, [
        h('p', {}, `委托编号：${d.consignCode}`),
        h('p', {}, `样品编号：${d.objectCode}`),
      ]))
      modalError(msg, '当前批号已有历史委托')
    }
  }
  else {
    modalError('系统已存在相同批号!')
  }
}
</script>
