<template>
  <ht-modal
    :title="modalTitle || '设置采集设备钥匙'"
    centered
    width="800"
    :confirm-loading="confirmLoading"
    :mask-closable="false"
    :open="visible"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div style="padding: 10px 0">
          <a-button type="primary" @click="add">
            新增
          </a-button>
        </div>
        <a-table
          :columns="columns"
          :pagination="false"
          :data-source="data"
          bordered
          row-key="sortNum"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'deviceKey'">
              <div>
                <a-input
                  :value="text"
                  @change="
                    (e) => handleChange(e.target.value, record, 'deviceKey')
                  "
                />
              </div>
            </template>

            <template v-if="column.dataIndex === 'labType'">
              <a-select
                :value="record.labType"
                style="width: 100%"
                @change="(e) => handleChange(e, record, 'labType')"
              >
                <a-select-option
                  v-for="item in typeData"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <div class="editable-row-operations">
                <a @click="() => readData(record, true)">读取数据</a>
                <a @click="() => deleteData(record)">删除</a>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
  </ht-modal>
</template>

<script>
const columns = [
  {
    title: '序号',
    dataIndex: 'sortNum',
    width: '5%',
  },
  {
    title: '采集设备钥匙(设备地址-节点编号)',
    dataIndex: 'deviceKey',
    width: '35%',
    scopedSlots: { customRender: 'deviceKey' },
  },
  {
    title: '设备类型',
    dataIndex: 'labType',
    width: '15%',
    scopedSlots: { customRender: 'labType' },
  },
  {
    title: '实时温度',
    dataIndex: 'temperature',
    width: '15%',
  },
  {
    title: '实时湿度',
    dataIndex: 'humidity',
    width: '15%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '15%',
    scopedSlots: { customRender: 'operation' },
  },
]
export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      editData: null,
      data: [],
      value: [],
      columns,
      spinning: false,
      modalTitle: '',
      typeData: [
        { id: '10', name: '温湿度设备' } /* ,{id:'20',name:"数据采集设备"} */,
      ],
    }
  },
  computed: {},
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    showModal(data, id, titles) {
      this.modalTitle = titles
      this.visible = true
      this.editData = data
      const target = data ? data.split(';') : []
      this.data = target.map((item, index) => {
        const deviceKeyArr = item.split(': ')
        const result = {
          sortNum: index + 1,
          deviceKey: deviceKeyArr[0],
          labType: deviceKeyArr[1] === '温湿度设备' ? '10' : '20',
          labId: id,
          temperature: '',
          humidity: '',
        }
        return result
      })
      this.data.forEach((item) => {
        this.readData(item, false)
      })
    },
    handleChange(values, record, column) {
      const newData = [...this.data]
      const target = newData.filter(
        item => record.sortNum === item.sortNum,
      )[0]
      if (target) {
        target[column] = values
        this.data = newData
      }
    },
    handleOk() {
      const realArr = this.data.map((item) => {
        const target = this.typeData.filter(
          itemJ => item.labType === itemJ.id,
        )[0]
        return `${item.deviceKey}: ${target.name}`
      })
      const realArr2 = realArr.filter(item => item)
      this.callback(realArr2.join(';'))
      this.handleCancel()
    },
    handleCancel() {
      this.editData = null
      this.visible = false
    },
    add() {
      const newData = [...this.data].map((item, index) => {
        return {
          ...item,
          sortNum: index + 1,
        }
      })
      newData.push({
        sortNum: newData.length + 1,
        deviceKey: '',
        labType: '10',
      })
      this.data = [...newData]
    },
    // 读取实时数据
    readData(record, flag) {
      const url = window.$oApi.laboratory.realTimeData
      const dataInfo
        = `?deviceKey=${
          record.deviceKey
        }&labId=${
          record.labId
        }&labType=${
          record.labType
        }&_t=${
          Math.random()}`
      window.$oAjax({
        url: url + dataInfo,
        type: 'GET',
      }).then((res) => {
        if (res.code !== 20000) {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          return
        }
        if (res.data.length > 0) {
          if (flag) {
            window.$oAntdModal.success(
              window.$oMsgTips.info(
                `当前数据更新于：${res.data[0].recordTimeStr}`,
              ),
            )
          }
          record.temperature = `${res.data[0].temperatureValue}℃`
          record.humidity = `${res.data[0].humidityValue}%`
        }
        else {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(
              `设备钥匙【${
                record.deviceKey
              }】没有获取到任何数据，请检查钥匙是否正确，设备是否完好。`,
            ),
          )
          record.temperature = '无数据'
          record.humidity = '无数据'
        }
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
          this.data = this.data.filter(
            item => item.sortNum !== record.sortNum,
          )
        },
      })
    },
  },
}
</script>

<style scoped>
.spin-content {
  height: 300px;
  overflow: auto;
}
</style>
