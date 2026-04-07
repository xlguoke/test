<!-- eslint-disable vue/eqeqeq -->
<template>
  <div>
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :loading="loading"
      row-key="id"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record, text, index }">
        <template v-if="column.dataIndex === 'reportFileName'">
          <div>
            <div v-if="record.editable && isAddId(record)">
              <span
                style="display: inline-block; line-height: 28px; float: left"
              >{{ text }}</span>
              <a-button style="float: right" @click="selectFile(index)">
                选择
              </a-button>
            </div>
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>

        <template v-if="column.dataIndex === 'status'">
          <span>
            <span v-if="record.editable"></span>
            <a-switch
              v-else
              checked-children="已修正"
              un-checked-children="未修正"
              :checked="text == '1' ? true : false"
              @change="amend(record)"
            />
          </span>
        </template>

        <template v-if="column.dataIndex === 'content'">
          <div>
            <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="(e) => handleChange(e.target.value, record.id, 'content')"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>

        <template v-if="column.dataIndex === 'type'">
          <div>
            <div v-if="record.editable">
              <span
                style="display: inline-block; line-height: 28px; float: left"
              >{{ text }}</span>
              <a-button style="float: right" @click="selectType">
                选择
              </a-button>
            </div>
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <template v-if="record.editable">
              <a @click="() => save(record)">保存</a>
              <a-popconfirm
                title="确定取消吗?"
                @confirm="() => cancel(record.id)"
              >
                <a>取消</a>
              </a-popconfirm>
            </template>
            <template v-else>
              <template v-if="record.status === '1'">
                <a @click="() => disallow(record)">打回本次修正</a>
              </template>
              <template v-else>
                <a @click="() => edit(record.id)">编辑</a>
              </template>
              <a @click="() => deleteData(record)">删除</a>
            </template>
          </div>
        </template>
      </template>
    </a-table>
    <a-button
      v-if="canOperation !== 'false'"

      style="margin-top: 10px"
      @click="add"
    >
      新增
    </a-button>
    <QuestionType ref="QuestionType" :callback="selectQuestionType" />
    <TestTaskFileTree ref="TestTaskFileTree" :callback="getFileInfo" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import qs from 'qs'
import { getQueryVariable } from '~/providers/common/utils'
import QuestionType from './components/questionType.vue'
import TestTaskFileTree from './components/testTaskFileTree.vue'

const columns = [
  {
    title: '报告编号',
    dataIndex: 'reportNumber',
  },
  {
    title: '文件名称',
    dataIndex: 'reportFileName',
    width: '15%',
    scopedSlots: { customRender: 'reportFileName' },
  },
  {
    title: '问题',
    dataIndex: 'content',
    width: '15%',
    scopedSlots: { customRender: 'content' },
  },
  {
    // title: '问题类型',
    title: '问题内容',
    dataIndex: 'type',
    width: '15%',
    scopedSlots: { customRender: 'type' },
  },
  {
    title: '严重程度',
    dataIndex: 'severity',
  },
  {
    title: '提出人',
    dataIndex: 'createUserName',
  },
  {
    title: '修正情况',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: '修正人',
    dataIndex: 'amendUserName',
  },
  {
    title: '操作',
    width: '8%',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]

if (
  !getQueryVariable('canOperation') === 'false'
  || (getQueryVariable('canOperation') === 'false'
    && getQueryVariable('canAmend') === 'false')
  || getQueryVariable('isOperation') === 'false'
) {
  columns.pop()
}

export default {
  components: {
    QuestionType,
    TestTaskFileTree,
  },
  data() {
    return {
      data: [],
      cacheData: [],
      sourceModule: getQueryVariable('sourceModule'),
      reportId: getQueryVariable('reportId'),
      testTaskId: getQueryVariable('testTaskId'),
      canAmend: getQueryVariable('canAmend'), // 是否修正人
      isOperation: getQueryVariable('isOperation') || '', // 修正情况
      canOperation: getQueryVariable('canOperation'), // 是否显示添加按钮
      needScroll: getQueryVariable('needScroll'), // 修正情况
      columns,
      isAdd: true,
      loading: false,
      questionTypeId: '',
      editId: '',
      selectFileIndex: -1,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    isAddId(record) {
      return record.id.includes('add_')
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, reportId, testTaskId, sourceModule } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.reportQuestion.list, {
          params: {
            page: -1,
            size: -1,
            reportId,
            testTaskId,
            sourceModule,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows
            this.cacheData = this.data.map(item => ({ ...item }))
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
            this.loading = false
          }
        })
    },
    // 新增
    add() {
      if (this.editId != '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前编辑或新增!'))
        return
      }

      const id = `add_${new Date().getTime()}`
      this.isAdd = true
      this.data.push({
        content: '',
        type: '',
        reportNumber: '',
        reportFileName: '',
        reportFileMarkId: '',
        id,
        editable: true,
      })

      this.editId = id
    },
    // 删除
    deleteData(record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除 ${record.content} 吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .delete(`${window.$oApi.reportQuestion.editQuestion}/${record.id}`)
            .then((res) => {
              if (res.code && res.code !== 20010) {
                window.$oAntdMessage.success('删除成功')
                this.getData()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
        },
      })
    },
    // 选择报告
    selectFile(ind) {
      this.selectFileIndex = ind
      this.$refs.TestTaskFileTree.showModal(this.reportId)
    },
    // 选择文件回调
    getFileInfo(file) {
      const item = this.data[this.selectFileIndex]
      item.reportNumber = file.reportNum
      item.reportFileName = file.reportFileName
      item.reportFileMarkId = file.reportFileMarkId
      item.reportId = file.reportId
      this.data[this.selectFileIndex] = item
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
      let method = 'POST'
      const data = {
        content: record.content,
        questionTypeId: this.questionTypeId,
        reportFileMarkId: record.reportFileMarkId,
        reportId: record.reportId,
      }
      if (
        !record.id.includes('add_')
        && (!data.reportId || !data.reportFileMarkId)
      ) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择文件'))
        return
      }

      if (this.isAdd === false) {
        method = 'PUT'
        data.id = record.id
      }
      else if (this.isAdd === true) {
        method = 'POST'
        data.sourceType = 3
        data.sourceModule = this.sourceModule
      }

      window.$oAjax({
        method,
        url: window.$oApi.reportQuestion.editQuestion,
        data: qs.stringify({ ...data }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.editId = ''
          this.questionTypeId = ''
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
    cancel(id) {
      if (this.isAdd === true) {
        this.data = this.data.filter(item => item.id != id)
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
      this.questionTypeId = ''
    },
    selectType() {
      if (this.needScroll == '1') {
        top.document.body.scrollTo({
          top: top.screen.height,
          behavior: 'smooth',
        })
      }
      this.$refs.QuestionType.showModal(this.questionTypeId)
    },
    selectQuestionType(record) {
      this.questionTypeId = record[0].id
      this.data = this.data.map((item) => {
        if (item.id == this.editId) {
          return {
            ...item,
            // type: record[0].type,
            type: record[0].name,
            severity: record[0].severity,
          }
        }
        else {
          return item
        }
      })
    },
    amend(record) {
      // if(this.canAmend == "false"){
      //   return;
      // }
      // if(record.reportStatus==='8' || record.reportStatus==='9'){
      let url
      if (record.status === '1') {
        url = window.$oApi.reportQuestion.disAmend
      }
      else {
        url = window.$oApi.reportQuestion.amend
      }

      window.$oAjax({
        method: 'PUT',
        url,
        params: { id: record.id },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    // 打回本次修正
    disallow(record) {
      window.$oAjax({
        method: 'PUT',
        url: window.$oApi.reportQuestion.disallow,
        params: { id: record.id },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
