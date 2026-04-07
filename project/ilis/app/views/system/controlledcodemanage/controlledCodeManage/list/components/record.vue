<template>
  <div>
    <ht-modal
      title="受控码版本"
      :open="value"
      centered
      :mask-closable="false"
      width="800px"
      @cancel="onCancel"
    >
      <a-table
        :columns="columns"
        :data-source="dataSource"
        bordered
        :pagination="false"
        :loading="loading"
        row-key="id"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'controlCode'">
            <a-input
              v-if="record.isEdit"
              v-model:value="record.controlCode"
              :disabled="record.isLoading"
              placeholder="请输入"
            />
            <span v-else>{{ record.controlCode }}</span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="table-handle">
              <a
                v-if="!isEdit"
                title="编辑"
                style="color: #1890ff"
                @click="onEditRow(record)"
              >
                编辑
              </a>
              <a
                v-if="record.isEdit"
                title="保存"
                style="color: #1890ff"
                @click="onCheckCode(record)"
              >
                保存
              </a>
              <a
                v-if="record.isEdit && !record.isLoading"
                title="取消"
                style="color: red"
                @click="onCancelRow(record)"
              >
                取消
              </a>
            </div>
          </template>
        </template>
      </a-table>
      <template #footer>
        <a-button @click="onCancel">
          关闭
        </a-button>
        <div style="clear: both"></div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { checkCodeExist, editCode, getCodeChangeRecord } from '../../api'

export default {
  props: ['value', 'id'],
  emits: ['update:value'],
  data() {
    return {
      columns: [
        {
          title: '受控码',
          dataIndex: 'controlCode',
          width: '25%',
          scopedSlots: { customRender: 'controlCode' },
        },
        {
          title: '启用日期',
          dataIndex: 'enableData',
          width: '20%',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '20%',
        },
        {
          title: '更新时间',
          dataIndex: 'updateDate',
          width: '20%',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '15%',
          scopedSlots: { customRender: 'operation' },
        },
      ],
      loading: false,
      dataSource: [],
      cacheRow: null,
      isEdit: false,
    }
  },
  watch: {
    value(val) {
      if (val === true) {
        this.getData()
      }
    },
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    async getData() {
      this.loading = true
      const res = await getCodeChangeRecord({ uniqueMark: this.id })
      this.loading = false
      if (res.code !== 20010) {
        this.dataSource = res.data.map(item => ({
          ...item,
          isEdit: false,
          isLoading: false,
        }))
      }
      else {
        window.$oAntdModal.warning(
          window.$oMsgTips.info(res.msg || res.message || '请求失败，请稍后再试'),
        )
      }
    },
    // 编辑行
    onEditRow(row) {
      this.isEdit = true
      row.isEdit = true
      this.cacheRow = { ...row }
      window.$oForceUpdate()
    },
    // 检查代码
    async onCheckCode(row) {
      if (row.isLoading) {
        return
      }

      if (!row.templateName) {
        window.$oAntdModal.warning({
          title: '提示',
          content: '受控码为必填',
        })
        return
      }

      try {
        // 将改行置为不可编辑状态
        row.isLoading = true
        window.$oForceUpdate()

        const loading = window.$oAntdMessage.loading('受控码检查中...', 0)
        const res = await checkCodeExist({
          uniqueMark: row.uniqueMark,
          controlCode: row.controlCode,
        })

        setTimeout(loading, 0)
        if (res.code !== 20010) {
          if (res.data.exist === true) {
            window.$oAntdConfirm({
              title: '提示',
              content: `本次填写的受控码在系统中已存在，${res.data.message} 是否继续？`,
              okText: '确认',
              cancelText: '取消',
              onOk: async () => {
                this.onSaveRow(row)
              },
            })
          }
          else {
            this.onSaveRow(row)
          }
        }
        else {
          row.isLoading = false
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.msg || res.message || '请求异常，请稍后再试'),
          )
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        setTimeout(loading, 0)
        row.isLoading = false
        window.$oAntdModal.warning('请求异常，请稍后再试')
      }

      window.$oForceUpdate()
    },
    // 保存行
    async onSaveRow(row) {
      const formData = { ...row }

      const loading = window.$oAntdMessage.loading('数据保存中...', 0)
      try {
        const res = await editCode(formData)
        setTimeout(loading, 0)
        if (res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          await this.getData()
          this.isEdit = false
        }
        else {
          row.isLoading = false
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.msg || res.message || '保存失败，请稍后再试'),
          )
        }
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        setTimeout(loading, 0)
        row.isLoading = false
        window.$oAntdModal.warning('保存失败，请稍后再试')
      }
      window.$oForceUpdate()
    },
    // 取消
    onCancelRow(row) {
      window.$oAntdConfirm({
        title: '提示',
        content: `确认取消编辑吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          if (this.isEdit === true) {
            this.isEdit = false
            const keys = Object.keys(this.cacheRow)
            // eslint-disable-next-line array-callback-return
            keys.map((key) => {
              row[key] = this.cacheRow[key]
            })
            row.isEdit = false
            window.$oForceUpdate()
          }
        },
      })
    },
    onCancel() {
      if (this.isEdit === true) {
        window.$oAntdConfirm({
          title: '提示',
          content: `存在正在编辑的项，是否继续关闭？`,
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {
            $emit(this, 'update:value', false)
            this.isEdit = false
            window.$oNextTick(() => {
              this.dataSource = []
            })
          },
        })
      }
      else {
        $emit(this, 'update:value', false)
        this.isEdit = false
        window.$oNextTick(() => {
          this.dataSource = []
        })
      }
    },
  },
}
</script>
