<template>
  <div>
    <a-spin :spinning="spinning" style="min-height: 400px">
      <ht-modal
        title="审核转交"
        :open="visible"
        :keyboard="false"
        :mask-closable="false"
        width="440px"
        :confirm-loading="confirmLoading"
        @cancel="handleCancel"
        @ok="confirm"
      >
        <div class=" p-2">
          <a-alert class=" mb-4 text-sm">
            <template #message>
              <li>1. 审核转交只能转交当前人员的审核，不影响其他人员；</li>
              <li>
                2. 多个审核批量转交时，将根据多个审核任务当前节点权
                限范围的交集进行人员选择；
              </li>
            </template>
          </a-alert>
          <a-form :model="formState">
            <BaseTitle>转交给</BaseTitle>
            <a-form-item name="userIds" class="ml-3">
              <a-tree-select
                v-model:value="formState.userIds"
                show-search
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="请选择转交人员"
                allow-clear
                :tree-data="transferPersonData"
                tree-node-filter-prop="label"
              >
                <template #title="{ label }">
                  <span class="text-sm">{{ label }}</span>
                </template>
              </a-tree-select>
            </a-form-item>
            <BaseTitle>转交意见</BaseTitle>
            <a-form-item name="comment" class="ml-3">
              <a-textarea
                v-model:value="formState.comment"
                :rows="4"
                placeholder="请输入转交意见"
              ></a-textarea>
            </a-form-item>
          </a-form>
        </div>
      </ht-modal>
    </a-spin>

    <!-- <SelectPersonnel ref="selPersonnelRef" :callback="getPersonnelData" /> -->
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { auditTransfer, getTransferUser } from '../api'

export default {
  props: ['callback'],
  data() {
    return {
      spinning: false,
      visible: false,
      formState: {
        userIds: null,
        comment: '',
      },
      taskIds: '', // 审核任务ids
      transferPersonData: [],
      confirmLoading: false,
    }
  },
  methods: {
    async initTransferUser() {
      const res = await getTransferUser(this.taskIds)
      if (res.data && res.data.length > 0) {
        this.transferPersonData = res.data.map((item) => {
          return {
            label: item.name,
            value: item.id,
            key: item.id,
            checkable: false,
            selectable: false,
            children: (item.children || []).map((child, index) => {
              return {
                label: child.name,
                value: `${item.id},${child.id},${index}`, // 业务中存在key重复，使用拼接让key唯一且与value保持一致
                key: `${item.id},${child.id},${index}`,
              }
            }),
          }
        })
      }
      else {
        this.transferPersonData = []
      }
    },
    showModal(selectedRows) {
      this.visible = true
      this.taskIds = selectedRows.map(item => item.id).join(',')
      this.transferPersonData = []
      this.initTransferUser()
    },
    handleCancel() {
      this.formState = {}
      this.visible = false
    },
    async confirm() {
      if (!this.formState.userIds) {
        message.warning('请选择转交人员')
        return
      }
      if (!this.formState.comment) {
        message.warning('请填写转交意见')
        return
      }
      this.spinning = true
      this.confirmLoading = true
      const userIds = this.formState.userIds.split(',')[1]
      const params = {
        userIds,
        comment: this.formState.comment,
        objectIds: this.taskIds,
      }
      await auditTransfer(params)
        .finally(() => {
          this.spinning = false
          this.confirmLoading = false
        })
      this.formState = {}
      this.visible = false
      this.callback()
      message.success('操作成功！')
    },
  },
}
</script>

<style lang="less" scoped>
</style>
