<template>
  <AppProvider>
    <a-spin :spinning="loading">
      <div style="padding: 10px 10px 4px; border-top: solid 1px #e2e2e2">
        <a-button
          type="primary"
          @click="formVisible = true"
        >
          新增
        </a-button>
        <a-button @click="edit">
          修改
        </a-button>
        <a-button
          @click="() => (propertyProfileVisible = true)"
        >
          配置自定义属性
        </a-button>
        <a-button danger ghost @click="handleDelete">
          删除
        </a-button>
      </div>
      <ht-modal
        v-model:open="propertyProfileVisible"
        title="委托自定义属性配置"
        @ok="handleProfile"
      >
        <CustomProperty customize-type="consign-profile" />
      </ht-modal>
      <a-table
        class="mt-2"
        :data-source="data"
        :columns="columns"
        :row-selection="rowSelection"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'blind'">
            <span>
              <a-tag :color="text ? 'green' : 'volcano'">
                {{ record.blind ? '盲样' : '不盲样' }}
              </a-tag>
            </span>
          </template>
          <template v-if="column.dataIndex === 'columnType'">
            {{ names[text] }}
          </template>
          <template v-if="column.dataIndex === 'preVisible'">
            <a-switch
              v-model:checked="record.preVisible"
              @change="changePreVisible(record)"
            ></a-switch>
          </template>
        </template>
      </a-table>
      <ht-modal
        v-model:open="formVisible"
        title="委托自定义属性"
        :mask-closable="false"
        @ok="handleOk"
        @cancel="handleCancel"
      >
        <a-spin :spinning="spinning">
          <a-form v-bind="layout" ref="form" :model="form" :rules="rules">
            <a-form-item label="属性名称" prop="columnName">
              <a-input
                v-model:value="form.columnName"
                placeholder="请输入自定义属性名称"
              />
            </a-form-item>
            <a-form-item label="属性类型" prop="columnType">
              <a-select
                v-model:value="form.columnType"
                placeholder="请选择属性类型"
                @change="changeColumnType"
              >
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
                <a-select-option value="selectUpdate">
                  下拉列表（可输可选）
                </a-select-option>
                <a-select-option value="selectMultiple">
                  下拉列表（多选）
                </a-select-option>
                <a-select-option value="date">
                  日期组件
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              v-if="
                form.columnType === 'select'
                  || form.columnType === 'selectUpdate'
                  || form.columnType === 'radio'
                  || form.columnType === 'selectMultiple'
              " label="属性候选值" prop="columnValue"
            >
              <a-popover title="提示">
                <template #content>
                  <p>多个候选值以半角逗号分隔。</p>
                  <p>
                    例如：
                    <span
                      style="
                        background: #eee;
                        font-size: 14px;
                        font-family: '宋体';
                      "
                    >普通送检,定期检查</span>
                  </p>
                </template>
                <a-select
                  v-model:value="form.columnValue"
                  :allow-clear="true"
                  :token-separators="[',']"
                  mode="tags"
                  placeholder="请输入属性候选值"
                  @change="changeSelect"
                >
                  <a-select-option
                    v-for="item in items"
                    :key="item + 1"
                    :value="item"
                  >
                    {{ item }}
                  </a-select-option>
                </a-select>
              </a-popover>
            </a-form-item>
            <a-form-item label="属性默认值">
              <a-input-number
                v-if="form.columnType === 'inputNumber'"
                v-model:value="form.defaultValue"
                placeholder="请输入属性默认值"
                style="width: 100%"
              />
              <a-date-picker
                v-else-if="form.columnType === 'date'"
                v-model:value="form.defaultValue"
                value-format="YYYY-MM-DD"
                placeholder="请选择默认日期"
                style="width: 100%"
              />
              <a-input
                v-else
                v-model:value="form.defaultValue"
                :disabled="
                  form.columnType === 'select'
                    || form.columnType === 'selectUpdate'
                    || form.columnType === 'radio'
                "
                placeholder="请输入属性默认值"
              />
            </a-form-item>
            <a-form-item label="是否盲样" prop="blind">
              <a-radio-group
                v-model:value="form.blind"
                style="padding-right: 12px"
              >
                <a-radio :value="1">
                  是
                </a-radio>
                <a-radio :value="0">
                  否
                </a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="排序号" prop="columnIndex">
              <a-input-number v-model:value="form.columnIndex" />
            </a-form-item>
            <a-form-item label="应用到预委托" prop="columnIndex">
              <a-radio-group v-model:value="form.preVisible">
                <a-radio :value="1">
                  是
                </a-radio>
                <a-radio :value="0">
                  否
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-form>
        </a-spin>
      </ht-modal>
    </a-spin>
  </AppProvider>
</template>

<script>
import CustomProperty from '~/providers/components/CustomProperty.vue'

export default {
  name: 'App',
  components: { CustomProperty },
  data() {
    return {

      propertyProfileVisible: false,
      loading: false,
      spinning: false,
      data: [],
      columns: [
        { title: '自定义属性名称', dataIndex: 'columnName' },
        {
          title: '是否盲样',
          dataIndex: 'blind',
          scopedSlots: { customRender: 'blind' },
        },
        {
          title: '应用到预委托',
          dataIndex: 'preVisible',
          scopedSlots: { customRender: 'preVisible' },
        },
        {
          title: '属性类型',
          dataIndex: 'columnType',
          scopedSlots: { customRender: 'columnType' },
        },
        { title: '默认值', dataIndex: 'defaultValue' },
        { title: '排序号', dataIndex: 'columnIndex' },
      ],
      columnData: [],
      formVisible: false,
      form: {
        columnName: '',
        blind: 0,
        columnIndex: 1,
        columnType: 'input',
        columnValue: '',
        defaultValue: '',
        preVisible: 0,
      },
      rules: {
        columnName: [
          { required: true, message: '请输入属性名称', trigger: 'blur' },
          { min: 1, max: 100, message: '属性名称超长', trigger: 'blur' },
        ],
        blind: [
          { required: true, message: '请选择属性是否盲样', trigger: 'change' },
        ],
        columnIndex: [
          { required: true, message: '请输入属性排序号', trigger: 'blur' },
        ],
      },
      layout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
      },
      selectedRowKeys: [],
      selectRows: [],
      names: {
        input: '文本框',
        textArea: '文本域',
        inputNumber: '数字文本框',
        radio: '单选框',
        select: '下拉列表',
        selectUpdate: '下拉列表（可修改）',
        selectMultiple: '下拉列表（多选）',
        date: '日期组件',
      },
      items: [],
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectRows = selectedRows
          this.selectedRowKeys = selectedRowKeys
        },
      }
    },
  },
  mounted() {
    this.fetchData()
    window.GetResult = (layerI, successFunc) => {
      successFunc(layerI, [])
    }
  },
  methods: {
    fetchData() {
      this.loading = true
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'consign-property',
          },
        })
        .then((res) => {
          this.loading = false
          this.data = res.data.map((item) => {
            const blind = Number.parseInt(item.columnName.substring(0, 1))
            return {
              ...item,
              columnName: item.columnName.substring(1),
              // eslint-disable-next-line unicorn/prefer-number-properties
              blind: isNaN(blind) ? 0 : blind,
              key: item.id,
            }
          })
        })
    },
    handleOk() {
      this.$refs.form.validateFields().then(() => {
        this.spinning = true
        // 这里根据现有委托自定义属性来的，1.自定义属性名称 2.是否盲样 3.排序号 写得比较死
        const data = {
          columnName: this.form.blind + this.form.columnName,
          columnType: this.form.columnType,
          columnIndex: this.form.columnIndex,
          preVisible: !!this.form.preVisible,
          defaultValue: this.form.defaultValue,
          customizeType: 'consign-property',
          visible: true,
          id: this.form.id,
          isDelete: false,
        }
        if (this.form.columnValue && this.form.columnValue.length > 0) {
          if (this.form.columnValue.length > 50) {
            window.$oAntdMessage.warning('候选值数量超限')
            this.spinning = false
            return
          }
          data.columnValue = this.form.columnValue.join(',')
        }
        this.submit(data)
          .then((res) => {
            this.spinning = false
            if (res.code === 21000 || res.code === 22000) {
              window.$oAntdMessage.success('操作成功')
              this.fetchData()
              this.selectRows = []
              this.selectedRowKeys = []
              this.handleCancel()
              this.formVisible = false
            }
            else {
              window.$oAntdMessage.warning(`操作失败,${res.msg}` || res.message)
            }
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err)
            this.spinning = false
            window.$oAntdMessage.error('请求失败')
          })
      })
    },
    handleProfile() {
      this.propertyProfileVisible = false
      this.fetchData()
    },
    changeColumnType(e) {
      if (['radio', 'select', 'selectUpdate', 'selectMultiple'].includes(e))
        return
      this.form.defaultValue = ''
      this.form.columnValue = ''
    },
    // 修改存在候选值的表单
    changeSelect(e) {
      if (e && e.length) {
        this.form.defaultValue = e[0]
      }
      else {
        this.form.defaultValue = ''
      }
    },
    // 列表切换“是否应用到预委托”
    changePreVisible(row) {
      this.loading = true
      const data = { ...row }
      data.columnName = row.blind + row.columnName
      this.submit(data)
        .then((res) => {
          this.fetchData()
          if (res.code === 21000 || res.code === 22000) {
            window.$oAntdMessage.success('操作成功')
            this.handleCancel()
          }
          else {
            window.$oAntdMessage.warning(`操作失败,${res.msg}` || res.message)
          }
        })
        .catch((err) => {
          this.loading = false
          window.$oAntdMessage.warning(`操作失败,${err.msg}` || err.message)
        })
    },
    edit() {
      if (this.selectRows.length !== 1) {
        window.$oAntdMessage.warning('请选择一条数据进行编辑')
        return
      }
      this.form = { ...this.selectRows[0] }
      this.form.preVisible = this.form.preVisible ? 1 : 0
      if (this.form.columnValue && this.form.columnValue.length > 0) {
        this.form.columnValue = this.form.columnValue.split(',')
      }
      this.formVisible = true
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
    handleDelete() {
      if (this.selectRows.length < 1) {
        window.$oAntdMessage.warning('请选择一条数据进行编辑')
        return
      }
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk: () => {
          const ids = self.selectRows.map(row => row.id).join(',')
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
                self.selectRows = []
                self.fetchData()
              }
              else {
                window.$oAntdMessage.warning('删除失败！')
              }
            })
            .catch((err) => {
              // eslint-disable-next-line no-console
              console.log(err)
              window.$oAntdMessage.error('操作失败！')
            })
        },
      })
    },
    handleCancel() {
      this.form = {
        columnName: '',
        blind: 0,
        columnIndex: 1,
        columnType: 'input',
        preVisible: 0,
        defaultValue: '',
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
