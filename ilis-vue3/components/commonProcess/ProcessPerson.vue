<template>
  <div>
    <span v-for="(item, index) in personData" :key="index">
      <a-tag
        :closable="!disabled"
        class=" cursor-pointer"
        @close.prevent="handleClose(item)"
        @click="setPersonnels(item)"
      >
        {{ item.presetUserRealName || item.processTaskName }} </a-tag>
      <ArrowRightOutlined v-if="index < (personData.length - 1)" class=" mr-3" />
    </span>
  </div>
  <PersonSelector v-model:show="showPersonSelector" :checked-ids="checkedIds" @confirm="getPerson" />
</template>

<script lang="ts"  setup>
import { ArrowRightOutlined } from '@ant-design/icons-vue'
import PersonSelector from '../PersonSelector.vue'
import type { IProcessUserNode } from '.'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'

const props = defineProps<{
  modelValue: IProcessUserNode[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: IProcessUserNode[]): void
}>()

const showPersonSelector = ref(false)

const checkedIds = ref([] as string[])

const currentPersonNode = ref({} as Record<string, any>)

const personData = ref<IProcessUserNode[]>([])

watch(() => props.modelValue, (val) => {
  personData.value = val
}, { deep: true })

watch(() => personData.value, (val) => {
  emit('update:modelValue', val)
}, { deep: true, immediate: true })

function setPersonnels(item: any) {
  if (props.disabled) {
    return
  }
  if (item.presetUserId) {
    checkedIds.value = [item.presetUserId]
  }
  currentPersonNode.value = item
  showPersonSelector.value = true
}

function getPerson(rows: IUserSelectVoEntity[]) {
  currentPersonNode.value.presetUserId = rows[0].id
  currentPersonNode.value.presetUserRealName = rows[0].name
  currentPersonNode.value.presetUsername = rows[0].account
  showPersonSelector.value = false
}

function handleClose(item: any) {
  item.presetUserId = ''
  item.presetUserRealName = ''
  item.presetUsername = ''
}
</script>
