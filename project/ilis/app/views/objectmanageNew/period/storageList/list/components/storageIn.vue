<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <ht-modal
      ref="EditSample"
      title="入库"
      :open="visible"
      centered
      class="samplingManage-sample"
      :mask-closable="false"
      width="1000px"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form
            v-bind="layout"
            ref="ruleForm"
            :model="formData"
            :rules="rules"
            :hide-required-mark="false"
            style="width: 100%"
          >
            <a-row :gutter="15">
              <a-col span="8">
                <a-form-item label="入库日期" required prop="saveDate">
                  <a-date-picker
                    v-model:value="formData.saveDate"
                    type="date"
                    placeholder="请选择"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col span="8">
                <a-form-item label="存放位置" required prop="site">
                  <a-popover
                    placement="bottom"
                    trigger="click"
                    title="位置选择"
                  >
                    <template #content>
                      <p>
                        <span>位置分组：</span>
                        <a-cascader
                          v-if="treeData"
                          v-model:value="selSiteGourpId"
                          style="width: 180px"
                          :options="treeData"
                          :field-names="fieldNames"
                          placeholder="请选择分组"
                          :allow-clear="false"
                          change-on-select
                          @change="onChangeSleGroup"
                        />
                      </p>
                      <p style="margin-top: 10px">
                        <span>存放位置：</span>
                        <a-select
                          v-model:value="selSiteId"
                          style="width: 180px"
                          placeholder="请先选择分组"
                          @change="handleChangeSelSite"
                        >
                          <a-select-option
                            v-for="item in siteList"
                            :key="item.id"
                            :value="item.id"
                          >
                            {{ item.sn }}
                          </a-select-option>
                        </a-select>
                      </p>
                    </template>
                    <a-auto-complete
                      v-model:value="formData.site"
                      placeholder="请选择或输入存放位置"
                    />
                  </a-popover>

                  <!-- <a-popover placement="bottom" trigger="click" title="位置选择" :overlayStyle="{ width: '300px' }">
                    <template slot="content">
                      <a-row>
                        <a-col span="8" style="text-align: right;">标养室：</a-col>
                        <a-col span="16">
                          <a-select @change="handleChangeSelSite" v-model="selSiteId" style="width:100%"  placeholder="标养室">
                            <a-select-option v-for="item in siteList" :key="item.id" :value="item.id"> {{item.sn}}</a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                      <a-row style="margin-top: 8px;">
                        <a-col span="8" style="text-align: right;">类型：</a-col>
                        <a-col span="16">
                          <a-radio-group name="radioGroup" v-model="siteType">
                            <a-radio :value="1">货架</a-radio>
                            <a-radio :value="2">调养箱</a-radio>
                          </a-radio-group>
                        </a-col>
                      </a-row>
                      <a-row style="margin-top: 8px;" v-if="siteType == 1">
                        <a-col span="8" style="text-align: right;">货架分组：</a-col>
                        <a-col span="16">
                          <a-cascader
                            style="width:100%"
                            v-if="treeData"
                            :options="treeData"
                            :field-names="fieldNames"
                            placeholder="请选择分组"
                            :allowClear="false"
                            change-on-select
                            @change="onChangeSleGroup"
                          />
                        </a-col>
                      </a-row>
                      <a-row style="margin-top: 8px;" v-if="siteType == 1">
                        <a-col span="8" style="text-align: right;">货架位置：</a-col>
                        <a-col span="16">
                          <a-select @change="handleChangeSelSite" v-model="selSiteId" style="width:180px"  placeholder="请先选择分组">
                            <a-select-option v-for="item in siteList" :key="item.id" :value="item.id"> {{item.sn}}</a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                      <a-row style="margin-top: 8px;" v-if="siteType == 2">
                        <a-col span="8" style="text-align: right;">调养箱：</a-col>
                        <a-col span="16">
                          <a-select @change="handleChangeSelSite" v-model="selSiteId" style="width:180px"  placeholder="请选择">
                            <a-select-option :key="1" :value="1">调养箱1</a-select-option>
                            <a-select-option :key="1" :value="1">调养箱2</a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                    </template>
                    <a-auto-complete
                      v-model="formData.site"
                      placeholder="请选择或输入存放位置"
                    />
                  </a-popover> -->
                </a-form-item>
              </a-col>
              <a-col span="8">
                <a-form-item label="入库人" required prop="user">
                  <a-input
                    v-model:value="formData.user"
                    placeholder="请输入"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <div class="scanBox">
            <div
              style="display: flex; border-top: 1px solid var(--colorSplit); padding: 10px 0"
            >
              <!-- <a-input style="width: 400px" ref="scanCode_" id="scanCode_" v-model="searchString" autocomplete="off"
                       placeholder="输入标签编码回车后即可添加" @pressEnter="byLabelFun"/>
              <a-button style="margin-left: 10px" type="primary" @click="byLabelFun">添加</a-button> -->
              <ScanCodeQuery1
                v-model:value="searchString"
                scan-type="example"
                @enter="scanCodeAddData"
              />
              <a-button
                style="margin-left: 10px"
                type="primary"
                @click="selected"
              >
                选择
              </a-button>
            </div>
            <a-table
              id="tableBox"
              :columns="columns"
              :pagination="data.length > 0 ? pagination : false"
              :data-source="data"
              bordered
              :custom-row="customRow"
              row-key="id"
              :row-class-name="rowClassName"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'operation'">
                  <a-popconfirm
                    v-if="data.length"
                    title="确定要删除?"
                    @confirm="() => deleteRow(record.id, record.uid)"
                  >
                    <a href="javascript:;"> 删除</a>
                  </a-popconfirm>
                </template>
              </template>
            </a-table>
          </div>
          <!-- <a-input style="visibility: hidden" ref="barCodeInput" v-model="barCode" size="small" @keyup.enter.native="payCode" /> -->
          <br />
          <!-- <a-button @click="okBtn()">okBtn</a-button> -->
        </div>
      </a-spin>
    </ht-modal>
    <WaitStorageIn ref="waitStorageIn" @success-ok="selectedComplete" />

    <ReservationFunctionRoom ref="ReservationFunctionRoom" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import ScanCodeQuery1 from '~/providers/components/scanCodeQuery/index.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import ReservationFunctionRoom from './reservationFunctionRoom.vue'
import waitStorageIn from './waitStorageIn.vue'

const columns = [
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '试样数量',
    dataIndex: 'sampleNum',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectSn',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 125,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    WaitStorageIn: waitStorageIn,
    ScanCodeQuery1,
    ReservationFunctionRoom,
  },
  emits: ['success-ok'],
  data() {
    return {
      siteType: 1,
      selSiteId: '',
      selSiteGourpId: '',
      siteList: [],
      selSite: {},
      selGroupSite: [],
      fieldNames: { label: 'name', value: 'id', children: 'children' },
      treeData: [],
      data: [],
      columns,
      dayjs,
      spinning: false,
      visible: false,

      formData: {
        issaveDate: '0',
        saveDate: dayjs(new Date()) || undefined,
        site: '',
        user: '',
      },
      layout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      rules: {
        saveDate: [
          { required: true, message: '入库日期不能为空', trigger: 'change' },
        ],
        site: [{ required: true, message: '位置不能为空', trigger: 'change' }],
        user: [
          { required: true, message: '入库人不能为空', trigger: 'change' },
        ],
      },
      numberUnit: [],
      searchString: '',
      barCode: '',
      queryParam: null,
      type: getQueryVariable('type') || '',
      periodIds: getQueryVariable('periodIds') || '',
      // type=QRcode &type=ByRFIDs type=warehousingAdd
      page: 1,
      size: 10,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData(this.data)
        },
        onShowSizeChange: (page, size) => {
          this.size = size
          this.page = 1
          this.getData(this.data)
        },
      },
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              $(`#tableBox tr[data-row-key="${record.id}"]`).removeClass(
                'hitek-tableRow-active',
              )
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
              $(`#tableBox tr[data-row-key="${record.id}"]`)
                .addClass('hitek-tableRow-active')
                .siblings()
                .removeClass('hitek-tableRow-active')
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
          },
        }
      },
    }
  },
  computed: {},
  created() {
    // this.testData();
    this.numberUnitData()
    this.getTree()
  },
  mounted() {
    window.GetResult = this.okBtn
  },
  methods: {
    handleChangeSelSite(v) {
      this.siteList.forEach((item) => {
        if (item.id == v) {
          this.selSite = item
        }
      })
      let str = ''
      this.selGroupSite.forEach((item) => {
        str += `${item.name}/`
      })
      this.formData.site = str + this.selSite.sn
      this.$refs.ruleForm.validate('site')
    },
    onChangeSleGroup(v, node) {
      this.selGroupSite = node
      window.$oAjax({
        method: 'get',
        url: `/rest/periodStorageSite/getAll`,
        params: {
          groupId: v[v.length - 1],
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.siteList = res.data
          if (res.data.length > 0) {
            this.selSite = res.data[0]
            this.selSiteId = res.data[0].id
            let str = ''
            this.selGroupSite.forEach((item) => {
              str += `${item.name}/`
            })
            this.formData.site = str + this.selSite.sn
            this.$refs.ruleForm.validate('site')
          }
          else {
            this.selSite = {}
            this.selSiteId = ''
            this.formData.site = ''
          }
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    // 获取存放组
    getTree() {
      window.$oAjax
        .get(`/rest/periodStorageSiteGroup/tree`)
        .then((res) => {
          if (Number.parseInt(res.code) === 20000) {
            this.treeData = res.data
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取数量单位下拉
    numberUnitData() {
      window.$oAjax
        .post(
          'systemController.do?typeGrid&typegroupid=99064352841138377&field=id,typename,typecode,sourceFrom',
        )
        .then((res) => {
          this.numberUnit = res.rows.map(item => item.typename)
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
            : ''
        })
    },
    getData(data, isAdd) {
      const newData = [...this.data]
      const errData = []

      // labelId: "10063"
      // qrCode: "20063"
      // rfid: "30063"
      let type = this.type === 'QRcode' ? 'qrCode' : 'rfid'
      if (isAdd) {
        // eslint-disable-next-line unused-imports/no-unused-vars
        type = 'labelId'
      }
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        const target = newData.filter(itemJ => item.id === itemJ.id)[0]
        if (!target) {
          if (item.error === '0') {
            newData.push({ ...item })
          }
          else {
            window.$oAntdModal.warning(
              window.$oMsgTips.info(
                `样品${errData.join('；\n')}已在列表中，无需重复添加`,
              ),
            )
          }
        }
      })
      this.data = newData
      this.pagination.pageSize = this.size
      this.pagination.current = this.page
      this.pagination.total = newData.length
      this.spinning = false
      if (errData.length > 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info(`${errData.join('；\n')}`))
      }
    },
    deleteRow(did) {
      if (did) {
        const newData = [...this.data]
        this.data = newData.filter(item => item.id !== did)
        this.getData(this.data)
      }
    },
    scanCodeAddData(res) {
      const { err, data } = res
      if (err) {
        return window.$oAntdMessage.error(err.message || '添加失败')
      }
      else if (data.length === 0) {
        return window.$oAntdMessage.warning('未查询到试件信息')
      }
      const ids = this.data.map(d => d.id)
      const repeats = []
      const unValidStatus = []
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        const sn = d.testObjectCode ? `（${d.testObjectCode}）` : ''
        const msg = `${d.testSampleDisplayName}${sn}`
        if (ids.includes(d.id)) {
          repeats.push(msg)
        }
        else if (d.storageStatus == '1') {
          unValidStatus.push(msg)
        }
        else {
          this.data.unshift(d)
        }
      }
      this.pagination.total = this.data.length
      if (repeats.length > 0 || unValidStatus.length > 0) {
        const repeatStr = repeats.join(',')
        const unValidStr = unValidStatus.join(',')
        let str = ''
        if (repeatStr)
          str = `【${repeatStr}】已存在，无需重复添加！`
        if (unValidStr)
          str += `【${unValidStr}】当前状态为已入库，无需再次入库！`
        window.$oAntdMessage.warning(str)
      }
    },
    selected() {
      this.$refs.waitStorageIn.showModal(this.data)
    },
    selectedComplete(data) {
      this.data = data
    },
    // 预约功能室
    onResLab(obj) {
      this.$refs.ReservationFunctionRoom.showModal(obj)
    },
    // 保存提交数据
    async handleOk() {
      let result = false
      await this.$refs.ruleForm.validateFields().then(() => {
        result = true
      })
      if (!result) {
        return
      }
      const newData = [...this.data]

      this.spinning = true
      // periodIds
      const obj = {
        inOut: '1', // 1,2
        site: this.formData.site,
        periodIds: '',
        user: this.formData.user,
      }
      if (this.formData.saveDate) {
        obj.date = this.formData.saveDate.format('YYYY-MM-DD')
      }

      let str = ''
      this.selGroupSite.forEach((item) => {
        str += `${item.name}/`
      })
      str = str + this.selSite.sn

      if (str == this.formData.site) {
        obj.siteId = this.selSite.id
      }
      obj.periodIds = newData.map(item => item.id).join(',')
      window.$oAjax({
        url: window.$oApi.storageList.storageInOut,
        data: window.$oQs.stringify(obj),
        method: 'post',
      }).then((res) => {
        if (res.code === 20000) {
          // this.onResLab(obj);
          this.handleCancel()
          $emit(this, 'success-ok')
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    handleCancel() {
      this.formData.user = ''
      this.formData.site = ''
      this.searchString = ''
      this.selSiteId = ''
      this.selSiteGourpId = ''
      this.siteList = []
      this.visible = false
      this.data = []
    },
    showModal(type) {
      this.type = type
      this.visible = true
      // window.$oNextTick(() => {
      //   this.$refs["barCodeInput"].focus();
      // });
    },
    timeShowHtml(record) {
      const isTested = record.isTested
      const obj = {
        consignStatus: '已完成',
        color: '#ACACAC',
      }
      // 0 1-3 3 3+ 已完成

      if (isTested === '1') {
        obj.consignStatus = '已完成'
      }
      else {
        const end = record.planTestTime
        const start = new Date().getTime()
        const utc = end - start
        const day = Math.floor(utc / (24 * 60 * 60 * 1000)) // 天
        const H = Math.floor(utc / (60 * 60 * 1000) - 24 * day) // 小时
        // eslint-disable-next-line unused-imports/no-unused-vars
        const M = utc / (60 * 1000) // 分
        if (day < 0) {
          obj.consignStatus = '已超期'
          obj.color = '#DA0722'
        }
        else if (day >= 0 && day < 1) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#1890FF'
        }
        else if (day > 1 && day <= 4) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#F59D29'
        }
        else if (day > 4) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#74B80A'
        }
      }
      return obj
    },
  },
}
</script>

<style lang="less">
.container-search-all {
  width: 400px;
  margin-right: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
</style>
