<template>
  <ht-modal
    v-model:open="visible"
    title="配置详情"
    width="80%"
    :loading="spinning"
    hide-confirm
    fixed-height
    @cancel="handleCancel"
  >
    <a-tabs v-model:active-key="equType" @change="getData">
      <a-tab-pane key="WVPLabColumn" tab="录像机"></a-tab-pane>
      <a-tab-pane key="HKWSLabColumn" tab="摄像头"></a-tab-pane>
    </a-tabs>
    <a-table
      :columns="columnsObj[equType]"
      :data-source="dataSource[equType]"
      bordered
      :pagination="false"
      row-key="id"
      :scroll="{ y: tableHeight }"
    >
      <template #bodyCell="{ column }">
        <template v-if="column.dataIndex === 'password'">
          <span>******</span>
        </template>
      </template>
    </a-table>
  </ht-modal>
</template>

<script>
const columnsObj = {
  WVPLabColumn: [
    {
      title: '供应商名称',
      dataIndex: 'supplierName',
    },
    {
      title: '监控设备名称',
      dataIndex: 'equName',
    },
    {
      title: '所在功能室',
      dataIndex: 'labName',
    },
    {
      title: '接口地址',
      dataIndex: 'interfaceUrl',
    },
    {
      title: 'loginUrl',
      dataIndex: 'loginUrl',
    },
    {
      title: 'deviceId',
      dataIndex: 'deviceId',
    },
    {
      title: 'channelId',
      dataIndex: 'channelId',
    },
    {
      title: 'username',
      dataIndex: 'username',
    },
    {
      title: 'password',
      dataIndex: 'password',
      scopedSlots: { customRender: 'password' },
    },
    {
      title: 'startTime',
      dataIndex: 'startTime',
    },
    {
      title: 'endTime',
      dataIndex: 'endTime',
    },
  ],
  HKWSLabColumn: [
    {
      title: '供应商名称',
      dataIndex: 'supplierName',
    },
    {
      title: '设备名称',
      dataIndex: 'equName',
    },
    {
      title: '所在功能室',
      dataIndex: 'labName',
    },
    {
      title: '接口地址',
      dataIndex: 'interfaceUrl',
    },
    {
      title: 'appSecret',
      dataIndex: 'appSecret',
    },
    {
      title: 'appKey',
      dataIndex: 'appKey',
    },
    {
      title: 'deviceSerial',
      dataIndex: 'deviceSerial',
    },
    {
      title: 'protocol',
      dataIndex: 'protocol',
    },
    {
      title: 'channelNo',
      dataIndex: 'channelNo',
    },
  ],
}
export default {
  data() {
    return {
      visible: false,
      spinning: false,
      columnsObj,
      equType: 'WVPLabColumn',
      tableHeight: 300,
      dataSource: {
        HKWSLabColumn: [],
        WVPLabColumn: [],
      },
    }
  },
  created() {
    this.tableHeight = (window.innerHeight || document.body.clientHeight) - 300
  },
  methods: {
    showModal() {
      this.equType = 'WVPLabColumn'
      this.visible = true
      window.$oNextTick(() => {
        this.getData()
      })
    },
    getData() {
      this.spinning = true
      window.$oAjax
        .get(`${window.$oApi.laboratory.getConfig}?equType=${this.equType}`)
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            const list = res.data
            for (let i = 0; i < list.length; i++) {
              const item = list[i]
              list[i] = {
                ...item,
                ...item.params,
              }
            }
            this.dataSource[this.equType] = res.data
          }
          else {
            window.$oAntdMessage.error(res.msg || '获取配置信息异常')
          }
        })
        .catch((err) => {
          console.error(err)
          this.spinning = false
          window.$oAntdMessage.error(err.msg || '获取配置信息异常')
        })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>
