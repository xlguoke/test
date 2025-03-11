<template>
  <a-select
    v-model:value="selectedList"
    mode="multiple"
    style="width: 100%"
    :dropdown-match-select-width="false"
    placeholder="请选择"
  >
    <!-- eslint-disable-next-line vue/no-template-shadow -->
    <template #tagRender="{ label, value, option }">
      <span
        :class="`
          px-1 py-1 mr-1 rounded-[3px] flex items-center
          ${isExpire(value) ? 'bg-red-600 text-white' : 'bg-gray-300'}
        `"
        :title="label[0].children"
        @mousedown.prevent
      >
        <!-- <span class="sm:max-w-[56px] xl:max-w-[80px] whitespace-nowrap overflow-hidden text-ellipsis"></span> -->
        <span class="leading-[16px]">
          {{ label[0].children }}
        </span>
        <CloseOutlined class="ml-[4px] text-[12px]" @click.stop="delStandard(option)" />
      </span>
    </template>
    <a-select-option
      v-for="d in dataSource"
      :key="d.uniqKey"
      :value="d.uniqKey"
    >
      {{ showName ? `${d.baseStandardName}${d.publishCode}` : (d.publishCode || d.baseStandardName) }}
    </a-select-option>
    <a-select-option
      v-if="showActionBtn"
      disabled
      value=""
      class="add-option"
      @click="addStandard"
    >
      <template v-if="enableRecommend">
        设置 <SettingOutlined />
      </template>
      <template v-else>
        新增 <PlusOutlined />
      </template>
    </a-select-option>
  </a-select>
</template>

<script setup lang='ts'>
import { CloseOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { useDateFormat, useNow } from '@vueuse/core'
import type { PropType } from 'vue'
import type { ParamStandardItem } from '../modules/UseParamStandard.ts'
import { STANDARD_TYPE } from '~/types/standard.ts'
import { usePermissionStore } from '~/store/permissionStore.ts'

const props = defineProps({
  value: {
    type: Array<string>,
    default: () => [],
  },
  dataSource: {
    type: Array as PropType<ParamStandardItem[]>,
    default: () => [],
  },
  showName: {
    type: Boolean,
    default: false,
  },
  enableRecommend: {
    type: Boolean,
    default: false,
  },
  standardType: {
    type: String as PropType<STANDARD_TYPE>,
    default: null,
  },
})

const emits = defineEmits<{
  (e: 'add'): void
  (e: 'update:value', selected: string[]): void
  (e: 'deleteTag', uniqKey: string): void
}>()

const { hasPermission } = usePermissionStore()

const enableRecommend = computed(() => props.enableRecommend)

const showActionBtn = computed(() => {
  if (!enableRecommend.value) {
    return true
  }

  if (props.standardType === STANDARD_TYPE.STANDARD && hasPermission('settingStandard')) {
    return true
  }

  return false
})

const selectedList = computed({
  get: () => (props.value),
  set: (val) => { emits('update:value', val) },
})

const { value } = useDateFormat(useNow(), 'YYYY-MM-DD')
function isExpire(key: string) {
  const item = props.dataSource.find(d => d.uniqKey === key) as ParamStandardItem
  return item.expireDate && new Date(item.expireDate) < new Date(value)
}

function addStandard() {
  emits('add')
}

function delStandard(item) {
  emits('update:value', selectedList.value.filter(uniqKey => uniqKey !== item.value))
  emits('deleteTag', item.value)
}
</script>

<style>
.ant-select-dropdown .ant-select-item-option-disabled.add-option{
  margin-top: 8px;
  text-align: center;
  background-color: rgba(0, 102, 236, 0.1);
  color:#0066ec;
  cursor: pointer;
}
.ant-select-selection-overflow-item:not(:first-child){
  margin-top: 2px;
}
</style>
