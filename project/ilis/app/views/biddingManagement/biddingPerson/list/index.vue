<template>
  <div class="disqualification">
    <div class="disqualification-search">
      <div>
        <a-input
          v-model:value="queryParam"
          placeholder="输入姓名回车即可查询"
          class="disqualification-search-all"
          @press-enter="search"
        />
        <a-button type="primary" @click="search">
          查询
        </a-button>
      </div>
      <a-space class="mt-2">
        <a-button type="primary" @click="add">
          新增
        </a-button>
        <a-button @click="downloadTemplate">
          下载Excel导入模板
        </a-button>
        <a-upload
          :show-upload-list="false"
          name="file"
          accept=".xls, .xlsx"
          :custom-request="customRequest"
        >
          <a-button>
            Excel导入
          </a-button>
        </a-upload>
        <!-- <a-button @click="handleExport">
          导出
        </a-button> -->
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="handleExport">
                导出人员信息
              </a-menu-item>
              <a-menu-item key="2" @click="handleExportQrInfo">
                导出人员二维码
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            导出
            <DownOutlined />
          </a-button>
        </a-dropdown>
        <a-button @click="() => (propertyProfileVisible = true)">
          人员信息项配置
        </a-button>
        <a-button v-permission="'msgPushSetting'" @click="onPushSetting">
          消息变更推送设置
        </a-button>
        <a-button
          v-permission="'sync-tic-user'"
          :loading="syncPersonLoading"
          @click="syncPerson"
        >
          同步TIC人员
        </a-button>
        <a-button @click="onSettingColumn">
          列筛选
        </a-button>
      </a-space>
    </div>
    <a-table
      :row-selection="rowSelection"
      :custom-row="customRow"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      bordered
      :scroll="scroll"
      :pagination="pagination"
      :row-class-name="rowClassName"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'username'">
          {{ record.username || '-' }}
        </template>
        <template v-if="column.dataIndex === 'dateOfBirth'">
          {{ record.dateOfBirth ? dayjs(record.dateOfBirth).format('YYYY-MM-DD') : '' }}
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <a-flex>
            <a-button type="link" @click="viewDetail(record)">
              查看
            </a-button>
            <a-button type="link" @click="editRow(record)">
              编辑
            </a-button>
            <a-button v-if="!record.username" type="link" @click="openCreateUser(record)">
              创建账号
            </a-button>
            <a-button v-if="!record.username" type="link" @click="onRelateAccount(record)">
              关联账号
            </a-button>
            <a-button v-if="record.username" type="link" @click="onDelRelateAccount(record)">
              取消关联
            </a-button>
            <a-button type="link" danger @click="deletePerson(record)">
              删除
            </a-button>
          </a-flex>
        </template>
      </template>
    </a-table>

    <EditModal ref="EditModal" :callback="getData" />
    <ht-modal
      v-model:open="propertyProfileVisible"
      :mask-closable="false"
      title="人员自定义信息项配置"
      @ok="handleProfile"
    >
      <CustomProperty customize-type="bidding-person" />
    </ht-modal>

    <!-- 创建账号 -->
    <CreateUser
      v-model:open="createUserVisible"
      :person-data="createUserPerson"
      @on-save="saveUserCallBack"
    />

    <!-- 列筛选 -->
    <CustomColumn ref="CustomColumn" @ok-btn="initColumns"></CustomColumn>

    <!-- 消息变更推送设置 -->
    <PushSetting ref="PushSetting" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { DownOutlined } from '@ant-design/icons-vue'
import { message, Modal, Table } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.js'
import sseRequestProgress from '~/components/sseRequestProgress'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { deleteRelateAccount, relateAccount } from '~/views/biddingManagement/biddingPerson/api.js'
import CreateUser from '~/views/unit-config/userMgt/components/Add.vue'
import { exportUserQrInfo } from '../api.ts'
import EditModal from './components/editModal.vue'
import PushSetting from './components/pushSetting.vue'
import RelateAccount from './components/RelateAccount.vue'

export default {
  components: {
    EditModal,
    CustomProperty,
    CustomColumn,
    PushSetting,
    CreateUser,
    DownOutlined,
  },
  data() {
    return {
      dayjs,
      rootUrl,
      data: [],
      queryParam: '',
      loading: false,
      page: 1,
      size: 10,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        pageSizeOptions: ['10', '20', '50', '100', '500'],
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData()
        },
      },
      query: {},
      columns: [],
      scroll: {
        y: 520,
      },
      selectedRowKeys: [],
      selectedRows: [],
      fields: [
        { title: '姓名', dataIndex: 'personName' },
        { title: '身份证号', dataIndex: 'identityNumber' },
        { title: '组织机构', dataIndex: 'department' },
        { title: '职称', dataIndex: 'jobTitle' },
        { title: '人员状态', dataIndex: 'personStatus' },
        { title: '所学专业', dataIndex: 'profession' },
        { title: '持证专业', dataIndex: 'certificateNames' },
        { title: '被引用次数（中标）', dataIndex: 'winQuoteNum' },
        { title: '特种设备作业人员', dataIndex: 'specialEquipmentOperator' },
      ],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              this.selectedRowKeys = this.selectedRowKeys.filter(i => i !== record.id)
              this.selectedRows = this.selectedRows.filter(i => i.id !== record.id)
            }
            else {
              this.selectedRowKeys.push(record.id)
              this.selectedRows.push(record)
            }
          },
        }
      },
      createUserPerson: {},
      createUserVisible: false,
      propertyProfileVisible: false,
      pushSettingVisible: false,
      syncPersonLoading: false,
      lastSearchParams: {},
      jobTitleDict: [],
      jobTitleLevelDict: [],
      personArchiveStatusDict: [],
      biddingPersonPositionDict: [],
      biddingPersonEducationDict: [],
    }
  },
  computed: {
    rowSelection() {
      return {
        fixed: true,
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  async created() {
    this.biddingPersonEducationDict = await this.getDictByCode('biddingPersonEducation')
    this.biddingPersonPositionDict = await this.getDictByCode('biddingPersonPosition')
    this.jobTitleDict = await this.getDictByCode('biddingPersonJobTitle')
    this.jobTitleLevelDict = await this.getDictByCode('biddingPersonJobTitleLevel')
    this.personArchiveStatusDict = await this.getDictByCode('person_archive_status')
    await this.getFilingStatus()
    this.initColumns()
    this.getData(true)
  },
  methods: {
    // 关联账户
    onRelateAccount(record) {
      AnyDialogHelper.showModel(RelateAccount, {
        id: record.id,
      }).then(() => {
        this.search()
      })
    },
    // 取消关联账户
    onDelRelateAccount(record) {
      Modal.confirm({
        title: '您正在取消系统账号关联！',
        content: `您确定要取消【${record.personName}】与系统账号【${record.username}】的关联吗？`,
        onOk: async () => {
          await deleteRelateAccount(record.id)

          message.success('操作成功')
          this.getData()
        },
      })
    },
    onPushSetting() {
      this.$refs.PushSetting.showModal()
    },
    onSettingColumn() {
      this.$refs.CustomColumn.showModal('biddingPerson', '自定义列配置', false)
    },
    async initColumns() {
      const res = await window.$oAjax.get('rest/common/chosen-columns?type=biddingPerson')

      if (res.code !== 20010) {
        const list = res.data.map((item) => {
          item.title = item.columnName
          item.key = item.columnKey
          item.dataIndex = item.key
          item.ellipsis = true
          item.width = 150

          if (['graduatedDate', 'entryTime', 'contractStartTime', 'contractEndTime'].includes(item.dataIndex)) {
            item.customRender = ({ text }) => text ? dayjs(text).format('YYYY-MM-DD') : ''
          }

          if (item.dataIndex == 'winQuoteNum') {
            item.customRender = ({ text }) => text || 0
          }

          if (item.dataIndex == 'jobTitle') {
            item.customRender = ({ text }) => {
              const res = this.jobTitleDict.find(item => item.typeCode == text)
              return res?.typeName
            }
          }
          if (item.dataIndex == 'education') {
            item.customRender = ({ text }) => {
              const res = this.biddingPersonEducationDict.find(item => item.typeCode == text)
              return res?.typeName
            }
          }
          if (item.dataIndex == 'position') {
            item.customRender = ({ text }) => {
              const res = this.biddingPersonPositionDict.find(item => item.typeCode == text)
              return res?.typeName
            }
          }

          if (item.dataIndex == 'jobTitleLevel') {
            item.customRender = ({ text }) => {
              const res = this.jobTitleLevelDict.find(item => item.typeCode == text)
              return res?.typeName
            }
          }

          if (item.dataIndex == 'archiveStatus') {
            item.customRender = ({ text }) => {
              const res = this.personArchiveStatusDict.find(item => item.typecode == text)
              return res?.typename
            }
          }

          if (item.dataIndex == 'personStatus') {
            item.customRender = ({ text }) => {
              if (text == '0') {
                return '在职'
              }
              else if (text == '1') {
                return '离职'
              }
              else {
                return ''
              }
            }
          }
          if (item.dataIndex == 'specialEquipmentOperator') {
            item.customRender = ({ text }) => {
              return text ? '是' : '否'
            }
          }

          return item
        })

        list.push({
          title: '操作',
          dataIndex: 'operation',
          width: 280,
          fixed: 'right',
        })

        this.scroll.x = list.length * 150
        this.columns = list
      }
      else {
        this.columns = []
      }
    },
    async getFilingStatus() {
      const res = await window.$oAjax.get('dictionaryController.do?getListByGroupId&dictGroupId=person_archive_status')

      if (res.success) {
        this.personArchiveStatusDict = res.obj
      }
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    async getDictByCode(dictCode) {
      const { data, code } = await window.$oAjax.get('rest/type/getTypesByGroupCode', { params: { groupCode: dictCode } })
      if (code === 20000) {
        return data
      }
    },

    // 同步人员
    syncPerson() {
      this.syncPersonLoading = true
      window.$oAjax
        .post('/rest/biddingPersonController/syncTicUser')
        .then((res) => {
          this.syncPersonLoading = false
          if (res.code === 20000) {
            message.success('TIC人员同步完成')
            this.getData(true)
          }
          else {
            message.warn(
              res.msg || res.message || 'TIC人员同步失败，请稍后再试',
            )
          }
        })
        .catch(() => {
          this.syncPersonLoading = false
          message.warn('TIC人员同步失败，请稍后再试')
        })
    },
    getData(flag) {
      if (flag) {
        this.page = 1
      }
      const { page, size, query } = this
      this.loading = true
      const params = { page, size, ...query }
      this.lastSearchParams = params
      window.$oAjax
        .get(window.$oApi.biddingPerson.list, {
          params,
        })
        .then((res) => {
          if (res.success) {
            this.data = res.obj.rows
            // eslint-disable-next-line array-callback-return
            this.data.map((data) => {
              if (
                data.biddingCustomizeValueEntities
                && data.biddingCustomizeValueEntities.length > 0
              ) {
                // eslint-disable-next-line array-callback-return
                data.biddingCustomizeValueEntities.map((item) => {
                  data[item.columnId] = item.columnValue
                })
              }
            })
            this.pagination.total = res.obj.count
            this.pagination.current = page
            this.pagination.pageSize = size
            this.selectedRowKeys = []
            this.selectedRows = []
          }
          else {
            message.error(res.msg || res.message)
          }
          this.loading = false
        })
    },
    // 搜索
    search() {
      const data = {}
      data.queryParam = this.queryParam.trim()
      this.query = data
      this.getData(true)
    },
    downloadTemplate() {
      window.open(`${rootUrl}${window.$oApi.biddingPerson.download}?isModel=1`)
    },
    add() {
      this.$refs.EditModal.showModal()
    },
    setting() {
      this.$refs.CustomInfo.showModal()
    },
    editRow(record) {
      this.$refs.EditModal.showModal(record)
    },
    deletePerson(record) {
      window.$oAjax
        .get(`/biddingPersonController/delete/${record.id}/check`)
        .then((res) => {
          if (res && res.code !== 20010) {
            const data = res.data || []
            if (data.length > 0) {
              Modal.confirm({
                title: '提示',
                content: `人员已在以下设备中授权：${data.map(i => `${i.name}（${i.equipmentSn}）`).join('、')}，删除将移除对应的设备授权人员，是否继续？`,
                okText: '继续删除',
                cancelText: '取消',
                onOk: async () => {
                  const res = await window.$oAjax.get(window.$oApi.biddingPerson.delete, { params: { id: record.id } })
                  if (res && res.success) {
                    message.success(res.msg || res.message)
                    this.getData(true)
                  }
                  else {
                    message.error(res.msg || res.message)
                  }
                },
              })
            }
            else {
              Modal.confirm({
                title: '删除',
                content: `确认删除人员 ${record.personName || ''} 的信息吗？`,
                okText: '确认',
                cancelText: '取消',
                onOk: async () => {
                  const res = await window.$oAjax.get(window.$oApi.biddingPerson.delete, { params: { id: record.id } })
                  if (res && res.success) {
                    message.success(res.msg || res.message)
                    this.getData(true)
                  }
                  else {
                    message.error(res.msg || res.message)
                  }
                },
              })
            }
          }
          else {
            message.error(res.msg || res.message)
          }
        })
    },
    // 打开tab
    viewDetail(data) {
      if (top.addTabs) {
        top.addTabs({
          id: data.id,
          title: '人员详情',
          close: false,
          url: `biddingController.do?biddingPersonDetail&id=${data.id}`,
        })
      }
    },
    // 创建账号
    async openCreateUser(record) {
      this.createUserPerson = { ...record }
      this.createUserVisible = true
    },
    async saveUserCallBack(res) {
      await relateAccount(this.createUserPerson.id, res.data.obj)
      this.getData()
    },
    handleExport() {
      if (!this.data.length) {
        message.warning('未找到满足条件数据，暂不支持导出!')
        return
      }

      const exportUrl = new URL('/ilis2/rest/biddingPersonController/export', location.origin)

      if (this.selectedRowKeys.length) {
        exportUrl.searchParams.append('ids', this.selectedRowKeys.join(','))
      }
      else {
        Object.keys(this.lastSearchParams).forEach((key) => {
          const val = this.lastSearchParams[key]
          if (!['page', 'size'].includes(key) && isDefined(val)) {
            exportUrl.searchParams.append(key, val)
          }
        })
      }

      window.open(exportUrl.href)
    },
    async handleExportQrInfo() {
      if (!this.data.length) {
        message.warning('未找到满足条件数据，暂不支持导出!')
        return
      }
      try {
        const ids = (this.selectedRowKeys || []).join(',')
        const response = await exportUserQrInfo({
          ...this.lastSearchParams,
          ids,
        })
        // 从响应中获取 blob 数据
        const blob = new Blob([response.data], { type: 'application/zip' })

        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = '人员二维码.zip'
        link.click()

        // 清理创建的 URL 对象
        window.URL.revokeObjectURL(downloadUrl)
      }
      catch (error) {
        message.error(`文件下载失败: ${error.message}`)
      }
    },
    customRequest(file) {
      sseRequestProgress.show({
        api: window.$oApi.biddingPerson.import,
        method: 'postForm',
        data: {
          file: file.file,
        },
        onComplete: (res) => {
          if (res && res.length) {
            const displayObj = {
              title: '导入模板中存在以下问题，请编辑模板文件后重新导入！',
              width: 480,
              columnName: '问题内容',
              dataSource: [],
            }

            if (res.length === 1 && res[0].includes('须指定身份证号导入：')) {
              const arr = res[0].split('须指定身份证号导入：')
              const data = (arr[1] || '').split(',')
              displayObj.title = '以下人员信息在系统中存在多人同名的情况，为确保数据准确的导入，请在系统和导入模板中同时完善同名人员的身份证号信息后再次导入！'
              displayObj.width = 420
              displayObj.columnName = '姓名'
              displayObj.dataSource = data.map((item, index) => ({
                index: index + 1,
                content: item,
              }))
            }
            else if (res.length === 1 && res[0].includes('须完善系统中对应人员的身份证信息：')) {
              const arr = res[0].split('须完善系统中对应人员的身份证信息：')
              const data = (arr[1] || '').split(',')
              displayObj.title = '下列人员姓名在导入文件中重复出现，但系统中存在没有身份证信息的人员信息，须完善系统中对应人员的身份证信息后再次导入！'
              displayObj.width = 420
              displayObj.columnName = '姓名'
              displayObj.dataSource = data.map((item, index) => ({
                index: index + 1,
                content: item,
              }))
            }
            else {
              displayObj.dataSource = res.map((item, index) => ({
                index: index + 1,
                content: item,
              }))
            }

            Modal.error({
              title: '导入失败',
              width: displayObj.width,
              content: h('div', {}, [
                h('div', {}, displayObj.title),
                h(Table, {
                  class: 'mt-2',
                  bordered: true,
                  columns: [{
                    title: '序号',
                    dataIndex: 'index',
                    width: '60px',
                  }, {
                    title: displayObj.columnName,
                    dataIndex: 'content',
                  }],
                  dataSource: displayObj.dataSource,
                  pagination: false,
                  size: 'small',
                  scroll: { y: 420 },
                }, ''),
              ]),
              centered: true,
              okText: '确定',
            })
          }
          else {
            message.success('导入成功')
            this.getData(true)
          }
        },
      })
    },
    handleProfile() {
      this.propertyProfileVisible = false
      this.getData(true)
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
