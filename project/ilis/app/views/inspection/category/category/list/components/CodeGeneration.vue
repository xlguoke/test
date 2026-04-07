<template>
  <div>
    <a-row>
      <a-col :span="10" :offset="14">
        <span style="color: green">
          注：检查编号中含年、月、日时，生成标题按生成日期进行取值</span>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24">
        <a-table
          :columns="columns"
          :data-source="variableData"
          row-key="id"
          :pagination="false"
          style="min-height: 220px"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'orderNumber'">
              <div :key="record.id">
                <a-input-number
                  v-if="record.edit"
                  style="margin: -5px 0"
                  :value="text"
                  @change="(e) => orderNumberChange(e, record)"
                />
                <template v-else>
                  {{ text }}
                </template>
              </div>
            </template>
            <template v-if="column.dataIndex === 'type'">
              <div :key="record.id">
                <a-select
                  v-if="record.edit"
                  v-model:value="record.type"
                  :style="{ width: '100%' }"
                  width="200px"
                >
                  <a-select-option
                    v-for="item in type"
                    :key="item.typecode"
                    :value="item.typecode"
                  >
                    {{ item.typename }}
                  </a-select-option>
                </a-select>
                <template v-else>
                  {{ typeFilter_filter(text, type) }}
                </template>
              </div>
            </template>
            <template v-if="column.dataIndex === 'content'">
              <div :key="record.id">
                <a-select
                  v-if="
                    record.edit && record.type === 'sn_factor_custom_property'
                  "
                  v-model:value="record.content"
                  :style="{ width: '100%' }"
                  width="200px"
                >
                  <a-select-option
                    v-for="item in customProperties"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.columnName }}
                  </a-select-option>
                </a-select>
                <a-input
                  v-else-if="record.edit && !hiddenContentType[record.type]"
                  style="margin: -5px 0"
                  :value="text"
                  @change="(e) => contentChange(e.target.value, record)"
                />
                <template v-else>
                  {{ contentFilter_filter(text, customProperties, record.type) }}
                </template>
              </div>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <div>
                <span v-if="record.edit" class="table-handle">
                  <a style="margin-right: 20px" @click="() => verify(record)">保存</a>
                  <a-popconfirm
                    title="确定要取消吗?"
                    @confirm="() => cancel(record)"
                  >
                    <a>取消</a>
                  </a-popconfirm>
                </span>
                <span v-else class="table-handle">
                  <a-popconfirm
                    v-if="data.length"
                    title="确定要删除吗？"
                    @confirm="() => onDelete(record)"
                  >
                    <a-button
                      v-permission="'category:code:delete'"

                      type="link"
                    >
                      删除
                    </a-button>
                  </a-popconfirm>
                  <a-button
                    v-permission="'category:code:edit'"

                    type="link"
                    @click="
                      () => {
                        edit(record)
                      }
                    "
                  >编辑
                  </a-button>
                </span>
              </div>
            </template>
          </template>
        </a-table>
      </a-col>
    </a-row>
    <a-row class="mt-2">
      <a-col :span="24">
        <a-button type="primary" @click="plusItem">
          新增
        </a-button>
      </a-col>
    </a-row>
    <br />
    <hr />
    <br />
    <a-row>
      <a-col :span="24">
        <h4><strong>标题预览：</strong></h4>
        <span class="preview"> {{ preview }}</span>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { request } from '../../request'

export default {
  name: 'CodeGeneration',
  props: {
    customizeType: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
  },
  emits: ['code-preview'],
  data() {
    return {
      data: [],
      variableData: [],
      labelCol: { span: 0 },
      wrapperCol: { span: 24 },

      columns: [
        {
          title: '序号',
          dataIndex: 'orderNumber',
          width: '15%',
        },
        {
          title: '检查编号项',
          dataIndex: 'type',
          width: '30%',
        },
        {
          title: '标题内容项',
          dataIndex: 'content',
          width: '35%',
        },
        {
          title: '操作',
          width: '20%',
          dataIndex: 'operation',
        },
      ],
      type: null,
      customProperties: [],
      hiddenContentType: {
        sn_factor_year: true,
        sn_factor_month: true,
        sn_factor_day: true,
      },
      brackets: {
        sn_factor_year: true,
        sn_factor_month: true,
        sn_factor_day: true,
        sn_factor_custom_property: true,
      },
      newId: {},
      preview: '',
    }
  },
  created() {
    this.initData()
    this.initCustomProperties()
    this.initType()
  },
  mounted() {
    this.variableData = JSON.parse(JSON.stringify(this.data))
  },
  methods: {
    contentFilter_filter(value, customProperties, type) {
      // 如果是自定义属性就要展示下拉列表的显示值
      if (type === 'sn_factor_custom_property') {
        const custom = customProperties
          ? customProperties.find(it => it.id === value)
          : null
        return custom ? custom.columnName : null
      }

      return value
    },
    typeFilter_filter(value, type) {
      return type ? type.find(it => it.typecode === value).typename : value
    },
    initData() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      request.codeGeneration.category(_this.categoryId).then((res) => {
        _this.data = res.data
        // 正在编辑的数据
        const editing = _this.variableData.filter(item => item.edit)
        // 正在编辑的持久数据
        const editPersistent = editing.filter(item => !_this.newId[item.id])
        // 从刷新的持久数据中排除正在编辑的持久数据
        const data = _this.data.filter((item) => {
          let flag = true
          editPersistent.forEach((it) => {
            if (it.id === item.id) {
              flag = false
            }
          })
          return flag
        })
        // 刷新列表数据
        _this.variableData = data.concat(editing)
        _this.updatePreInfo()
      })
    },
    initType() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      request.codeGeneration.type().then((res) => {
        _this.type = res.rows
        this.updatePreInfo()
      })
    },
    initCustomProperties() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      request.codeGeneration
        .customProperties(_this.customizeType)
        .then((res) => {
          _this.customProperties = res.data
        })
    },
    onDelete(record) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      request.codeGeneration.delete(record.id).then(() => {
        _this.initData()
      })
    },
    plusItem() {
      const idIndex = Object.getOwnPropertyNames(this.newId).length
      const id = `_new_${idIndex}`
      this.newId[id] = true
      const item = {
        id,
        orderNumber: null,
        inspectionTypeId: this.categoryId,
        type: '',
        content: '',
        edit: true,
      }
      this.variableData.push(item)
    },
    orderNumberChange(value, record) {
      record.orderNumber = value
    },
    typeChange(value, record) {
      record.type = value
    },
    contentChange(value, record) {
      record.content = value
    },
    verify(record) {
      // 信息验证
      if (
        (!record.orderNumber && record.orderNumber !== 0)
        // eslint-disable-next-line regexp/no-unused-capturing-group
        || !/(^\d+$)/.test(String(record.orderNumber))
      ) {
        window.$oAntdMessage.error('序号只能是正整数')
        return false
      }
      if (!record.type) {
        window.$oAntdMessage.error('请选择检查编号项')
        return false
      }
      if (!record.content && !this.hiddenContentType[record.type]) {
        window.$oAntdMessage.error('请输入标题内容项')
        return false
      }
      this._save(record)
    },
    _save(record) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const temp = JSON.parse(JSON.stringify(record))
      if (this.newId[temp.id]) {
        temp.id = null
        delete this.newId[temp.id]
      }
      request.codeGeneration.edit(temp).then((res) => {
        record.id = res.data
        record.edit = false
        _this.initData()
      })
    },
    cancel(record) {
      record.edit = false
      if (this.newId[record.id]) {
        this.variableData = this.variableData.filter(
          item => item.id !== record.id,
        )
        delete this.newId[record.id]
      }
      else {
        Object.assign(
          record,
          this.data.filter(item => record.id === item.id)[0],
        )
      }
    },
    edit(record) {
      record.edit = true
    },
    updatePreInfo() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      let pre = ''
      _this.data.forEach((item) => {
        const i = _this._getPreviewInfoByType(item)
        if (_this.brackets[item.type]) {
          pre += `[${i}]`
        }
        else {
          pre += i
        }
      })
      _this.preview = pre
      $emit(this, 'code-preview', pre)
    },
    /**
     * 检查是否还有正在正在修改的数据没有保存
     */
    checkEditing() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      return new Promise((resolve) => {
        const index = _this.variableData.findIndex(item => item.edit)
        if (!index || index < 0) {
          resolve(true)
        }
        else {
          resolve(false)
        }
      })
    },
    /**
     * 检查表格是否有数据可修改
     */
    checkDataExists() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      return new Promise((resolve) => {
        if (_this.variableData.length) {
          resolve(true)
        }
        else {
          resolve(false)
        }
      })
    },
    _getPreviewInfoByType(item) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      if (_this.hiddenContentType[item.type]) {
        return _this.type
          ? _this.type.find(it => it.typecode === item.type).typename
          : item.type
      }
      else if (item.type === 'sn_factor_custom_property') {
        const custom = _this.customProperties
          ? _this.customProperties.find(it => it.id === item.content)
          : null
        return custom ? custom.columnName : null
      }
      else {
        return item.content
      }
    },
  },
}
</script>

<style scoped>
.ant-plus {
  height: 32px !important;
  width: 32px !important;
  padding: 0 !important;
  margin-top: 10px;
}
.preview {
  min-height: 40px;
}
.ant-table-content {
  min-height: 220px;
}
hr {
  border-top: 0;
  border-bottom-color: #e8e8e8;
}
</style>
