<template>
  <ht-modal
    title="指派签章人员"
    width="640px"
    :open="value"
    :closable="false"
    :mask-closable="false"
    :destroy-on-close="true"
    :confirm-loading="confirmLoading"
    @ok="submit"
    @cancel="cancel"
  >
    <a-table
      bordered
      row-key="id"
      :row-selection="rowSelection"
      :scroll="{ y: 350 }"
      :pagination="false"
      :loading="loading"
      :columns="columns"
      :data-source="data"
    ></a-table>
  </ht-modal>
</template>

<script>
import { FunctionControllerService } from '~/providers/providers/services/functionController'
import { SignerService } from '~/providers/providers/services/signer'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const functionControllerService = new FunctionControllerService()
const signerService = new SignerService()

export default {
  props: ['value', 'reportIds'],
  emits: ['update:value', 'on-success'],
  data() {
    return {
      selectedRowKeys: [],
      columns: [
        {
          title: '人员',
          dataIndex: 'realName',
          width: '100px',
        },
        {
          title: '账号',
          dataIndex: 'userName',
          width: '100px',
        },
        {
          title: '角色',
          dataIndex: 'userKey',
        },
      ],
      data: [],
      confirmLoading: false,
      loading: false,
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'radio',
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        },
      }
    },
  },
  watch: {
    value(val) {
      if (val) {
        this.getSelectedUsers()
        this.getUsers()
      }
      else {
        this.selectedRowKeys = []
      }
    },
  },
  methods: {
    async submit() {
      if (!this.selectedRowKeys.length) {
        window.$oAntdMessage.warn('请选择一位人员！')
        return
      }

      this.confirmLoading = true
      await signerService
        .allocate({
          reportIds: this.reportIds,
          userId: this.selectedRowKeys[0],
        })
        .finally(() => {
          this.confirmLoading = false
        })

      window.$oAntdMessage.success('操作成功！')
      $emit(this, 'on-success')
      this.cancel()
    },
    async getUsers() {
      if (this.data.length > 0) {
        return
      }

      this.loading = true
      const res = await functionControllerService
        .usersByCode('stamp_sign')
        .finally(() => {
          this.loading = false
        })
      this.data = res.data
    },
    async getSelectedUsers() {
      const res = await signerService.allocatedUser(this.reportIds.join(','))
      this.selectedRowKeys = res.data.split(',')
    },
    cancel() {
      $emit(this, 'update:value', false)
    },
  },
}
</script>
