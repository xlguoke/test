<template>
  <div class="archivingDetail">
    <div class="archivingDetail-head">
      <div style="font-size: 16px; font-weight: bold">
        {{ headerData ? headerData.name : '' }}
      </div>
      <div style="padding-top: 5px">
        {{ headerData ? headerData.intro : '' }}
      </div>
      <div v-if="reportObj && reportObj.showInfo" style="padding-top: 5px">
        报告归档情况：已归档报告
        <a
          v-if="reportObj && reportObj.archivedTotal"
          style="color: #40a9ff; text-decoration: underline"
          @click="goArchive('1')"
        >{{ reportObj && reportObj.archivedTotal }}</a>
        <span v-else style="color: #40a9ff">{{
          reportObj && reportObj.archivedTotal
        }}</span>

        份，未归档报告
        <a
          v-if="reportObj && reportObj.waitArchiveTotal"
          style="color: #40a9ff; text-decoration: underline"
          @click="goArchive('0')"
        >{{ reportObj && reportObj.waitArchiveTotal }}</a>
        <span v-else style="color: #40a9ff">{{
          reportObj && reportObj.waitArchiveTotal
        }}</span>
        份。
      </div>
      <div style="padding-top: 5px; color: red">
        当前需归档的资料：{{ mtodoObj }}
      </div>
    </div>
    <a-spin :spinning="spinning">
      <div class="archivingDetail-wrap">
        <div class="archivingDetail-left">
          <DetailFolder
            ref="DetailFolder"
            :add-edit-row="addEditRow"
            :callback="getData"
            :max-height="maxHeight - 80"
          />
        </div>
        <div class="archivingDetail-right">
          <a-button

            v-permission="'detailItemAdd'"
            @click="addEditRow"
          >
            增加资料项
          </a-button>
          <a-button style="margin-left: 5px" @click="viewLog">
            查看日志
          </a-button>
          <div
            v-if="rightData && rightData.length === 0"
            style="padding-top: 25px"
          >
            <a-divider style="color: gray; font-size: 14px">
              暂无数据
            </a-divider>
          </div>
          <div
            :style="`max-height:${
              maxHeight ? maxHeight : '400'
            }px;overflow-y:auto;`"
          >
            <div
              v-for="(item, index) in rightData"
              :key="item.id"
              class="archivingDetail-list"
            >
              <div class="archivingDetail-list-title">
                <CheckCircleFilled
                  v-if="item.isArchived !== null"
                  :style="`color: ${
                    item.isArchived === '1' ? 'green' : 'gray'
                  };cursor:pointer;`"
                />
                {{ item.name }}
                <ArrowsAltOutlined v-if="!item.children" class="archivingDetail-list-handleIcon" title="展开" @click="openData(item, index)" />
                <ShrinkOutlined v-else class="archivingDetail-list-handleIcon" title="收起" @click="closeData(item, index)" />
                <EditOutlined
                  v-permission="'detailItemAndCycleUpdate'"
                  class="archivingDetail-list-handleIcon"
                  title="编辑"
                  @click="editRow(item, index)"
                />
                <DeleteOutlined v-permission="'detailItemAndCycleDelete'" class="archivingDetail-list-handleIcon" title="删除" @click="deleteRow(item, index)" />
              </div>
              <div v-if="item.cycleType !== '2'">
                <ul v-if="item.children" class="archivingDetail-list-fileList">
                  <li v-for="file in item.children" :key="file.id">
                    <div v-if="file.dataType === 'ele'">
                      <strong>电子档案：</strong>
                      <a
                        href="javascript:;"
                        style="color: #40a9ff; text-decoration: underline"
                        @click="downloadAccessory(file.attachId)"
                      >{{ file.dataName }}</a>
                      <span style="color: #999; margin-left: 15px">{{ file.archiveUserName }}
                        {{
                          (file.uploadDate,
                           dayjs(file.uploadDate).format('YYYY-MM-DD HH:mm:ss'))
                        }}</span>
                      <DeleteOutlined v-permission="'detailItemDataDelete'" class="archivingDetail-list-handleIcon" title="删除" @click="delArchives(file, item, index, undefined, item)" />
                    </div>
                    <div v-else-if="file.dataType === 'paper'">
                      <strong>纸质档案：</strong>
                      <span>{{ file.dataName }}</span>
                      <strong style="margin-left: 15px">归档地址：</strong>
                      <span>{{ file.archiveAddress }}</span>
                      <strong style="margin-left: 15px">档案编号：</strong>
                      <span>{{ file.dataNo }}</span>
                      <strong style="margin-left: 15px">归档人员及日期：</strong>
                      <span>{{ file.archiveUserName }} {{ file.archiveTime }}</span>
                      <EditOutlined
                        v-permission="'detailItemDataUpdate'"
                        class="archivingDetail-list-handleIcon"
                        title="编辑"
                        @click="
                          editArchives(file, item, index, undefined, item)
                        "
                      />
                      <DeleteOutlined v-permission="'detailItemDataDelete'" class="archivingDetail-list-handleIcon" title="删除" @click="delArchives(file, item, index, undefined, item)" />
                    </div>
                  </li>
                  <li>
                    <a-button

                      v-permission="'detailItemDataAdd'"
                      @click="openAddArchives(item, index, undefined, item)"
                    >
                      新增档案
                    </a-button>
                    <span
                      v-if="item.children.length === 0 && item.cycleType === '1'"
                    >
                      <a-button

                        v-if="item.isArchived === '0'"

                        v-permission="'detailDataMark'"
                        @click="markFun(item, true, '1', item)"
                      >标记为已归档</a-button>
                      <a-button

                        v-if="item.isArchived === '1'"

                        v-permission="'detailDataMark'"
                        @click="markFun(item, false, '1', item)"
                      >标记为未归档</a-button>
                    </span>
                  </li>
                </ul>
              </div>
              <div v-else-if="item.cycleType === '2'">
                <ul
                  v-if="item.children && item.children.length > 0"
                  class="archivingDetail-list-timeline"
                >
                  <li
                    v-for="(time, timeIndex) in item.children"
                    :key="timeIndex"
                  >
                    <div class="archivingDetail-list-title">
                      <CheckCircleFilled
                        v-if="time.isArchived !== null"
                        theme="filled"
                        :style="`color:${
                          time.isArchived === '1' ? 'green' : 'gray'
                        };cursor:pointer;`"
                      />
                      {{ dayjs(time.cycleTime).format('YYYY-MM-DD') }}
                      <ArrowsAltOutlined v-if="!time.children" class="archivingDetail-list-handleIcon" title="展开" @click="openData(time, index, timeIndex)" />
                      <ShrinkOutlined v-else class="archivingDetail-list-handleIcon" title="收起" @click="closeData(time, index, timeIndex)" />
                      <EditOutlined
                        v-permission="'detailItemAndCycleUpdate'" class="archivingDetail-list-handleIcon" title="编辑" @click="
                          editCycleTime(time, index, timeIndex)
                        "
                      />
                      <DeleteOutlined v-permission="'detailItemAndCycleDelete'" class="archivingDetail-list-handleIcon" title="删除" @click="delCycleTime(time, index, timeIndex, item)" />
                    </div>
                    <ul
                      v-if="time.children"
                      class="archivingDetail-list-fileList"
                    >
                      <li v-for="file in time.children" :key="file.id">
                        <div v-if="file.dataType === 'ele'">
                          <strong>电子档案：</strong>
                          <a
                            href="javascript:;"
                            style="color: #40a9ff; text-decoration: underline"
                            @click="downloadAccessory(file.attachId)"
                          >{{ file.dataName }}</a>
                          <span style="color: #999; margin-left: 15px">{{ file.archiveUserName }}
                            {{
                              file.uploadDate
                                ? dayjs(file.uploadDate).format(
                                  'YYYY-MM-DD HH:mm:ss',
                                )
                                : ''
                            }}</span>
                          <DeleteOutlined v-permission="'detailItemDataDelete'" class="archivingDetail-list-handleIcon" title="删除" @click="delArchives(file, time, index, timeIndex, item)" />
                        </div>
                        <div v-else-if="file.dataType === 'paper'">
                          <strong>纸质档案：</strong>
                          <span>{{ file.dataName }}</span>
                          <strong style="margin-left: 15px">归档地址：</strong>
                          <span>{{ file.archiveAddress }}</span>
                          <strong style="margin-left: 15px">档案编号：</strong>
                          <span>{{ file.dataNo }}</span>
                          <strong style="margin-left: 15px">归档人员及日期：</strong>
                          <span>{{ file.archiveUserName }}
                            {{ file.archiveTime }}</span>
                          <EditOutlined
                            v-permission="'detailItemDataUpdate'" class="archivingDetail-list-handleIcon" title="编辑" @click="
                              editArchives(file, time, index, timeIndex, item)
                            "
                          />
                          <DeleteOutlined v-permission="'detailItemDataDelete'" class="archivingDetail-list-handleIcon" title="删除" @click="delArchives(file, time, index, timeIndex, item)" />
                        </div>
                      </li>
                      <li>
                        <a-button

                          v-permission="'detailItemDataAdd'"
                          @click="openAddArchives(time, index, timeIndex, item)"
                        >
                          新增档案
                        </a-button>
                        <span v-if="time.children.length === 0">
                          <a-button

                            v-if="time.isArchived === '0'"
                            @click="markFun(time, true, '2', item)"
                          >标记为已归档</a-button>
                          <a-button

                            v-if="time.isArchived === '1'"
                            @click="markFun(time, false, '2', item)"
                          >标记为未归档</a-button>
                        </span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
    <AddEditComponent ref="AddEditComponent" :callback="showTree" />
    <ArchiveSituation ref="ArchiveSituation" />
    <AddArchives ref="AddArchives" />
    <Logs ref="Logs" />
    <ht-modal
      :title="materialtitle || '编辑资料项名称'"
      :mask-closable="false"
      :open="materialVis"
      :confirm-loading="materialLoading"
      @ok="materialOk"
      @cancel="materialCancel"
    >
      <a-form-item
        v-if="isEditDate"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 17 }"
        label="请选择日期："
      >
        <a-date-picker
          v-model:value="materialDate"
          @change="(e) => handleChange(e)"
        />
        <!-- {{materialDate?dayjs(materialDate).format('YYYY-MM-DD'):undefined -->
        <!-- :v-model="dayjs(materialDate).format('YYYY-MM-DD')" -->
        <!-- }} -->
      </a-form-item>
      <a-form-item
        v-else
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 17 }"
        label="请输入资料项名称："
      >
        <a-input v-model:value="materialName" placeholder="请输入" />
      </a-form-item>
    </ht-modal>
    <AddFile ref="AddFile" />
  </div>
</template>

<script>
import { ArrowsAltOutlined, CheckCircleFilled, DeleteOutlined, EditOutlined, ShrinkOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { downloadAccessory, getQueryVariable } from '~/providers/common/utils'
import DetailFolder from '~/providers/components/archive/detailFolder.vue'
import Logs from '~/providers/components/logs.vue'
import AddArchives from './components/addArchives.vue'
import AddEditComponent from './components/addEdit.vue'
import AddFile from './components/addFile.vue'
import ArchiveSituation from './components/archiveSituation.vue'

// const columns = [{
//   title: '归档资料项',
//   dataIndex: 'name',
//   width: '25%',
//   scopedSlots: {customRender: 'name'}
// },{
//   title: '归档类型',
//   dataIndex: 'cycleType',
//   width: '30%',
//   scopedSlots: {customRender: 'cycleType'}
// },  {
//   title: '默认归档频率',
//   dataIndex: 'cycle',
//   width: '25%',
//   scopedSlots: {customRender: 'cycle'}
// }, {
//   title: '操作',
//   dataIndex: 'operation',
//   width: '20%',
//   scopedSlots: {customRender: 'operation'}
// }];
export default {
  name: 'List',
  components: {
    DetailFolder,
    AddEditComponent,
    ArchiveSituation,
    AddArchives,
    AddFile,
    Logs,
    ArrowsAltOutlined,
    CheckCircleFilled,
    DeleteOutlined,
    EditOutlined,
    ShrinkOutlined,
  },
  data() {
    return {
      // columns,
      maxHeight: null,
      indexInfo: {},
      downloadAccessory,
      dayjs,
      spinning: false,
      documentId: getQueryVariable('documentId') || '',
      rightData: [],
      reportObj: null,
      materialVis: false,
      materialLoading: false,
      materialtitle: '编辑资料项名称',
      materialName: '',
      materialDate: undefined,
      isEditDate: false,
      materialId: '',
      treeSelectObj: {},
      mtodoObj: null,
      headerData: null,
      archiveName: '',
    }
  },
  computed: {},
  created() {
    this.getReport()
    this.mtodoDataFun()
    this.getDocument()
    // 进入页面获取右侧全部数据
    // this.getData();
  },
  mounted() {
    this.maxHeight
      = document.body.clientHeight
        - document.getElementsByClassName('archivingDetail-head')[0].clientHeight
        - 200
  },
  methods: {
    getDocument() {
      this.spinning = true
      window.$oAjax({
        method: 'get',
        url: window.$oApi.archiving.getById,
        params: { id: this.documentId },
      }).then((res) => {
        if (res.code === 20000) {
          this.headerData = res.data
          this.archiveName = res.data.name
          this.showTree()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          this.headerData = null
        }
        this.spinning = false
      })
    },
    getReport() {
      // this.spinning = true;
      window.$oAjax({
        method: 'get',
        url: window.$oApi.archivingDetail.getReport,
        params: { documentId: this.documentId },
      }).then((res) => {
        if (res.code === 20000) {
          this.reportObj = res.data
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    // 当前需要归档的资料
    mtodoDataFun() {
      this.spinning = false
      window.$oAjax({
        method: 'get',
        url: window.$oApi.archivingDetail.mtodoDataUrl,
        params: { documentId: this.documentId },
      }).then((res) => {
        if (res.code === 20000) {
          this.mtodoObj = res.data
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    markFun(row, isMark, pType, parentNode) {
      let url = window.$oApi.archivingDetail.unMarkUrl
      if (isMark) {
        url = window.$oApi.archivingDetail.markUrl
      }
      window.$oAjax({
        method: 'get',
        url,
        params: { pType, objectId: row.id },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')

          // 重新请求当前节点
          this.reloadTree(parentNode)
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    // 打开新增档案弹窗 增加index和timeIndex参数，用于新增后刷新
    openAddArchives(row, index, timeIndex, parentNode) {
      const data = { ...row }
      this.indexInfo = {
        data: row,
        index,
        timeIndex,
        parentNode,
      }
      this.$refs.AddArchives.showModal(data, this.documentId)
    },
    // 编辑纸质文档
    editArchives(file, time, index, timeIndex, parentNode) {
      this.indexInfo = {
        data: time,
        index,
        timeIndex,
        parentNode,
      }
      this.$refs.AddFile.showModal(file)
    },
    // 编辑周期
    editCycleTime(time, index, timeIndex) {
      this.indexInfo = {
        data: time,
        index,
        timeIndex,
      }
      this.materialDate = dayjs(new Date(time.cycleTime))
      this.materialtitle = '修改时间节点'
      this.materialId = time.id
      this.isEditDate = true
      this.materialVis = true
    },
    handleChange(value) {
      this.materialDate = value
    },
    // 删除增档案
    delArchives(file, time, index, timeIndex, parentNode) {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk() {
          self.spinning = true
          window.$oAjax
            .delete(`${window.$oApi.archivingDetail.delArchives}/${file.id}`)
            .then((res) => {
              if (res.code === 20000) {
                window.$oAntdMessage.success('删除成功')
                self.openData(time, index, timeIndex)
                self.reloadTree(parentNode)
              }
              else {
                window.$oAntdMessage.error(res.msg || res.message)
              }
              self.spinning = false
            })
        },
      })
    },
    // 删除周期
    delCycleTime(time, index, timeIndex, parentNode) {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '周期及周期以下的档案资料将一并被删除，是否继续？',
        onOk() {
          self.spinning = true
          window.$oAjax
            .delete(`${window.$oApi.archivingDetail.delCycleTime}/${time.id}`)
            .then((res) => {
              if (res.code === 20000) {
                window.$oAntdMessage.success('删除成功')
                self.openData(parentNode, index, timeIndex)
              }
              else {
                window.$oAntdMessage.error(res.msg || res.message)
              }
              self.spinning = false
            })
        },
      })
    },
    // 获取右侧数据
    async getTreeData(row) {
      let params = {}
      if (row.id) {
        params = {
          type: row.typeOfItem,
          id: row.id,
        }
      }
      else {
        params = {
          documentId: this.documentId,
        }
      }

      return await window.$oAjax({
        url: window.$oApi.archivingDetail.listMaterial,
        params,
      })
    },
    // 展开下级数据
    async openData(row, index, timeIndex) {
      const res = await this.getTreeData(row)

      if (res.code === 20000) {
        if (row.cycleType === '2' && index !== undefined) {
          this.rightData[index].children = res.data
        }
        else if (
          row.typeOfItem === '3'
          && index !== undefined
          && timeIndex !== undefined
        ) {
          this.rightData[index].children[timeIndex].children = res.data
        }
        else if (
          (row.cycleType === '1' || row.cycleType === '3')
          && index !== undefined
        ) {
          this.rightData[index].children = res.data
        }
        window.$oForceUpdate()
      }
    },
    closeData(row, index, timeIndex) {
      if (
        (row.cycleType === '1'
          || row.cycleType === '2'
          || row.cycleType === '3')
        && index !== undefined
      ) {
        delete this.rightData[index].children
      }
      if (
        row.typeOfItem === '3'
        && index !== undefined
        && timeIndex !== undefined
      ) {
        delete this.rightData[index].children[timeIndex].children
      }
      window.$oForceUpdate()
    },
    goArchive(tabsType) {
      if (this.reportObj.showDetail) {
        this.$refs.ArchiveSituation.showModal(
          this.reportObj.reportArchiveCounts,
        )
      }
      else {
        const projectIds
          = this.reportObj.projectIds.length > 0
            ? this.reportObj.projectIds[0]
            : ''
        const consignUnitId = this.reportObj.consignUnitId
          ? this.reportObj.consignUnitId
          : ''
        const url = `archiveController.do?goListPage&dataType=${tabsType}&isCurrencyArchive=1&consignUnitId=${
          consignUnitId || ''
        }&consignProjectId=${projectIds}`

        top.addTabs
        && top.addTabs({
          id: '1',
          title: '报告归档情况',
          close: false,
          url,
        })
      }
    },
    // 查看日志
    viewLog() {
      this.$refs.Logs.showModal(this.documentId, '22')
    },
    showTree() {
      window.$oNextTick(() => {
        this.$refs.DetailFolder.showModal(this.archiveName)
      })
    },
    getData(dataObj) {
      let params = {}
      this.treeSelectObj = {}
      this.rightData = []
      if (dataObj) {
        params = {
          type: dataObj.typeOfItem,
          id: dataObj.id,
        }
        this.treeSelectObj = { ...dataObj }
      }
      else {
        params = {
          documentId: this.documentId,
        }
      }
      // 获取右侧数据
      window.$oAjax({
        url: window.$oApi.archivingDetail.listMaterial,
        params,
      }).then((res) => {
        if (res.code === 20000) {
          this.rightData = res.data
        }
        else {
          this.rightData = []

          if (res.success === false) {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        }
      })
    },
    // 增加资料项
    addEditRow(e, data) {
      let treeData = this.$refs.DetailFolder.treeData
      let isQuote = false
      if (data) {
        treeData = data
        isQuote = true
      }
      this.$refs.AddEditComponent.showModal(this.archiveName, treeData, isQuote)
    },
    // 编辑资料项
    editRow(item, index) {
      this.indexInfo = {
        data: item,
        index,
      }
      this.materialtitle = '编辑资料项名称'
      this.materialName = item.name
      this.materialId = item.id
      this.materialVis = true
    },
    materialOk() {
      this.materialLoading = true
      let url = window.$oApi.archivingDetail.updateMaterial
      let data = null
      if (this.materialName) {
        data = { name: this.materialName, id: this.materialId }
      }
      if (this.materialDate) {
        url = window.$oApi.archivingDetail.updateCycleTime
        data = {
          cycleTime: dayjs(this.materialDate).format('YYYY-MM-DD'),
          id: this.materialId,
        }
      }

      window.$oAjax({
        url,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('修改成功')
          if (
            this.isEditDate === true
            && this.indexInfo.index !== undefined
            && this.indexInfo.timeIndex !== undefined
          ) {
            this.rightData[this.indexInfo.index].children[
              this.indexInfo.timeIndex
            ].cycleTime = this.materialDate
          }
          else if (
            this.isEditDate === false
            && this.indexInfo.index !== undefined
          ) {
            this.rightData[this.indexInfo.index].name = data.name
          }
          this.materialCancel()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.materialLoading = false
      })
    },
    materialCancel() {
      this.materialName = ''
      this.materialId = ''
      this.materialDate = undefined
      this.isEditDate = false
      this.materialVis = false
    },
    // 删除资料项
    deleteRow(item, index) {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '系统将删除该资料项及文件，是否继续?',
        onOk() {
          self.spinning = true
          window.$oAjax
            .delete(`${window.$oApi.archivingDetail.deleteMaterial}/${item.id}`)
            .then((res) => {
              if (res.code === 20000) {
                window.$oAntdMessage.success('删除成功')
                self.rightData.splice(index, 1)
              }
              else {
                window.$oAntdMessage.error(res.msg || res.message)
              }
              self.spinning = false
            })
        },
      })
    },
    // 新增后刷新
    reloadList() {
      this.reloadTree(this.indexInfo.parentNode)
    },
    // 更新请求当前操作的树
    async reloadTree(row) {
      this.spinning = true
      const res = await this.getTreeData(this.treeSelectObj)
      if (res.data.find(i => i.id === row.id)) {
        row.isArchived = res.data.find(i => i.id === row.id).isArchived
      }

      if (row.cycleType === '2') {
        const obj = []
        for (let i = 0; i < row.children.length; i++) {
          if (Array.isArray(row.children[i].children)) {
            obj.push({ id: row.children[i].id, data: row.children[i] })
          }
        }

        const timeRes = await this.getTreeData(row)
        row.children = timeRes.data

        for (let j = 0; j < obj.length; j++) {
          const fileRes = await this.getTreeData(row.children[j])
          const timeIndex = row.children.findIndex(k => k.id === obj[j].id)
          if (timeIndex !== -1) {
            row.children[timeIndex].children = fileRes.data
          }
        }
      }
      else {
        const normalRes = await this.getTreeData(row)
        row.children = normalRes.data
      }
      window.$oForceUpdate()
      this.spinning = false
    },
  },
}
</script>

<style lang="less" scoped>
.archivingDetail {
  padding: 15px;
  color: #333;
  .ant-btn {
    padding: 0 8px;
  }

  .archivingDetail-wrap {
    border: solid 1px #c2c2c2;
    margin-top: 8px;
    padding: 15px;
    position: relative;

    &::after {
      content: '';
      display: block;
      clear: both;
    }

    &::before {
      content: '';
      display: block;
      width: 1px;
      height: 100%;
      top: 0;
      left: 385px;
      position: absolute;
      background: #c2c2c2;
    }
  }

  .archivingDetail-left {
    width: 370px;
    float: left;
    padding-right: 15px;

    :deep(.dataCollection-search) {
      margin-top: -10px;
    }
  }

  .archivingDetail-right {
    overflow: hidden;
    padding-left: 15px;
  }

  .archivingDetail-list {
    padding-top: 15px;

    .archivingDetail-list-title {
      font-size: 14px;
      font-weight: bold;

      .anticon-check-circle {
        margin-right: 5px;
        color: gray;
      }

      &:hover {
        .archivingDetail-list-handleIcon {
          display: inline-block;
        }
      }
    }
  }

  .archivingDetail-list-fileList {
    padding-left: 20px;

    & > li {
      margin-top: 5px;

      & > div:hover {
        .archivingDetail-list-handleIcon {
          display: inline-block;
        }
      }
    }
  }

  .archivingDetail-list-timeline {
    padding-left: 20px;

    & > li {
      margin-top: 10px;
    }

    .archivingDetail-list-fileList {
      padding-left: 0;
    }
  }

  .archivingDetail-list-handleIcon {
    margin-left: 4px;
    cursor: pointer;
    color: #40a9ff;
    font-size: 16px;
    display: none;

    &.anticon-delete {
      color: red;
    }
  }
}
</style>
