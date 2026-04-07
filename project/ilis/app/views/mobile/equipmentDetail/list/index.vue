<!-- eslint-disable vue/eqeqeq -->
<template>
  <div>
    <div class="equipmentOutgo-wrap" :style="`height:${windowHeight}px`">
      <div class="equipmentOutgo-search">
        <a-input v-model:value="quickQry" />
        <a-button type="primary" @click="getData(false)">
          搜索
        </a-button>
      </div>
      <div class="equipmentOutgo-body">
        <div class="equipmentOutgo-body-left">
          <div
            v-for="item in egressStatusData"
            :key="item.value"
            :class="egressStatus == item.value ? 'active' : ''"
            @click="getData(item.value)"
          >
            {{ item.name }}
          </div>
        </div>
        <div
          class="equipmentOutgo-body-right"
          :style="`height:${windowHeight - 50}px`"
        >
          <a-spin :spinning="loading">
            <ul class="equipmentOutgo-list">
              <li
                v-for="(item, index) in data"
                :key="index"
                @click="goDetail(item.id)"
              >
                <div>
                  <div>
                    <strong>{{ item.equipmentName }}</strong>
                  </div>
                </div>
                <div class="equipmentOutgo-list-status">
                  {{
                    item.status
                      ? egressStatusData.find(
                        (data) => data.value == item.status,
                      ).name
                      : ''
                  }}
                  <RightOutlined />
                </div>
              </li>
            </ul>
          </a-spin>
        </div>
      </div>
    </div>
    <Add ref="Add" :callback="getData" />
    <Dispose ref="Dispose" :callback="getData" />
    <Detail
      ref="Detail"
      :egress-status-data="egressStatusData"
      :callback="getData"
    />
    <a-modal title="确认" :open="confirmVisible" width="400px">
      备注：
      <a-textarea
        :row="4"
        placeholder="请输入"
        style="width: 300px; vertical-align: top"
      ></a-textarea>
    </a-modal>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { RightOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import { formatTime } from '~/providers-moblie/common/utils'
import Add from './components/add.vue'
import Detail from './components/detail.vue'
import Dispose from './components/dispose.vue'

const egressStatusData = [
  { name: '全部', value: 0 },
  { name: '库存', value: 10 },
  { name: '外出待确认', value: 20 },
  { name: '外出被拒绝', value: 30 },
  { name: '外出', value: 40 },
  { name: '归还待确认', value: 50 },
  { name: '归还被拒绝', value: 60 },
  { name: '外出延期', value: 70 },
  { name: '延期待确认', value: 80 },
  { name: '延期被拒绝', value: 90 },
]

const columns = [
  {
    title: '设备信息',
    dataIndex: 'equipmentName',
    width: '10%',
  },
  {
    title: '外出状态',
    dataIndex: 'status',
    width: '8%',
    customRender: text =>
      egressStatusData.find(item => item.value == text)
        ? egressStatusData.find(item => item.value == text).name
        : '',
  },
  {
    title: '关联任务',
    dataIndex: 'testTaskSn',
    width: '8%',
  },
  {
    title: '借取人',
    dataIndex: 'borrowUser',
    width: '8%',
  },
  {
    title: '外出时间',
    dataIndex: 'egressTime',
    width: '10%',
    customRender: time =>
      time ? formatTime(time, 'YYYY-YY-DD HH:mm:ss') : '',
  },
  {
    title: '预还时间',
    dataIndex: 'expectReturnTime',
    width: '10%',
    customRender: time =>
      time ? formatTime(time, 'YYYY-YY-DD HH:mm:ss') : '',
  },
  {
    title: '外出确认人',
    dataIndex: 'egressAuditUser',
    width: '10%',
  },
  {
    title: '归还人',
    dataIndex: 'returnPerson',
    width: '8%',
  },
  {
    title: '归还时间',
    dataIndex: 'returnTime',
    width: '10%',
    customRender: time =>
      time ? formatTime(time, 'YYYY-YY-DD HH:mm:ss') : '',
  },
  {
    title: '归还确认人',
    dataIndex: 'returnAuditUser',
    width: '8%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    Add,
    Dispose,
    Detail,
    RightOutlined,
  },
  data() {
    return {
      data: [],
      quickQry: '',
      columns,
      confirmVisible: false,
      formLayout: 'horizontal',
      loading: false,
      page: 1,
      size: 999,
      egressStatusData,
      windowHeight: window.screen.height,
      egressStatus: 0,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData(status) {
      if (status !== false) {
        this.egressStatus = status
      }

      const { page, size, quickQry, egressStatus } = this
      const params = {
        page,
        size,
        quickQry,
        egressStatus: egressStatus === 0 ? '' : egressStatus,
      }

      this.loading = true
      mAjax
        .get(`${mApi.eqEgressList.list}`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows
            this.loading = false
          }
        })
    },
    add() {
      this.isAdd = true
      this.$refs.Add.showModal()
    },
    handleChange(info) {
      if (info.file.status !== 'uploading') {
        // eslint-disable-next-line no-console
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`)
        this.getData()
      }
      else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`)
      }
    },
    viewDetail(record) {
      this.$refs.Detail.showModal(record.id)
    },
    egressDispose(record, status) {
      this.$refs.Dispose.showModal(record, status)
    },
    goDetail(id) {
      this.$router.push({
        name: 'detail',
        params: {
          id,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
