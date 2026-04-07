<template>
  <div class="otherAchievement">
    <div class="otherAchievement-left">
      <a-tree
        :load-data="onLoadData"
        :expanded-keys="expandedKeys"
        :auto-expand-parent="autoExpandParent"
        :selected-keys="selectedKeys"
        :tree-data="treeData"
        class="testItemDetail-left-tree"
        @expand="onExpand"
        @select="onSelect"
      />
    </div>
    <div class="otherAchievement-right">
      <div v-if="!isSelect" class="otherAchievement-search">
        <div v-if="allSearch">
          <a-form :model="formState">
            <a-form-item
              label="成果类型"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-select
                v-model:value="formState.achievementTypeCode"
                placeholder="请选择成果类型"
              >
                <a-select-option
                  v-for="(item, index) in typeData"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              label="状态"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-select v-model:value="formState.status" placeholder="请选择状态">
                <a-select-option
                  v-for="(item, index) in statusData"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              label="上传人员"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-input v-model:value="formState.person" placeholder="请选择上传人员" />
            </a-form-item>
            <a-form-item
              label="创建日期"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-range-picker v-model:value="formState.stamp" value-format="YYYY-MM-DD" />
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 22, offset: 2 }">
              <a-button @click="search">
                查询
              </a-button>
              <a-button
                @click="
                  () => {
                    searchType(false)
                  }
                "
              >
                切换普通查询
              </a-button>
              <a-button
                @click="
                  () => {
                    formState = {}
                    getDataByFile()
                    auditProcessObj = {}
                  }
                "
              >
                重置
              </a-button>
              <a-button

                v-permission="'add:achieve'"
                :disabled="isDetail"
                type="primary"
                @click="uploadFile"
              >
                上传成果
              </a-button>
              <a-button
                v-permission="''"
                :disabled="isDetail"
                type="primary"
                @click="printFun"
              >
                打印
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <div v-else>
          <a-input
            v-model:value="attachmentName"
            placeholder="请输入成果名称"
            class="otherAchievement-search-all"
          />
          <a-button @click="search">
            查询
          </a-button>
          <a-button
            @click="
              () => {
                searchType(true)
              }
            "
          >
            切换高级查询
          </a-button>
          <a-button

            v-permission="'add:achieve'"
            :disabled="isDetail"
            type="primary"
            @click="uploadFile"
          >
            上传成果
          </a-button>
          <a-button
            v-permission="''"
            :disabled="isDetail"
            type="primary"
            @click="printFun"
          >
            打印
          </a-button>
          <a-button
            :disabled="isDetail"
            @click="exportFun"
          >
            导出文件
          </a-button>
        </div>
      </div>
      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        bordered
        :pagination="pagination"
        row-key="id"
        :row-selection="rowSelection"
        :custom-row="customRow"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'achievementName'">
            <div class="editable-row-operations" @click.stop="() => {}">
              <a
                :href="`${rootUrl}/uploadController.do?download&accessoryId=${record.attachmentId}`"
              >{{ text }}</a>
            </div>
          </template>

          <template v-if="column.dataIndex === 'status'">
            <div v-if="'audit' === text" @click.stop="() => {}">
              <a-tooltip trigger="hover" placement="rightBottom" color="#fff">
                <a @mouseover="auditProcess(record)">{{ showStatus(text) }}</a>
                <template #title>
                  <a-steps
                    direction="vertical"
                    progress-dot
                    :current="auditCurrent"
                    class="audit-process-step"
                  >
                    <a-step
                      v-for="(d, i) in auditProcessList"
                      :key="i"
                      :title="`${d.department || ''} ${d.auditUser || ''} ${
                        d.auditTime || '未审核'
                      }`"
                    />
                  </a-steps>
                </template>
              </a-tooltip>
            </div>
            <span v-else>{{ showStatus(text) }}</span>
            <span></span>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <a-space>
              <a-button type="link" @click="() => viewLog(record)">
                日志
              </a-button>
              <template v-if="'repulse' === record.status">
                <a-button
                  v-permission="'edit:achieve'"
                  type="link"
                  @click="() => edit(record)"
                >
                  编辑
                </a-button>
                <a-button
                  v-permission="'del:achieve'"
                  type="link"
                  danger
                  @click="deleteRow(record)"
                >
                  删除
                </a-button>
              </template>
              <a-button
                v-if="isShowHandleSign(record)"
                type="link"
                @click="handleSign(record)"
              >
                签字
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <UploadResultModal
      ref="UploadModal"
      :is-add="isAdd"
      :callback="getDataByTree"
      :tree-info="treeInfo"
      :node="node"
    />

    <Logs ref="Logs" />
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import sseRequestProgress from '~/components/sseRequestProgress'
import { formatTime, getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import { usePermissionStore } from '~/store/permissionStore'
import PdfSignModal from '~/views/report/compiled/signature/component/PdfSignModal.vue'
import Logs from './components/logs.vue'
import UploadResultModal from './components/uploadModal.vue'

const typeData = [
  { name: '综合检测大纲', value: '10011' },
  { name: '综合检测方案', value: '10010' },
  { name: '检测细则', value: '10086' },
  { name: '其它', value: '10000' },
]
const statusData = [
  { name: '审核中', value: 'audit' },
  { name: '审核中', value: 'audited' },
  { name: '审核通过', value: 'approval' },
  { name: '审核未通过', value: 'not_approve' },
  { name: '审核打回', value: 'repulse' },
]

const columns = [
  {
    title: '单位工程',
    dataIndex: 'projectName',
    width: '15%',
    customRender: ({ text, record }) => {
      if (record.contractPartId && record.contractPartName) {
        return record.contractPartName
      }
      else if (record.unitProjectId && record.unitProjectName) {
        return record.unitProjectName
      }
      else {
        return text
      }
    },
  },
  {
    title: '文件名称',
    dataIndex: 'achievementName',
    width: '15%',
    scopedSlots: { customRender: 'achievementName' },
  },
  {
    title: '成果类型',
    dataIndex: 'achievementType',
    width: '15%',
    customRender: ({ text }) => {
      const d = typeData.find(item => item.value === text)
      return d ? d.name : ''
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: '10%',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: '上传人员',
    dataIndex: 'createName',
    width: '10%',
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    width: '20%',
    customRender: ({ text }) => formatTime(text, 'YYYY-MM-DD'),
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '15%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    UploadResultModal,
    Logs,
  },
  setup() {
    const usePermission = usePermissionStore()
    const signAuth = usePermission.hasPermission('other::result::signature')

    return {
      signAuth,
    }
  },
  data() {
    return {
      id: getQueryVariable('id') || '',
      isDetail: getQueryVariable('status') === '1',
      expandedKeys: [],
      rootUrl,
      autoExpandParent: true,
      selectedKeys: [],
      isAdd: true,
      data: [],
      columns,
      attachmentName: '',
      formLayout: 'horizontal',
      formState: {},
      allSearch: false,
      loading: false,
      page: 1,
      size: 10,
      contractPartId: '',
      unitProjectId: '',
      typeData,
      statusData,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          if (`${this.type}` === '1') {
            this.getDataByTree()
          }
          else {
            this.getDataByFile()
          }
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          if (`${this.type}` === '1') {
            this.getDataByTree()
          }
          else {
            this.getDataByFile()
          }
        },
      },
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
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
              if (!record.children) {
                this.selectedRowKeys.push(record.id)
                this.selectedRows.push(record)
              }
            }
          },
        }
      },
      rootData: '',
      type: 1,
      treeInfo: {},
      node: {},
      treeData: [],
      params: {},
      selectedRow: {},
      isSelect: false,
      auditProcessObj: {},
      auditProcessList: [],
      auditCurrent: 0,
      userInfo: null,
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        // type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
      }
    },
  },
  created() {
    this.getUserInfo()
    this.requestTreeData()
  },
  methods: {
    getUserInfo() {
      if (this.userInfo)
        return this.userInfo
      this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    },
    // 是否显示签字按钮
    isShowHandleSign(record) {
      // 非pdf格式，不支持签字
      if (this.isNotPdf(record.achievementName)) {
        return false
      }
      // 审核通过且未签字
      const audit = record.status === 'approval' && record.signatureStatus !== 'signed'
      // 是否为当前处理人，非当前处理人（登录用户）时根据执行权限（非发起人签字）判断是否显示
      const isSelf = this.userInfo.username === record.createBy
      return isSelf ? audit : audit && this.signAuth
    },
    showStatus(text) {
      const statusItme = this.statusData.find(item => item.value === text)
      return statusItme ? statusItme.name : ''
    },
    // 审核中时，所处于的阶段
    auditProcess(row) {
      const list = this.auditProcessObj[row.id]
      if (list && list.length > 0) {
        this.auditProcessList = list
        this.auditCurrent = list.findLastIndex(item => item.audit)
        return
      }
      this.loading = true
      window.$oAjax
        .get(`api/synthesis/achievement/audit/detail/${row.id}`, {
          headers: {
            'Unit-Code': localStorage.getItem('unitCode'),
          },
        })
        .then((res) => {
          this.loading = false
          this.auditProcessList = []
          this.auditCurrent = 0
          if (res.code === 20000) {
            this.auditProcessObj[row.id] = res.data
            this.auditProcessList = res.data
            this.auditCurrent = res.data.findLastIndex(item => item.audit)
          }
          else {
            window.$oAntdMessage.error(res.message || '获取审核进度失败')
          }
        })
        .catch((err) => {
          this.loading = false
          window.$oAntdMessage.error(err.message || '获取审核进度失败')
        })
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getRootData(data) {
      if (data) {
        this.rootData = data
        this.params = {
          type: data.type,
          id: data.oid || data.id,
          name: data.name,
        }
        this.getDataByTree()
      }
    },
    getDataByTree() {
      const { type, id } = this.params
      const typeObj = { '-2': 'project', '-1': 'contract', 'default': 'unit' }
      if (`${this.type}` !== '1') {
        this.type = 1
        this.page = 1
        this.pageSize = 10
      }

      const { page, size } = this
      this.loading = true
      window.$oRest
        .get(
          `${window.$oApi.testItem.achievement}/${
            typeObj[type] || typeObj.default
          }/${id}`,
          {
            params: {
              page,
              size,
            },
          },
        )
        .then((res) => {
          this.type = 1
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          // this.selectedRowKeys = [];
          this.loading = false
        })
    },
    getDataByFile(data = {}) {
      if (!this.attachmentName.trim() && !this.allSearch) {
        this.getDataByTree()
        return
      }

      if (`${this.type}` !== '2') {
        this.type = 2
        this.page = 1
        this.pageSize = 10
        this.selectedKeys = []
      }

      const { page, size, id } = this

      this.loading = true
      window.$oRest
        .get(`${window.$oApi.testItem.achievementList}/${id}`, {
          params: {
            page,
            size,
            ...data,
          },
        })
        .then((res) => {
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          // this.selectedRowKeys = [];
          this.loading = false
        })
    },
    // 搜索
    search() {
      let data = {}
      this.auditProcessObj = {}
      if (this.allSearch) {
        let stamp = []
        const values = { ...this.formState }
        if (values.stamp && Array.isArray(values.stamp)) {
          stamp = values.stamp.map((item, index) => {
            let time = item
            if (index === 0) {
              time = `${time} 00:00:00`
            }
            else {
              time = `${time} 23:59:59`
            }
            return new Date(time).getTime()
          })
        }
        data = {
          ...values,
          stamp: stamp.toString() || null,
        }
      }
      else {
        data.attachmentName = this.attachmentName.trim()
      }
      this.getDataByFile(data)
    },
    // 切换搜索类型
    searchType(bool) {
      this.allSearch = bool
    },
    // 删除
    deleteRow(data) {
      Modal.confirm({
        title: '删除',
        content: `确认删除这条数据吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.loading = true
          window.$oAjax
            .delete(`${window.$oApi.testItem.achievement}/${data.id}`)
            .then((res) => {
              if (res.code && res.code !== 20010) {
                message.success(res.message || '删除成功')
                if (this.type === 1) {
                  this.getDataByTree()
                }
                else if (this.type === 2) {
                  this.getDataByFile()
                }
                this.loading = false
              }
              else {
                message.error(res.message || res.msg || '删除失败')
                this.loading = false
              }
            })
        },
      })
    },
    // 查看日志
    viewLog(data) {
      this.$refs.Logs.showModal(data.id, '8')
    },
    // 编辑
    edit(data) {
      this.isAdd = false
      this.$refs.UploadModal.showModal(data)
    },
    uploadFile() {
      this.isAdd = true
      this.$refs.UploadModal.showModal()
    },
    requestTreeData() {
      if (!this.id)
        return ''

      window.$oRest
        .get(window.$oApi.testItem.getTree, { params: { id: this.id } })
        .then((res) => {
          if (res.code === 20000) {
            this.treeData = this.getTreeData(res.data)
            this.getRootData(this.treeData[0])
            const arrIds = this.treeData.map(item => item.oid)
            if (this.treeData[0].children && this.treeData[0].children[0].oid) {
              arrIds.push(this.treeData[0].children[0].oid)
            }
            this.expandedKeys = [...this.expandedKeys, ...arrIds]
            this.onExpand(this.expandedKeys)
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
    },
    onLoadData(treeNode) {
      return new Promise((resolve) => {
        if (treeNode.children) {
          resolve()
          return
        }
        console.warn('加载树的参数：', treeNode)
        setTimeout(() => {
          const data = {
            id:
              treeNode.type > 0
                ? treeNode.sid
                : treeNode.id,
            type: treeNode.type,
            levelCode: treeNode.levelCode || '',
          }
          // 树获取三个参数
          window.$oRest
            .get(window.$oApi.testItem.getTree, {
              headers: {
                'X-Requested-With': 'XMLHttpRequest',
              },
              params: data,
              dataType: 'JSON',
            })
            .then((res) => {
              if (res.code === 20000) {
                treeNode.children = this.getTreeData(res.data)
                this.treeData = [...this.treeData]
                const arrIds = treeNode.children.map(item => item.oid)
                this.expandedKeys.push(arrIds)
                this.onExpand(this.expandedKeys)
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })

          resolve()
        }, 1000)
      })
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys
      this.selectedRow = info.node.dataRef

      const node = info.node.dataRef
      this.node = node
      this.page = 1
      this.pagination.page = 1

      if (info.selected) {
        if (`${node.type}` === '-2') {
          this.treeInfo = {}
          this.params = {
            type: node.type,
            id: this.rootData.id,
            name: node.name,
          }
        }
        else {
          if (`${node.type}` === '-1') {
            this.treeInfo = {
              contractPartId: node.oid,
              projectId: this.rootData.id,
            }
          }
          else {
            this.treeInfo = {
              unitProjectId: node.oid,
              projectId: this.rootData.id,
            }
          }
          this.params = {
            type: node.type,
            id: node.oid,
            name: node.name,
          }
        }
        this.getDataByTree()
      }
      else {
        this.treeInfo = {}
        this.params = {
          type: '-2',
          id: this.rootData.id,
          name: this.rootData.name,
        }
        this.getDataByTree()
      }
    },
    getTreeData(data) {
      console.warn('获取树数据：', data)
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length !== 0) {
          children = this.getTreeData(data[i].children)
        }
        const obj = {
          ...data[i],
          value: data[i].oid,
          title: data[i].name,
          key: data[i].oid,
          isLeaf: false,
          children,
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    printFun() {
      if (this.selectedRowKeys.length === 0) {
        message.warn('请先选择其他成果')
        return
      }
      const obj = {}
      this.selectedRowKeys.forEach((item) => {
        obj[item] = {
          businessType: 40,
          businessId: item,
        }
      })

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint(this.selectedRowKeys, 'OtherAchievementAuditRecord', obj || {})
    },
    // 导出
    async exportFun() {
      const { type, id } = this.params
      const typeObj = { '-2': 'project', '-1': 'contract', '2': 'unit' }
      sseRequestProgress.show({
        api: `rest/synthesis/achievement/zip/${typeObj[type]}/${id}`,
        method: 'post',
        onComplete: (res) => {
          if (!res) {
            window.$oAntdModal.warning(window.$oMsgTips.info('导出失败'))
            return
          }
          window.open(res, '_blank')
        },
      })
    },
    // 获取流程节点人员信息
    async getPresetAuditer(processInstanceId) {
      try {
        const res = await window.$oAjax
          .get(window.$oApi.testItem.getPresetAuditer, {
            params: {
              processInstanceId,
            },
          })
        if (res.code && res.code === 20000) {
          return res.data
        }
      }
      catch (err) {
        console.error(err)
        throw err
      }
    },
    async getAuditProcess() {
      try {
        const res = await window.$oAjax
          .get('rest/auditProcess/getProcessUserTaskList?auditTypeId=40')
        if (res.code && res.code === 20000) {
          const obj = {}
          res.data.forEach((d) => {
            obj[d.activitiNodeId] = d.isMultiInstance
          })
          return obj
        }
      }
      catch (err) {
        console.error(err)
        return {}
      }
    },
    isNotPdf(fileName) {
      const ind = fileName.lastIndexOf('.')
      return fileName.substring(ind).toLocaleLowerCase() !== '.pdf'
    },
    // 签字
    async handleSign(row) {
      try {
        this.loading = true
        // 获取审核节点
        const auditProcess = await this.getAuditProcess()
        // 获取节点审核人员
        const persons = await this.getPresetAuditer(row.processInstanceId)
        const staffDataObj = {}
        for (let i = 0; i < persons.length; i++) {
          const d = persons[i]
          if (!staffDataObj[d.activitiNodeId]) {
            staffDataObj[d.activitiNodeId] = {
              id: d.activitiNodeId,
              staffname: [{ id: d.presetUserId, name: d.presetUserRealName }],
              signMode: 'picture',
              type: d.activitiNodeId,
              signTag: d.processTaskName,
              typename: d.processTaskName,
              isMultiple: auditProcess[d.activitiNodeId] || false,
            }
          }
          else {
            staffDataObj[d.activitiNodeId].staffname.push({
              id: d.presetUserId,
              name: d.presetUserRealName,
            })
          }
        }
        this.loading = false
        const signItems = Object.values(staffDataObj)

        const data = await AnyDialogHelper.showModel(PdfSignModal, {
          files: [{
            id: row.attachmentId,
            attachmenttitle: row.achievementName,
          }],
          signData: [],
          signItem: signItems,
          staffData: signItems,
          unInitSignOrderConfig: true,
        })

        this.saveSignData(row.id, data)
      }
      catch (err) {
        this.loading = false
        console.error(err)
      }
    },
    /** 保存签名设置 */
    saveSignData(id, data) {
      this.loading = true
      window.$oAjax
        .post(`rest/synthesis/other/achievement/signature/${id}`, data.signData, {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then((res) => {
          this.loading = false
          if (res.code === 22000) {
            window.$oAntdMessage.success('签字成功')
            this.search()
          }
          else {
            throw new Error(res.message)
          }
        })
        .catch((err) => {
          this.loading = false
          window.$oAntdModal.warning(window.$oMsgTips.info(err.msg || err.message))
        })
    },
    showModal(recordId) {
      this.id = recordId
      this.isSelect = true
      this.selectedRowKeys = []
      this.selectedRows = []
      this.requestTreeData()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
