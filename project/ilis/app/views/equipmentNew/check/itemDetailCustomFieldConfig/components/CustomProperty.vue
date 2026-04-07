<template>
  <div>
    <div>
      <div style="margin: 10px">
        <div style="padding-bottom: 10px">
          <a-input
            v-model:value="queryName"
            placeholder="输入自定义名称回车即可查询"
            style="width: 300px; margin-right: 5px"
            @press-enter="fetchData"
          />
          <a-button @click="fetchData">
            查询
          </a-button>
        </div>
        <div
          style="
            padding-top: 10px;
            border-top: solid 1px #e2e2e2;
            margin-top: 10px;
          "
        >
          <a-button @click="add">
            新增
          </a-button>
          <a-button @click="edit">
            修改
          </a-button>
          <a-button @click="deleteColumn">
            删除
          </a-button>
        </div>
      </div>
      <a-table
        :loading="dataLoading"
        :columns="columns"
        :data-source="data"
        :bordered="true"
        :row-selection="rowSelection"
        :custom-row="customRow"
        row-key="id"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'visible'">
            <span>
              <a-tag :color="text ? 'green' : 'volcano'">
                {{ visible ? '可见' : '不可见' }}
              </a-tag>
            </span>
          </template>

          <template v-if="column.dataIndex === 'columnType'">
            {{ names[text] }}
          </template>
        </template>
      </a-table>
      <ht-modal v-model:open="addColumnVisible" title="自定义表头">
        <a-form-model
          v-bind="layout"
          ref="columnForm"
          :model="columnForm"
          :rules="rules"
        >
          <a-form-model-item has-feedback label="表头名称" prop="columnName">
            <a-input v-model:value="columnForm.columnName" autocomplete="off" />
          </a-form-model-item>
          <!-- <a-form-model-item has-feedback label="属性类型" prop="columnType" >
              <a-select v-model="columnForm.columnType" placeholder="请选择属性类型">
                <a-select-option value="input">
                  文本框
                </a-select-option>
                <a-select-option value="textArea">
                  文本域
                </a-select-option>
                <a-select-option value="inputNumber">
                  数字文本框
                </a-select-option>
                <a-select-option value="radio">
                  单选框
                </a-select-option>
                <a-select-option value="select">
                  下拉列表
                </a-select-option>
                <a-select-option value="date">
                  日期组件
                </a-select-option>
              </a-select>
            </a-form-model-item> -->
          <!-- <a-form-model-item v-if="this.columnForm.columnType === 'select'" has-feedback label="属性候选值" prop="columnValue">
              <a-popover title="提示">
                <template slot="content">
                  <p>多个候选值以半角逗号分隔。</p>
                  <p>例如： <span style="background: #eee;font-size: 14px;font-family: '宋体'">普通送检,定期检查</span></p>
                </template>
                <a-select
                    :allowClear="true"
                    :token-separators="[',']"
                    mode="tags"
                    v-model="columnForm.columnValue"
                    placeholder="请输入属性候选值"
                >
                  <a-select-option v-for="item in items" :key="item + 1" :value="item">
                    {{ item }}
                  </a-select-option>
                </a-select>
              </a-popover>
            </a-form-model-item> -->
          <a-form-model-item has-feedback label="排序号" prop="columnIndex">
            <a-input-number v-model:value="columnForm.columnIndex" />
          </a-form-model-item>
          <!-- <a-form-model-item has-feedback label="是否可见" prop="visible"> -->
          <!-- <a-radio-group v-model="columnForm.visible" style="padding-right: 12px"> -->
          <!-- <a-radio :value="true"> -->
          <!-- 可见 -->
          <!-- </a-radio> -->
          <!-- <a-radio :value="false"> -->
          <!-- 不可见 -->
          <!-- </a-radio> -->
          <!-- </a-radio-group> -->
          <!-- </a-form-model-item> -->
        </a-form-model>
        <template #footer>
          <a-button key="back" @click="handleCancel">
            取消
          </a-button>
          <a-button
            key="submit"
            type="primary"
            :loading="loading"
            @click="handleOk"
          >
            保存
          </a-button>
        </template>
      </ht-modal>
    </div>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'CustomProperty',
  props: {
    customizeType: {
      type: String,
      required: true,
    },
  },
  emits: ['callBack'],
  data() {
    return {
      queryName: '',
      data: [],
      columns: [
        {
          title: '排序号',
          dataIndex: 'columnIndex',
          width: 80,
          align: 'center',
        },
        { title: '标题名称', dataIndex: 'columnName' },
        // {title: '属性类型', dataIndex: 'columnType', scopedSlots: {customRender: 'columnType'}},
        // {title: '候选值', dataIndex: 'columnValue'},
        // {title: '是否可见', dataIndex: 'visible', scopedSlots: {customRender: 'visible'}}
      ],
      addColumnVisible: false,
      columnForm: {
        visible: true,
      },
      layout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 14 },
      },
      rules: {
        columnName: [
          { required: true, message: '请输入自定义属性名称', trigger: 'blur' },
          { min: 1, max: 100, message: '自定义属性名称超长', trigger: 'blur' },
        ],
        columnType: [
          {
            required: true,
            message: '请选择自定义属性类型',
            trigger: 'change',
          },
        ],
        columnIndex: [
          {
            required: true,
            message: '请输入自定义属性排序号',
            trigger: 'blur',
          },
        ],
        visible: [
          { required: true, message: '请选择列的可见性', trigger: 'change' },
        ],
      },
      loading: false,
      dataLoading: false,
      selectedRows: [],
      selectedRowKeys: [],
      items: [],
      names: {
        input: '文本框',
        textArea: '文本域',
        inputNumber: '数字文本框',
        radio: '单选框',
        select: '下拉框',
        date: '日期组件',
      },
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.id),
                1,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.id !== record.id,
              )
            }
            else {
              this.selectedRowKeys.push(record.id)
              this.selectedRows.push(record)
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRows = selectedRows
          this.selectedRowKeys = selectedRowKeys
        },
      }
    },
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      this.dataLoading = true
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: this.customizeType,
            queryName: this.queryName,
          },
        })
        .then((res) => {
          this.loading = false
          this.dataLoading = false
          this.data = res.data
        })
        .catch(() => {
          window.$oAntdMessage.error('获取数据失败')
          this.dataLoading = false
        })
    },
    add() {
      this.addColumnVisible = true
    },
    handleOk() {
      this.$refs.columnForm.validate((valid) => {
        if (valid) {
          this.loading = true
          const data = { ...this.columnForm }
          data.customizeType = this.customizeType
          if (
            this.columnForm.columnValue
            && this.columnForm.columnValue.length > 0
          ) {
            if (this.columnForm.columnValue.length > 50) {
              window.$oAntdMessage.warning('候选值数量超限')
              this.loading = false
              return
            }
            data.columnValue = this.columnForm.columnValue.join(',')
          }

          data.visible = true
          this.submit(data).then((res) => {
            if (res.code === 21000 || res.code === 22000) {
              window.$oAntdMessage.success('操作成功！')
              this.handleCancel()
              this.fetchData()
              $emit(this, 'callBack')
            }
            else {
              window.$oAntdMessage.error(res.message || '操作失败！')
            }
            this.loading = false
          })
        }
      })
    },
    handleCancel() {
      this.$refs.columnForm.resetFields()
      this.addColumnVisible = false
      this.columnForm = {}
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    submit(data) {
      if (data.id) {
        return window.$oAjax.put(window.$oApi.common.customProperty, data, {
          headers: {
            'content-type': 'application/json',
          },
        })
      }
      else {
        return window.$oAjax.post(window.$oApi.common.customProperty, data, {
          headers: {
            'content-type': 'application/json',
          },
        })
      }
    },
    edit() {
      if (this.selectedRows.length !== 1) {
        window.$oAntdMessage.warning('请选择一条数据进行编辑')
        return
      }
      this.columnForm = { ...this.selectedRows[0] }
      if (
        this.columnForm.columnValue
        && this.columnForm.columnValue.length > 0
      ) {
        this.columnForm.columnValue = this.columnForm.columnValue.split(',')
      }
      this.addColumnVisible = true
    },
    deleteColumn() {
      if (this.selectedRows.length < 1) {
        window.$oAntdMessage.warning('请选择一条数据')
        return
      }
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk: () => {
          const ids = self.selectedRows.map(row => row.id).join(',')
          window.$oAjax
            .delete(window.$oApi.common.customProperties, {
              params: {
                ids,
              },
            })
            .then((res) => {
              if (res.code === 23000) {
                window.$oAntdMessage.success('删除成功！')
                self.selectedRowKeys = []
                self.selectedRows = []
                self.fetchData()
                $emit(this, 'callBack')
              }
              else {
                window.$oAntdMessage.warning('删除失败！')
              }
            })
            .catch(() => {
              window.$oAntdMessage.error('操作失败！')
            })
        },
      })
    },
  },
}
</script>

<style scoped></style>
