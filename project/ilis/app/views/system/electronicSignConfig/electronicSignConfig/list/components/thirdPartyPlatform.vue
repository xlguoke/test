<!-- eslint-disable vue/eqeqeq -->
<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <a-spin :spinning="spinning">
      <a-form
        ref="formRef"
        :label-col="{ span: 3 }"
        :wrapper-col="{ span: 6 }"
        @submit="handleSubmit"
      >
        <a-form-item label="电子签名平台：">
          <a-select
            v-model:value="signatureServer"
            placeholder="请选择电子签名平台"
            @change="signChange"
          >
            <a-select-option
              v-for="item in dictContent"
              :key="item.id"
              :value="item.typecode"
            >
              {{ item.typename }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="电子签章平台">
          <a-select
            v-model:value="stampServer"
            placeholder="请选择电子签章平台"
            @change="stampChange"
          >
            <a-select-option
              v-for="item in dictContent"
              :key="item.id"
              :value="item.typecode"
            >
              {{ item.typename }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 3 }">
          <a-button type="primary" html-type="submit">
            确定
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 契约锁 配置信息 -->
      <div v-show="deedLockConfigureData.length > 0">
        <br />
        <a-divider orientation="left">
          契约锁配置信息
        </a-divider>
        <a-form :label-col="{ span: 3 }" :wrapper-col="{ span: 10 }">
          <a-form-item
            v-for="(d, i) in deedLockConfigureData"
            :key="d.id"
            :label="d.description"
          >
            <a-row :gutter="10">
              <a-col span="12">
                <a-input
                  v-model:value="d.propertyValue"
                  @blur="blurSaveValue(i, d)"
                />
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </div>

      <!-- 电子签章平台 配置信息 -->
      <div v-show="fddConfigureData.length > 0">
        <br />
        <a-divider orientation="left">
          法大大配置信息
        </a-divider>
        <a-form :label-col="{ span: 3 }" :wrapper-col="{ span: 10 }">
          <a-form-item
            v-for="(d, i) in fddConfigureData"
            :key="d.id"
            :label="d.description"
          >
            <template v-if="d.propertyKey === 'fdd.sign.register.auth.status'">
              <span class="f12">{{ fddStatusObj[d.propertyValue] }}</span>
              <div class="mt-2">
                <a-button
                  v-if="d.propertyValue == 'CREATE' || d.propertyValue == 'AUTH'"
                  @click="enterpriseAuthFdd"
                >
                  法大大企业认证
                </a-button>
                <a-button
                  v-if="d.propertyValue == 'AUTH'"
                  @click="refreshEnterpriseAuthFdd"
                >
                  刷新认证状态
                </a-button>
                <a-button
                  v-if="
                    d.propertyValue == 'SIGN_CREATE'
                      || d.propertyValue == 'SIGN_AUTH'
                  "
                  @click="enterpriseSignAuthFdd"
                >
                  法大大企业用户签字授权
                </a-button>
                <a-button
                  v-if="d.propertyValue == 'SIGN_AUTH'"
                  @click="refreshEnterpriseSignAuthFdd"
                >
                  刷新授权状态
                </a-button>
              </div>
            </template>
            <template
              v-else-if="d.propertyKey === 'fdd.sign.registered.company.id'"
            >
              <span class="f12">{{ d.propertyValue }}</span>
            </template>
            <a-row v-else :gutter="10">
              <a-col span="12">
                <a-input
                  v-model:value="d.propertyValue"
                  @blur="blurSaveValueFdd(i, d)"
                />
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item v-if="!enterpriseAuthStatus" :wrapper-col="{ offset: 3 }">
            <a-button
              type="primary"
              :loading="createFddEnterpriseUserLoading"
              @click="enterpriseCraeteUserFdd"
            >
              创建企业用户
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 用户列表 -->
      <div v-show="showUserTable">
        <br />
        <a-divider orientation="left">
          第三方平台用户列表
        </a-divider>
        <div>
          <div class="mb-4">
            <a-input
              v-model:value="queryCondition"
              class="mr-2"
              allow-clear
              style="width: 240px"
              placeholder="输入用户名和账号查询"
            />
            <a-button @click="searchUser()">
              查询
            </a-button>
            <a-button @click="onImport()">
              导入
            </a-button>
            <a-button
              v-if="signatureServer == 'deedLock'"
              type="primary"
              @click="craeteUser"
            >
              创建契约锁用户
            </a-button>
            <a-button
              v-if="signatureServer === 'fdd'"
              :loading="createFddUserLoading"
              type="primary"
              @click="craeteUserFdd"
            >
              创建法大大用户
            </a-button>
          </div>
          <a-table
            :row-selection="rowSelection"
            :columns="columnsUser"
            :pagination="pagination"
            :data-source="platformUserList"
            :loading="tableLoading"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'signPhoto'">
                <img :src="record.signPhoto" style="width: 60px; height: 30px" />
              </template>

              <template v-if="column.dataIndex === 'deedStatus'">
                <template v-if="signatureServer == 'deedLock'">
                  {{ deedStatusObj[record.deedStatus] }}
                </template>
                <template v-if="signatureServer == 'fdd'">
                  {{ fddStatusObj[record.deedStatus] }}
                </template>
              </template>

              <template v-if="column.dataIndex === 'tripartiteType'">
                <template v-if="record.tripartiteType == 'FDD'">
                  法大大
                </template>
                <template v-else>
                  {{ record.tripartiteType }}
                </template>
              </template>

              <template v-if="column.dataIndex === 'signKey'">
                <a-input
                  v-if="record.edit"
                  v-model:value="record.signKey"
                  placeholder="用户章信息"
                  style="width: 100%"
                ></a-input>
                <span v-else>{{ record.signKey }}</span>
              </template>

              <template v-if="column.dataIndex === 'tripartiteUserId'">
                <a-input
                  v-if="record.edit"
                  v-model:value="record.tripartiteUserId"
                  placeholder="请输入签名平台用户信息"
                  style="width: 100%"
                ></a-input>
                <span v-else>{{ record.tripartiteUserId }}</span>
              </template>

              <template v-if="column.dataIndex === 'handle'">
                <div class="table-handle">
                  <a
                    v-if="
                      signatureServer === 'deedLock'
                        && record.deedStatus != 'AUTH_SUCCESS'
                    "
                    href="javascript:;"
                    title="认证"
                    @click="userAuthHandle(text, record)"
                  >
                    契约锁认证
                  </a>
                  <a
                    v-if="fddAuthBtnAuth(record)"
                    href="javascript:;"
                    title="法大大认证"
                    @click="userAuthHandleFdd(text, record)"
                  >
                    法大大用户认证
                  </a>
                  <a
                    v-if="signatureServer === 'fdd' && record.deedStatus == 'AUTH'"
                    href="javascript:;"
                    title="刷新"
                    @click="refreshFddStatus(text, record)"
                  >
                    刷新
                  </a>
                  <a
                    v-if="fddSignAuthBtnAuth(record)"
                    href="javascript:;"
                    title="法大大签字授权"
                    @click="userSignAuthHandleFdd(text, record)"
                  >
                    法大大签字授权
                  </a>
                  <a
                    v-if="signatureServer === 'fdd' && record.deedStatus == 'SIGN_AUTH'"
                    href="javascript:;"
                    title="刷新"
                    @click="refreshFddSignStatus(text, record)"
                  >
                    刷新
                  </a>
                  <a
                    v-if="!record.edit && allowEditTable"
                    href="javascript:;"
                    title="编辑"
                    @click="editHandle(record)"
                  >
                    编辑
                  </a>
                  <template v-if="record.edit && allowEditTable">
                    <a href="javascript:;" title="保存" @click="saveHandle(record)">保存</a>
                    <a href="javascript:;" title="取消" @click="record.edit = false">取消</a>
                  </template>
                </div>
              </template>
              <template v-if="column.dataIndex === 'signKeyEnableTime'">
                <a-range-picker
                  v-if="record.edit"
                  v-model:value="record.signKeyTime"
                  show-time
                  style="width: 100%"
                />
                <template v-else>
                  <span v-if="text && record.signKeyExpireTime">
                    {{ text }} 至 {{ record.signKeyExpireTime }}
                  </span>
                  <span v-else>-</span>
                </template>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-spin>

    <ht-modal
      v-model:open="importVisible"
      :mask-closable="false"
      title="导入签名信息"
      :closable="!importLoading"
    >
      <ComHeader>导入步骤</ComHeader>
      <p class="import-p">
        1. 下载用户签名信息导入模板，<a
          href="javascript:;"
          class="text-blue-500"
          @click="downloadTemp"
        >点击下载</a>
      </p>
      <p class="import-p">
        2. 按账号及用户名录入对应签名信息
      </p>
      <p class="import-p">
        3. 点击下方“选择文件”选中（单选）编辑好的模板文件后，即可导入
      </p>
      <ComHeader class="mt-4">
        选择文件
      </ComHeader>
      <div>
        选择模板：
        <a-button type="primary" :loading="importLoading" @click="importFun">
          <template v-if="importLoading">
            导入中，请稍后...
          </template>
          <template v-else>
            选择文件
          </template>
        </a-button>
        <input
          id="importFile"
          hidden
          accept=".xlsx,.xls"
          type="file"
          @change="getImportFile"
        />
      </div>
      <template #footer>
        <a-button
          :disabled="importLoading"
          style="float: none"
          @click="importVisible = false"
        >
          取消
        </a-button>
      </template>
    </ht-modal>

    <ImportError ref="ImportError" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import ComHeader from '~/providers/components/comHeader/index.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { FddSignService } from '~/providers/providers/services/fdd-sign'
import ImportError from './importError.vue'

const fddSignService = new FddSignService()

const CODE = [
  'deedLock',
  'creditSign',
  'kingGrid',
  'eastSign',
  'deedLockV2',
  'fdd',
  'caSign',
]

export default {
  components: {
    ComHeader,
    ImportError,
  },
  data() {
    const columnsUser = [
      {
        title: '账号',
        dataIndex: 'userName',
        key: 'userName',
      },
      {
        title: '用户名',
        dataIndex: 'realName',
        key: 'realName',
      },
      {
        title: '手机号',
        dataIndex: 'mobilePhone',
        key: 'mobilePhone',
      },
      {
        title: '签字图片',
        dataIndex: 'signPhoto',
        key: 'signPhoto',
        scopedSlots: { customRender: 'signPhoto' },
      },
      {
        title: '签名平台用户信息',
        dataIndex: 'tripartiteUserId',
        key: 'tripartiteUserId',
        width: 200,
        scopedSlots: { customRender: 'tripartiteUserId' },
      },
      {
        title: '用户章信息',
        dataIndex: 'signKey',
        key: 'signKey',
        width: 200,
        scopedSlots: { customRender: 'signKey' },
      },
      {
        title: '第三方用户类型',
        dataIndex: 'tripartiteType',
        width: 100,
      },
      {
        title: '身份证号',
        dataIndex: 'idCard',
        key: 'idCard',
      },
      {
        title: '起止日期',
        dataIndex: 'signKeyEnableTime',
        width: 360,
      },
      {
        title: '契约锁用户认证状态',
        dataIndex: 'deedStatus',
        key: 'deedStatus',
        scopedSlots: { customRender: 'deedStatus' },
      },
      {
        title: '操作',
        dataIndex: 'handle',
        width: 100,
        fixed: 'right',
      },
    ]
    return {
      spinning: false,
      importVisible: false,
      importLoading: false,
      dictContent: [],
      signatureServer: '',
      stampServer: '',
      formLayout: 'horizontal',
      deedStatusObj: {
        REGISTERED: '用户未认证',
        CERTIFYING: '认证中',
        AUTH_SUCCESS: '认证成功',
        AUTH_FAILURE: '认证失败',
      },
      fddStatusObj: {
        AUTH: '认证中',
        CREATE: '用户已创建',
        SIGN_CREATE: '签名待授权',
        SIGN_AUTH: '签名授权中',
        SUCCESS: '认证完成',
      },
      tripartiteTypeObj: {
        credit: '诚信签',
        deed: '契约锁',
      },
      deedLockConfigureData: [], // 契约锁配置信息
      oldDeedLockConfigureData: [],
      fddConfigureData: [], // 法大大配置信息,
      oldFddConfigureData: [], // 法大大配置信息,
      platformUserList: [], // 用户列表
      selectedRowKeys: [], //  已选择用户
      columnsUser,
      queryCondition: '',
      pagination: {
        pageSize: 10,
        current: 1,
        total: 0,
      },
      tableLoading: false,
      createFddUserLoading: false,
      createFddEnterpriseUserLoading: false,
    }
  },
  computed: {
    // 企业认证状态
    enterpriseAuthStatus() {
      const fddConfigureData = this.fddConfigureData
      const item = fddConfigureData.find(
        i => i.propertyKey === 'fdd.sign.register.auth.status',
      )

      if (item && item.propertyValue) {
        return item.propertyValue
      }

      return null
    },
    // 是否允许编辑表格
    allowEditTable() {
      return [
        'kingGrid',
        'eastSign',
        'fdd',
        'deedLock',
        'deedLockV2',
        'caSign',
      ].includes(this.signatureServer)
    },
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        type: this.signatureServer === 'fdd' ? 'radio' : 'checkbox',
        onChange: this.onSelectChange,
        getCheckboxProps: record => ({
          props: {
            disabled:
              // eslint-disable-next-line eqeqeq
              record.tripartiteUserId != '' && record.tripartiteUserId != null,
          },
        }),
      }
    },
    // 是否显示用户列表
    showUserTable() {
      return CODE.includes(this.signatureServer)
    },
  },
  created() {
    this.getDictContent()
  },
  methods: {
    downloadTemp() {
      window.open(`${rootUrl}/rest/kingGrid/user/model`)
    },
    // 导入
    onImport() {
      this.importVisible = true
    },
    importFun() {
      document.getElementById('importFile').click()
    },
    async getImportFile() {
      const ele = document.getElementById('importFile')
      const files = ele.files
      const file = files[0]

      if (!file.name.includes('.xlsx') || !file.name.includes('.xls')) {
        window.$oAntdModal.error({
          title: '导入失败！',
          content: '文件格式错误，仅支持导入xls和xlsx格式文件！',
        })
        ele.value = ''
        return
      }

      this.importLoading = true

      const formData = new FormData()
      formData.append('file', file)
      // eslint-disable-next-line unused-imports/no-unused-vars
      const res = await window.$oAjax({
        method: 'POST',
        url: '/rest/kingGrid/user/import',
        data: formData,
      })
        .then((res) => {
          if (res.code === 20000) {
            if (res.data && res.data.length > 0) {
              this.$refs.ImportError.open(
                res.data.map(item => ({
                  Index: item.rowNum,
                  content: item.errorMsg,
                })),
              )
              return
            }

            window.$oAntdMessage.success('操作成功！')
            this.searchUser()
            this.importVisible = false
          }
          else {
            window.$oAntdMessage.error(res.message || '导入失败！')
          }
        })
        .finally(() => {
          this.importLoading = false
          ele.value = ''
        })
    },
    // 法大大用户认证按钮权限
    fddAuthBtnAuth(record) {
      const { signatureServer } = this
      const { deedStatus, tripartiteType } = record
      return (
        signatureServer === 'fdd'
        // eslint-disable-next-line eqeqeq
        && (deedStatus == 'CREATE' || deedStatus == 'AUTH')
        // eslint-disable-next-line eqeqeq
        && tripartiteType == 'FDD'
      )
    },
    // 法大大用户签字授权按钮权限
    fddSignAuthBtnAuth(record) {
      const { signatureServer } = this
      const { deedStatus, tripartiteType } = record

      return (
        signatureServer === 'fdd'
        // eslint-disable-next-line eqeqeq
        && (deedStatus == 'SIGN_CREATE' || deedStatus == 'SIGN_AUTH')
        // eslint-disable-next-line eqeqeq
        && tripartiteType == 'FDD'
      )
    },
    statusClass(_class) {
      return _class ? _class.toLocaleLowerCase() : ''
    },
    getDictContent() {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.signConfig.dictContent,
        data: qs.stringify({
          list: JSON.stringify(['@sign_server@']),
        }),
      }).then((res) => {
        this.getSignServer()
        if (res.success) {
          this.dictContent = res.attributes.sign_server
        }
        else {
          this.dictContent = []
        }
      })
    },
    initColumns() {
      const { signatureServer } = this
      const showDeedStatus = ['deedLock', 'deedLockV2'].includes(
        signatureServer,
      )
      const showFddStatus = signatureServer === 'fdd'

      this.columnsUser = this.columnsUser.filter(
        i => i.dataIndex !== 'deedStatus',
      )

      if (showDeedStatus) {
        this.columnsUser.splice(8, 0, {
          title: '契约锁用户认证状态',
          dataIndex: 'deedStatus',
          key: 'deedStatus',
          scopedSlots: { customRender: 'deedStatus' },
        })
      }

      if (showFddStatus) {
        this.columnsUser.splice(8, 0, {
          title: '法大大用户认证状态',
          dataIndex: 'deedStatus',
          key: 'deedStatus',
          scopedSlots: { customRender: 'deedStatus' },
        })
      }
    },
    getSignServer() {
      window.$oAjax.get(window.$oApi.signConfig.signService).then((res) => {
        if (res.code === 20000) {
          const signature = res.data.signatureServer
          const stamp = res.data.stampServer
          this.signatureServer = signature
          this.stampServer = stamp
          this.initColumns()
          if (CODE.includes(signature) || CODE.includes(stamp)) {
            this.getConfigure(stamp)
            this.getPlatformUserDatas(CODE[0])
          }
        }
      })
    },
    handleSubmit(e) {
      e.preventDefault()
      const data = [
        { propertyKey: 'stamp.server', propertyValue: this.stampServer },
        {
          propertyKey: 'signature.server',
          propertyValue: this.signatureServer,
        },
      ]
      this.spinning = true
      window.$oAjax
        .post(window.$oApi.signConfig.saveDictContent, data, {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            window.$oAntdMessage.success(res.message || '修改成功！')
          }
          else {
            window.$oAntdMessage.error(res.message || '修改失败！')
          }
        })
        .finally(() => {
          this.spinning = false
        })
    },
    signChange(e) {
      const { signatureServer, stampServer } = this

      if (
        !CODE.includes(signatureServer)
        && !CODE.includes(stampServer)
      ) {
        this.platformUserList = []
        this.pagination.current = 1
        this.pagination.total = 0
      }

      this.selectedRowKeys = []
      this.initColumns()
      this.getPlatformUserDatas(e)
    },
    async stampChange(val) {
      this.getConfigure(val)
    },
    // 配置信息
    async getConfigure(val) {
      this.deedLockConfigureData = this.oldDeedLockConfigureData = []
      this.fddConfigureData = this.oldFddConfigureData = []

      if (val === 'fdd') {
        const res = await fddSignService.configure()
        this.fddConfigureData = res.data || []
        this.oldFddConfigureData = JSON.parse(JSON.stringify(res.data))
        return
      }

      if (['deedLock', 'deedLockV2'].includes(val)) {
        window.$oAjax.get(window.$oApi.signConfig.configure).then((res) => {
          res.data.forEach(d => (d.key = d.id))
          this.deedLockConfigureData = res.data || []
          this.oldDeedLockConfigureData = JSON.parse(JSON.stringify(res.data))
        })
      }
    },
    // 编辑契约锁配置信息
    blurSaveValue(i, item) {
      const oldItem = this.oldDeedLockConfigureData[i]
      if (item.propertyValue === oldItem.propertyValue)
        return

      this.spinning = true
      window.$oAjax
        .put(window.$oApi.signConfig.systemProperty, {
          id: item.id,
          description: item.description,
          propertyKey: item.propertyKey,
          propertyValue: item.propertyValue,
        }, {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then(() => {
          window.$oAntdMessage.success('更新成功')
          this.oldDeedLockConfigureData[i].propertyValue = item.propertyValue
        })
        .finally(() => {
          this.spinning = false
        })
    },
    // 编辑法大大配置信息
    blurSaveValueFdd(i, item) {
      const oldItem = this.oldFddConfigureData[i]
      if (item.propertyValue === oldItem.propertyValue)
        return

      this.spinning = true
      window.$oAjax
        .put(window.$oApi.signConfig.systemProperty, JSON.stringify({
          id: item.id,
          description: item.description,
          propertyKey: item.propertyKey,
          propertyValue: item.propertyValue,
        }), {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then(() => {
          window.$oAntdMessage.success('更新成功')
          this.oldFddConfigureData[i].propertyValue = item.propertyValue
        })
        .finally(() => {
          this.spinning = false
        })
    },
    // 表格选择行
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    // 第三方平台用户列表
    getPlatformUserDatas(val = CODE[0]) {
      if (!CODE.includes(val))
        return

      this.tableLoading = true
      window.$oAjax({
        url: window.$oApi.signConfig.userList,
        method: 'GET',
        params: {
          queryCondition: this.queryCondition,
          page: this.pagination.current,
          rows: this.pagination.pageSize,
        },
      })
        .then((res) => {
          const list = res.data.rows || []
          list.forEach((d) => {
            d.key = d.id
            d.edit = false
            if (d.signKeyEnableTime && d.signKeyExpireTime) {
              d.signKeyTime = [dayjs(d.signKeyEnableTime), dayjs(d.signKeyExpireTime)]
            }
            else {
              d.signKeyTime = []
            }
          })
          this.pagination.total = res.data.count || 0
          this.platformUserList = list
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    handleTableChange(pagination) {
      this.pagination.current = pagination.current
      this.getPlatformUserDatas()
    },
    // 查詢
    searchUser() {
      this.pagination.current = 1
      this.getPlatformUserDatas()
    },
    // 契约锁用户创建
    craeteUser() {
      const data = this.selectedRowKeys
      if (data.length === 0) {
        window.$oAntdMessage.warning('请选择用户')
        return
      }
      window.$oAjax.post(window.$oApi.signConfig.createUser, data, {
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.selectedRowKeys = []
          this.getPlatformUserDatas()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    // 法大大用户创建
    async craeteUserFdd() {
      const data = this.selectedRowKeys
      if (data.length !== 1) {
        window.$oAntdMessage.warning('请选择1个用户')
        return
      }

      this.createFddUserLoading = true
      const res = await fddSignService.userCreate(data[0]).finally(() => {
        this.createFddUserLoading = false
      })

      if (res.code !== 20010) {
        this.getPlatformUserDatas()
        this.selectedRowKeys = []
        window.$oAntdMessage.success('创建成功')
      }
    },
    // 认证
    userAuthHandle(text, tags) {
      window.$oAjax
        .post(`${window.$oApi.signConfig.userAuthStatus}/${tags.id}`)
        .then((res) => {
          // eslint-disable-next-line eqeqeq
          if (res.code === 20000 && res.data.deedUserStatus != 'AUTH_SUCCESS') {
            window.$oAjax
              .post(`${window.$oApi.signConfig.userAuth}/${tags.id}`)
              .then((res) => {
                window.open(res.data, '_blank')
              })
          }
        })
    },
    // 法大大认证
    async userAuthHandleFdd(text, record) {
      const loading = window.$oAntdMessage.loading('数据处理中...', 0)
      const res = await fddSignService.userAuth(record.id).finally(() => {
        loading()
      })

      if (res.code !== 20010) {
        window.open(res.data, '_blank')
        this.getPlatformUserDatas()
      }
    },
    // 法大大签字授权
    async userSignAuthHandleFdd(text, record) {
      const loading = window.$oAntdMessage.loading('数据处理中...', 0)
      const res = await fddSignService.signAuth(record.id).finally(() => {
        loading()
      })

      if (res.code !== 20010) {
        window.open(res.data, '_blank')
        this.getPlatformUserDatas()
      }
    },
    async refreshFddStatus(text, record) {
      const loading = window.$oAntdMessage.loading('刷新中...', 0)
      const res = await fddSignService.authStatus(record.id).finally(() => {
        loading()
      })

      if (res.code !== 20010) {
        window.$oAntdMessage.success('刷新成功！')
        this.getPlatformUserDatas()
      }
    },
    async refreshFddSignStatus(text, record) {
      const loading = window.$oAntdMessage.loading('刷新中...', 0)
      const res = await fddSignService.signAuthStatus(record.id).finally(() => {
        loading()
      })

      if (res.code !== 20010) {
        window.$oAntdMessage.success('刷新成功！')
        this.getPlatformUserDatas()
      }
    },
    // 法大大企业认证
    async enterpriseAuthFdd() {
      const loading = window.$oAntdMessage.loading('数据处理中...', 0)
      const res = await fddSignService.enterpriseAuth().finally(() => {
        loading()
      })

      if (res.code !== 20010) {
        window.open(res.data, '_blank')
        this.getConfigure('fdd')
      }
    },
    // 法大大企业签字认证
    async enterpriseSignAuthFdd() {
      const loading = window.$oAntdMessage.loading('数据处理中...', 0)
      const res = await fddSignService.enterpriseSignAuth().finally(() => {
        loading()
      })

      if (res.code !== 20010) {
        window.open(res.data, '_blank')
        this.getConfigure('fdd')
      }
    },
    // 法大大企业用户创建
    async enterpriseCraeteUserFdd() {
      this.createFddEnterpriseUserLoading = true
      const res = await fddSignService.enterpriseCreate().finally(() => {
        this.createFddEnterpriseUserLoading = false
      })

      if (res.code !== 20010) {
        this.getConfigure('fdd')
        window.$oAntdMessage.success('创建成功')
      }
    },
    // 刷新法大大企业认证
    async refreshEnterpriseAuthFdd() {
      const loading = window.$oAntdMessage.loading('刷新中...', 0)
      const res = await fddSignService.enterpriseStatus().finally(() => {
        loading()
      })

      if (res.code !== 20010) {
        this.getConfigure(this.stampServer)
        window.$oAntdMessage.success('刷新成功！')
      }
    },
    // 刷新法大大企业签字认证
    async refreshEnterpriseSignAuthFdd() {
      const loading = window.$oAntdMessage.loading('刷新中...', 0)
      const res = await fddSignService
        .enterpriseSignAuthStatus()
        .finally(() => {
          loading()
        })

      if (res.code !== 20010) {
        this.getConfigure(this.stampServer)
        window.$oAntdMessage.success('刷新成功！')
      }
    },
    editHandle(row) {
      row.edit = !row.edit
    },
    saveHandle(row) {
      if (row.signKeyTime && row.signKeyTime.length === 2) {
        row.signKeyEnableTime = dayjs(row.signKeyTime[0]).format('YYYY-MM-DD HH:mm:ss')
        row.signKeyExpireTime = dayjs(row.signKeyTime[1]).format('YYYY-MM-DD HH:mm:ss')
      }
      else {
        row.signKeyEnableTime = row.signKeyExpireTime = ''
      }
      this.tableLoading = true
      window.$oAjax({
        method: 'put',
        url: `/rest/kingGrid/user/key`,
        data: {
          userId: row.id,
          tripartiteUserId: row.tripartiteUserId,
          signKey: row.signKey,
          signKeyEnableTime: row.signKeyEnableTime,
          signKeyExpireTime: row.signKeyExpireTime,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('编辑成功')
          this.getPlatformUserDatas()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      }).finally(() => {
        this.spinning = false
      })
    },
  },
}
</script>

<style>
.certifying {
  color: rgb(59, 226, 226);
}
.auth_success {
  color: rgb(44, 230, 143);
}
.auth_failure {
  color: rgb(231, 53, 53);
}
.import-p {
  line-height: 22px;
}
</style>
