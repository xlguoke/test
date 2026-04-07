<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="选择中标单位"
      centered
      width="90%"
      class="otherAchievement-uploadModal"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-table
        style="margin-top: 10px"
        :row-selection="rowSelection"
        :custom-row="customRow"
        :scroll="{ y: 350 }"
        :columns="columns"
        :data-source="data"
        :loading="loading"
        bordered
        :pagination="false"
        row-key="id"
      >
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
export default {
  props: ['callback', 'id'],
  data() {
    return {
      visible: false,
      loading: false,
      columns: [{ title: '单位名称', dataIndex: 'unitName', width: '100%' }],
      selectedRowKeys: [],
      selectedRows: [],
      data: [],
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'radio',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  methods: {
    getData(flag) {
      if (flag) {
        this.page = 1
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size } = this
      this.loading = true

      window.$oAjax
        .get(window.$oApi.biddingRecord.unitList, {
          params: { recordId: this.id },
        })
        .then((res) => {
          if (res && res.success) {
            if (res.obj && res.obj.length > 0) {
              this.data = res.obj
            }
          }
          this.loading = false
        })
    },
    showModal() {
      this.getData()
      this.visible = true
    },
    handleSubmit() {
      this.callback(this.selectedRows)
      this.cancelModal()
    },
    cancelModal() {
      this.visible = false
      this.selectedRowKeys = []
      this.selectedRows = []
    },
  },
}
</script>

<style></style>
