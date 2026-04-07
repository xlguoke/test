<template>
  <div ref="noteRef" class="noteList">
    <a-spin :spinning="loading">
      <a-form layout="inline" class="search-form">
        <a-form-item>
          <a-select
            v-model:value="searchForm.businessModule"
            allow-clear
            placeholder="请选择业务模块"
            @change="search"
          >
            <a-select-option v-for="k in businessMode" :key="k" :value="k">
              {{ k }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-input
            v-model:value="searchForm.quickQry"
            allow-clear
            placeholder="请输入短信名称/内容查询"
            :max-length="50"
            @press-enter="search"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="search">
            查询
          </a-button>
          <a-button @click="resetForm">
            重置
          </a-button>
        </a-form-item>
      </a-form>
      <a-table
        row-key="id"
        bordered
        :columns="columns"
        :data-source="data"
        :row-class-name="rowClassName"
        :pagination="pagination"
        :scroll="{ y: tableHeight }"
        @change="changeTable"
      >
        <template #bodyCell="{ column, record, text, index }">
          <template v-if="column.dataIndex === 'scenariosPicture'">
            <a-button type="link" @click="applyScene(record)">
              查看
            </a-button>
          </template>

          <template v-if="column.dataIndex === 'enabled'">
            <a-switch
              :checked="text"
              @change="changeEnabled(record)"
            ></a-switch>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <a-button type="link" @click="preview(record)">
              预览
            </a-button>
            <a-button type="link" @click="edit(record)">
              编辑
            </a-button>
            <a-button type="link" @click="init(record, index)">
              初始化
            </a-button>
            <a-button type="link" @click="simulaSend(record)">
              模拟发送
            </a-button>
          </template>
        </template>
      </a-table>

      <!-- 应用场景 -->
      <ht-modal
        v-model:open="visible"
        :footer="null"
        width="90%"
        centered
        class="application"
      >
        <img class="preview-img" :src="previewImg" alt="应用场景" />
      </ht-modal>

      <!-- 预览 -->
      <a-modal
        v-model:open="viewVisible"
        :footer="null"
        width="375px"
        centered
        :get-container="$refs.noteRef"
      >
        <div class="phone-box">
          <img class="bg" :src="phoneBg" alt="" />
          <div class="content-preview">
            <p class="content-msg">
              {{ contentPreview }}
            </p>
          </div>
        </div>
      </a-modal>

      <!-- 模拟发送 -->
      <ht-modal
        v-model:open="sendVisible"
        title="模拟发送"
        width="450px"
        centered
        :mask-closable="false"
        :keyboard="false"
      >
        <div class="alert-info">
          <ExclamationCircleFilled />
          <div class="alert-con">
            模拟发送，是为了验证短信内容能否被正常发出，避免短信内容编辑后发送失败或内容缺失。
          </div>
        </div>
        <br />
        <a-form ref="formRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :model="rowObj">
          <a-form-item
            label="接收电话"
            :rules="[
              { required: true, message: '请输入接收电话' },
              { validator: validPhone, message: '电话格式错误' },
            ]"
            name="phone"
          >
            <a-input
              v-model:value="rowObj.phone"
              placeholder="请输入接收电话"
            />
          </a-form-item>
          <a-form-item label="短信内容">
            <div class="note-content">
              {{ rowObj.content }}
            </div>
          </a-form-item>
        </a-form>
        <template #footer>
          <div class="clearfix">
            <a-button @click="sendVisible = false">
              关闭
            </a-button>
            <a-button type="primary" :loading="btnLoading" @click="sendTest">
              确定
            </a-button>
          </div>
        </template>
      </ht-modal>

      <Edit ref="editRef" @load="getData()" />
    </a-spin>
  </div>
</template>

<script>
import { ExclamationCircleFilled } from '@ant-design/icons-vue'
import Edit from './components/Edit.vue'

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 50,
    align: 'center',
    customRender: ({ index }) => index + 1,
  },
  {
    title: '短信名称',
    dataIndex: 'name',
    sorter: true,
    width: '15%',
  },
  {
    title: '业务模块',
    dataIndex: 'module',
    width: '10%',
  },
  {
    title: '短信内容',
    dataIndex: 'content',
    ellipsis: true,
    width: '40%',
  },
  {
    title: '触发方式',
    dataIndex: 'triggerMode',
    width: '10%',
  },
  {
    title: '应用场景',
    dataIndex: 'scenariosPicture',
    width: '10%',
    scopedSlots: { customRender: 'scenariosPicture' },
  },
  {
    title: '状态',
    dataIndex: 'enabled',
    width: '8%',
    scopedSlots: { customRender: 'enabled' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 240,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    Edit,
    ExclamationCircleFilled,
  },
  data() {
    const validPhone = (rule, value, callback) => {
      if (value && !/^1\d{10}$/.test(value)) {
        return callback(new Error(rule.message))
      }
      callback()
    }
    return {
      phoneBg: new URL('~/assets/img/phone-bg.png', import.meta.url),
      fsStaticPath: window.$fsStaticPath,
      visible: false,
      viewVisible: false,
      sendVisible: false,
      loading: false,
      btnLoading: false,
      businessMode: [],
      searchForm: {},
      sortOrder: {},
      tableHeight: 300,
      columns,
      data: [],
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.pagination.current = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.pagination.current = page
          this.pagination.pageSize = size
          this.getData()
        },
      },
      previewImg: '',
      contentPreview: '',

      rowObj: {},
      validPhone,
    }
  },
  created() {
    this.getBuisnessMode()
    this.getData()
  },
  mounted() {
    window.getSelections = this.getSelections
    this.initTableHeight()
    window.onresize = () => {
      this.initTableHeight()
    }
  },
  methods: {
    initTableHeight() {
      const formH = document.querySelector('.search-form').clientHeight
      this.tableHeight = document.body.clientHeight - formH - 160
    },
    rowClassName(record, index) {
      return index % 2 === 1 ? 'dark-row' : 'light-row'
    },
    // 获取业务模块
    getBuisnessMode() {
      window.$oAjax.get('/rest/sms/template/business-modules').then((res) => {
        if (res.code !== 20000)
          return
        this.businessMode = res.data || []
      })
    },
    getData() {
      const { current, pageSize } = this.pagination
      const par = { ...this.searchForm }
      this.loading = true
      par.quickQry = par.quickQry ? encodeURI(par.quickQry) : ''
      window.$oAjax({
        url: '/rest/sms/template/pagination',
        method: 'GET',
        params: {
          page: current,
          size: pageSize,
          ...this.sortOrder,
          ...par,
        },
      })
        .then((res) => {
          this.loading = false
          if (res.code !== 20000) {
            return window.$oErrorAlert(res.message)
          }
          this.pagination.total = res.data.count
          this.data = res.data.rows
        })
        .catch((err) => {
          this.loading = false
          window.$oErrorAlert(err.message)
        })
    },
    // 搜索
    search() {
      this.pagination.current = 1
      this.getData()
    },
    // 重置
    resetForm() {
      this.pagination.current = 1
      this.searchForm = {}
      this.getData()
    },
    // 修改排序
    changeTable(pagination, filters, sorter) {
      if (!sorter.field)
        return
      let order = ''
      switch (sorter.order) {
        case 'ascend':
          order = 'asc'
          break
        case 'descend':
          order = 'desc'
          break
        default:
          order = ''
          break
      }
      this.sortOrder = {
        order,
        orderBy: order ? sorter.field : '',
      }
      this.getData()
    },
    // 应用场景
    applyScene(row) {
      if (!row.scenarios) {
        return window.$oAntdMessage.warning('暂未添加应用场景说明!')
      }
      const modal = window.$oAntdModal.warning({
        title: '应用场景说明！',
        okText: '关闭',
        centered: true,
        content: () =>
          h('div', {}, [
            row.scenarios
              ? h(
                  'span',
                  `${row.scenarios}。${row.scenariosPicture ? '点击' : ''}`,
                )
              : '',
            row.scenariosPicture
              ? h(
                  'a',
                  {
                    style: 'user-select: none;',
                    on: {
                      click: () => {
                        this.previewImg = row.scenariosPicture || ''
                        this.visible = true
                        modal.destroy()
                      },
                    },
                  },
                  '查看示例',
                )
              : '',
          ]),
      })
    },
    // 切换状态
    changeEnabled(row) {
      const url = `/rest/sms/template/${row.enabled ? 'disable' : 'enable'}/${
        row.id
      }`
      this.loading = true
      window.$oAjax
        .get(url)
        .then((res) => {
          this.loading = false
          if (res.code !== 20000) {
            return window.$oErrorAlert(res.message)
          }
          row.enabled = !row.enabled
        })
        .catch((err) => {
          this.loading = false
          window.$oErrorAlert(err.message)
        })
    },
    // 预览
    preview(row) {
      this.contentPreview = row.contentPreview
      this.viewVisible = true
    },
    // 编辑
    edit(row) {
      this.$refs.editRef.showModal(row.id)
    },
    // 初始化
    init(row, ind) {
      window.$oAntdConfirm({
        title: '初始化短信内容！',
        content: '您确定要初始化验证码短信的内容吗？',
        onOk: () => {
          this.loading = true
          window.$oAjax
            .get(`/rest/sms/template/init/${row.id}`)
            .then((res) => {
              this.loading = false
              if (res.code !== 20000) {
                return window.$oErrorAlert(res.message)
              }
              window.$oAntdMessage.success('操作成功')
              this.data[ind] = res.data
            })
            .catch((err) => {
              this.loading = false
              window.$oErrorAlert(err.message)
            })
        },
      })
    },
    // 模拟发送
    simulaSend(row) {
      this.rowObj = row
      this.rowObj.phone = ''
      this.sendVisible = true
    },
    sendTest() {
      this.$refs.formRef.validateFields().then(() => {
        const value = { ...this.rowObj }
        this.btnLoading = true
        window.$oAjax
          .get(
            `/rest/sms/template/send-test/${this.rowObj.id}?phone=${value.phone}`,
          )
          .then((res) => {
            this.btnLoading = false
            if (res.code !== 20000) {
              return window.$oErrorAlert(res.message)
            }
            window.$oAntdMessage.success('操作成功')
            this.sendVisible = false
            this.rowObj = {}
          })
          .catch((err) => {
            this.btnLoading = false
            window.$oErrorAlert(err.message)
          })
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
