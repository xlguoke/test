<template>
  <div>
    <div class="text-right text-colorError pb-2">
      注：查询不到配置时，系统自动采用以下空白章！
    </div>
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :loading="loading"
      :row-class-name="rowClassName"
      row-key="id"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'drawType'">
          <div>
            <a-select
              v-if="record.editable"
              style="width: 100%"
              :value="text"
              @change="(e) => handleSelectChange(e, record.id, 'drawType')"
            >
              <a-select-option
                v-for="(item, index) in dictData"
                :key="index"
                :value="item.id"
              >
                {{ item.typename }}
              </a-select-option>
            </a-select>
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>

        <template v-if="column.dataIndex === 'customCharacter'">
          <div>
            <a-input
              v-if="record.editable && record.drawTypeCode === '1'"
              :value="text"
              @change="
                (e) => handleChange(e.target.value, record.id, 'customCharacter')
              "
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>

        <template v-if="column.dataIndex === 'effectiveDate'">
          <div>
            <a-date-picker
              v-if="record.editable"
              :value="text ? dayjs(new Date(text)) : undefined"
              @change="(e) => handleChange(e, record.id, 'effectiveDate')"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <template v-if="record.editable">
              <a @click="(e) => save(record)">保存</a>
              <a-popconfirm
                title="确定取消吗?"
                @confirm="() => cancel(record.id)"
              >
                <a>取消</a>
              </a-popconfirm>
            </template>
            <template v-else>
              <a :disabled="editId !== ''" @click="(e) => edit(record.id)">编辑</a>
              <a @click="(e) => deleteData(record)">删除</a>
            </template>
          </div>
        </template>
      </template>
    </a-table>
    <a-button style="margin-top: 10px" @click="addRow">
      新增
    </a-button>
  </div>
</template>

<script>
import dayjs from 'dayjs'

const columns = [
  {
    title: '空白区域绘制方式',
    dataIndex: 'drawType',
    width: '30%',
    scopedSlots: { customRender: 'drawType' },
  },
  {
    title: '自定义字符',
    dataIndex: 'customCharacter',
    width: '25%',
    scopedSlots: { customRender: 'customCharacter' },
  },
  {
    title: '启用日期（按委托日期启用）',
    dataIndex: 'effectiveDate',
    width: '25%',
    scopedSlots: { customRender: 'effectiveDate' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '20%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {},
  props: ['dictData'],
  data() {
    return {
      data: [],
      cacheData: [],
      dayjs,
      columns,
      isAdd: true,
      loading: false,
      editId: '',
      templateType: '2',
    }
  },
  created() {
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    handleSelectChange(value, id, column) {
      const obj = this.dictData.filter(item => item.id === value)[0]
      const drawType = obj.typename
      const drawTypeCode = obj.typecode
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = drawType
        target.drawTypeCode = drawTypeCode
        // eslint-disable-next-line ts/no-unused-expressions
        drawTypeCode !== '1' ? (target.customCharacter = '') : ''
        this.data = newData
      }
    },
    getData(templateType) {
      if (templateType) {
        this.templateType = templateType
        this.data = []
        this.cacheData = []
      }
      this.loading = true
      window.$oAjax({
        url: window.$oApi.udrBlankDraw.list,
        params: {
          page: -1,
          size: -1,
          templateType: this.templateType,
        },
      }).then((res) => {
        if (res && res.data) {
          this.data = res.data
          this.cacheData = this.data.map(item => ({ ...item }))
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
        }
        this.loading = false
      })
    },
    addRow() {
      // eslint-disable-next-line eqeqeq
      if (this.editId != '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前编辑或新增!'))
        return
      }
      this.editId = new Date().getTime()
      this.isAdd = true
      this.data.push({
        drawType: '',
        drawTypeCode: '',
        templateType: this.templateType,
        templateTypeName: this.templateType === '2' ? '记录' : '报告',
        customCharacter: '',
        effectiveDate: new Date(),
        id: this.editId,
        editable: true,
      })
    },
    // 删除
    deleteData(record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .delete(`${window.$oApi.udrBlankDraw.delUrl}/${record.id}`)
            .then((res) => {
              if (res.code && res.code !== 20010) {
                window.$oAntdMessage.success('删除成功')
                this.editId = ''
                this.getData()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
        },
      })
    },
    handleChange(value, id, column) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    edit(id) {
      this.isAdd = false
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      this.editId = id
      if (target) {
        target.editable = true
        this.data = newData
      }
    },
    save(record) {
      let method
      const data = {
        drawType: record.drawType,
        drawTypeCode: record.drawTypeCode,
        templateType: record.templateType,
        templateTypeName: record.templateTypeName,
        customCharacter: record.customCharacter,
        effectiveDate: record.effectiveDate
          ? dayjs(record.effectiveDate).format('YYYY-MM-DD')
          : '',
      }
      this.loading = true
      if (this.isAdd === false) {
        data.id = record.id
        method = 'PUT'
      }
      else {
        method = 'POST'
      }
      window.$oAjax({
        method,
        url: window.$oApi.udrBlankDraw.addEditUrl,
        data,
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.editId = ''
          this.isAdd = false
          this.getData()
        }
        else {
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            : ''
          this.loading = false
        }
      })
    },
    cancel(id) {
      if (this.isAdd === true) {
        this.isAdd = false
        this.data = this.data.filter(item => item.id !== id)
      }
      else {
        const newData = [...this.data]
        const target = newData.filter(item => id === item.id)[0]
        if (target) {
          Object.assign(
            target,
            this.cacheData.filter(item => id === item.id)[0],
          )
          delete target.editable
          this.data = newData
        }
      }
      this.editId = ''
    },
  },
}
</script>

<style lang="less"></style>
