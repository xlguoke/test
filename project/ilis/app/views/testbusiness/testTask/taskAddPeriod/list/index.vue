<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div style="margin-top: 10px; margin-bottom: 10px">
          <a-button
            type="primary"
            style="vertical-align: middle"

            @click="add"
          >
            新增
          </a-button>
          <a-button

            style="vertical-align: middle; margin-left: 5px"
            @click="deleteData"
          >
            删除
          </a-button>
        </div>
        <a-table
          :columns="columns"
          :row-selection="rowSelection"
          :data-source="data"
          bordered
          :pagination="false"
          :row-class-name="rowClassName"
          row-key="id"
          :custom-row="customRow"
          :scroll="{ y: 350 }"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'producer'">
              <span>
                <span v-if="record.editable">
                  <a-button
                    style="float: right"
                    @click="setPersonnels('radio', record.id, '选择人员')"
                  >选择</a-button>
                  <div style="line-height: 28px">{{ text }}</div>
                </span>
                <span v-else>{{ text }}</span>
              </span>
            </template>

            <template v-if="column.dataIndex === 'iotLabelType'">
              <template v-if="record.editable">
                <div style="width: 100%; display: flex">
                  <a-select
                    style="width: 50%"
                    :default-value="record.iotLabelType"
                    placeholder="请选择"
                    :dropdown-match-select-width="false"
                    @change="
                      (e) => {
                        handleChange(e, record.id, 'iotLabelType')
                      }
                    "
                  >
                    <a-select-option key="2" value="二维码编号">
                      二维码编号
                    </a-select-option>
                    <a-select-option key="3" value="RFID编号">
                      RFID编号
                    </a-select-option>
                    <a-select-option key="1" value="标签编号">
                      标签编号
                    </a-select-option>
                  </a-select>
                  <a-input
                    :id="`scanCode_${record.id}`"
                    :ref="`scanCode_${record.id}`"
                    style="width: 50%"
                    :placeholder="
                      record.iotLabelType === '标签编号' ? '请输入' : '请扫码'
                    "
                    :value="record.iotLabelCode"
                    @change="
                      (e) =>
                        handleChange(e.target.value, record.id, 'iotLabelCode')
                    "
                  />
                </div>
              </template>
              <template v-else>
                <div>标签编号:{{ record.storeId }}</div>
                <div>二维码编号:{{ record.barcodeId }}</div>
                <div>RFID编号:{{ record.rfid }}</div>
              </template>
            </template>

            <template v-if="column.dataIndex === 'processObjectSn'">
              <span>
                <span v-if="record.editable">
                  <a-select
                    style="width: 100%"
                    :default-value="defaultSample"
                    placeholder="请选择"
                    :dropdown-match-select-width="false"
                    @change="
                      (e) => {
                        handleChange(e, record.id, 'processObjectSn')
                      }
                    "
                  >
                    <a-select-option
                      v-for="item in sampleData"
                      :key="item.id"
                      :value="item.id"
                    >
                      {{ item.testObjectSn }}
                    </a-select-option>
                  </a-select>
                </span>
                <span v-else>{{ text }}</span>
              </span>
            </template>

            <template v-if="column.dataIndex === 'testParamName'">
              <span>
                <span v-if="record.editable">
                  <a-select
                    mode="multiple"
                    style="width: 100%"
                    :dropdown-match-select-width="false"
                    @change="(e) => handleChange(e, record.id, 'testParamName')"
                  >
                    <a-select-option
                      v-for="item in paramsData"
                      :key="item.testObjectParamId"
                      :value="item.testObjectParamId"
                    >
                      {{ item.testParamName }}
                    </a-select-option>
                  </a-select>
                </span>
                <span v-else>{{ text }}</span>
              </span>
            </template>

            <template v-if="column.dataIndex === 'formingDate'">
              <span>
                <a-date-picker
                  v-if="record.editable"
                  style="width: 100%"
                  @change="
                    (time, time2) => {
                      handleChange(time2, record.id, 'formingDate')
                    }
                  "
                />
                <span v-else>{{
                  text && formatTime(text, 'YYYY-MM-DD')
                }}</span>
              </span>
            </template>

            <template v-if="['periodCode', 'days', 'description'].includes(column.dataIndex)">
              <div>
                <div v-if="record.editable">
                  <a-input
                    v-if="column.dataIndex != 'days'"
                    style="width: 100%"
                    :value="text"
                    @change="(e) => handleChange(e.target.value, record.id, column.dataIndex)"
                  />
                  <a-input-number
                    v-else-if="column.dataIndex == 'days'"
                    :min="1"
                    style="width: 100%"
                    :value="text"
                    @change="(e) => handleChange(e, record.id, column.dataIndex)"
                  />
                </div>
                <template v-else>
                  {{ text }}
                </template>
              </div>
            </template>

            <template v-if="column.dataIndex === 'isTested'">
              <span>
                <div v-if="record.editable">
                  <a-switch
                    :checked="record.isTested"
                    checked-children="已检测"
                    un-checked-children="未检测"
                    @change="
                      (status) => handleChange(status, record.id, 'isTested')
                    "
                  />
                </div>
                <a-switch
                  v-else
                  checked-children="已检测"
                  un-checked-children="未检测"
                  :checked="text == '1' ? true : false"
                  @change="amend(record)"
                />
              </span>
            </template>
          </template>
        </a-table>
        <!-- <div style="padding-top:10px;"> -->
        <!-- <a-button type="primary" style="margin-right:5px;" @click="save">保存</a-button> -->
        <!-- </div> -->
        <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
      </div>
    </a-spin>
  </div>
</template>

<script>
import qs from 'qs'
import { formatTime, getQueryVariable } from '~/providers/common/utils'

import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

const columns = [
  {
    title: '智能标签编号',
    dataIndex: 'iotLabelType',
    width: '14%',
    scopedSlots: { customRender: 'iotLabelType' },
  },
  {
    title: '试件所属样品',
    dataIndex: 'processObjectSn',
    width: '14%',
    scopedSlots: { customRender: 'processObjectSn' },
  },
  {
    title: '制件人',
    dataIndex: 'producer',
    width: '11%',
    scopedSlots: { customRender: 'producer' },
  },
  {
    title: '制样参数',
    dataIndex: 'testParamName',
    width: '18%',
    scopedSlots: { customRender: 'testParamName' },
  },
  {
    title: '试件编号',
    dataIndex: 'periodCode',
    width: '10%',
    scopedSlots: { customRender: 'periodCode' },
  },
  {
    title: '制样日期',
    dataIndex: 'formingDate',
    width: '12%',
    scopedSlots: { customRender: 'formingDate' },
  },
  {
    title: '龄期（天）',
    dataIndex: 'days',
    width: '7%',
    scopedSlots: { customRender: 'days' },
  },
  {
    title: '试验日期',
    dataIndex: 'testDate',
    width: '8%',
    customRender: ({ record }) => {
      if (!record.editable) {
        return (
          record.formingDate
          && formatTime(
            Number.parseInt(record.formingDate)
            + (record.days || 0) * 24 * 60 * 60 * 1000,
            'YYYY-MM-DD',
          )
        )
      }
    },
  },
  {
    title: '制样情况描述',
    dataIndex: 'description',
    width: '10%',
    scopedSlots: { customRender: 'description' },
  },
  {
    title: '是否已检测',
    dataIndex: 'isTested',
    width: '10%',
    scopedSlots: { customRender: 'isTested' },
  },
]

export default {
  components: {
    TableTreePersonnel,
  },
  data() {
    return {
      formatTime,
      data: [],
      cacheData: [],
      sampleData: [],
      paramsData: [],
      columns,
      spinning: false,
      selectedRowKeys: [],
      selectedRows: [],
      testTaskId: getQueryVariable('testTaskId'),
      defaultSample: '',
      selectPage: 'checkbox',
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage === 'radio') {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
            else {
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
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        type: this.selectPage,
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  mounted() {
    window.GetResult = this.save
  },
  created() {
    this.getData()
    this.getSampleData()
    this.getParamsListData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      const { testTaskId } = this
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.taskAddPeriod.list, {
          params: {
            testTaskId,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.rows) {
            this.data = res.rows.map(item => ({ ...item }))
            this.selectedRows = []
            this.selectedRowKeys = []
            this.cacheData = this.data.map(item => ({ ...item }))
            this.spinning = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
            this.spinning = false
          }
        })
    },
    getSampleData() {
      const { testTaskId } = this
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.taskAddPeriod.sampleList, {
          params: {
            testTaskId,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.success) {
            this.sampleData = res.obj
            // this.defaultSample = this.sampleData.length == 1 ? this.sampleData[0].id : undefined;
            this.spinning = false
          }
          else {
            this.spinning = false
          }
        })
    },
    getParamsListData() {
      const { testTaskId } = this
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.taskAddPeriod.paramsList, {
          params: {
            testTaskId,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.success) {
            this.paramsData = res.obj
            this.spinning = false
          }
          else {
            this.spinning = false
          }
        })
    },
    // 新增
    add() {
      const id = new Date().getTime()
      this.data.push({
        uid: id,
        id,
        editable: true,
        producerId: localStorage.getItem('userId'),
        iotLabelType: '二维码编号',
        producer:
          localStorage.getItem('userInfo')
          && JSON.parse(localStorage.getItem('userInfo')).realName,
        processObjectSn: this.defaultSample,
      })
      window.$oNextTick(() => {
        $(`#scanCode_${id}`).focus()
      })
    },
    // 删除
    deleteData() {
      if (this.selectedRows.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择要删除的龄期'))
        return
      }
      const submitIdArr = []
      const idArr = []
      for (let i = 0; i < this.selectedRows.length; i++) {
        const item = this.selectedRows[i]
        if (item.producer == '委托方制件') {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(`第${i + 1}行 委托方添加的制件信息不能删除！`),
          )
          return
        }
        if (item.uid) {
          idArr.push(item.id)
        }
        else {
          submitIdArr.push(item.id)
        }
      }
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          if (submitIdArr.length === 0) {
            // eslint-disable-next-line array-callback-return
            idArr.map((itemJ) => {
              this.data = this.data.filter(item => item.id !== itemJ)
            })
          }
          else {
            window.$oAjax({
              method: 'POST',
              url: window.$oApi.taskAddPeriod.delete,
              data: qs.stringify({
                periodId: submitIdArr.toString(),
              }),
            }).then((res) => {
              if (res && res.success) {
                window.$oAntdMessage.success('删除成功')
                // eslint-disable-next-line array-callback-return
                this.selectedRowKeys.map((itemJ) => {
                  this.data = this.data.filter(item => item.id !== itemJ)
                })
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
          }
        },
      })
    },
    handleChange(value, id, column) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        if (column === 'iotLabelType') {
          $(`#scanCode_${target.id}`).focus()
        }
        this.data = newData
      }
    },
    save(layerI, successFunc) {
      const dataArr = []

      for (let index = 0; index < this.data.length; index++) {
        const item = this.data[index]

        if (item.uid) {
          if (
            !item.testParamName
            || (item.testParamName && item.testParamName.length === 0)
          ) {
            window.$oAntdModal.warning(
              window.$oMsgTips.info(`第 ${index + 1} 行 请选择制样参数`),
            )
            return
          }
          if (!item.formingDate) {
            window.$oAntdModal.warning(
              window.$oMsgTips.info(`第 ${index + 1} 行 请选择制样日期`),
            )
            return
          }
          if (!item.processObjectSn && this.sampleData.length > 1) {
            window.$oAntdModal.warning(
              window.$oMsgTips.info(
                `第 ${index + 1} 行 任务对应多组流转样品,请选择`,
              ),
            )
            return
          }
          if (item.processObjectSn && !item.processObjectId) {
            item.processObjectId = this.sampleData.find(
              itemJ => itemJ.id == item.processObjectSn,
            ).id
            item.processObjectSn = this.sampleData.find(
              itemJ => itemJ.id == item.processObjectSn,
            ).testObjectSn
          }
          item.testTaskId = this.testTaskId
          item.isTested = item.isTested ? '1' : '0'

          dataArr.push({ ...item })
        }
      }
      if (dataArr.length > 0) {
        const submitData = []
        // eslint-disable-next-line array-callback-return
        dataArr.map((item) => {
          item.formingDate = new Date(`${item.formingDate} 00:00:00`).getTime()
          let testObjectParamIds
          if (
            Array.isArray(item.testParamName)
            && item.testParamName.length > 0
          ) {
            const obj = {}
            // eslint-disable-next-line array-callback-return
            this.paramsData.map((itemI) => {
              obj[itemI.testObjectParamId] = itemI.testParamName
            })
            testObjectParamIds = item.testParamName.toString()
            item.testParamName = item.testParamName
              .map(itemII => obj[itemII])
              .toString()
          }
          delete item.uid
          submitData.push({
            periodEntity: { ...item },
            testObjectParamIds,
          })
        })
        this.spinning = true
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.taskAddPeriod.addAll,
          // data: qs.stringify(data),
          data: submitData,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        }).then((res) => {
          if (res && res.success) {
            window.$oAntdMessage.success('操作成功')
            this.getData()
            this.spinning = false

            successFunc && successFunc(layerI, res)
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.spinning = false
          }
        })
      }
      else {
        // 没有编辑项时，点击确定直接关闭弹窗

        successFunc
        && successFunc(layerI, {
          success: true,
        })
      }
    },
    amend(record) {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.taskAddPeriod.changeStatus,
        params: {
          periodId: record.id,
          isTested: record.isTested == '0' ? '1' : '0',
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    getPerson(idsPerson, acceptData) {
      const newData = [...this.data]
      const target = newData.filter(item => idsPerson === item.id)[0]
      if (target) {
        target.producer = acceptData[0].name
        target.producerId = acceptData[0].id
        this.data = newData
      }
    },
    setPersonnels(type, idsPerson, title) {
      const data = this.data.filter(item => item.id == idsPerson) || []
      const acceptData = []
      if (data.length) {
        acceptData.push({
          id: data[0].producerId,
          name: data[0].producer,
        })
      }
      this.$refs.TableTreePersonnel.showModal(
        type,
        idsPerson,
        acceptData,
        title,
      )
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
