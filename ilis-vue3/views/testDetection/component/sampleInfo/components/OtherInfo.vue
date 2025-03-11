<template>
  <a-collapse v-model:active-key="activeKey">
    <a-collapse-panel key="1" header="辅助信息">
      <p class="mb-4 flex items-center text-[#090]">
        带 <img :src="flagsUrl" class="w-4 h-4 mx-1" /> 为参与试验数据处理的信息，请填写完整
      </p>
      <a-form :label-col="{ span: 7 }" label-wrap :disabled="disabled">
        <a-form-item v-for="item in otherInfo" :key="item.id">
          <template #label>
            <img v-if="item.testDataProcess || item.isNotNull" :src="flagsUrl" class="w-4 h-4 mx-1" />
            <span class="custom-form-item-label" :title="item.alias || item.displayName">
              <span v-if="item.customized" style="color:#888;">(自定义)</span>
              {{ item.alias || item.displayName }}
            </span>
          </template>
          <template v-if="item.isBlind">
            <a-input value="***" disabled />
          </template>
          <template v-else>
            <a-date-picker
              v-if="`${item.dataType}` === '2'"
              v-model:value="item.value"
              value-format="YYYY-MM-DD"
              class="w-full"
              :placeholder="`请选择${item.alias || item.displayName}`"
            />
            <a-auto-complete
              v-else
              v-model:value.trim="item.value"
              :placeholder="`请输入或选择${item.alias || item.displayName}`"
              :options="initInputHistory(item)"
            />
          </template>
        </a-form-item>
      </a-form>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang='ts'>
import type { Specifications } from '~/views/consign/component/selectSpecification'

export interface LocalSpecifications extends Specifications {
  isBlind?: boolean
}

const props = defineProps({
  datas: {
    type: Array as PropType<LocalSpecifications[]>,
    required: true,
  },
  /** 盲样 */
  blind: Boolean,
  /** 是否禁用 */
  disabled: Boolean,
  /** 是否为初始化时的样品 */
  isInitSample: Boolean,
})

const flagsUrl = 'data:image/svg+xml;utf8,%3Csvg%20class%3D%22icon%22%20style%3D%22width%3A%201em%3Bheight%3A%201em%3Bvertical-align%3A%20middle%3Bfill%3A%20currentColor%3Boverflow%3A%20hidden%3B%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h1024v1024H0V0z%22%20fill%3D%22%23202425%22%20opacity%3D%22.01%22%20%2F%3E%3Cpath%20d%3D%22M136.533333%20102.4a68.266667%2068.266667%200%200%200-68.266666%2068.266667v341.333333a68.266667%2068.266667%200%200%200%2068.266666%2068.266667h273.066667a68.266667%2068.266667%200%200%200%2068.266667%2068.266666h374.340266a68.266667%2068.266667%200%200%200%2062.737067-95.163733l-50.0736-116.872533a68.266667%2068.266667%200%200%201%200-53.794134l50.0736-116.872533A68.266667%2068.266667%200%200%200%20852.206933%20170.666667H614.4a68.266667%2068.266667%200%200%200-68.266667-68.266667H136.533333z%22%20fill%3D%22%23FF7744%22%20%2F%3E%3Cpath%20d%3D%22M102.4%2051.2A51.2%2051.2%200%200%201%20153.6%20102.4v819.2a51.2%2051.2%200%200%201-102.4%200V102.4A51.2%2051.2%200%200%201%20102.4%2051.2z%22%20fill%3D%22%23FFAA44%22%20%2F%3E%3C%2Fsvg%3E'
const hideFields = ['代表批量', '试样数量']
const activeKey = ref('1')
const otherInfo = ref<LocalSpecifications[]>([])

watch(() => props.datas, () => {
  initOtherInfo()
}, {
  immediate: true,
})

/** 初始化辅助信息 */
function initOtherInfo() {
  const list = props.datas.filter(d => !d.isJoinSpecification && (!hideFields.includes(d.systemFieldName)))
  if (otherInfo.value.length > 0) {
    setOtherInfoValue(list)
  }
  otherInfo.value = list
}

/**
 * 修改参数或样品层级，导致辅助信息改变时，对改变前后的同名(显示名称)字段进行赋值处理 #31643
 * 从A样品换成B样品，辅助信息默认值处理逻辑：
   1. A样品下辅助信息有值时，将A样品下辅助信息赋值给B样品同名辅助信息，此时若B样品下同名辅助信息有默认值，则将B样品辅助信息默认值放到待选项；
   2. A样品下辅助信息无值时，不做赋值处理，此时B样品有默认值直接显示
   3. 切换成最初始的样品时，不进行赋值处理，将当前填写的值均放到待选项中
   4. 存在盲样时，不做任何处理
 */
function setOtherInfoValue(resData: LocalSpecifications[]) {
  const oldInfos = otherInfo.value
  for (let i = 0; i < resData.length; i++) {
    const item = resData[i]

    // 盲样数据，不做处理
    if (item.isBlind)
      continue

    // 由于存在名称相同，id不同的情况，故不使用id进行匹配赋值
    const oldItem = oldInfos.filter(d => d.displayName === item.displayName)
    if (oldItem.length === 1) {
      const first = oldItem[0]
      if (first.isBlind || !first.value)
        continue
      if (props.isInitSample) {
        // 切换回最初始的样品
        if (`${item.dataType}` !== '2' && !item.inputHistory.includes(first.value)) {
          item.inputHistory.unshift(first.value)
        }
        continue
      }
      // 存在默认值时，将默认值放到待选项；日期类型不处理待选项
      if (item.value && `${item.dataType}` !== '2' && !item.inputHistory.includes(item.value)) {
        item.inputHistory.unshift(item.value)
      }
      item.value = first.value
    }
    else if (oldItem.length > 1) {
      // 更新前有两条名称相同系统字段不同的数据，更新后只保留了其中一条，将原来两条数据中，id匹配的当默认值显示，另一条放到下拉菜单中
      for (let j = 0; j < oldItem.length; j++) {
        const d = oldItem[j]
        if (d.isBlind || !d.value)
          continue

        if (props.isInitSample) {
          if (`${item.dataType}` !== '2' && !item.inputHistory.includes(d.value)) {
            item.inputHistory.unshift(d.value)
          }
          continue
        }
        if (item.value && `${item.dataType}` !== '2' && !item.inputHistory.includes(item.value)) {
          item.inputHistory.unshift(item.value)
        }

        if (nameKey(item) === nameKey(d)) {
          item.value = d.value
        }
        else if (!item.value) {
          item.value = d.value
        }
      }
    }
  }
}

function nameKey(d: Specifications) {
  return d.displayName + d.systemFieldName
}

/**
 * ## 处理待选项
 */
function fixInputHistory(inputHistory: string | string[]) {
  if (typeof (inputHistory) == 'string') {
    return inputHistory.split(';')
  }
  return inputHistory
}

// 初始化下拉数据
function initInputHistory(item: Specifications) {
  const history = fixInputHistory(item.inputHistory) || []
  const newHistory = history.map(d => ({ label: d, value: d, isDataCenter: false }))
  const options = []
  if (item.listValue) {
    const list = item.listValue.split(';')
    for (let i = 0; i < list.length; i++) {
      if (!list[i])
        continue
      const ind = history.findIndex(d => d === list[i])
      if (ind === -1) {
        newHistory.push({ label: list[i], value: list[i], isDataCenter: !item.customized })
      }
      else {
        newHistory[ind].isDataCenter = true
      }
    }
  }

  // 分组
  const sysList = newHistory.filter(d => d.isDataCenter)
  const historylist = newHistory.filter(d => !d.isDataCenter)
  if (sysList.length > 0) {
    options.push({
      label: '系统字段',
      options: sysList,
    })
  }
  if (historylist.length > 0) {
    options.push({
      label: '历史记录',
      options: historylist,
    })
  }
  return options
}

function saveData() {
  const datas = JSON.parse(JSON.stringify(props.datas))
  for (let i = 0; i < datas.length; i++) {
    const item = datas[i]
    delete item.isBlind
    const info = otherInfo.value.find(d => nameKey(d) === nameKey(item))
    if (!info)
      continue
    info.value = item.value
  }
  return datas
}

defineExpose({
  saveData,
})
</script>

<style scoped>
.ant-form-item{
  margin-bottom: 12px;
}
.custom-form-item-label{
  line-height: 14px;
  max-height: 31px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
