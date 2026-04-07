<template>
  <div class="min-h-[50vh] overflow-x-hidden">
    <a-spin :spinning="spinning">
      <a-alert
        type="warning"
        class="!mt-2 !mb-3"
        message="选择系统提供的下拉默认选项后，如有补充信息，请点击+号进行追加，请勿直接在系统提供的选项中直接修改信息，会影响模板计算或技术指标的显示"
      />

      <!-- 特殊字符 -->
      <SpecialCharacter
        v-if="!disabled"
        ref="specialCharacterRef"
        class="float-right"
        @select="selectCharacter"
        @cancel="cancelCharacter"
      />

      <a-form>
        <a-form-item
          v-for="(s, i) in specifications"
          :key="i"
        >
          <template #label>
            <div :title="s.displayName" class="custom-form-label">
              {{ s.alias || s.displayName }}
            </div>
          </template>
          <a-row :gutter="8">
            <a-col>
              <a-auto-complete
                v-model:value="s.value"
                clearable
                :placeholder="`${disabled ? '' : '请输入或选择'}`"
                style="width: 220px"
                :options="initInputHistory(s)"
                :disabled="disabled"
                @focus="handleFocus(i)"
              >
              </a-auto-complete>
            </a-col>
            <a-col>
              <a-button-group v-if="!disabled" class="custom-button-group">
                <a-button title="添加属性" :icon="h(PlusOutlined)" @click="handleAppend(i)" />
                <a-button
                  v-if="i > 0"
                  title="上移"
                  :icon="h(ArrowUpOutlined)"
                  @click="handlePosition(i, i - 1)"
                >
                </a-button>
                <a-button
                  v-if="i < specifications.length - 1"
                  title="下移"
                  :icon="h(ArrowDownOutlined)"
                  @click="handlePosition(i, i + 1)"
                ></a-button>
                <a-button
                  v-if="s.deleteAble"
                  title="删除"
                  :icon="h(DeleteOutlined)"
                  @click="handleDelete(i)"
                ></a-button>
              </a-button-group>
              <span v-if="s.value && getSpace(s.value) > 0" class="text-gray-500 text-xs ml-2">内容中含有{{ getSpace(s.value) }}个空格</span>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
      <a-divider style="border-color: #ccc" dashed />

      <a-form label-align="right">
        <a-form-item>
          <template #label>
            <div title="规格型号预览" class="custom-form-label">
              规格型号预览
            </div>
          </template>
          <a-input :value="preview" class="w-[290px]" readonly></a-input>
        </a-form-item>
      </a-form>

      <template v-if="showAddProperty">
        <div class="ml-8 mt-12">
          <a-button @click="addProperty">
            添加属性
          </a-button>
        </div>

        <AddProperty v-model:open="visible" :sample-id="sampleId" @ok="addPropertyOk" />
      </template>
    </a-spin>
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import type { _VIEW_TYPE_, Specifications, SpecificationsInfo } from '../api'
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from '@unovis/ts'
import { useDateFormat, useDebounceFn } from '@vueuse/core'
import { message } from 'ant-design-vue'
import { getDictByCode } from '~/api/common'
import { SpecialCharacter } from '~/components/specialCharacter'
import { UseTestOtherInfo } from '~/views/consign/component/selectSample/modules/UseTestOtherInfo.ts'
import { connector_default, connectorValue, DEFAULT_VALUE, SYSTEM_FIELDS_ENUM, SYSTEM_FIELDS_NAME } from '..'
import { getLastConfig, saveConfig, VIEW_TYPE } from '../api'
import { mergeConfigSpecifications } from '../modules/mergeSpecifications'
import AddProperty from './AddProperty.vue'

const props = defineProps({
  pSpecifications: {
    type: Array as PropType<Specifications[]>,
    required: true,
  },
  sampleId: {
    type: String,
    required: true,
  },
  independent: {
    type: Boolean,
    default: false,
  },
  viewType: {
    type: String as PropType<_VIEW_TYPE_>,
    default: VIEW_TYPE.ADD,
  },
  showAddProperty: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits<{
  /** 添加属性成功的回调 */
  (e: 'addProperty'): void
  /** 弹窗内容加载完成后的回调 */
  (e: 'afterRender'): void
}>()

/**
 * # 拼接规格型号
 * @param {Specifications[]} datas 规格型号明细-弹窗内的全部内容
 * @returns string 拼接后的规格型号
 */
function previewSpecification(datas: Specifications[]) {
  const str = datas
    .filter(i => i.value !== '' && i.value !== undefined && i.value !== null)
    .map(i => i.value)
    .join('')
  return str.trim()
}

let old_sampleId = ''

const disabled = computed(() => VIEW_TYPE.DETAIL === props.viewType)
/** 规格型号属性列表 */
const specifications = ref<Specifications[]>([])
/** 拼接后的规格型号 */
const preview = computed(() => previewSpecification(specifications.value))
const spinning = ref(false)
/** 系统配置的连接符 */
const sysConnector = ref('')

const initDataDebounce = useDebounceFn(initData, 100)

/**
 * 监听规格型号数据变化，初始化规格型号明细
 * 1. 明细数据为空时，初始化 —— 默认数据
 * 2. 切换样品时初始化 —— 存在不同样品规格型号一致的情况，故需要检测是否切换了样品
 * 2. 规格型号数据变更时初始化 —— 系统配置的规格型号变更，编辑数据时需要重新初始化
 */
watch(
  () => props.pSpecifications,
  (list) => {
    const noData = list.length === 0
    const changeData = !noData && JSON.stringify(list) !== JSON.stringify(specifications.value)
    if (noData || changeData || old_sampleId !== props.sampleId) {
      old_sampleId = props.sampleId
      initDataDebounce(cloneDeep(list))
    }
  },
  {
    immediate: true,
  },
)

/**
 * ## 初始化规格型号数据
 */
let originRules: Specifications[] = []
async function initData(metaSpecifications: Specifications[]) {
  if (!props.sampleId) {
    console.warn('initData: 未选择样品')
    return
  }
  let datas = cloneDeep(metaSpecifications)
  spinning.value = true
  await getDefaultConnector()
  if (props.viewType === VIEW_TYPE.ADD) {
    const configs = await getSampleLastConfig()
    originRules = cloneDeep(configs)
    datas = mergeConfigSpecifications(datas, configs)
    datas = initConnector(datas)
  }
  else {
    datas.forEach((item) => {
      if (!item.isJoinSpecification) {
        item.deleteAble = true
      }
      if (item.displayName === '连接符') {
        item.listValue = sysConnector.value
      }
    })
  }
  if (datas.length === 0) {
    datas.push({
      ...DEFAULT_VALUE,
      displayName: '规格型号',
      name: '规格型号',
      deleteAble: false,
      value: '',
    })
  }

  checkRepeatSpecification(metaSpecifications, datas)
  specifications.value = datas
  nextTick(() => {
    spinning.value = false
    emits('afterRender')
  })
}

/**
 * 获取默认连接符
 */
async function getDefaultConnector() {
  if (!sysConnector.value) {
    try {
      const { data } = await getDictByCode('specification:options')
      sysConnector.value = data.map(d => d.typeCode).join(';')
    }
    catch (e) {
      console.error(e)
      sysConnector.value = connector_default
    }
  }
}

/**
 * 验证规格型号是否存在重复数据：线上问题，未排查到数据重复的具体原因，添加错误数据日志记录
 */
const { value: nowDate } = useDateFormat(Date.now(), 'YYYY-MM-DD HH:mm:ss')
function checkRepeatSpecification(
  specifications: Specifications[],
  datas: Specifications[],
) {
  const repeatObj: any = {}
  for (let i = 0; i < datas.length; i++) {
    const d = datas[i]
    // 忽略自定义数据、连接符
    if (!d.systemFieldName)
      continue

    const key = d.displayName
    if (repeatObj[key]) {
      console.error('规格型号数据重复（辅助信息或已保存的数据）：', specifications)
      console.error('规格型号数据重复（最后一次保存的数据）：', originRules)
      localStorage.setItem(
        `${nowDate}---specification-repeat`,
        JSON.stringify({
          viewType: props.viewType,
          sampleId: props.sampleId,
          source: !location.href.includes('goTestTaskDetail') ? '委托收样' : '任务详情',
          specifications,
          originRules,
        }),
      )
    }
    else {
      repeatObj[key] = d
    }
  }
  removeLocalStorageLog()
}

// 日志记录时间，超过时间删除，避免将内存占满
const logIndate = 1000 * 60 * 60 * 24 * 5
/**
 * 删除本地记录的日志
 */
function removeLocalStorageLog() {
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key && key.includes('specification-repeat')) {
      const d = key.split('---')[0]
      if (d && Date.now() - new Date(d).getTime() >= logIndate) {
        localStorage.removeItem(key)
      }
    }
  })
}

/**
 * ## 获取样品最后一次保存的规格型号
 */
async function getSampleLastConfig() {
  try {
    if (!props.sampleId) {
      console.warn('getLastConfig: 未选择样品')
      return []
    }
    const { data } = await getLastConfig(props.sampleId)
    return data
  }
  catch (err) {
    console.error('获取选择样品最后一次保存的规格型号: ', err)
    return []
  }
}

/**
 * 初始化连接符：全是系统配置的规格型号时，默认空格连接
 */
function initConnector(datas: Specifications[]) {
  const isCustom = datas.some(i => !i.isJoinSpecification && !i.systemFieldName)
  if (isCustom)
    return datas
  const result = []
  for (let i = 0; i < datas.length; i++) {
    result.push(datas[i])
    if (i < datas.length - 1) {
      result.push({
        ...connectorValue,
        listValue: sysConnector.value,
      })
    }
  }
  return result
}

/**
 * ## 处理待选项
 */
function fixInputHistory(inputHistory: string | string[]): string[] {
  if (!inputHistory)
    return []
  if (typeof (inputHistory) === 'string') {
    return inputHistory.split(';').filter(d => !!d)
  }
  return inputHistory.filter(d => !!d)
}

// 初始化下拉数据
function initInputHistory(item: Specifications) {
  const history = fixInputHistory(item.inputHistory)
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
      options: sysList.map((d) => {
        let label = d === ' ' ? '空格' : d
        let value = d

        if (value && value.includes('@_@')) {
          label = UseTestOtherInfo.getListValueLabel(value)
          value = UseTestOtherInfo.getListValueValue(value)
        }

        return { label, value }
      }),
    })
  }
  if (history.length > 0) {
    options.push({
      label: '历史记录',
      options: history.map(d => ({ label: d, value: d })),
    })
  }
  return options
}

// 新增
function handleAppend(i: number) {
  specifications.value.splice(i + 1, 0, { ...DEFAULT_VALUE })
}

// 切换排序
function handlePosition(x: number, y: number) {
  if (y === specifications.value.length || y === -1) {
    message.warning('无法再移动了')
    return
  }
  const b = specifications.value[x]
  specifications.value[x] = specifications.value[y]
  specifications.value[y] = b
}

// 删除规格型号
function handleDelete(i: number) {
  specifications.value.splice(i, 1)
  if (specifications.value.length === 0) {
    specifications.value.push({
      ...DEFAULT_VALUE,
      displayName: '规格型号',
      name: '规格型号',
      deleteAble: false,
      value: '',
    })
  }
}

/**
 * 保存规格型号
 * @param bol 是否保存到服务器
 */
function saveData(bol?: boolean) {
  const dataList = cloneDeep(specifications.value)
  const param: SpecificationsInfo = {
    specifications: dataList,
    /** 规格型号 - 组合值 */
    standard: preview.value,
    /** 规格型号 - 规格 */
    specification: '',
    /** 规格型号 - 等级 */
    grade: '',
    /** 规格型号 - 标号 */
    label: '',
    /** 规格型号 - 型号 */
    model: '',
  }
  for (let i = 0; i < dataList.length; i++) {
    const item = dataList[i]

    if (item.deleteAble)
      continue

    if (SYSTEM_FIELDS_NAME.includes(item.systemFieldName)) {
      const field = SYSTEM_FIELDS_ENUM[item.systemFieldName]
      param[field] = item.value || ''
    }
  }
  if (bol !== false && props.sampleId) {
    // 不保存默认的连接符
    saveConfig(props.sampleId, dataList)
  }
  return param
}

/**
 * ## 特殊字符
 */
const specialCharacterRef = ref()
let focusIndex = -1
function handleFocus(ind: number) {
  focusIndex = ind
}

// 关闭特殊字符弹窗
function cancelCharacter() {
  focusIndex = -1
}

// 选择特殊字符
function selectCharacter(char: string) {
  if (focusIndex === -1) {
    message.warning('未找到聚焦的输入框')
    return ''
  }
  specifications.value[focusIndex].value += char
}

// 获取输入文本中有多少个空格
function getSpace(val: string) {
  return val.split(' ').length - 1
}

function closeAllModal() {
  if (specialCharacterRef.value)
    specialCharacterRef.value.close()
}

// 添加自定义属性
const visible = ref(false)
function addProperty() {
  visible.value = true
}
// 添加成功
function addPropertyOk() {
  emits('addProperty')
}

defineExpose({
  saveData,
  closeAllModal,
})
</script>

<style scoped>
.specification-warp {
  padding: 20px;
}

.custom-button-group .anticon {
  display: block;
}

.ant-select-item-group {
  background-color: #eee;
}

:deep(.ant-form-item-label > label) {
  width: 120px;
}

:deep(.custom-form-label) {
  flex: 1;
  text-align: right;
  max-height: 32px;
  line-height: 14px;
  overflow: hidden;
  display: -webkit-box;
  white-space: wrap;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}
</style>
