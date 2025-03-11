<template>
  <HtModal
    v-model:open="internalOpen"
    :title="title || '请选择人员'"
    width="500px"
    tiled-level
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <a-space direction="vertical" style="width: 100%;">
      <IlisFormSearch
        :entity="EvaluateInvUserEntity"
        :field-list="['quickQry']"
        @search="getTree($event)"
        @reset="getTree($event)"
      />
      <a-spin :spinning="loading">
        <div class=" min-h-20">
          <a-tree
            v-model:checked-keys="checkedKeys"
            checkable
            :tree-data="treeData"
            :field-names="{
              children: 'userList',
              key: 'id',
            }"
          >
          </a-tree>
        </div>
      </a-spin>
    </a-space>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { UnitUser } from '../api'
import { getUnitUserAll } from '../api'
import { EvaluateInvUserEntity } from '../EvaluateInvUserEntity'
import { IlisFormSearch } from '~/components/ilisComponent'
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogPropsSelector<UnitUser[]>>()

const internalOpen = ref(true)

const loading = ref(false)

const treeData = ref<any[]>([])

const checkedKeys = ref<string[]>(props.checkedIds || [])

const userList = ref<UnitUser[]>([])

async function getTree(query?: Record<string, any>) {
  loading.value = true
  const { data } = await getUnitUserAll(query).finally(() => loading.value = false)
  userList.value = []
  // 整理树型数据
  data.forEach((unit) => {
    unit.title = unit.unitName
    unit.userList.forEach((user) => {
      user.title = user.username
      user.consignUnitName = unit.unitName
      // consignUnitId 和 sampleSenderId 提交用
      user.sampleSenderId = user.id
      user.sampleSenderName = user.username
      user.consignUnitId = unit.id

      // 把所有人员放入数组，方便后面过滤
      if (userList.value.findIndex(item => item.id === user.id) === -1) {
        userList.value.push(user)
      }
    })
  })
  treeData.value = data
}

/**
 * # 确认
 */
function handleConfirm() {
  const selectedUser = userList.value.filter(user => checkedKeys.value.includes(user.id))
  if (!selectedUser?.length) {
    return message.warning('请选择人员')
  }
  internalOpen.value = false
  props.onConfirm(selectedUser)
}

getTree()
</script>
