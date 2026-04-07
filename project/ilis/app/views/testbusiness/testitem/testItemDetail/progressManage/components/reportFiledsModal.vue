<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="上报字段"
      :mask-closable="false"
      class="testItem-reportFieldsModal-modal"
      @ok="cancelModal"
    >
      <a-button

        v-permission="'add:progress:column'"
        type="primary"
        style="margin-bottom: 10px"
        @click="
          () => {
            $refs.AddReportFields.showModal()
          }
        "
      >
        添加
      </a-button>
      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        :scroll="{ y: 160 }"
        row-key="id"
        bordered
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="['columnName', 'columnType'].includes(column.dataIndex)">
            <div>
              <a-input
                v-if="record.editable && column.dataIndex != 'columnType'"
                style="margin: -5px 0"
                :value="text"
                @change="(e) => handleChange(e.target.value, record.id, column.dataIndex)"
              />
              <a-select
                v-if="record.editable && column.dataIndex == 'columnType'"
                style="margin: -5px 0"
                :value="contentType.filter((item) => item.value == text)[0].name"
                @select="(e) => handleChange(e, record.id, column.dataIndex)"
              >
                <a-select-option
                  v-for="(item, index) in contentType"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
              <template v-if="!record.editable">
                {{
                  column.dataIndex == 'columnName'
                    ? text
                    : contentType.filter((item) => item.value == text)[0].name
                }}
              </template>
            </div>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <template v-if="record.editable">
                <a @click="() => save(record)">保存</a>
                <a-popconfirm
                  title="确定取消吗？"
                  @confirm="() => cancel(record.id)"
                >
                  <a>取消</a>
                </a-popconfirm>
              </template>
              <template v-else>
                <a
                  v-permission="'edit:progress:column'"
                  @click="() => edit(record.id)"
                >编辑</a>
                <a
                  v-permission="'del:progress:column'"
                  href="javascript:;"
                  @click="deleteRow(record)"
                >删除</a>
              </template>
            </div>
          </template>
        </template>
      </a-table>
    </ht-modal>

    <AddReportFields
      ref="AddReportFields"
      :content-type="contentType"
      :callback="getFields"
    />
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import AddReportFields from './addReportFields'

const columns = [
  {
    title: '序号',
    dataIndex: 'columnIndex',
    width: '15%',
  },
  {
    title: '标题',
    dataIndex: 'columnName',
    width: '40%',
    scopedSlots: { customRender: 'columnName' },
  },
  {
    title: '内容类型',
    dataIndex: 'columnType',
    width: '20%',
    scopedSlots: { customRender: 'columnType' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '25%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    AddReportFields,
  },
  props: ['contentType'],
  data() {
    return {
      id: getQueryVariable('id'),
      data: [],
      columns,
      loading: false,
      visible: false,
      isEdit: false,
    }
  },
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取自定义字段
    getFields() {
      this.loading = true
      window.$oRest({
        url: `${window.$oApi.testItem.getFields}/${this.id}`,
      }).then((res) => {
        if (res && res.data) {
          this.data = res.data
          this.cacheData = this.data.map(item => ({ ...item }))
          this.loading = false
          this.isEdit = false
        }
      })
    },
    showModal() {
      this.getFields()
      this.visible = true
    },
    cancelModal() {
      if (this.isEdit) {
        message.warn('请先保存或取消当前正在编辑项')
        return
      }
      this.visible = false
    },
    handleChange(value, id, column) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    // 编辑
    edit(id) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target.editable = true
        this.data = newData
        this.isEdit = true
      }
    },
    // 保存
    save(data) {
      delete data.isDelete
      delete data.editable

      this.loading = true
      window.$oAjax({
        method: 'PUT',
        url: window.$oApi.testItem.column,
        data,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          message.success('操作成功')
          this.getFields()
        }
        else {
          message.warn(res.message)
        }
        this.loading = false
      })
    },
    // 取消
    cancel(id) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        Object.assign(
          target,
          this.cacheData.filter(item => id === item.id)[0],
        )
        delete target.editable
        this.data = newData
        this.isEdit = false
      }
    },
    // 删除
    deleteRow(data) {
      Modal.confirm({
        title: '删除',
        content: `确认删除 ${data.columnName} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oRest
            .delete(`${window.$oApi.testItem.column}/${data.id}`)
            .then((res) => {
              if (res && res.code) {
                message.success(res.message)
                this.getFields()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
        },
      })
    },
  },
}
</script>

<style lang="less">
.testItem-reportFieldsModal-modal {
  .ant-modal-body {
    height: 380px;
    overflow-y: auto;
  }
}
</style>
