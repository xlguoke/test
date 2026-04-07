<template>
  <a-spin :spinning="loading">
    <div class="h-screen px-3 flex flex-col gap-3">
      <a-tabs v-model:active-key="activeTab" size="large" @change="queryList">
        <a-tab-pane
          v-for="item in tabList"
          :key="item.key"
          :tab="item.tab"
        />
      </a-tabs>
      <a-form layout="inline">
        <a-form-item>
          <a-input
            v-model:value="query.name"
            style="width: 250px"
            placeholder="输入二维码名称或报告编号后查询"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="queryList()">
            查询
          </a-button>
        </a-form-item>
      </a-form>

      <a-space v-if="activeTab !== ''">
        <a-button type="primary" @click="openAddQRCode">
          新增二维码
        </a-button>
        <a-button @click="openScanningBox">
          设置扫码后显示内容
        </a-button>
        <a-button @click="openQuickAdd">
          快速创建
        </a-button>
        <a-button danger @click="onDel()">
          批量删除
        </a-button>
      </a-space>

      <div ref="tableBoxRef" class="flex-1 h-0">
        <a-table
          :columns="columns"
          :data-source="tabledata"
          :pagination="pagination"
          :row-key="returnkey"
          bordered
          :row-selection="{
            selectedRowKeys,
            onChange: onSelectChange,
          }"
          :scroll="{ y: tableHeight }"
          @change="changePage"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'manipulate'">
              <a-space :size="0">
                <a-button type="link" @click="openEditQRCode(record)">
                  编辑
                </a-button>
                <a-button type="link" @click="openQECodeDet(record)">
                  查看
                </a-button>
                <a-button type="link" @click="openDownloadCode(record)">
                  下载
                </a-button>
                <a-button type="link" danger @click="onDel(record)">
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <ht-modal
        v-model:open="editBoxVisible"
        :title="addModalTitle"
        destroy-on-close
      >
        <div style="overflow-y: auto; max-height: 70vh">
          <a-form
            ref="ruleEditFiledForm"
            :model="fieldForm"
            :rules="fieldRules"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :force-render="true"
            :destroy-on-close="true"
          >
            <a-form-item v-if="modalStatus !== 5" label="二维码名称" name="name">
              <a-input
                v-model:value="fieldForm.name"
                :disabled="isDetailModal"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item label="检测类型" name="type">
              <a-radio-group
                v-model:value="fieldForm.type"
                :disabled="isDetailModal"
                @change="onChangeType"
              >
                <a-radio
                  v-for="item in tabListOptions"
                  :key="item.key"
                  :value="item.key"
                  :disabled="disabledTestType(item.key)"
                >
                  {{ item.tab }}
                </a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item
              v-for="(item, index) in scanningShowList"
              :key="index"
              :label="item.name"
            >
              <a-input
                v-model:value="item.fieldValue"
                :disabled="isDetailModal"
                placeholder="请输入"
              />
            </a-form-item>

            <a-form-item label="备注">
              <a-input
                v-model:value="fieldForm.remark"
                :disabled="isDetailModal"
                placeholder="请输入"
              />
            </a-form-item>
          </a-form>
        </div>

        <template #footer>
          <a-button @click="editBoxVisible = false">
            取消
          </a-button>
          <a-button
            v-show="!isDetailModal && !isQuickAddModal"
            type="primary"
            @click="svaeAndCreateCode"
          >
            生成二维码
          </a-button>
          <a-button
            type="primary"
            :loading="submitLoading"
            @click="editBoxHandleOk"
          >
            确定
          </a-button>
        </template>
      </ht-modal>

      <ht-modal
        v-model:open="scanningBoxVisible"
        title="设置扫码后显示的内容"
        width="700px"
        hide-confirm
      >
        <div style="margin-bottom: 10px">
          <a-button type="primary" @click="openScanningConfigBox">
            新增
          </a-button>
        </div>
        <a-table
          :columns="scanningContent"
          :data-source="scanningShowList"
          :pagination="false"
          :row-key="returnkey"
          :loading="configLoading"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'scanningSwitch'">
              <div>
                <a-switch
                  v-model:checked="record.shown"
                  size="small"
                  @change="onChangeOnAndOff(record)"
                />
              </div>
            </template>

            <template v-if="column.dataIndex === 'manipulate'">
              <div>
                <a-button type="link" @click="editScanningConfig(record)">
                  编辑
                </a-button>
                <a-button
                  type="link" danger
                  :disabled="record.sourceFrom === '0'"
                  @click="delScanningConfig(record)"
                >
                  删除
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </ht-modal>

      <ht-modal
        v-model:open="editScaningFieldVisible"
        width="400px"
        title="编辑扫码显示"
        :mask-closable="false"
        @ok="verifyScanningConfig()"
      >
        <a-form
          ref="ruleEditScaningForm"
          :model="modifyConfig"
          :rules="scanningRules"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-form-item label="内容列" name="name">
            <a-input
              v-model:value="modifyConfig.name"
              :disabled="
                modifyConfig.sourceFrom && modifyConfig.sourceFrom === '0'
                  ? true
                  : false
              "
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item label="排序号" name="orderNumber">
            <a-input
              v-model:value="modifyConfig.orderNumber"
              type="number"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item label="显示在扫码页面">
            <a-switch v-model:checked="modifyConfig.shown" size="small" />
          </a-form-item>
        </a-form>
      </ht-modal>

      <ht-modal
        v-model:open="downVisible"
        title="下载二维码"
        :down-visible="false"
        ok-text="下载"
        @ok="downCode"
      >
        <div
          id="QRCodeBox"
          style="width: 300px; height: 300px; margin: 0 auto; text-align: center"
        >
          <span v-if="!qrCodeUrl">二维码生成中...</span>
          <img v-else :src="qrCodeUrl" class="size-full block">
        </div>
      </ht-modal>
    </div>
  </a-spin>
</template>

<script>
import QRCode from 'qrcode'
import { useTableHeight } from '~/hooks/useTableHeight'

const scanningContent = [
  {
    title: '内容列',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    dataIndex: 'scanningSwitch',
    title: '显示在扫码页面',
  },
  {
    title: '排序号',
    dataIndex: 'orderNumber',
    key: 'orderNumber',
  },
  {
    dataIndex: 'manipulate',
    title: '操作',
  },
]

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 60,
    align: 'center',
    customRender: ({ index }) => {
      return index + 1
    },
  },
  {
    title: '二维码名称',
    dataIndex: 'name',
  },
  {
    title: '报告编号',
    dataIndex: 'sn',
  },
  {
    title: '生成时间',
    dataIndex: 'createDate',
  },
  {
    title: '检测类型',
    dataIndex: 'type',
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
  {
    title: '操作',
    width: 170,
    dataIndex: 'manipulate',
  },
]

export default {
  name: 'List',
  setup() {
    const { tableBoxRef, tableHeight } = useTableHeight()

    return { tableBoxRef, tableHeight }
  },
  data() {
    return {
      activeTab: 0,
      activeSubTab: this.activeTab || 0,
      tabList: [
        { key: 0, tab: '室内检测' },
        { key: 1, tab: '现场检测' },
        { key: '', tab: '全部' },
      ],
      loading: false,
      downVisible: false,
      configLoading: false,
      scanningRules: {
        name: [{ required: true, message: '内容列为必填项', trigger: 'blur' }],
        orderNumber: [
          { required: true, message: '排序为必填项', trigger: 'blur' },
        ],
      },
      fieldRules: {
        name: [
          { required: true, message: '二维码名称为必填项', trigger: 'blur' },
        ],
        type: [
          { required: true, message: '检测类型为必填项', trigger: 'change' },
        ],
      },
      scanningShowList: [],
      scanningBoxVisible: false,
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
      fieldForm: {
        name: '',
        type: 0,
        remark: '',
      },
      editBoxVisible: false,
      query: {
        name: '',
        selState: '',
      },
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10, // 每页中显示10条数据
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'], // 每页中显示的数据
        showTotal: total => `共有 ${total} 条数据`, // 分页中显示总的数据
      },
      selRow: [],
      columns,
      scanningContent,
      tabledata: [],
      paramId: '',
      modifyConfig: {
        name: '',
        orderNumber: '',
        shown: false,
      },
      // 1-新增 2-编辑 3-详情 4-快速新增 5-批量编辑
      modalStatus: null,
      editScaningFieldVisible: false,
      // 当前下载二维码选择row
      downCodeRow: {},
      selectedRowKeys: [],
      submitLoading: false,
      qrCodeUrl: '',
      editTestType: 0,
    }
  },
  computed: {
    tabListOptions() {
      return this.tabList.filter(d => d.key !== '')
    },
    isDetailModal() {
      return this.modalStatus === 3
    },
    isQuickAddModal() {
      return this.modalStatus === 4
    },
    addModalTitle() {
      switch (this.modalStatus) {
        case 1:
          return '新增二维码'
        case 2:
          return '编辑二维码'
        case 3:
          return '二维码详情'
        case 4:
          return '快速创建二维码'
        case 5:
          return '批量编辑'
        default:
          return ''
      }
    },
  },
  beforeCreate() {},
  mounted() {
    window.getSelectedRow = this.getSelectedRow
  },
  created() {
    this.getTemplateList()
  },
  methods: {
    disabledTestType(key) {
      return (this.activeTab === 0 && key === 1) || (this.activeTab === 1 && key === 0)
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    initFieldForm() {
      this.fieldForm = {
        name: '',
        type: this.activeTab || 0,
        remark: '',
      }
    },
    // 打开新增二维码弹窗
    openAddQRCode() {
      this.initFieldForm()
      this.modalStatus = 1
      this.getScaningShowList()
      this.editBoxVisible = true
    },
    // 打开编辑二维码
    openEditQRCode(row) {
      this.modalStatus = 2
      this.editBoxVisible = true
      this.getQRCodeDet(row.id)
    },
    // 打开二维码详情
    openQECodeDet(row) {
      this.modalStatus = 3
      this.editBoxVisible = true
      this.getQRCodeDet(row.id)
    },
    // 打开快速创建二维码
    async openQuickAdd() {
      const { selectedRowKeys } = this

      if (selectedRowKeys.length !== 1) {
        window.$oAntdMessage.warn('请选择一个目标二维码')
        return
      }

      this.initFieldForm()

      this.modalStatus = 4
      this.editBoxVisible = true
      await this.getScaningShowList()
      this.getQRCodeDet(selectedRowKeys[0])
    },
    // 获取二维码详情
    getQRCodeDet(id) {
      return new Promise((r, j) => {
        window.$oAjax({
          method: 'get',
          params: { id },
          url: `/rest/externalQrcode/byId`,
        }).then((res) => {
          if (res.code === 20000) {
            r(res.data)
            // 数据回显用于修改和详情
            this.fieldForm = {
              name: res.data.name,
              type: res.data.type || 0,
              remark: res.data.remark,
              id: res.data.id,
              sn: res.data.sn,
              createDate: res.data.createDate,
            }
            this.editTestType = res.data.type

            if (this.isQuickAddModal) { /* empty */ }

            // 排序展示
            const arr = res.data.fields
            arr.sort((m, n) => {
              if (m.orderNumber < n.orderNumber)
                return -1
              else if (m.orderNumber > n.orderNumber)
                return 1
              else return 0
            })
            arr.forEach((item) => {
              item.id = item.fieldId
            })

            // 快速新增逻辑
            if (this.isQuickAddModal) {
              const r = []
              const scanningShowList = this.scanningShowList
              for (let i = 0; i < scanningShowList.length; i++) {
                const item = scanningShowList[i]
                const dataItem = arr.find(j => j.id === item.id)
                r.push({
                  ...item,
                  fieldValue: dataItem ? dataItem.fieldValue : null,
                })
              }

              this.scanningShowList = r

              this.fieldForm = {
                name: res.data.name,
                type: res.data.type || 0,
                remark: res.data.remark,
              }
            }
            else {
              // 数据回显用于修改和详情
              this.scanningShowList = arr
            }
          }
          else {
            // eslint-disable-next-line prefer-promise-reject-errors
            j()
            window.$oAntdMessage.error(res.message)
          }
        })
      })
    },
    // 打开扫码后的自定义内容配置
    openScanningConfigBox() {
      this.modifyConfig = {
        name: '',
        orderNumber: '',
        shown: false,
      }
      this.editScaningFieldVisible = true
    },
    openScanningBox() {
      this.scanningBoxVisible = true
      this.getScaningShowList()
    },

    editScanningConfig(row) {
      this.modifyConfig = { ...row }
      this.editScaningFieldVisible = true
    },
    // 删除自定义字段
    delScanningConfig(row) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确认删除?',
        okText: '确定',
        cancelText: '取消',
        onOk() {
          _this.configLoading = true
          window.$oAjax({
            method: 'delete',
            params: { id: row.id },
            url: `/rest/externalQrcode/fieldConfig/del`,
          })
            .then((res) => {
              if (res.code === 20000) {
                _this.getScaningShowList()
                _this.configLoading = false
              }
              else {
                window.$oAntdMessage.error(res.message)
              }
            })
        },
        onCancel() {

        },
      })
    },
    // 编辑自定义字段
    async editBoxHandleOk() {
      if (this.isDetailModal) {
        this.editBoxVisible = false
        return
      }

      try {
        await this.$refs.ruleEditFiledForm.validate()
        this.saveQRCode()
      }
      catch (err) {
        console.error(err)
      }
    },
    // 保存自定义字段并生成二维码
    async svaeAndCreateCode() {
      if (this.isDetailModal || this.isQuickAddModal) {
        this.editBoxVisible = false
        return
      }

      try {
        await this.$refs.ruleEditFiledForm.validate()
        this.saveQRCode().then((res) => {
          this.openDownloadCode(res)
        })
      }
      catch (err) {
        console.error(err)
      }
    },
    // 保存二维码
    saveQRCode() {
      return new Promise((r, j) => {
        const data = { ...this.fieldForm }
        data.fields = this.scanningShowList.map((item) => {
          if (item.id === '4028b2297a7a9cfb017a7afe4ba00017') {
            data.sn = item.fieldValue
          }
          return {
            fieldId: item.id,
            fieldValue: item.fieldValue,
          }
        })

        this.submitLoading = true
        window.$oAjax({
          method: 'post',
          data,
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          url: `/rest/externalQrcode/save`,
        })
          .then((res) => {
            if (res.code === 20000) {
              this.editBoxVisible = false
              this.getTemplateList()
              r(res.data)
            }
            else {
              window.$oAntdMessage.error(res.message)
              // eslint-disable-next-line prefer-promise-reject-errors
              j()
            }
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },

    async verifyScanningConfig() {
      try {
        await this.$refs.ruleEditScaningForm.validate()
        this.saveConfig().then(() => {
          this.editScaningFieldVisible = false
        })
      }
      catch (err) {
        console.error(err)
      }
    },
    queryList() {
      this.activeSubTab = this.activeTab || 0
      this.pagination.pageSize = 10
      this.pagination.current = 1
      this.getTemplateList()
    },
    // 打开下载二维码框
    openDownloadCode(row) {
      this.downVisible = true
      // 弹窗打开是异步，事件执行时无法获取到节点对象，antd 没有提供钩子函数，所以这里延时执行
      if (document.getElementById('QRCodeBox')) {
        this.createQrcode(row)
      }
      else {
        setTimeout(() => {
          this.createQrcode(row)
        }, 1000)
      }
    },
    // 生成二维码
    createQrcode(row) {
      this.downCodeRow = row

      QRCode.toDataURL(row.content, {
        // 第一个入参是组件id
        text: row.content, // 生成二维码的文本
        width: 300,
        height: 300,
        colorDark: '#000000', // 二维码色
        colorLight: '#ffffff', // 背景色
        errorCorrectionLevel: 'H',
      }).then((url) => {
        this.qrCodeUrl = url
      })
    },
    // 下载二维码
    downCode() {
      if (document.querySelectorAll('#QRCodeBox img')[0]) {
        const url = document.querySelectorAll('#QRCodeBox img')[0].src
        const a = document.createElement('a')
        const event = new MouseEvent('click')
        // 下载图名字
        a.download = this.downCodeRow.name
        a.href = url
        // 合成函数，执行下载
        a.dispatchEvent(event)
      }
    },
    onChangeOnAndOff(row) {
      row.shown ? (row.shown = true) : (row.shown = false)
      this.modifyConfig = { ...row }
      this.saveConfig()
    },
    // 保存自定义字段
    saveConfig() {
      return new Promise((r, j) => {
        const data = { ...this.modifyConfig, type: this.activeTab }
        data.orderNumber = Number.parseInt(data.orderNumber)
        window.$oAjax({
          method: 'post',
          data: [data],
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          url: `/rest/externalQrcode/fieldConfig/save`,
        }).then((res) => {
          if (res.code === 20000) {
            this.getScaningShowList()
            r(res.data)
          }
          else {
            window.$oAntdMessage.error(res.message)
            // eslint-disable-next-line prefer-promise-reject-errors
            j()
          }
        })
      })
    },
    // 获取所有自定义字段
    getScaningShowList() {
      return new Promise((r, j) => {
        const type = this.activeTab || 0

        window.$oAjax
          .get(`/rest/externalQrcode/fieldConfig/list?type=${type}`)
          .then((res) => {
            if (Number.parseInt(res.code) === 20000) {
              r(res.data)
              const arr = res.data
              arr.sort((m, n) => {
                if (m.orderNumber < n.orderNumber)
                  return -1
                else if (m.orderNumber > n.orderNumber)
                  return 1
                else return 0
              })
              this.scanningShowList = arr
            }
            else {
              j(res)
              window.$oAntdMessage.error(res.message)
            }
          })
          .catch((err) => {
            console.error(err)
            this.scanningShowList = []
          })
      })
    },
    // 新增二维码时，切换检测类型
    onChangeType() {
      this.getScaningShowList()
    },
    getSelectedRow() {
      return this.selRow
    },
    returnkey(r) {
      return r.id
    },

    changePage(v) {
      this.pagination.current = v.current
      this.pagination.pageSize = v.pageSize
      this.getTemplateList()
    },
    // isShowAll是否展示全部数据还是子暂时自己的数据
    // 2023-2-15新增改善需求 yangjianping
    onChangeIsShowAll() {
      this.query.isShowAll = !this.query.isShowAll
      this.getTemplateList() // 重新更新数据
    },
    // 获取列表数据
    getTemplateList() {
      this.selectedRowKeys = []
      const params = {
        quickQry: this.query.name,
        page: this.pagination.current,
        size: this.pagination.pageSize,
        isShowAll: this.query.isShowAll,
      }
      if (this.activeTab !== '') {
        params.type = this.activeTab
      }
      this.loading = true
      window.$oAjax
        .get(`/rest/externalQrcode/list`, {
          params,
        })
        .then((res) => {
          if (Number.parseInt(res.code) === 20000) {
            const datas = res.data.rows
            datas.forEach((item) => {
              const s = this.tabList.find(tab => tab.key === item.type)
              item.type = s ? s.tab : '-'
            })
            this.pagination.total = res.data.count
            this.tabledata = res.data.rows
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    onDel(row) {
      const ids = []

      if (row) {
        ids.push(row.id)
      }
      else if (this.selectedRowKeys.length === 0) {
        window.$oAntdMessage.warn('请选择目标二维码')
        return
      }
      else {
        ids.push(...this.selectedRowKeys)
      }

      window.$oAntdConfirm({
        title: '您正在删除二维码！',
        content: '删除后将无法恢复，您确定要删除二维码吗？',
        onOk: async () => {
          await window.$oAjax({
            method: 'DELETE',
            url: `/rest/externalQrcode/del`,
            data: JSON.stringify(ids),
            headers: {
              'content-type': 'application/json',
            },
          })
          window.$oAntdMessage.success('操作成功！')
          this.queryList()
        },
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
