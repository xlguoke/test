<template>
  <div>
    <div class="flex justify-between items-center mb-1">
      <div>
        <a-dropdown v-if="hideLayoutDatas.length" v-model:open="visible" placement="bottomLeft" arrow>
          <a-button type="text" @click.prevent>
            <EyeInvisibleOutlined />
            显示隐藏的填写项
          </a-button>
          <template #overlay>
            <div class=" text-black whitespace-nowrap hide-layout-dropdown">
              已隐藏的填写项
              <p class="text-[#ff5722]">
                可点击填写项重新加入到表单布局中，加入的填写项会默认出现在“附件”上方
              </p>
              <ul class="select-none">
                <li
                  v-for="(item, ind) in hideLayoutDatas"
                  :key="item.fieldCode"
                  class="p-2 mb-1 border h-full flex items-center bg-gray-100 text-black"
                  :class="{ 'cursor-not-allowed opacity-50': !!item.disabled, 'cursor-pointer': !item.disabled }"
                  :title="item.disabled ? item.disabledMsg || '' : ''"
                  @click="showFormItem(item, ind)"
                >
                  {{ item.fieldName }}
                </li>
              </ul>
            </div>
          </template>
        </a-dropdown>
      </div>

      <div v-if="editLayout">
        <a-button type="link" size="small" @click="setColLayout(2)">
          2列布局
        </a-button>
        <a-button type="link" size="small" @click="setColLayout(3)">
          3列布局
        </a-button>
        <a-button type="link" size="small" @click="setColLayout(4)">
          4列布局
        </a-button>
      </div>
    </div>

    <GridLayout
      v-model:layout="layoutDatas"
      :col-num="12"
      :row-height="34"
      :is-draggable="editLayout"
      :is-resizable="editLayout"
      :margin="editLayout ? [8, 8] : [2, 2]"
      :is-mirrored="false"
      vertical-compact
      use-css-transforms
    >
      <GridItem
        v-for="(item, ind) in layoutDatas"
        :key="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.i === 'attachmentQrKey' ? 12 : item.w"
        :h="item.h"
        :i="item.i"
        :min-w="item.i === 'attachmentQrKey' ? 12 : 3"
        :max-w="item.i === 'attachmentQrKey' ? 12 : 12"
        :min-h="1"
        :max-h="1"
        :is-resizable="item.i !== 'attachmentQrKey'"
      >
        <div
          class="border h-full flex items-center select-none"
          :class="{ 'border-blue-300': item.defaulted }"
        >
          <div
            class="flex items-center gap-2 px-2 h-full"
            :class="{ 'bg-blue-100': item.defaulted, 'bg-gray-100': !item.defaulted }"
          >
            <EyeInvisibleOutlined
              title="隐藏此填写项"
              class="text-[14px] text-gray-600 cursor-pointer"
              @click="hideFormItem(item, ind)"
            />
            <a-checkbox
              v-model:checked="item.required"
              :disabled="item.disabledRequired"
              title="勾选设置必填项"
            />
            <span class="w-[90px] text-right leading-3 custom-input-label" :title="term(item.fieldName)">
              {{ term(item.fieldName) }}
            </span>
          </div>
          <div class="flex-1" :class="{ 'pl-2': [EFormItemDynamicType.SWITCH, EFormItemDynamicType.RADIO, EFormItemDynamicType.CHECKBOX].includes(item.formType) }">
            <div v-if="!item.defaulted"></div>
            <FormInput
              v-else-if="item.dataFrom === OPTIONS_DATA_SOURCE.COMPONENT"
              v-model="item.value"
              :layout-item="item"
              :disabled="editLayout"
            />
            <CustomInput
              v-else
              v-model="item.value"
              :disabled="editLayout"
              class="w-full !min-w-10"
              :controls="false"
              :form-field-config="{
                formType: item.formType,
                dateFormat: initDateFormat(item, systemParams.TIME_ACCURACY),
                placeholder: Array.isArray(item) ? initPlaceholder(item) : term(initPlaceholder(item) as string),
                options: item.options,
                treeData: item.options,
                multiple: item.formType === EFormItemDynamicType.SELECT_MULTIPLE,
              }"
            ></CustomInput>
          </div>
        </div>
      </GridItem>
    </GridLayout>
  </div>
</template>

<script setup lang='ts'>
import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import { EyeInvisibleOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from '@unovis/ts'
import { Modal } from 'ant-design-vue'
import { GridItem, GridLayout } from 'grid-layout-plus'
import CustomInput from '~/anyThing/components/input/CustomInput.vue'
import { EFormItemDynamicType } from '~/anyThing/enum/EFormItemType'
import { useIndustryStore } from '~/store/industryStore.ts'
import { useSystemParamStore } from '~/store/systemParamStore'
import { initDateFormat, initPlaceholder } from '~/views/consign/consignDetail'
import FormInput from '~/views/consign/consignDetail/components/dynamicForm/formInput/Input.vue'
import { OPTIONS_DATA_SOURCE } from '~/views/unit-config/industryConfig'

const props = defineProps({
  editLayout: {
    type: Boolean,
    default: false,
  },
  layoutConfigs: {
    type: Array as PropType<IndustryLayoutConfig[]>,
    default: () => [],
  },
})

const { term } = useIndustryStore()
const { systemParams } = useSystemParamStore()

const visible = ref(false)

const layoutDatas = ref<IndustryLayoutConfig[]>([])
const hideLayoutDatas = ref<IndustryLayoutConfig[]>([])

watch(() => props.layoutConfigs, () => {
  initLayoutDatas()
}, {
  immediate: true,
})

function initLayoutDatas() {
  const layout = cloneDeep(props.layoutConfigs)
  const showLayout = layout.filter(d => d.isShow)
  showLayout.sort((a, b) => {
    const n = a.y - b.y
    if (n === 0)
      return a.x - b.x
    return n
  })
  layoutDatas.value = showLayout
  hideLayoutDatas.value = layout.filter(d => !d.isShow)
}

/** 隐藏填写项 */
function hideFormItem(item: IndustryLayoutConfig, ind: number) {
  Modal.confirm({
    title: '提示',
    content: '确定隐藏此填写项吗？',
    onOk: () => {
      item.isShow = !item.isShow
      hideLayoutDatas.value.push(item)
      layoutDatas.value.splice(ind, 1)
    },
  })
}

/** 显示填写项 */
function showFormItem(item: IndustryLayoutConfig, ind: number) {
  if (item.disabled)
    return
  item.isShow = !item.isShow
  layoutDatas.value.push(item)
  hideLayoutDatas.value.splice(ind, 1)

  if (hideLayoutDatas.value.length === 0)
    visible.value = false
}

/** 清空默认值 */
function clearLayoutValue() {
  layoutDatas.value.forEach((item) => {
    item.value = ''
  })
  hideLayoutDatas.value.forEach((item) => {
    item.value = ''
  })
}

/** 设置固定列 */
function setColLayout(col: number) {
  let y = 0
  let n = 0
  for (let i = 0; i < layoutDatas.value.length; i++) {
    const item = layoutDatas.value[i]

    if (item.i === 'attachmentQrKey') {
      // 附件单独一行
      y++
      n = col
      item.w = 12
      item.x = 0
      item.y = y
      continue
    }

    item.w = 12 / col
    item.x = (12 / col) * (n % col)
    if (n % col === 0 && n !== 0)
      y++
    item.y = y
    n++
  }
}

defineExpose({
  layoutDatas: () => [...layoutDatas.value, ...hideLayoutDatas.value],
  clearLayoutValue,
})
</script>

<style scoped>
.custom-input-label{
  /* 限制为两行显示 */
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  word-break: break-all;
}
:deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector),
.ant-input-affix-wrapper,
.ant-input-number,
.ant-input,
.ant-input-affix-wrapper,
.ant-picker{
  border: none;
  background-color: transparent;
}

:deep(textarea){
  height: 32px !important;
  border: none !important;
  resize: none !important;
  background-color: transparent !important;
}

.hide-layout-dropdown{
  padding: 12px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),0 3px 6px -4px rgba(0, 0, 0, 0.12),0 9px 28px 8px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  background-color: #fff;
}
</style>
