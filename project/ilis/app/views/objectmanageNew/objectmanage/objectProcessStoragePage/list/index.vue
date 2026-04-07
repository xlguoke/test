<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form
          ref="Form"
          layout="horizontal"
          :model="formData"
          :rules="rules"
          :label-col="{ span: 4 }"
          :hide-required-mark="false"
        >
          <a-form-item label="入库日期" name="saveDate">
            <a-date-picker
              v-model:value="formData.saveDate"
              type="date"
              placeholder="请选择"
              value-format="YYYY-MM-DD"
              :get-popup-container="trigger => trigger.parentNode"
            />
          </a-form-item>
          <a-form-item v-if="isWarehousingAdd" label="存放功能室" name="laboratoryName">
            <a-select
              v-model:value="formData.laboratoryId"
              :options="labSelectData"
              placeholder="请选择存放功能室"
              allow-clear
              show-search
              option-filter-prop="label"
              style="width: 200px;"
              option-label-prop="label"
              :get-popup-container="trigger => trigger.parentNode"
            >
              <template #option="{ label }">
                <span>{{ label }}</span>
              </template>
            </a-select>
          </a-form-item>
          <a-form-item v-if="isWarehousingAdd" label="具体存放位置" name="sampleNum">
            <a-auto-complete
              v-model:value="formData.saveSite"
              :options="numberUnit"
              placeholder="请选择或输入具体存放位置"
              allow-clear
              style="width: 200px;"
              :get-popup-container="trigger => trigger.parentNode"
            />
          </a-form-item>
          <a-form-item v-else label="存放位置" name="sampleNum">
            <a-auto-complete
              v-model:value="formData.saveSite"
              :options="numberUnit"
              placeholder="请选择或输入存放位置"
              allow-clear
              style="width: 200px;"
              :get-popup-container="trigger => trigger.parentNode"
            />
          </a-form-item>
        </a-form>
        <div v-if="!isWarehousingAdd" class="scanBox">
          <div id="testd" style="padding: 6px 0">
            <!-- <a-input style="width: 400px" ref="scanCode_" id="scanCode_" v-model="searchString" autocomplete="off"
                       placeholder="输入标签编码回车后即可添加" @pressEnter="byLabelFun"/>
                <a-button style="margin-left: 10px" type="primary" @click="byLabelFun">添加</a-button> -->
            <ScanCodeQuery
              v-model:value="searchString"
              scan-type="sampleFlow"
              @enter="scanCodeAddData"
            />
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
                <div class="table-handle">
                  <a-popconfirm
                    v-if="data.length"
                    title="确定要删除?"
                    @confirm="() => deleteRow(record.id, record.uid)"
                  >
                    <a href="javascript:;"> 删除</a>
                  </a-popconfirm>
                </div>
              </template>
            </template>
          </a-table>
        </div>
        <!-- <a-input style="visibility: hidden" ref="barCodeInput" v-model="barCode" size="small" @keyup.enter.native="payCode" /> -->
        <br />
        <!-- <a-button @click="okBtn()">okBtn</a-button> -->
      </div>
    </a-spin>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { ScanCodeQuery } from '~/components/scanCodeQuery'
import { getQueryVariable } from '~/providers/common/utils'

const columns = [
  {
    //   title: '标记',
    //   dataIndex: 'scrapSn',
    // },{
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
    ScanCodeQuery,
  },
  data() {
    return {
      data: [],
      columns,
      dayjs,
      spinning: false,

      formData: {
        issaveDate: '0',
        saveDate: dayjs(new Date()).format('YYYY-MM-DD') || undefined,
        saveSite: '',
        laboratoryName: '',
        laboratoryId: undefined,
      },
      layout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      rules: {
        categorySampleId: [
          {
            required: true,
            message: '请选择取样类型',
            trigger: 'change',
          },
        ],
      },
      numberUnit: [],
      labSelectData: [],
      searchString: '',
      barCode: '',
      queryParam: null,
      type: getQueryVariable('type') || '',
      processObjectIds: decodeURIComponent(getQueryVariable('processObjectIds')) || '',
      isWarehousingAdd: false,
      // type=QRcode &type=scanRFID type=warehousingAdd
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
    if (this.type === 'warehousingAdd') {
      this.isWarehousingAdd = true
    }
    this.numberUnitData()
    this.getLabSelectData()
  },
  mounted() {
    // 将GetResult方法绑定到window下面，提供给外部调用\
    // document.getElementById('scanCode_').focus();
    // this.$refs["barCodeInput"].focus();
    window.GetResult = this.okBtn
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取数量单位下拉
    getLabSelectData() {
      window.$oAjax
        .get('laboratoryController?dataGridPage', {
          params: {
            page: 1,
            size: 9999,
          },
        })
        .then((res) => {
          const arr = res.obj.rows || []
          if (arr.length) {
            this.labSelectData = arr.map(item => ({
              value: item.id,
              label: item.name,
            }))
          }
        })
    },
    numberUnitData() {
      window.$oAjax
        .post(
          'systemController.do?typeGrid&typegroupid=6a2ff2e5-d8d5-4e4f-8ad3-eb6dd543&field=id,typename,typecode,sourceFrom',
        )
        .then((res) => {
          if (res.rows && Array.isArray(res.rows)) {
            this.numberUnit = res.rows.map(item => ({
              value: item.typename,
              label: item.typename,
            }))
          }

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
      let type = ''
      if (this.type === 'scanRFID') {
        type = 'rfid'
      }
      else if (this.type === 'QRcode') {
        type = 'qrCode'
      }
      if (isAdd) {
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
            errData.push(`编号 ${item[type]},${item.error}`)
          }
        }
      })
      this.data = newData
      this.pagination.pageSize = this.size
      this.pagination.current = this.page
      this.pagination.total = newData.length
      this.spinning = false
      if (errData.length > 0) {
        window.$oAntdModal.warning(
          window.$oMsgTips.info(
            `样品${errData.join('；\n')}已在列表中，无需重复添加`,
          ),
        )
      }
    },
    deleteRow(did) {
      if (did) {
        const newData = [...this.data]
        this.data = newData.filter(item => item.id !== did)
        this.getData(this.data)
      }
    },
    scanCodeAddData(data) {
      if (data.length === 0) {
        return window.$oAntdMessage.warning('未查询到样品流转信息')
      }
      const ids = this.data.map(d => d.id)
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        if (d.state !== '000') {
          window.$oAntdMessage.warning(`样品当前流转状态无法入库！`)
          continue
        }
        if (ids.includes(d.id)) {
          window.$oAntdMessage.warning(`请勿重复添加同一样品！`)
        }
        else {
          this.data.unshift(d)
        }
      }
      this.pagination.total = this.data.length
    },
    okBtn(layerI, successFunc) {
      const newData = [...this.data]
      this.spinning = true
      // processObjectIds
      const obj = {
        processObjectIds: '',
        saveSite: this.formData.saveSite,
        laboratoryId: this.formData.laboratoryId,
      }
      if (this.formData.saveDate) {
        obj.saveDate = this.formData.saveDate
      }
      if (this.type === 'warehousingAdd') {
        obj.processObjectIds = this.processObjectIds
      }
      else {
        obj.processObjectIds = newData.map(item => item.id).join(',')
      }
      window.$oAjax({
        url: window.$oApi.objectProcessStoragePage.putStorage,
        data: window.$oQs.stringify(obj),
        method: 'post',
      }).then((res) => {
        if (res.success) {
          // eslint-disable-next-line ts/no-unused-expressions
          layerI ? successFunc(layerI, true) : ''
        }
        else {
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            : ''
        }
        this.spinning = false
      })
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
@import './index.less';
</style>
