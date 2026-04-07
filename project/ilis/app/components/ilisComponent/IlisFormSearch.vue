<template>
  <div class="pb-2 border-b border-solid border-[var(--colorSplit)]">
    <a-form
      v-bind="$attrs"
      ref="formRef"
      :model="formState"
      layout="inline"
      class="gap-y-2"
      @submit="handleSubmit"
    >
      <a-form-item
        v-for="field in formFieldList"
        v-show="!searchFieldConfigObj?.[field]?.isHidden && !props.hiddenFields?.includes(field)"
        :key="field"
        :name="field"
      >
        <slot :name="field" :data="(formState as any)">
          <IlisInput
            v-model="formState[field]"
            :style="{ minWidth: '240px', width: searchFieldConfigObj?.[field]?.width || '100%' }"
            :entity="entity"
            :field="field"
            :form-data="formState"
            :options="formState.getOptions(field)"
            :selector-config="{
              ...formFieldConfigObj?.[field]?.selectorConfig,
              ...searchFieldConfigObj?.[field]?.selectorConfigMixin,
            }"
            :disabled="props.disabledFields?.includes(field)"
            @change="handleChange(field)"
          />
        </slot>
      </a-form-item>
      <a-space>
        <a-button type="primary" html-type="submit">
          查询
        </a-button>
        <a-button @click="handleReset">
          重置
        </a-button>
        <a-button v-if="!hideAdvancedSearch && advancedFormFieldList?.length" @click="advancedSearchVisible = true">
          高级查询
        </a-button>
      </a-space>

      <!-- 高级查询弹窗 -->
      <HtModal
        v-if="!hideAdvancedSearch && advancedFormFieldList?.length"
        v-model:open="advancedSearchVisible"
        title="高级查询"
        width="700px"
        force-render
      >
        <div class="pl-8 pr-12 grid gap-x-3 advanced-search" :class="[`grid-cols-${1}`]">
          <a-form-item
            v-for="field in advancedFormFieldList"
            v-show="!searchFieldConfigObj?.[field]?.isHidden && !props.hiddenFields?.includes(field)"
            :key="field"
            :name="field"
            :label-col="labelCol"
            label-wrap
          >
            <template #label>
              <span class="whitespace-pre-wrap leading-4">
                {{ term(formState.getFormFieldLabel(field)) }}
              </span>
            </template>
            <slot :name="field" :data="(formState as any)">
              <IlisInput
                v-model="formState[field]"
                style="min-width: 200px;width: 100%;"
                :entity="entity"
                :field="field"
                :form-data="formState"
                :options="formState.getOptions(field)"
                :selector-config="{
                  ...formFieldConfigObj?.[field]?.selectorConfig,
                  ...searchFieldConfigObj?.[field]?.selectorConfigMixin,
                }"
                :checked-value="formFieldConfigObj?.[field]?.checkedValue"
                :un-checked-value="formFieldConfigObj?.[field]?.unCheckedValue"
                :disabled="props.disabledFields?.includes(field)"
              />
            </slot>
          </a-form-item>
        </div>
        <template #footer>
          <a-button @click="advancedSearchVisible = false">
            取消
          </a-button>
          <a-button @click="handleReset">
            重置
          </a-button>
          <a-button type="primary" @click="handleSubmit();advancedSearchVisible = false">
            确定
          </a-button>
        </template>
      </HtModal>
    </a-form>

    <a-space v-if="queryTags.length > 0 || (showIndustry && sample)" class="mt-2" wrap :size="3">
      <IlisIndustryTag v-if="showIndustry"></IlisIndustryTag>
      <a-tag
        v-for="item in queryTags"
        :key="item.label"
        closable
        class="!px-[12px] !py-[4px]"
        @close="onCloseTag(item)"
      >
        {{ item.label }}：{{ item.value }}
      </a-tag>
    </a-space>
  </div>
</template>

<script lang="ts" setup>
import type { FormProps } from 'ant-design-vue'
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import type { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'
import type { ClassConstructor } from '~/anyThing/types/ClassConstructor'
import type { FilterOutOnProps } from '~/anyThing/types/FilterOutOnProps'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import { useIndustryStore } from '~/store/industryStore'

type FilterFormType = FilterOutOnProps<FormProps>

// 定义泛型接口
interface Props<T> extends /* @vue-ignore */ FilterFormType {
  /**
   * # 配置实体
   */
  entity: ClassConstructor<T>

  /**
   * # 初始数据
   */
  initData?: InstanceType<ClassConstructor<AnyBaseModel>>

  /**
   * # 要展示的字段列表
   */
  fieldList?: string[]

  /**
   * # 字段排序参考
   */
  fieldOrder?: string[]

  /**
   * # 是否显示高级搜索
   */
  hideAdvancedSearch?: boolean

  /** # 高级查询表单label布局 */
  labelCol?: object

  /** # 是否显示高级查询标签 */
  showSearchTag?: boolean

  /** # 是否显示领域（开启后展示领域筛选条件tag，条件变更后自动触发搜索） */
  showIndustry?: boolean

  /** # 需要禁用的字段列表 */
  disabledFields?: string[]

  /** # 需要隐藏的字段列表 */
  hiddenFields?: string[]
}

/** 高级查询标签 */
interface QueryTagItem {
  /** 显示名称 */
  label: string
  /** 显示值 */
  value: string
  /** 绑定字段 */
  key: any
}

const props = withDefaults(defineProps<Props<AnyBaseModel>>(), {
  labelCol: () => ({ style: { width: '120px' } }),
  showSearchTag: true,
})

const emits = defineEmits<{
  (event: 'search', value: Record<string, any>): void
  (event: 'reset', value: Record<string, any>): void
}>()

const { term } = useIndustryStore()

const formRef = ref<FormExpose>()

const formState = ref(new props.entity!())

const advancedSearchVisible = ref(false)

// 领域：选了样品的处理
const { sample } = toRefs(useIndustryStore())

const formFieldConfigObj = computed(() => {
  return formState.value.getFormFieldConfigObj()
})

const searchFieldConfigObj = computed(() => {
  return formState.value.getSearchFileldConfigObj()
})

watch([sample], () => {
  if (props.showIndustry)
    handleSubmit()
})

const formFieldList = computed(() => {
  let list = []
  // 过滤出配置对象isAdvanced为true的字段
  list = Object.entries(searchFieldConfigObj.value)?.filter(([_key, value]) => !value.isAdvanced).map(([key, _value]) => key)
  let res = list
  if (props.fieldList?.length) {
    res = list.filter(item => props.fieldList?.includes(item))
  }
  return AnyDataTransformHelper.sortByArray(res, props.fieldOrder || [])
})

/** 高级查询字段列表 */
const advancedFormFieldList = computed(() => {
  const list = Object.entries(searchFieldConfigObj.value)?.filter(([_key, value]) => value.isAdvanced).map(([key, _value]) => key)
  let res = list
  if (props.fieldList?.length) {
    res = list.filter(item => props.fieldList?.includes(item))
  }
  return AnyDataTransformHelper.sortByArray(res, props.fieldOrder || [])
})

/** 高级查询 tags */
const queryTags = ref<QueryTagItem[]>([])
function renderSearchTag(searchObj: Record<string, any>) {
  if (!props.showSearchTag)
    return

  const tags: QueryTagItem[] = []
  for (const k in searchObj) {
    const q_config = searchFieldConfigObj.value?.[k]
    const config = formFieldConfigObj.value?.[k]
    const label = formState.value.getFormFieldLabel(k)
    let value = searchObj[k]
    if (!q_config?.isAdvanced || value === null || value === undefined || value === '' || value.length === 0)
      continue

    // 日期范围、输入范围
    if ([EFormItemType.DATE_RANGE, EFormItemType.DATETIME_RANGE, EFormItemType.INPUT_RANGE].includes(config.formType)) {
      if (!value || !value[0] || !value[1])
        continue
      value = value.join('~')
    }
    // 多选
    else if (typeof value === 'object') {
      const dict = formState.value.getFieldDictionaryArray(k)
      const vals = dict?.filter(d => value.includes(d.key)).map(d => d.label)
      if (vals)
        value = vals.join(',')
      else
        value = value.toString()
    }
    // 下拉
    else if (config.formType === EFormItemType.SELECT || config.formType === EFormItemType.RADIO) {
      const opts = formState.value.getOptions(k)
      const item = opts?.find(o => o.value === value)
      value = item ? item.label : value
    }
    // 树形下拉
    else if (config.formType === EFormItemType.TREE_SELECT) {
      const opts = formState.value.getTreeOptions(k)
      function _each(list: any[]): string {
        for (let i = 0; i < list.length; i++) {
          const opt = list[i]
          if (opt.value === value) {
            return opt.label
          }
          if (opt.children && opt.children.length) {
            const v = _each(opt.children)
            if (v)
              return v
          }
        }
        return ''
      }
      value = _each(opts) || value
    }

    tags.push({
      label,
      key: k,
      value,
    })
  }
  queryTags.value = tags
}

/** 取消查询结果 */
function onCloseTag(item: QueryTagItem) {
  formState.value[item.key] = undefined
  handleSubmit()
}

function handleSubmit() {
  const searchObj = getSearchObj()
  emits('search', searchObj)
}

function handleChange(field: string) {
  const config = formFieldConfigObj.value?.[field]
  // 需要在change时触发搜索的有 select、checkbox、radio、date、dateRange、datetime、datetimeRange
  const triggerSearch = [
    EFormItemType.SELECT,
    EFormItemType.CHECKBOX,
    EFormItemType.RADIO,
    EFormItemType.DATE,
    EFormItemType.DATE_RANGE,
    EFormItemType.INPUT_RANGE,
    EFormItemType.TREE_SELECT,
    EFormItemType.DATETIME,
    EFormItemType.DATETIME_RANGE,
  ].includes(config.formType)
  if (triggerSearch) {
    // date、dateRange、datetime、datetimeRange 的数据收集有点问题，所以延时一下再触发搜索
    nextTick(() => {
      const searchObj = getSearchObj()
      emits('search', searchObj)
    })
  }
}

function getSearchObj() {
  const searchField = formState.value.getSearchFileldList()
  const searchObj = searchField.reduce((acc, cur) => {
    acc[cur] = formState.value[cur]
    return acc
  }, {} as Record<string, any>)

  renderSearchTag(searchObj)

  // rangeMap处理
  const formConfigObj = formState.value.getFormFieldConfigObj()
  for (const k in formConfigObj) {
    if (formConfigObj[k]?.rangeMap && k in searchObj) {
      const [key1, key2] = formConfigObj[k]?.rangeMap
      searchObj[key1] = searchObj[k]?.[0]
      searchObj[key2] = searchObj[k]?.[1]
      delete searchObj[k]
    }
  }

  return { ...searchObj, ...(props.showIndustry ? { sampleId: sample.value?.id } : {}) }
}

function handleReset() {
  formRef.value?.resetFields()
  queryTags.value = []
  emits('reset', {
    ...(props.showIndustry ? { sampleId: sample.value?.id } : {}),
  })
}

watch(() => props.initData, (newVal) => {
  if (newVal) {
    nextTick(() => {
      formState.value = newVal
      const searchObj = getSearchObj()
      emits('search', searchObj)
    })
  }
}, {
  immediate: true,
})

defineExpose({
  formState,
  advancedSearchVisible,
})
</script>

<style scoped>
:deep(.ant-space){
  margin-bottom: 0 !important;
}
.ant-form-item{
  margin-inline-end: 0;
}

:deep(.ant-form-item .ant-form-item-label >label){
  width: 100%;
  justify-content: flex-end;
}
/* 父容器flex布局，内容区超长导致换行 */
:deep(.ant-row .ant-form-item-control){
  width: 0;
}

.advanced-search .ant-form-item{
  margin-bottom: 12px;
}
</style>
