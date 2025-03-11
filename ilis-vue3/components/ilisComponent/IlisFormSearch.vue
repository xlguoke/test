<template>
  <a-form
    v-bind="$attrs"
    ref="formRef"
    :model="formState"
    layout="inline"
    @submit="handleSubmit"
  >
    <a-space wrap :size="8">
      <a-form-item
        v-for="field in formFieldList"
        v-show="!searchFieldConfigObj?.[field]?.isHidden"
        :key="field"
        :name="field"
      >
        <slot :name="field" :data="formState">
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
            @change="handleChange(field)"
          />
        </slot>
      </a-form-item>
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
      width="450px"
      @ok="handleSubmit();advancedSearchVisible = false"
    >
      <div class="grid gap-x-3" :class="[`grid-cols-${1}`]">
        <a-form-item
          v-for="field in advancedFormFieldList"
          v-show="!searchFieldConfigObj?.[field]?.isHidden"
          :key="field"
          :name="field"
        >
          <template #label>
            <span style="width: 70px;">
              <BaseText>{{ formState.getFormFieldLabel(field) }}</BaseText>
            </span>
          </template>
          <slot :name="field" :data="formState">
            <IlisInput
              v-model="formState[field]"
              style="min-width: 240px;width: 100%;"
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
            />
          </slot>
        </a-form-item>
      </div>
    </HtModal>
  </a-form>
</template>

<script lang="ts" setup>
import type { FormProps } from 'ant-design-vue'
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import { IlisInput } from '.'
import type { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'
import type { ClassConstructor } from '~/anyThing/types/ClassConstructor'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import type { FilterOutOnProps } from '~/anyThing/types/FilterOutOnProps'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'

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
}

const props = defineProps<Props<AnyBaseModel>>()

const emits = defineEmits<{
  (event: 'search', value: Record<string, any>): void
  (event: 'reset', value: Record<string, any>): void
}>()

const formRef = ref<FormExpose>()

const formState = ref(new props.entity!())

const advancedSearchVisible = ref(false)

const formFieldConfigObj = computed(() => {
  return formState.value.getFormFieldConfigObj()
})

const searchFieldConfigObj = computed(() => {
  return formState.value.getSearchFileldConfigObj()
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

watch(() => props.initData, (newVal) => {
  if (newVal) {
    formState.value = newVal
  }
})

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
  return searchObj
}

function handleReset() {
  formRef.value?.resetFields()
  emits('reset', {})
}

onMounted(() => {
  if (props.initData) {
    formState.value = props.initData
    const searchObj = getSearchObj()
    emits('search', searchObj)
  }
})

defineExpose({
  formState,
})
</script>

<style scoped>
:deep(.ant-space){
  margin-bottom: 0 !important;
}
.ant-form-item{
  margin-inline-end: 0;
}
</style>
