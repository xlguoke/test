<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-script">
        <a-form ref="formRef" :model="dataObj">
          <a-form-item
            label="台账名称"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '台账名称不能为空!' }]"
            name="name"
          >
            <a-input
              v-model:value="dataObj.name"
              :disabled="isDetail"
              placeholder="请输入"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            class="scriptBox"
            label="查询SQL语句"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <VAceEditor
              v-model:value="script"
              lang="sql"
              theme="chrome"
              style="height: 100px"
            ></VAceEditor>
          </a-form-item>
          <a-form-item
            label="是否使用具名参数"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-checkbox v-model:checked="namedParameters"></a-checkbox>
          </a-form-item>
        </a-form>
        <div style="margin: 8px">
          查询条件
        </div>
        <div class="table-box">
          <a-table
            :columns="columns"
            :data-source="dataSource"
            bordered
            :pagination="false"
            :row-class-name="rowClassName"
            :scroll="{ y: 160 }"
            row-key="id"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="['name', 'parameter'].includes(column.dataIndex)">
                <div>
                  <a-input
                    v-if="record.editable"
                    :value="text"
                    :max-length="column.dataIndex === 'name' ? 10 : undefined"
                    @change="(e) => handleChange(e.target.value, record.id, column.dataIndex)"
                  />
                  <template v-else>
                    {{ text }}
                  </template>
                </div>
              </template>

              <template v-if="column.dataIndex === 'type'">
                <div>
                  <span v-if="record.editable">
                    <a-select
                      style="width: 100%"
                      :default-value="record.typeName"
                      placeholder="请选择"
                      :dropdown-match-select-width="false"
                      @change="
                        (e) => {
                          handleChange(e, record.id, 'type')
                        }
                      "
                    >
                      <a-select-option
                        v-for="item in typeData"
                        :key="item.values"
                        :value="item.values"
                      >
                        {{ item.name }}
                      </a-select-option>
                    </a-select>
                  </span>
                  <template v-else>
                    {{ record.typeName }}
                  </template>
                </div>
              </template>

              <template v-if="column.dataIndex === 'operation'">
                <div class="editable-row-operations">
                  <template v-if="record.editable">
                    <a @click="() => save(record.id)">保存</a>
                    <a-popconfirm
                      title="确定要取消吗?"
                      @confirm="() => cancel(record.id)"
                    >
                      <a>取消</a>
                    </a-popconfirm>
                  </template>
                  <template v-else>
                    <a
                      :disabled="editingKey !== '' || isDetail"
                      @click="() => edit(record.id)"
                    >编辑</a>
                    <a-popconfirm
                      :disabled="editingKey !== '' || isDetail"
                      title="确定要删除吗?"
                      @confirm="delRow(record.id)"
                    >
                      <a :disabled="editingKey !== '' || isDetail">删除</a>
                    </a-popconfirm>
                  </template>
                </div>
              </template>
            </template>
          </a-table>
          <a-button
            v-if="!isDetail"
            style="margin-top: 10px"
            class="editable-add-btn"
            @click="handleAdd"
          >
            新增
          </a-button>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { VAceEditor } from 'vue3-ace-editor'
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import 'ace-builds/src-noconflict/mode-sql'
import 'ace-builds/src-noconflict/theme-chrome'
import 'ace-builds/src-noconflict/ext-language_tools'

const columns = [
  {
    title: '显示名称',
    dataIndex: 'name',
    width: '25%',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: '属性名称',
    dataIndex: 'parameter',
    width: '25%',
    scopedSlots: { customRender: 'parameter' },
  },
  {
    title: '查询类型',
    dataIndex: 'type',
    width: '40%',
    scopedSlots: { customRender: 'type' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]
export default {
  components: {
    VAceEditor,
  },
  props: ['callback'],
  data() {
    return {
      spinning: false,
      rootUrl,
      formLayout: 'horizontal',

      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dayjs,
      isDetail: false,
      editId: '',
      dataObj: {},
      script: '',
      namedParameters: false,
      dataSource: [],
      columns,
      editingKey: '',
      cacheData: [],
      typeData: [
        { name: 'input', values: 100 },
        { name: 'inputNumber', values: 110 },
        // {name: "select", values: 200},
        { name: 'date', values: 300 },
        { name: 'radio', values: 400 },
      ],
    }
    // 100 input/110 input number/200 select/300 date(范围)/400 radio
  },
  created() {
    // ilis 跳转的详情页面
    if (getQueryVariable('detailId')) {
      const id = getQueryVariable('detailId')
      this.showModal(id, true)
    }
  },
  mounted() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    async showModal(groupObj, editId, isDetail) {
      this.isDetail = isDetail
      this.editId = editId
      this.groupObj = groupObj

      if (editId) {
        this.spinning = true
        await window.$oAjax({
          method: 'get',
          url: `${window.$oApi.ledgerSetting.getById}/${editId}`,
        }).then((res) => {
          this.dataSource = []
          if (res.code === 20000) {
            this.dataObj = res.data
            // eslint-disable-next-line ts/no-unused-expressions
            this.dataObj.querySql ? (this.script = this.dataObj.querySql) : ''
            this.namedParameters = this.dataObj.namedParameters
            if (this.dataObj.conditions && this.dataObj.conditions.length) {
              this.dataSource = this.dataObj.conditions.map((item) => {
                const obj = this.typeData.filter(
                  itemJ => item.type === itemJ.values,
                )[0]
                return {
                  ...item,
                  typeName: obj.name,
                }
              })
            }
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.dataObj = {}
          }
          this.spinning = false
        })
      }
      else {
        this.dataSource = []
      }
      this.cacheData = this.dataSource.map(item => ({ ...item }))

      try {
        const ele = document.getElementsByClassName('ace_scroller')[0]
        if (this.isDetail) {
          ele.style.pointerEvents = 'none'
          ele.style.backgroundColor = '#f5f5f5'
          ele.style.width = '100%'
        }
        else {
          ele.style.pointerEvents = ''
          ele.style.backgroundColor = '#fff'
          ele.style.width = '100%'
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
    },
    dataRequired() {
      if (!this.script) {
        window.$oAntdModal.warning(window.$oMsgTips.info(`输入查询SQL语句`))
        return false
      }
      if (this.editingKey) {
        window.$oAntdModal.warning(window.$oMsgTips.info(`请先保存查询条件`))
        return false
      }
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        if (this.dataRequired()) {
          const fieldsValue = { ...this.dataObj }
          const data = {
            ...this.dataObj,
            name: fieldsValue.name,
            querySql: this.script,
            categoryId: this.groupObj.categoryId,
            category: this.groupObj.category,
            namedParameters: this.namedParameters,
          }
          let method = 'POST'
          if (this.dataObj.id) {
            method = 'PUT'
          }
          else {
            const newData = [...this.dataSource]
            data.conditions = newData.map((item) => {
              return {
                ...item,
              }
            })
          }
          this.spinning = true
          window.$oAjax({
            method,
            url: window.$oApi.ledgerSetting.addUpdateLedger,
            data: JSON.stringify(data),
            headers: {
              'content-type': 'application/json',
            },
          }).then((res) => {
            if (res.code === 21000 || res.code === 22000) {
              this.handleCancel()
              this.callback()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
        }
      })
    },
    handleCancel() {
      this.dataObj = {}
      this.script = ''
      this.editingKey = ''
      this.dataSource = []
      this.namedParameters = false
    },
    handleAdd() {
      const { dataSource } = this
      const id = new Date().getTime()
      if (this.editingKey) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先保存查询条件'))
        return
      }
      const newData = {
        name: '',
        type: '',
        field: '',
        ledgerId: this.dataObj ? this.dataObj.id : '',
        typeName: '',
        editable: true,
        uid: id,
        id,
      }
      this.dataSource = [...dataSource, newData]
      this.cacheData = [...dataSource, newData]
      this.editingKey = id
    },
    handleChange(value, key, column) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => key === item.id)[0]
      if (target) {
        if (column === 'type') {
          const obj = this.typeData.filter(item => value === item.values)[0]
          target.typeName = obj.name
        }
        target[column] = value
        this.dataSource = newData
      }
    },
    edit(key) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => key === item.id)[0]
      this.editingKey = key
      if (target) {
        target.editable = true
        this.dataSource = newData
      }
    },
    delRow(key) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => key === item.id)[0]
      if (target && target.uid) {
        // 没有id 直接删除
        // eslint-disable-next-line unused-imports/no-unused-vars
        const index = newData.findIndex(item => key === item.id)
        delete this.dataSource
        delete this.cacheData
        return
      }
      this.spinning = true
      window.$oAjax({
        url: `${window.$oApi.ledgerSetting.delCondition}/${key}`,
        method: 'DELETE',
      }).then((res) => {
        if (res.code === 23000) {
          window.$oAntdMessage.success('删除成功')
          this.showModal(this.groupObj, this.editId, this.isDetail)
          this.editingKey = ''
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    save(key) {
      let data = {}
      let method = 'POST'
      const newData = [...this.dataSource]
      const target = newData.filter(item => key === item.id)[0]
      if (!target.name && !target.type) {
        window.$oAntdModal.warning(
          window.$oMsgTips.info('查询类型设置不正确；显示名称不允许为空'),
        )
        return
      }
      if (!target.name && target.type) {
        window.$oAntdModal.warning(window.$oMsgTips.info('显示名称不允许为空'))
        return
      }
      if (target.name && !target.type) {
        window.$oAntdModal.warning(window.$oMsgTips.info('查询类型设置不正确'))
        return
      }
      data = { ...target }
      const arrName = this.dataSource.map(item => item.name)
      const newArr = [...new Set(arrName)]
      if (arrName.length !== newArr.length) {
        window.$oAntdModal.warning(window.$oMsgTips.info(`查询条件重复，请修改`))
        return
      }
      if (this.dataObj) {
        const uid = target.uid
        if (target.uid) {
          delete target.uid
        }
        else {
          method = 'PUT'
        }
        this.spinning = true
        window.$oAjax({
          method,
          url: window.$oApi.ledgerSetting.addUpdateCondition,
          data,
          headers: {
            'content-type': 'application/json',
          },
        }).then((res) => {
          if (res.code === 21000 || res.code === 22000) {
            this.editingKey = ''
            this.showModal(this.groupObj, this.editId, this.isDetail)
            const msg = res.code === 21000 ? '新增成功' : '编辑成功'
            window.$oAntdMessage.success(msg)
          }
          else {
            target.uid = uid
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.spinning = false
        })
      }
      else {
        const newCacheData = [...this.cacheData]
        const targetCache = newCacheData.filter(item => key === item.id)[0]
        if (target && targetCache) {
          delete target.editable
          this.dataSource = newData
          Object.assign(targetCache, target)
          this.cacheData = newCacheData
        }
        this.editingKey = ''
      }
    },
    cancel(key) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => key === item.id)[0]
      this.editingKey = ''
      if (target && target.uid) {
        // 没有id 直接删除
        const index = newData.findIndex(item => key === item.id)
        this.dataSource.splice(index, 1)
        this.cacheData.splice(index, 1)
      }
      else {
        Object.assign(
          target,
          this.cacheData.filter(item => key === item.id)[0],
        )
        delete target.editable
        this.dataSource = newData
      }
    },
  },
}
</script>

<style lang="less">
.scriptBox {
  label:before {
    display: inline-block;
    content: '*';
    margin-right: 4px;
    color: #f5222d;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }
  .ace_tooltip {
    visibility: hidden;
  }
  .ace-chrome {
    border: 1px solid #ebebeb;
  }
}
</style>
