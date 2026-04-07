<template>
  <div>
    <ht-modal
      :title="modalType == 'add' ? '新增时间节点' : '编辑'"
      centered
      :open="visible"
      :confirm-loading="confirmLoading"
      :width="modalType == 'add' ? '500px' : '700px'"
      :mask-closable="false"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div v-if="modalType == 'add' || modalType == 'editTime'">
        设置时间节点：<a-date-picker
          v-model:value="nodeDate"
          format="YYYY-MM-DD"
        />
      </div>
      <div v-else-if="modalType == 'edit'">
        资料上报提醒时间：<a-date-picker
          v-model:value="nodeDate"
          format="YYYY-MM-DD"
        />
        <a-table
          :columns="columns"
          :data-source="dataSource"
          bordered
          :pagination="false"
          :row-class-name="rowClassName"
          style="margin-top: 15px; margin-bottom: 10px"
        >
          <template #bodyCell="{ column, text, index }">
            <template v-if="column.dataIndex === 'content'">
              <a-input
                :value="text || ''"
                style="width: 100%"
                placeholder="请输入"
                @change="
                  (e) => {
                    contentHandleChange(e.target.value, index)
                  }
                "
              />
            </template>
            <template v-if="column.dataIndex === 'person'">
              <a-select
                mode="multiple"
                :value="text ? text : []"
                style="width: 100%"
                placeholder="所选人员均需上报资料"
                @change="
                  (value) => {
                    personHandleChange(value, index)
                  }
                "
              >
                <a-select-option
                  v-for="(item, index2) in personData"
                  :key="index2"
                  :value="item.personId"
                >
                  {{ item.personName }}
                </a-select-option>
              </a-select>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <a @click="deleteRow(index)">删除</a>
              </div>
            </template>
          </template>
        </a-table>
        <a-button @click="addData()">
          新增
        </a-button>
        <a-button @click="setQuote()">
          引用
        </a-button>
      </div>
      <SelQuoteType ref="SelQuoteType" :callback="getQuote" />
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatTime } from '~/providers/common/utils'
import SelQuoteType from './selQuoteType.vue'

const columns = [
  {
    title: '上报资料',
    dataIndex: 'content',
    width: '40%',
    scopedSlots: { customRender: 'content' },
  },
  {
    title: '资料上报负责人',
    dataIndex: 'person',
    width: '40%',
    scopedSlots: { customRender: 'person' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '20%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    SelQuoteType,
  },
  props: ['callback'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      data: {},
      dataSource: [],
      formatTime,
      dayjs,
      id: '',
      nodeId: '',
      nodeDate: undefined,
      modalType: 'add',
      columns,
      personData: [],
      nodeData: {},
      editId: '',
      beforeNodeDate: '',
    }
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    showModal(id, modalType, data, editId, beforeNodeDate, nextNodeDate) {
      this.id = id
      this.modalType = modalType
      this.getPersonData()
      if (modalType == 'edit' && data) {
        this.nodeData = data
        this.beforeNodeDate = beforeNodeDate
        this.nextNodeDate = nextNodeDate
        const contenList = data.contenDetailList || []
        const dataSource = contenList.map((item) => {
          let person
          if (item.personList) {
            person = item.personList.map(info => info.personId)
          }
          return {
            ...item,
            person,
          }
        })
        this.nodeDate = data.remindDate
          ? dayjs(formatTime(data.remindDate, 'YYYY-MM-DD'), 'YYYY-MM-DD')
          : undefined
        this.dataSource = dataSource
      }
      else if (modalType == 'editTime' && data) {
        this.nodeDate = data
          ? dayjs(formatTime(data, 'YYYY-MM-DD'), 'YYYY-MM-DD')
          : undefined
        this.editId = editId
      }
      this.visible = true
    },
    getPersonData() {
      window.$oAjax({
        method: 'get',
        url: window.$oApi.dataCollection.getPerson,
        params: {
          collectionId: this.id,
        },
        headers: {
          // "X-Requested-With": "XMLHttpRequest"
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          const personIds = Array.from(
            new Set(res.obj.map(item => item.personId)),
          )
          this.personData = personIds.map((personId) => {
            const data = res.obj.find(obj => obj.personId == personId)
            return {
              ...data,
            }
          })
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    handleOk() {
      let url = window.$oApi.dataCollection.addNode
      let data = {
        dataCollectionId: this.id,
        nodeDate: this.nodeDate,
      }

      const flag = this.dataSource.findIndex(
        i => i.person === undefined || i.person.length == 0,
      )

      if (flag >= 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('资料上报负责人必选'))
        return
      }
      this.confirmLoading = true

      if (this.modalType === 'edit') {
        const newDate = new Date(
          dayjs(data.nodeDate).set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          }),
        ).getTime()
        if (
          data.nodeDate
          && (this.beforeNodeDate > newDate || this.nextNodeDate < newDate)
        ) {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(
              '资料上报提醒时间不能小于阶段开始时间节点且不能大于阶段结束时间节点！',
            ),
          )
          this.confirmLoading = false
          return
        }
        url = window.$oApi.dataCollection.operationNode
        const contenList = this.dataSource.map((item) => {
          let personList = []
          if (item.person && item.person.length > 0) {
            personList = this.personData
              .filter(p => item.person.includes(p.personId))
              .map(p => ({
                personName: p.personName,
                personId: p.personId,
              }))
          }
          return {
            content: item.content,
            id: item.id,
            dataCollectionNodeDate: this.nodeData.nodeDate,
            dataCollectionNodeId: this.nodeData.id,
            dataCollectionId: this.id,
            personList,
          }
        })
        data = {
          ...data,
          nodeDate: this.nodeData.nodeDate
            ? formatTime(this.nodeData.nodeDate, 'YYYY-MM-DD')
            : '',
          remindDate: this.nodeDate,
          id: this.nodeData.id,
          contenList,
        }
      }
      else if (this.modalType == 'editTime') {
        data.id = this.editId
      }

      window.$oAjax({
        method: 'POST',
        url,
        data,
        headers: {
          // "X-Requested-With": "XMLHttpRequest"
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          window.$oAntdMessage.success(res.msg)

          this.callback && this.callback(this.id)
          this.handleCancel()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.nodeDate = undefined
      this.nodeData = {}
      this.editId = ''
      this.dataSource = []
      this.visible = false
    },
    personHandleChange(data, index) {
      this.dataSource[index].person = data
    },
    contentHandleChange(data, index) {
      this.dataSource[index].content = data
    },
    deleteRow(index) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.dataSource.splice(index, 1)
        },
      })
    },
    addData() {
      this.dataSource = [
        ...this.dataSource,
        {
          content: '',
          person: undefined,
        },
      ]
    },
    setQuote() {
      this.$refs.SelQuoteType.showModal()
    },
    // 选择设备 回显
    getQuote(data) {
      if (data.length > 0) {
        const contentArr = data.map(item => ({
          content: item,
          person: undefined,
        }))
        this.dataSource = [...this.dataSource, ...contentArr]
      }
    },
  },
}
</script>

<style></style>
