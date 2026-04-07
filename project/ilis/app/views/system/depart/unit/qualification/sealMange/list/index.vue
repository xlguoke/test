<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="sealMange">
    <div class="sealMange-left">
      <ComHeader>印章列表</ComHeader>
      <div class="mt-4 mb-4">
        <a-button type="primary" @click="add">
          新增
        </a-button>
        <a-button @click="edit">
          编辑
        </a-button>
        <a-button @click="deleteRow">
          删除
        </a-button>
      </div>
      <a-table
        :custom-row="customRow"
        :row-selection="{
          type: 'radio',
          hideDefaultSelections: false,
          selectedRowKeys,
          onChange: onSelectChange,
        }"
        :columns="columns"
        :data-source="data"
        :loading="loading"
        bordered
        :pagination="false"
        row-key="id"
        :row-class-name="rowClassName"
        :scroll="scroll"
      >
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'autoSign'">
            打印即标记已签章
            <a-tooltip placement="top">
              <template #title>
                <span>开启后，在打印报告时，有该印章的报告，将自动标记为已签章</span>
              </template>
              <QuestionCircleOutlined style="color: #1890ff" />
            </a-tooltip>
          </template>
        </template>

        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'autoSign'">
            <a-switch
              v-model:checked="record.autoSign"
              @change="
                (val) => {
                  setAutoSign(record)
                }
              "
            />
          </template>

          <template v-if="column.dataIndex === 'name'">
            <span
              style="margin-right: 4px"
              :title="`${text}[${
                record.sealType === 'QUALIFY' ? '资质' : record.sealType === 'PROJECT' ? '项目' : '其他'
              }]`"
            >{{ text }}</span>
            <a-tooltip
              destroy-tooltip-on-hide
              @visible-change="
                (visible) => {
                  visibleChange(visible, record)
                }
              "
            >
              <template #title>
                <span v-if="record._qualificationName">{{
                  record._qualificationName
                }}</span>
                <LoadingOutlined v-else />
              </template>
              <a-tag v-if="record.sealType === 'QUALIFY'" color="#f59a23">
                资质
              </a-tag>
              <a-tag v-if="record.sealType === 'OTHER'" color="#97c21c">
                其他
              </a-tag>
              <a-tag v-if="record.sealType === 'PROJECT'" color="#0066ec">
                项目
              </a-tag>
            </a-tooltip>
          </template>

          <template v-if="column.dataIndex === 'action'">
            <DragOutlined class="drag-handler" />
          </template>
        </template>
      </a-table>
    </div>

    <div ref="dragEle" class="sealMange-handler"></div>

    <div ref="areaEle" class="sealMange-right">
      <ComHeader v-if="selectedRow">
        {{ selectedRow.name }}印章版本
      </ComHeader>
      <ComHeader v-else>
        印章版本
      </ComHeader>
      <div style="height: 28px" class="mt-4 mb-4">
        <a-button
          v-if="showVersionBtn"
          type="primary"
          @click="addVersion"
        >
          新增
        </a-button>
        <a-button
          v-if="showVersionBtn"
          @click="editVersion"
        >
          编辑
        </a-button>
      </div>
      <a-table
        :row-selection="{
          selectedRowKeys: versionSelectRowKeys,
          onChange: onVersionSelectChange,
        }"
        :columns="versionColumns"
        :data-source="versionData"
        :loading="versionLoading"
        bordered
        :pagination="false"
        row-key="id"
        :row-class-name="rowClassName"
        :scroll="scroll2"
        :locale="{ emptyText }"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'sealStampFilePath'">
            <a href="javascript:;" class="text-blue-500" @click="onCheckImg(text)">点击预览</a>
          </template>

          <template v-if="column.dataIndex === 'verticalLocation'">
            <a href="javascript:;" class="text-blue-500" @click="coordinateConfig(record, 'vertical')">
              {{ record.verticalLocation.locationX }},{{
                record.verticalLocation.locationY
              }}
            </a>
          </template>

          <template v-if="column.dataIndex === 'horizontalLocation'">
            <a
              href="javascript:;"
              class="text-blue-500"
              @click="coordinateConfig(record, 'horizontal')"
            >
              {{ record.horizontalLocation.locationX }},{{
                record.horizontalLocation.locationY
              }}
            </a>
          </template>

          <template v-if="column.dataIndex === 'qualificationCertificateFilePath'">
            <a-button v-if="text" type="link" @click="onCheckFile(record)">
              点击查看
            </a-button>
            <a-upload
              v-if="!text"
              name="file"
              :multiple="false"
              :show-upload-list="false"
              accept=".pdf"
              :before-upload="(file) => beforeUploadFile(file, record)"
            >
              <a-tooltip placement="top">
                <template #title>
                  <span>仅支持pdf格式，&#60;50M</span>
                </template>
                <a-button type="link" :loading="record.uploadFileLoading">
                  点击上传
                </a-button>
              </a-tooltip>
            </a-upload>
            <span v-if="!text" style="color: #aaa; font-size: 12px">(仅支持pdf格式，&#60;50M)</span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 印章新增/编辑 -->
    <EditModal
      ref="EditModal"
      v-model:value="visible"
      :edit-id="editId"
      @on-save="getData"
    />

    <!-- 印章版本新增/编辑 -->
    <VersionEditModal
      v-model:value="versionVisible"
      :edit-id="versionEditId"
      :seal="selectedRow"
      @on-save="getSealVersions"
    />

    <!-- 印章版本坐标配置 -->
    <CoordinateConfigModal
      v-model:value="coordinateVisible"
      :version-data="versionRowData"
      :seal="selectedRow"
      :location-type="locationType"
      @on-save="getSealVersions"
    />
  </div>
</template>

<script>
import { DragOutlined, LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import { downloadFile } from '~/providers/common/utils'
import ComHeader from '~/providers/components/comHeader/index.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { SealMangeClient } from '~/providers/providers/clients/seal-mange-client'
import { SealService } from '~/providers/providers/services/common-body-seal'
import { UploadControllerService } from '~/providers/providers/services/uploadController'
import { DragView } from '~/providers/providers/utils/drag-view'
import CoordinateConfigModal from './components/coordinateConfigModal.vue'
import EditModal from './components/editModal.vue'
import VersionEditModal from './components/versionEditModal.vue'

const sealMangeClient = new SealMangeClient()
const sealService = new SealService()
const uploadControllerService = new UploadControllerService()

const dragInfo = {
  sourceId: null,
  sourceSort: null,

  targetId: null,
  targetSort: null,
}

export default {
  components: {
    EditModal,
    ComHeader,
    VersionEditModal,
    CoordinateConfigModal,
    DragOutlined,
    LoadingOutlined,
    QuestionCircleOutlined,
  },
  data() {
    return {
      rootUrl,
      data: [],
      selectPage: 'radio',
      loading: false,
      visible: false,
      versionVisible: false,
      coordinateVisible: false,
      locationType: 'horizontal',
      versionRowData: null,
      editId: null,
      versionEditId: null,
      scroll: {
        y: document.body.clientHeight - 170,
        scrollToFirstRowOnChange: true,
      },
      scroll2: {
        y: document.body.clientHeight - 170,
        scrollToFirstRowOnChange: true,
        x: 600,
      },
      columns: sealMangeClient.tableColumns,
      versionData: [],
      versionLoading: false,
      versionSelectRowKeys: [],
      selectedRowKeys: [],
      dragRow: null,
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.getSealVersions()
          },
          onMouseenter: (event) => {
            const ev = event || window.event
            ev.target.draggable = true
          },
          onDragstart: (event) => {
            const ev = event || window.event
            ev.stopPropagation()
            dragInfo.sourceId = record.id
            dragInfo.sourceSort = record.sort
          },
          onDragover: (event) => {
            const ev = event || window.event
            ev.preventDefault()
          },
          onDragenter: (event) => {
            const ev = event || window.event
            ev.preventDefault()

            dragInfo.targetId = record.id
            dragInfo.targetSort = record.sort

            // 设置拖动高亮效果
            const list = document.getElementsByClassName('ant-table-row')
            const node = document.getElementsByClassName('target')
            if (node.length) {
              node[0].classList.remove('target-top')
              node[0].classList.remove('target-bottom')
              node[0].classList.remove('target')
            }

            const index = this.data.findIndex(
              i => i.id === dragInfo.targetId,
            )
            if (index !== -1) {
              list[index].classList.add('target')

              if (dragInfo.targetSort <= dragInfo.sourceSort) {
                list[index].classList.add('target-top')
              }
              else {
                list[index].classList.add('target-bottom')
              }
            }
          },
          // 鼠标松开
          onDrop: (event) => {
            const ev = event || window.event
            ev.stopPropagation()

            dragInfo.targetId = record.id

            // 取消高亮效果
            const node = document.getElementsByClassName('target')
            if (node.length) {
              node[0].classList.remove('target-top')
              node[0].classList.remove('target-bottom')
              node[0].classList.remove('target')
            }

            this.dragSort()
          },
          style: {
            cursor: 'pointer',
          },
        }
      },
    }
  },
  computed: {
    versionColumns() {
      const columns = sealMangeClient.versionTableColumns
      const selectedRow = this.selectedRow

      if (selectedRow && selectedRow.sealType === 'QUALIFY') {
        return columns
      }

      return columns.filter(
        i => i.dataIndex !== 'qualificationCertificateFilePath',
      )
    },
    emptyText() {
      const { selectedRow } = this

      if (!selectedRow) {
        return '请先选择印章'
      }

      if (selectedRow.formatType === '10') {
        return '不签章，无印章版本'
      }

      return '暂无数据'
    },
    showVersionBtn() {
      const selectedRow = this.selectedRow

      if (selectedRow && selectedRow.formatType !== '10') {
        return true
      }

      return false
    },
    selectedRow() {
      const { selectedRowKeys } = this
      const selectedId = selectedRowKeys[0]

      if (selectedId) {
        return this.data.find(i => i.id === selectedId)
      }

      return null
    },
  },
  created() {
    this.getData()
  },
  mounted() {
    // eslint-disable-next-line no-new
    new DragView({
      dragEle: this.$refs.dragEle,
      areaEle: this.$refs.areaEle,
    })
  },
  methods: {
    async visibleChange(visible, record) {
      if (visible) {
        const res = await sealService.getQualificationInfoBySeal(record.id)
        if (res.code === 20000) {
          if (res.data) {
            record._qualificationName = res.data.name
          }
          else {
            record._qualificationName = '无'
          }
        }
      }
    },
    async dragSort() {
      if (dragInfo.sourceId === dragInfo.targetId) {
        return
      }

      const list = [...this.data]
      const sourceIndex = list.findIndex(i => i.id === dragInfo.sourceId)
      const targetIndex = list.findIndex(i => i.id === dragInfo.targetId)

      const sourceItem = list.splice(sourceIndex, 1)
      list.splice(targetIndex, 0, ...sourceItem)

      this.loading = true
      const res = await sealService.sort(
        list.map((i, index) => ({
          ...i,
          sort: index + 1,
        })),
      )
      this.loading = false

      if (res.code !== 20010) {
        window.$oAntdMessage.success('操作成功')
        this.getData()
      }
    },
    onCheckImg(url) {
      const wWidth = window.screen.width
      const hHeight = window.screen.height
      window.open(
        url,
        url,
        `height=380, width=380, top=${hHeight / 2 - 190}, left=${
          wWidth / 2 - 190
        }`,
      )
    },
    onCheckFile(row) {
      window.$oAjax({
        url: row.qualificationCertificateFilePath,
        method: 'get',
        responseType: 'blob',
      }).then((res) => {
        const blob = new Blob([res])
        const url = window.URL.createObjectURL(blob)
        const arr = row.qualificationCertificateFilePath.split('/')
        downloadFile(url, arr[arr.length - 1])
      })
    },
    beforeUploadFile(file, record) {
      const max = 50 * 1024 * 1024

      if (file.size > max || file.type !== 'application/pdf') {
        window.$oAntdModal.warning({
          title: '提示',
          content: '仅支持上传小于50M的pdf格式文件',
        })
        return
      }

      record.uploadFileLoading = true
      uploadControllerService
        .upload(file)
        .then(async (res) => {
          if (res.success) {
            const row = res.obj[0]
            const formData = {
              sealVersionId: record.id,
              qualificationCertificateFileId: row.id,
              qualificationCertificateFilePath: row.realpath,
            }
            const saveRes = await sealService.upload(formData).finally(() => {
              record.uploadFileLoading = false
            })

            if (saveRes.code !== 20010) {
              window.$oAntdMessage.success('上传成功')
              this.getSealVersions()
            }
          }
          else {
            record.uploadFileLoading = false
            window.$oAntdModal.warning({
              title: '提示',
              content: res.message || res.msg || '文件上传失败',
            })
          }
        })
        .catch(() => {
          record.uploadFileLoading = false
        })

      return false
    },
    async setAutoSign(row) {
      event.stopPropagation()

      this.loading = true
      const res = await sealService.switcher(row.id).finally(() => {
        this.loading = false
      })

      if (res.code !== 20010) {
        window.$oAntdMessage.success('操作成功')
        this.getData()
      }
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    async getData() {
      this.loading = true
      const res = await sealService.pagination(1, 999)
      this.data = res.data.map(i => ({
        ...i,
        _qualificationName: null,
      }))
      if (this.selectedRow) {
        this.getSealVersions()
      }
      this.loading = false
    },
    addVersion() {
      this.versionEditId = null
      this.versionVisible = true
    },
    editVersion() {
      const { versionSelectRowKeys } = this

      if (versionSelectRowKeys.length === 0) {
        window.$oAntdModal.warning({
          title: '提示',
          content: '请选择要编辑的数据',
        })
        return
      }

      if (versionSelectRowKeys.length > 1) {
        window.$oAntdModal.warning({
          title: '提示',
          content: '请选择一条数据进行操作',
        })
        return
      }

      this.versionEditId = versionSelectRowKeys[0]
      this.versionVisible = true
    },
    coordinateConfig(versionRowData, locationType) {
      this.versionRowData = versionRowData
      this.locationType = locationType
      this.coordinateVisible = true
    },
    add() {
      this.editId = null
      this.visible = true
    },
    edit() {
      const { selectedRowKeys } = this

      if (selectedRowKeys.length === 0) {
        window.$oAntdModal.warning({
          title: '提示',
          content: '请选择要编辑的数据',
        })
        return
      }

      this.editId = selectedRowKeys[0]
      this.visible = true
    },
    getDelTip(text) {
      const result = []
      result.push(h('p', '删除后将无法恢复！请谨慎删除！'))

      if (text) {
        result.push(
          h(
            'p',
            {
              style: {
                marginTop: '8px',
              },
            },
            [
              h('input', {
                style: {
                  verticalAlign: 'middle',
                  marginRight: '4px',
                  marginBottom: '4px',
                },
                attrs: {
                  type: 'checkbox',
                  id: 'delSealVersion',
                },
              }),
              `同时删除资质印章${text.join('')}`,
            ],
          ),
        )
      }

      return result
    },
    deleteRow() {
      const { selectedRowKeys, selectedRow } = this
      const text = null

      if (selectedRowKeys.length === 0) {
        window.$oAntdModal.warning({
          title: '提示',
          content: '请选择要删除的数据',
        })
        return
      }

      window.$oAntdConfirm({
        title: '您确定要删除？',
        content: () => this.getDelTip(text),
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          let checked = false
          const ele = document.getElementById('delSealVersion')

          ele && (checked = ele.checked)
          const res = await sealService.delete(selectedRow.id, checked)
          if (res.code !== 20010) {
            this.selectedRowKeys = []
            this.versionData = []
            this.versionSelectRowKeys = []
            window.$oAntdMessage.success('删除成功')
            this.getData()
          }
        },
      })
    },
    async getSealVersions() {
      const { selectedRowKeys, selectedRow } = this

      if (selectedRow.formatType === '10') {
        this.versionData = []
        this.versionSelectRowKeys = []
        return
      }

      this.versionLoading = true
      const res = await sealService.versions(selectedRowKeys[0]).finally(() => {
        this.versionLoading = false
      })

      if (res.code !== 20010) {
        this.versionData = res.data.map(i => ({
          ...i,
          uploadFileLoading: false,
        }))
        this.versionSelectRowKeys = []
      }
    },
    onVersionSelectChange(selectedRowKeys) {
      this.versionSelectRowKeys = selectedRowKeys
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
      this.getSealVersions()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
