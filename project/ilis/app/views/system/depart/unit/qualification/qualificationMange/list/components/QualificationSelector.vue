<template>
  <ht-modal
    v-model:open="_value"
    title="添加资质"
    :mask-closable="false"
    width="460px"
    :centered="true"
    @ok="handleSubmit"
    @cancel="cancelModal"
  >
    <a-table
      :row-selection="{
        selectedRowKeys,
        onChange: onSelectChange,
      }"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      row-key="id"
      :scroll="{ y: 380 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'defaultFlag'">
          {{ text ? '是' : '否' }}
        </template>

        <template v-if="column.dataIndex === 'Action'">
          <a-button @click="onDel(record)">
            删除
          </a-button>
        </template>
      </template>
    </a-table>
  </ht-modal>
</template>

<script>
import { QualificationService } from '~/providers/providers/services/common-body-qualification'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const qualificationService = new QualificationService()

export default {
  props: ['value', 'selectedIds'],
  emits: ['update:value', 'select'],
  data() {
    return {
      loading: false,
      data: [],
      selectedRowKeys: [],
      selectedRows: [],
      columns: [
        { title: '资质名称', dataIndex: 'name', ellipsis: true },
        {
          title: '证书编号',
          width: 150,
          dataIndex: 'certificateNo',
          ellipsis: true,
        },
      ],
    }
  },
  computed: {
    _value: {
      get() {
        return this.value
      },
      set(newValue) {
        $emit(this, 'update:value', newValue)
      },
    },
  },
  watch: {
    _value(val) {
      if (val === true) {
        this.getData()
      }
    },
  },
  methods: {
    onSelectChange(keys, rows) {
      this.selectedRowKeys = keys
      this.selectedRows = rows
    },
    cancelModal() {
      $emit(this, 'update:value', false)
    },
    async getData() {
      this.selectedRowKeys = []
      this.selectedRows = []

      this.loading = true
      const res = await qualificationService.pagination(1, 999)
      this.data = res.rows.filter(i => !i.autoStatement)
      this.loading = false

      if (this.selectedIds && this.selectedIds.length > 0) {
        this.selectedRows = this.data.filter(i =>
          this.selectedIds.includes(i.id),
        )
        this.selectedRowKeys = this.selectedRows.map(i => i.id)
      }
    },
    handleSubmit() {
      if (!this.selectedRowKeys.length) {
        window.$oAntdMessage.warn('请勾选资质！')
        return
      }

      $emit(this, 'select', this.selectedRows)
      this.cancelModal()
    },
  },
}
</script>
