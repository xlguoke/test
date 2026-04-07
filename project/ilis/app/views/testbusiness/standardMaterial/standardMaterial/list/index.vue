<!-- eslint-disable vue/eqeqeq -->
<template>
  <a-layout id="components-layout-demo-top-side-2" class="body-box">
    <a-layout>
      <a-layout-sider
        width="270"
        :style="{
          overflow: 'auto',
          padding: '10px',
          height: '100vh',
          position: 'fixed',
          left: 0,
          backgroundColor: 'var(--colorBgContainer)',
        }"
      >
        <div>
          <h3>规程资料存放位置</h3>
          <div style="padding: 10px 0">
            <a-button type="primary" @click="editLoalhostFun()">
              添加
            </a-button>
            <a-button
              :disabled="!selTreeLocation.id"
              @click="editLoalhostFun(true)"
            >
              编辑
            </a-button>
            <!-- 这里加一个复制 -->
            <!-- <a-button type="primary" @click="copyType" :disabled="false"
                >复制</a-button
              > -->
            <a-button
              :disabled="!selTreeLocation.id"
              danger
              @click="delLoalhost"
            >
              删除
            </a-button>
          </div>
        </div>
        <a-tree
          show-line
          :tree-data="treeData"
          :field-names="{
            children: 'children',
            title: 'location',
            key: 'id',
          }"
          @select="onSelect"
        ></a-tree>
        <p v-if="isShowTree">
          暂无数据
        </p>
      </a-layout-sider>
      <a-layout :style="{ marginLeft: '270px', padding: '0px 10px', backgroundColor: 'var(--colorBgContainer)' }">
        <AppProvider>
          <a-layout-content
            :style="{
              background: 'var(--colorBgContainer)',
              padding: '10px',
              margin: 0,
              minHeight: '280px',
              overflow: 'initial',
            }"
          >
            <a-spin :spinning="spinning" :tip="spinningTip">
              <div style="margin: 8px 0px" class="search-header">
                <a-input
                  v-model:value="quickQry"
                  placeholder="输入规程名称/颁布号后回车即可查询"
                  style="width: 280px"
                  @press-enter="quickSearch"
                />
                <a-button type="primary" class="ml-2" @click="quickSearch()">
                  查询
                </a-button>
              </div>

              <a-space class="mb-2">
                <a-button type="primary" @click="putInRegister(false)">
                  入库登记
                </a-button>
                <a-button
                  type="primary"
                  :disabled="!selectedRows.length"
                  @click="takeOutStandard()"
                >
                  出库登记
                </a-button>
                <a-button
                  :disabled="!selectedRows.length"
                  @click="locationChangeFun"
                >
                  位置变更
                </a-button>
                <a-button
                  :disabled="!(selectedRows.length == 1)"
                  @click="putInRegister(true)"
                >
                  编辑
                </a-button>
                <a-button
                  :disabled="!selectedRows.length"
                  danger
                  @click="delBooks"
                >
                  删除
                </a-button>
                <a-button

                  v-permission="'standardMaterialExport'"
                  @click="onExport"
                >
                  导出
                </a-button>
                <a-button

                  v-permission="'standardMaterialImport'"
                  @click="openImport"
                >
                  导入
                </a-button>
                <a-button

                  v-permission="'standardMaterialInout'"
                  @click="exportOutInStore"
                >
                  出入库台账
                </a-button>
                <a-button @click="columnScreen">
                  列筛选
                </a-button>
              </a-space>
              <!-- 删除变量 :rowClassName="rowClassName" -->
              <a-table
                :row-selection="rowSelection"
                :columns="tableColumns"
                :data-source="standardData"
                row-key="id"
                :loading="loading"
                :pagination="pagination"
                @change="sorterChange"
              >
                <template #bodyCell="{ column, record, text }">
                  <template v-if="column.dataIndex === 'name'">
                    <a href="javascript:;">{{ text }}</a>
                  </template>

                  <template v-if="column.dataIndex === 'bookName'">
                    <div>
                      <a-tooltip v-if="record.isExceed">
                        <template #title>
                          规程已失效
                        </template>
                        <span style="color: red">{{ text }}</span>
                      </a-tooltip>
                      <span v-else>{{ text }}</span>
                    </div>
                  </template>

                  <template v-if="column.dataIndex === 'screenSize'">
                    <span
                      :class="{ active: expiredFun(record.standard) }"
                    >{{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'upperLimit'">
                    <span
                      :class="{ active: expiredFun(record.standard) }"
                    >{{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'lowerLimit'">
                    <span
                      :class="{ active: expiredFun(record.standard) }"
                    >{{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'standard'">
                    <span :class="{ active: expiredFun(text) }">{{
                      text
                    }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'options'">
                    <div class="table-handle">
                      <a
                        href="javascript:;"
                        title="出库登记"
                        @click="takeOutStandardRow(record)"
                      >
                        出库登记
                      </a>

                      <a href="javascript:;" @click="putInRegisterRow(record)">
                        &nbsp;编辑
                      </a>

                      <a href="javascript:;" @click="giveBackRow(record)">
                        &nbsp;归还
                      </a>
                      <a
                        href="javascript:;"
                        style="color: red"
                        @click="delBooksRow(record)"
                      >
                        &nbsp;删除
                      </a>
                      <a @click="(e) => viewLog(e, record)"> &nbsp;日志</a>
                    </div>
                  </template>
                </template>
              </a-table>
            </a-spin>
            <AddLocation ref="addLocationRef" :callback="getTreeData" />
            <AddEditComponent ref="addBookRef" :callback="handleOkAddEditCall" />
            <TakeOut ref="takeOutRef" :callback="handleOkAddEditCall" />
            <GiveBack ref="giveBackRef" :callback="handleOkAddEditCall" />

            <LocationChange
              ref="locationChangeRef"
              :callback="handleOkAddEditCall"
            />
            <Logs ref="Logs" />
            <CustomColumn ref="CustomColumn" @ok-btn="initFun"></CustomColumn>
            <ImportVue ref="importRef" @refresh="getData" />

            <ht-modal
              v-model:open="outInVisible"
              title="规程资料出入库台账"
              :keyboard="false"
              :mask-closable="false"
              :body-style="{ padding: '0' }"
              wrap-class-name="outInModal"
              destroy-on-close
              width="80%"
            >
              <a-spin :spinning="spinningOutIn">
                <div style="height: 80vh">
                  <iframe
                    id="outInIframe"
                    :src="`/ilis2/standardBookStoreController/in-out-ledger/view.do?bookLocationId=${bookLocationId}`"
                    frameborder="0"
                    style="width: 100%; height: 100%"
                  ></iframe>
                </div>
              </a-spin>
              <template #footer>
                <div class="clearfix">
                  <a-button @click="outInVisible = false">
                    关闭
                  </a-button>
                </div>
              </template>
            </ht-modal>
          </a-layout-content>
        </AppProvider>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script>
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

import AddEditComponent from './components/addEdit.vue'
import AddLocation from './components/addLocation.vue'
import TakeOut from './components/takeOut.vue'
import GiveBack from './components/giveBack.vue'
import LocationChange from './components/locationChange.vue'
import HelloDemo from '~/providers/components/HelloDemo.vue'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import { ajaxRequest, downloadAccessory } from '~/providers/common/utils.js'
import Logs from './components/logs.vue'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import ImportVue from './components/import.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  name: 'list',
  data() {
    let self = this
    return {
      getColumnUrl: 'rest/common/chosen-columns?type=standard-archives',
      sortParams: {},
      standardData: [],
      quickQry: '',
      selTreeLocation: {},
      locationForm: {
        pid: null,
        location: '',
      },
      selLocation: {
        label: '',
        value: '',
      },
      selectedRows: [],
      selectedKeys: [],
      tableColumns: [],
      standardVisible: false,
      standardUrl: '',
      queryParam: '',
      sort: 'indexOrder',
      order: '',
      typeName: '',
      typeId: '',
      isShowTree: false,
      isEdit: false, // 是否编辑设计级配类型
      visible: false,
      isDisabledDel: true,
      isDisabledEdit: true,
      confirmLoading: false,
      maskClosable: false,
      groupSel: [],
      treeData: [],
      data: [],
      totals: 0,
      isLoadRange: true,
      selectedRowKeys: [],
      rangeId: '', // 规程id
      screenSize: '', // 规程名称
      lowerLimit: '',
      page: 1,
      size: 10,
      selectPage: 'radio', // 单选或者多选
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
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
      // fileList:[],
      loading: false,
      spinningTip: '',
      spinning: false,
      outInVisible: false,
      spinningOutIn: false,
      bookLocationId: '',
    }
  },
  components: {
    AddEditComponent,
    TakeOut,
    LocationChange,
    HelloDemo,
    UploadComponent,
    AddLocation,
    GiveBack,
    Logs,
    CustomColumn,
    ImportVue,
  },
  created() {
    this.initFun()
    this.getTreeData()
  },
  computed: {
    rowSelection() {
      return {
        type: 'checkbox',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows


        },
      }
    },
  },
  methods: {
    initFun() {
      this.getColumn().then((res) => {
        this.getData()
      })
    },
    //获取自定义列
    getColumn() {
      return new Promise((r, j) => {
        window.$oAjax.get(this.getColumnUrl).then((res) => {
          if (res.code === 20000 && res.data.length > 0) {
            let list = res.data.map((item, index) => {
              item.title = item.columnName
              item.key = item.columnKey
              item.dataIndex = item.key
              if (item.columnKey == 'bookName') {
                item.scopedSlots = { customRender: 'bookName' }
              }

              if (item.columnKey == 'inDate') {
                item.sorter = true
              }

              return item
            })
            list.push({
              title: '操作',
              dataIndex: 'options',
              width: '120',
            })

            this.tableColumns = list


            r(list)
          } else {
            j(res)
            window.$oAntdMessage.warning(res.message || res.msg || '请求错误')
          }
        })
      })
    },
    openImport() {
      this.$refs.importRef.openModal()
    },
    async onExport() {
      this.spinning = true
      this.spinningTip = '导出中...'
      let a = document.createElement('a')
      let params = {
        bookLocationId: this.selTreeLocation.id || '',
        quickQry: this.quickQry || '',
        page: this.page,
        size: this.size,
        ...this.sortParams,
      }
      this.sort ? (params[this.sort] = this.order) : ''

      let href = `/ilis2/rest/standardBookStoreController/archives-export`

      Object.keys(params)
        .filter((key) => params[key] !== undefined)
        .map(
          (key, index) =>
            (href += `${index === 0 ? '?' : '&'}${key}=${params[key]}`)
        )

      a.href = href
      a.target = '_blank'
      a.click()
      this.spinning = false
      this.spinningTip = ''
    },
    editLoalhostFun(isEdit) {
      if (isEdit) {

        if (!this.selTreeLocation.id) {
          window.$oAntdMessage.warn('请选择一个存放位置进行编辑')
          return
        } else {
          this.$refs.addLocationRef.showModal(this.selTreeLocation, false)
        }
      } else {
        this.$refs.addLocationRef.showModal(this.selTreeLocation, true)
      }
    },
    ajaxRequest,
    downloadAccessory,
    expiredFun(standard) {},
    showModal(isEdit) {
      this.isEdit = isEdit
      this.typeName = isEdit ? this.groupSel[0].typeName : ''
      this.visible = true
    },
    // 查看日志
    viewLog(e, data) {
      this.$refs.Logs.showModal(data.id)
    },

    checkDataExceed(date1) {
      if (!date1) {
        return false
      } else {
        const oDate1 = new Date(date1)
        // const oDate2 = Date.now()
        const now = new Date()
        const year = now.getFullYear() // 年
        const month = now.getMonth() + 1 // 月
        const date = now.getDate() // 日
        const oDate2 = new Date(`${year}-${month}-${date}`)
        if (oDate1.getTime() >= oDate2.getTime()) {
          return false //第一个大,意味着过期时间还没到
        } else {
          return true //第一个大
        }
      }
    },
    takeOutStandard() {

      if (!this.selectedRows.length) {
        window.$oAntdMessage.warn('请至少选择一条出库')
        return
      }
      this.$refs.takeOutRef.showModal(this.selectedRows)
    },
    takeOutStandardRow(row) {
      this.selectedRowKeys = [row.id]
      this.selectedRows = [row]
      this.takeOutStandard()
    },
    giveBackRow(row) {
      this.$refs.giveBackRef.showModal(row)
    },
    columnScreen() {
      this.$refs.CustomColumn.showModal(
        'standard-archives',
        '自定义列配置',
        false
      )
    },
    delBooksRow(row) {
      this.selectedRowKeys = [row.id]
      this.selectedRows = [row]
      this.delBooks()
    },

    locationChangeFun() {
      if (!this.selectedRows.length) {
        window.$oAntdMessage.warn('请至少选择一条变更位置')
        return
      }
      this.$refs.locationChangeRef.showModal(this.selectedRows)
    },
    putInRegister(isEdit) {
      if (isEdit) {
        this.$refs.addBookRef.showModal(
          this.selTreeLocation.id,
          this.selectedRows
        )
      } else {
        this.$refs.addBookRef.showModal(this.selTreeLocation.id)
      }
    },
    putInRegisterRow(row) {
      this.selectedRowKeys = [row.id]
      this.selectedRows = [row]




      this.putInRegister(true)
    },
    addLocationOk(e) {
      if (!this.selLocation) {
        window.$oAntdMessage.warn('请选择父级位置')
        return
      } else if (!this.locationForm.location) {
        window.$oAntdMessage.warn('请输入位置名称')
        return
      }

      this.confirmLoading = true
      this.locationForm.pid = this.selLocation.value
      window.$oAjax({
        method: 'POST',
        url: 'rest/standardBookLocationController?addOrEdit',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
        data: this.locationForm,
      }).then((res) => {
        this.visible = false
        this.confirmLoading = false
        if (res.code === 20000) {
          this.getTreeData()
        } else {
          window.$oAntdMessage.error(res.msg || '请求错误')
        }
      })
    },
    typeCancel(e) {
      this.visible = false
    },
    // #35562 根据类型复制级配
    copyType() {
      // this.loading = true;
      // // this.selectedKeys[0]是已选的级配类型id, this.typeId设计级配类型id
      // if (this.selectedKeys[0]) {
      //   window.$oAjax
      //     .get(window.$oApi.designGrade.typeCopyUrl, {
      //       params: { id: this.typeId },
      //     })
      //     .then((res) => {
      //       if (res.success) {
      //         window.$oAntdMessage.success(res.msg);
      //         this.getTreeData();
      //         this.typeId = res.obj.id;
      //         this.selectedKeys = [];
      //         this.selectedKeys.push(res.obj.id);
      //         this.groupSel = [];
      //         this.groupSel.push(res.obj);
      //         this.loading = false;
      //       } else {
      //         window.$oAntdMessage.error(res.message || res.msg);
      //       }
      //     });
      // } else {
      //   window.$oAntdModal.warning(window.$oMsgTips.info("请选择设计级配类型"));
      // }
    },
    delBooks() {
      let self = this
      if (this.selectedRows.length) {
        window.$oAntdConfirm({
          title: '正在删除规程资料！',
          content:
            '删除规程资料后，将同时删除其对应的出入库记录，您确定要删除吗？',
          cancelText: '取消',
          okText: '确定',
          onOk() {
            let data = {
              ids: self.selectedRowKeys.join(','),
            }
            window.$oAjax
              .get('rest/standardBookStoreController?batchDel', {
                params: {
                  ...data,
                },
              })
              .then((res) => {
                if (res.code === 20000) {
                  // self.selTreeLocation = {};
                  self.visible = false
                  self.confirmLoading = false
                  self.getData()
                  window.$oAntdMessage.success(res.msg || '删除成功！')
                } else {
                  window.$oAntdMessage.error(res.message || res.msg)
                }
              })
          },
          onCancel() {},
        })
      } else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择要删除的存放位置'))
      }
    },
    delLoalhost() {
      let self = this
      if (this.selTreeLocation.id) {
        window.$oAntdConfirm({
          title: '提示',
          content: '确认删除存放位置?',
          cancelText: '取消',
          okText: '确定',
          onOk() {
            let data = {
              id: self.selTreeLocation.id,
            }
            window.$oAjax
              .get('rest/standardBookLocationController?del', {
                params: {
                  ...data,
                },
              })
              .then((res) => {
                if (res.code === 20000) {
                  self.selTreeLocation = {}
                  self.visible = false
                  self.confirmLoading = false
                  self.getTreeData()
                  window.$oAntdMessage.success(res.msg || '删除成功！')
                } else {
                  window.$oAntdMessage.error(res.message || res.msg)
                }
              })
          },
          onCancel() {},
        })
      } else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择要删除的存放位置'))
      }
    },
    showModalAddEdit() {
      // if (this.typeId) {
      this.rangeId = ''
      setTimeout(() => {
        this.selectedRowKeys = []
        this.$refs.addBookRef.showModal()
      }, 100)
      // } else {
      //   window.$oAntdModal.warning(window.$oMsgTips.info("请选择设计级配类型"));
      // }
    },
    handleOkAddEditCall() {
      this.getData(this.rangeId)
    },
    editLoalhost(flag) {
      if (flag) {

      }
      this.showModal()
    },

    editTable(record) {
      // if (this.typeId) {
      //   if (this.rangeId) {
      //     this.rangeId ? this.$refs.addBookRef.showModal() : "";
      //   } else {
      //     window.$oAntdModal.warning(window.$oMsgTips.info("请选择级配范围"));
      //   }
      // } else {
      //   window.$oAntdModal.warning(window.$oMsgTips.info("请选择设计级配类型"));
      // }

      this.$refs.addBookRef.showModal()
    },
    cancelTable() {
      if (!this.typeId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择设计级配类型'))
        return
      }
      if (!this.rangeId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择级配范围'))
        return
      }
      let self = this
      window.$oAntdConfirm({
        title: '是否删除已创建筛孔尺寸？',
        content:
          '若已在UDR中引用该数据,删除后重新选择级配后原数据不可恢复,请谨慎操作。',
        onOk() {
          let data = {
            id: self.rangeId,
          }
          window.$oAjax
            .get(window.$oAjax.designGrade.rangeDeleteUrl, {
              params: {
                ...data,
              },
            })
            .then((res) => {
              self.cancelTableCall(res)
            })
        },
        onCancel() {},
      })
    },
    cancelTableCall(res) {
      if (res.success) {
        this.getData()
      }
    },
    getData() {

      // if (!this.locationForm.id) {
      //   window.$oAntdMessage.warn("请选择所在位置在进行查询");
      // }
      let { page, size } = this
      const data = {
        bookLocationId: this.selTreeLocation.id || '',
        quickQry: this.quickQry,
        page,
        size,
        ...this.sortParams,
      }
      this.sort ? (data[this.sort] = this.order) : ''
      this.loading = true
      window.$oAjax
        .get('rest/standardBookStoreController?dataGrid', {
          params: {
            ...data,
          },
        })
        .then((res) => {
          this.loading = false
          if (res.code === 20000) {
            this.standardData = res.data.rows.map((it) => {
              it.isExceed = this.checkDataExceed(it.expireDate)
              return it
            })
            this.pagination.total = res.data.total || 0
            this.pagination.current = page
            this.pagination.pageSize = size
            // this.getDataCall(res.obj, rangeId);
          }
        })
        .catch((err) => {
          this.loading = false
        })
    },
    getDataCall(res, rangeId) {
      if (res.rows) {
        this.data = res.rows
        // this.data = res.rows.sort((a, b)=> (b.screenSize || 0) - (a.screenSize || 0));
        if (rangeId) {
          this.rangeId = rangeId
        } else {
          setTimeout(() => {
            this.selectedRowKeys = []
          }, 100)
          this.rangeId = ''
        }
        this.loading = false
        if (this.data.length > 0) {
          // this.isDisabledDel = true;
        } else {
          // this.isDisabledDel = false;
        }
      } else if (res.msg) {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
      // #35562 需要让创建人才允许编辑
      this.isDisabledEditManage()
    },
    getTreeData() {
      const data = {
        // page: 1,
        // size: 9999,
        // queryParam: this.queryParam,
      }
      this.treeData = []
      window.$oAjax.get('rest/standardBookLocationController?list').then((res) => {

        if (res.code == '20000') {
          this.selectedKeys = []
          // this.getTreeDataCall(res.obj);
          this.treeData = res.data

          this.formTreeData = [
            {
              location: '/',
              id: '',
              pid: '',
              children: res.data,
            },
          ]
        }
      })
    },
    getTreeDataCall(res) {
      if (res.rows && res.rows.length > 0) {
        this.treeData = res.rows
        this.isShowTree = false
        this.renderTreeNodes(res.rows, true)
      } else {
        this.treeData = []
        this.isShowTree = true
      }
    },
    renderTreeNodes(data, defaultChecke) {
      for (let keys in data) {
        let item = data[keys]
        item.title = item.typeName
        item.key = item.id
        item.value = item.id
        if ('0' === keys && defaultChecke) {
          if (this.typeId) {
            this.typeId = this.typeId
            this.selectedKeys.push(this.typeId)
          } else {
            this.typeId = item.id
            this.selectedKeys.push(item.id)
            this.groupSel.push(item)
          }
          this.getData()
        }
        if (item.children && item.children.length) {
          this.renderTreeNodes(item.children)
        }
      }
    },
    onSelectlocation(v, lab, e) {},
    onSelect(selectedKeys, node) {
      this.selectedRowKeys = []
      this.selectedRows = []
      if (selectedKeys.length) {
        this.selTreeLocation.location =
          node.selectedNodes[0].location
        this.selTreeLocation.id = node.selectedNodes[0].id
        this.selTreeLocation.pid = node.selectedNodes[0].pid
      } else {
        this.selTreeLocation = {}
      }

      this.getData()
      // this.selectedKeys = selectedKeys;
      // if (info.selected) {
      //   let treeRow = info.selectedNodes[0];
      //   this.groupSel = [{ ...treeRow }];
      //   this.typeId = selectedKeys[0];
      //   this.pages = 1;
      //   if (this.isLoadRange) {
      //     setTimeout(() => {
      //       this.getData();
      //     }, 100);
      //   }
      //   this.isDisabledEditManage();
      // } else {
      //   this.groupSel = [];
      //   this.isDisabledEdit = true;
      //   // this.isDisabledDel = true;
      // }
    },
    quickSearch() {
      // 快速查询
      this.getData()
    },
    sorterChange(pagination, filters, sorter) {
      if (sorter.order) {
        let sorterObj = { ascend: 'asc', descend: 'desc' }
        this.sortParams = {
          dataOrder: sorterObj[sorter.order],
          dataOrderBy: sorter.field,
        }
      } else {
        this.sortParams = {}
      }
      this.getData()
    },
    // #35562 需要让创建人才允许编辑
    isDisabledEditManage() {
      // this.groupSel[0].createBy 属性为创建人
      let userInfo = JSON.parse(window.localStorage.getItem('userInfo'))
      if (userInfo.username === this.groupSel[0].createBy) {
        this.isDisabledEdit = false
      } else {
        this.isDisabledEdit = true
      }
    },
    /**
     * ## 出入库台账
     */
    exportOutInStore() {
      this.bookLocationId = this.selTreeLocation.id || ''
      this.outInVisible = true
      this.spinningOutIn = true
      window.$oNextTick(() => {
        document.getElementById('outInIframe').onload = () => {
          this.spinningOutIn = false
        }
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
.required label::before {
  content: '*';
  color: var(--colorError);
}
.outInModal .ant-modal {
  top: 5vh;
}
</style>
