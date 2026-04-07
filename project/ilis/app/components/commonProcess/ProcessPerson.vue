<template>
  <div>
    <span v-for="(item, index) in processUserData" :key="index" class="inline-flex items-center gap-2">
      <!-- 多选 -->
      <div
        v-if="item.isMultiInstance"
        class="custom-input cursor-pointer"
        @click="!disabledAuditNodes?.includes(item.activitiNodeId) && setPersonnels(item)"
      >
        <template v-if="personData[item.activitiNodeId].length">
          <a-tag
            v-for="(d, i) in personData[item.activitiNodeId]"
            :key="d.presetUserId"
            :closable="!disabled && !disabledAuditNodes?.includes(item.activitiNodeId)"
            @close.prevent="personData[item.activitiNodeId].splice(i, 1)"
          >
            {{ d.presetUserRealName }}
          </a-tag>
        </template>
        <span v-else class="text-gray-400">{{ item.processTaskName }}</span>
      </div>
      <!-- 单选 -->
      <a-tag
        v-else
        :closable="!disabled && personData[item.activitiNodeId].length > 0 && !disabledAuditNodes?.includes(item.activitiNodeId)"
        class="cursor-pointer custom-tag"
        @close.prevent="!disabledAuditNodes?.includes(item.activitiNodeId) && (personData[item.activitiNodeId] = [])"
        @click="!disabledAuditNodes?.includes(item.activitiNodeId) && setPersonnels(item)"
      >
        <span v-if="personData[item.activitiNodeId].length">
          {{ personData[item.activitiNodeId][0].presetUserRealName }}
        </span>
        <span v-else class="text-gray-400">{{ item.processTaskName }}</span>
      </a-tag>

      <ArrowRightOutlined v-if="index < (processUserData.length - 1)" class=" mr-2" />
    </span>
    <PersonSelector
      v-model:show="showPersonSelector"
      :multiple="isMultiple"
      :checked-ids="checkedIds"
      :params="{
        authCode: currentAuthCode,
      }"
      @confirm="getPerson"
    />
  </div>
</template>

<script lang="ts"  setup>
import type { IProcessUserNode, ProcessType } from '.'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { ArrowRightOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from '@unovis/ts'
import PersonSelector from '../PersonSelector.vue'
import { getProcessUser } from './api'

export interface IDefaultAuditers {
  presetUserId?: string
  presetUsername?: string
  presetUserRealName?: string
}

const props = defineProps<{
  modelValue: IProcessUserNode[]
  processType: ProcessType
  disabled?: boolean
  defaultValue?: IProcessUserNode[]
  /** # 禁用审核节点 */
  disabledAuditNodes?: string[]
  /** # 默认指定节点人员 */
  defaultAuditers?: Record<string, IDefaultAuditers[]>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: IProcessUserNode[]): void
}>()

const showPersonSelector = ref(false)
const checkedIds = ref([] as string[])
const isMultiple = ref(false)

const processUserData = ref<IProcessUserNode[]>([])
const personData = ref<Record<string, IProcessUserNode[]>>({})
const currentPersonNode = ref({} as IProcessUserNode)
const currentAuthCode = ref('')

watch(() => props.defaultValue, (list) => {
  if (!list || !list.length)
    return

  nextTick(() => {
    initPersonData(list)
  })
})

watch(() => personData.value, (val) => {
  const list = []
  for (const key in val) {
    list.push(...val[key])
  }
  emit('update:modelValue', list)
}, { deep: true, immediate: true })

/**
 * # 获取审批人员配置
 */
getUserConfig()
async function getUserConfig() {
  const { data } = await getProcessUser(props.processType)
  const obj: any = {}
  for (let i = 0; i < data.length; i++) {
    const d = data[i]
    obj[d.activitiNodeId] = []
  }
  processUserData.value = data || []
  personData.value = obj
  setDefaultAuditers()
}

function setDefaultAuditers() {
  if (!props.defaultAuditers)
    return
  const nodeIds = Object.keys(props.defaultAuditers)
  nodeIds.forEach((id) => {
    const node = processUserData.value.find(d => d.activitiNodeId === id)
    if (node) {
      personData.value[id] = props.defaultAuditers?.[id]?.map(i => ({
        ...node,
        ...i,
      }))?.filter(Boolean) || []
    }
  })
}

/**
 * 设置默认审批人员
 */
function initPersonData(persons: IProcessUserNode[]) {
  persons = cloneDeep(persons)
  const obj: any = cloneDeep(personData.value)
  for (let i = 0; i < persons.length; i++) {
    const item = persons[i]
    const isSel = obj[item.activitiNodeId].find((d: IProcessUserNode) => d.presetUserId === item.presetUserId)
    if (isSel)
      continue
    obj[item.activitiNodeId].push({
      ...item,
    })
  }
  personData.value = obj
}

// 设置审批人员
function setPersonnels(item: IProcessUserNode) {
  if (props.disabled) {
    return
  }
  const persons = personData.value[item.activitiNodeId]
  checkedIds.value = persons.map(d => d.presetUserId)
  isMultiple.value = !!item.isMultiInstance
  currentPersonNode.value = item
  currentAuthCode.value = item.authCode
  showPersonSelector.value = true
}

function getPerson(rows: IUserSelectVoEntity[]) {
  const { activitiNodeId } = currentPersonNode.value
  const initRows: IProcessUserNode[] = rows.map(d => ({
    ...currentPersonNode.value,
    presetUserId: d.id,
    presetUserRealName: d.name,
    presetUsername: d.account || '',
  }))
  personData.value[activitiNodeId] = initRows
  showPersonSelector.value = false
}
</script>

<style scoped>
.custom-input{
  box-sizing: border-box;
  padding: 4px 6px;
  min-width: 60px;
  color: rgba(0, 0, 0, 0.88);
  font-size: 12px;
  line-height: 1.6666666666666667;
  list-style: none;
  position: relative;
  display: inline-block;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.2s;
}
.custom-tag{
  line-height: 30px;
  transition: all 0.2s;
}
.custom-input:hover, .custom-tag:hover{
  border-color: #288afa;
}
</style>
