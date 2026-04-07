<template>
  <ht-modal
    v-model:open="visible"
    :title="title"
    width="90%"
    :hide-confirm="isDetails"
    :confirm-loading="confirmLoading"
    destroy-on-close
    @ok="handleSubmit"
    @cancel="cancelModal"
  >
    <div style="max-height: calc(100vh - 200px); overflow-y: auto">
      <div class="font-bold">
        基本信息
        <a-tag v-if="formData.id" style="margin-left: 15px">
          id：{{ formData.id }}
        </a-tag>
      </div>
      <div class="border-line" />
      <a-form :model="formData" :rules="rules" style="margin-top: 12px">
        <a-row>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="功能室名称"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
              class="required"
              name="name"
            >
              <a-input
                v-model:value="formData.name"
                style="width: 100%"
                :disabled="isDetails"
                placeholder="请输入功能室名称"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="试验室责任人"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-flex :gap="4">
                <a-select
                  v-model:value="selPersonIds"
                  mode="multiple"
                  placeholder="请选择试验室责任人"
                  :disabled="isDetails"
                  @change="changePerson"
                >
                  <a-select-option v-for="d in selPersons" :key="d.id" :value="d.id">
                    {{ d.name }}
                  </a-select-option>
                </a-select>
                <a-button
                  v-if="!isDetails"
                  type="primary"
                  @click="openpersonModal"
                >
                  选择
                </a-button>
              </a-flex>
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="部门"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-tree-select
                v-model:value="formData.departments"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '405px', overflow: 'auto' }"
                placeholder="请选择部门"
                allow-clear
                multiple
                tree-checkable
                tree-check-strictly
                :max-tag-count="2"
                :tree-data="departmentData"
                tree-default-expand-all
                label-in-value
                :disabled="isDetails"
              >
                <template #maxTagPlaceholder="text">
                  <span :title="text.map((i) => i.label).join(',')">+ {{ text.length }} ...</span>
                </template>
              </a-tree-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="功能室类型"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-select
                v-model:value="formData.type"
                :disabled="isDetails"
                :options="typeDict"
                style="width: 100%"
                placeholder="请选择功能室类型"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="基础功能"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-input
                v-model:value="formData.basicFuncDesc"
                :disabled="isDetails"
                style="width: 100%"
                placeholder="请输入基础功能"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="是否检测室"
              :label-col="{ span: 7 }"
              class="required"
              :wrapper-col="{ span: 17 }"
            >
              <a-select
                v-model:value="formData.isLaboratory"
                :disabled="isDetails"
              >
                <a-select-option value="1">
                  是
                </a-select-option>
                <a-select-option value="0">
                  否
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="排序号"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-input-number
                v-model:value="formData.orderNum"
                :disabled="isDetails"
                style="width: 100%"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="显示屏编号"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-input
                v-model:value="formData.displayScreenNum"
                :disabled="isDetails"
                :max-length="50"
                style="width: 100%"
                placeholder="请输入显示屏编号"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="门禁设备编号"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-input
                v-model:value="formData.accessControlEquipmentSn"
                :disabled="isDetails"
                style="width: 100%"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="适用参数"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-textarea
                v-model:value="formData.applicableParam"
                :disabled="isDetails"
                :max-length="1000"
                placeholder="请输入适用参数"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="功能室概况"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-textarea
                v-model:value="formData.overview"
                :disabled="isDetails"
                :max-length="1000"
                placeholder="请输入功能室概况"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="其他责任人信息"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-textarea
                v-model:value="formData.otherLiabilityPersons"
                :disabled="isDetails"
                :max-length="1000"
                placeholder="请输入其他责任人信息"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="备注"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-input
                v-model:value="formData.remark"
                :disabled="isDetails"
                style="width: 100%"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="目的地编号"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-select
                v-model:value="formData.positionCode"
                :disabled="isDetails"
                :options="positionCodeOptions"
                style="width: 100%"
                placeholder="请输入本功能室所在物理位置/虚拟编号位置"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="仓位编号"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-popover title="提示">
                <template #content>
                  <p>多个目的地编号值以半角逗号分隔，或输入后直接回车录入下一个。</p>
                </template>
                <a-select
                  v-model:value="formData.storeCode"
                  :allow-clear="true"
                  :token-separators="[',']"
                  mode="tags"
                  :disabled="isDetails"
                  :options="storeCodeOptions"
                  style="width: 100%"
                  placeholder="请输入目的地编号"
                />
              </a-popover>
            </a-form-item>
          </a-col>
          <a-col :md="12" :xl="8">
            <a-form-item
              label="环境等级"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-input
                v-model:value="formData.envLevel"
                :disabled="isDetails"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <a-tabs :key="formData.id" v-model:active-key="activeKey">
        <a-tab-pane key="1" tab="设备信息">
          <a-space v-if="!isDetails" class="mb-2">
            <a-button type="primary" @click="oepnSelEqModal">
              新增
            </a-button>
            <a-button @click="removeEq">
              移除
            </a-button>
          </a-space>
          <a-table
            :columns="columns"
            :data-source="selEqData"
            bordered
            :pagination="false"
            :loading="loading"
            :row-selection="rowSelection"
            :row-class-name="rowClassName"
            row-key="id"
            :scroll="{ x: 900, y: 380 }"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'unit'">
                <span>
                  <a @click="() => goDetail(record.unit)">
                    <u>{{ text }}</u>
                  </a>
                </span>
              </template>

              <template v-if="column.dataIndex === 'operation'">
                <span class="table-handle">
                  <a
                    v-if="!isDetails"
                    style="color: red"
                    @click="delEquipment(record)"
                  >
                    删除
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane v-if="formData.id && checkBtnAuth()" tab="关联屏幕显示内容">
          <a-alert
            message="注意：关联屏幕显示内容时，上传文件格式仅支持PDF、JPG、JPEG、PNG"
            type="info"
            show-icon
            style="margin-bottom: 10px"
          />
          <iframe
            width="100%"
            height="500px"
            src="/ilis2/eqFolderController.do?goEquipmentFile"
            frameborder="0"
          />
        </a-tab-pane>
        <a-tab-pane key="3" tab="温湿度管理" force-render>
          <TempHumForm
            ref="TempHumFormRef"
            v-model:iot-room-id="iotRoomId"
            :edit-data="tempHumFormData"
            :is-details="isDetails"
          />
        </a-tab-pane>
        <a-tab-pane key="4" tab="调养箱管理" force-render>
          <IncubatorForm
            ref="incubatorFormRef"
            v-model:iot-room-id="iotRoomId"
            :edit-data="tempHumFormData"
            :is-details="isDetails"
          />
        </a-tab-pane>
      </a-tabs>
    </div>

    <SelectEquip ref="selectEquipRef" :callback="selectEquipData" />
  </ht-modal>
</template>

<script>
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { getDictByCode } from '~/api/common'
import PersonInfoSelector from '~/components/PersonInfoSelector.vue'
import getDepartmentData from '~/providers/api/getDepartment'
import { formatTime, getQueryVariable } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { usePermissionStore } from '~/store/permissionStore'
import IncubatorForm from './IncubatorForm.vue'
import SelectEquip from './selectEquip.vue'
import TempHumForm from './tempHumForm.vue'

const columns = [
  // {
  //   title: "序号",
  //   dataIndex: "orderNum",
  //   key: "orderNum",
  //   align: "center",
  //   width: "10%",
  // },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
  },
  {
    title: '设备名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '设备类别',
    dataIndex: 'type',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '所属部门',
    dataIndex: 'departName',
  },
  {
    title: '资产编号',
    dataIndex: 'assetSn',
  },
  {
    title: '购置日期',
    dataIndex: 'buyDate',
    customRender({ text }) {
      return text ? formatTime(text, 'YYYY-MM-DD') : ''
    },
  },

  {
    title: '检校类型',
    dataIndex: 'checkType',
  },
  {
    title: '设备状态',
    dataIndex: 'status',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    SelectEquip,
    TempHumForm,
    IncubatorForm,
  },
  props: ['callback', 'contentType'],
  emits: ['callback'],
  data() {
    return {
      activeKey: '1',
      quickQry: '',
      title: '',
      isDetails: false,
      selPersons: [],
      data: [],
      loading: false,
      columns,
      id: getQueryVariable('id'),
      visible: false,
      confirmLoading: false,
      positionCodeOptions: [],
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.page = page
          this.size = size
          this.getData()
        },
      },
      selEqData: [],
      iotRoomId: undefined, // 物联网系统房间ID
      formData: {
        overview: '',
        name: '',
        remark: '',
        envLevel: '',
        isLaboratory: '1',
        orderNum: 0,
        basicFuncDesc: '',
        labDutyPerson: '',
        labDutyPersonId: '',
        equipmentIds: [],
        accessControlEquipmentSn: '',
        otherLiabilityPersons: '',
        storeCode: [],
      },
      storeCodeOptions: [],
      selPersonIds: [],
      tempHumFormData: null,
      humitureType: [
        { label: '实时（设备采集）', value: '1' },
        { label: '标准（手动设置）', value: '0' },
      ],
      selectedRowKeys: [],
      selectedRows: [],
      departmentData: [],
      selDeparts: [],
      rules: {
        name: [
          { required: true, message: '请输入实验室名称', trigger: 'blur' },
        ],
      },
      typeDict: [],
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: 'checkbox',
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  async created() {
    // 传递给jsp页面，用作限制上传文件类型
    window.filesObj = {
      accepts: 'file',
      acceptMime: 'image/jpg,image/png,image/jpeg,application/pdf',
      exts: 'jpg|png|jpeg|pdf',
    }
    const { data: typeDict } = await getDictByCode('labType')
    const { data: positionCodeOptions } = await getDictByCode('lab::position')
    this.positionCodeOptions = positionCodeOptions?.map((i) => {
      return {
        label: i.typeName,
        value: i.typeCode,
      }
    })
    this.typeDict = typeDict?.map((i) => {
      return {
        label: i.typeName,
        value: i.typeCode,
      }
    })
    const departs = await getDepartmentData()
    this.departmentData = departs
  },
  methods: {
    checkBtnAuth() {
      const { hasPermission } = usePermissionStore()
      return hasPermission('customScreenContent')
    },
    removeEq() {
      const keys = this.selectedRowKeys
      for (let i = this.selEqData.length - 1; i >= 0; i--) {
        if (keys.includes(this.selEqData[i].id)) {
          this.selEqData.splice(i, 1)
        }
      }
    },
    changePerson() {
      this.selPersons = this.selPersons.filter(item => this.selPersonIds.includes(item.id))
    },
    async openpersonModal() {
      const persons = await AnyDialogHelper.showModel(PersonInfoSelector, {
        multiple: true,
      })
      const filterPersons = persons.filter(d => !this.selPersonIds.includes(d.id))
      const newPersons = filterPersons.map(d => ({
        id: d.id,
        name: d.personName,
      }))
      this.selPersons = [...this.selPersons, ...newPersons]
      this.selPersonIds = this.selPersons.map(d => d.id)
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    showModal(data, isDetails) {
      this.activeKey = '1'
      this.visible = true
      this.resetForm()

      if (data) {
        window.InitObj = {
          editId: data.id,
        }
        this.title = isDetails ? '详情' : '编辑'
        this.isDetails = isDetails
        const d = JSON.parse(JSON.stringify(data))

        if (d.departIds && d.departNames) {
          const names = d.departNames.split(',')
          d.departments = names.map(d => ({
            value: d,
            label: d,
          }))
        }

        this.formData = d

        this.queryEqList()
        this.getDetail(data.id)
      }
      else {
        this.tempHumFormData = null
        this.title = '新增'
      }
    },
    getDetail(id) {
      window.$oAjax({
        method: 'GET',
        url: `rest/laboratoryController/${id}`,
      }).then((res) => {
        this.tempHumFormData = res.data
        this.formData.positionCode = res.data?.positionCode || ''
        this.formData.envLevel = res.data?.envLevel || ''
        this.formData.storeCode = res.data?.storeCode ? res.data.storeCode.split(',') : []
        this.iotRoomId = res.data?.labIotEq?.iotEqId || undefined
        this.selPersons = res.data?.biddingPersons.map(v => ({
          id: v.biddingPersonId,
          name: v.biddingPersonName,
        })) || []
        this.selPersonIds = this.selPersons.map(v => v.id)
      })
    },
    resetForm() {
      this.isDetails = false
      this.selEqData = []
      this.selPersons = []
      this.iotRoomId = undefined
      this.formData = {
        overview: '',
        name: '',
        remark: '',
        envLevel: '',
        isLaboratory: '1',
        orderNum: 0,
        basicFuncDesc: '',
        labDutyPerson: '',
        labDutyPersonId: '',
        equipmentIds: [],
        accessControlEquipmentSn: '',
        otherLiabilityPersons: '',
        departments: [],
      }
    },
    delEquipment(row) {
      this.selEqData.forEach((it, index) => {
        if (row.id === it.id) {
          this.selEqData.splice(index, 1)
        }
      })
    },
    queryEqList() {
      if (this.formData.id) {
        window.$oAjax({
          method: 'GET',
          url: 'rest/laboratoryController?getEquipmentByLaboratoryQuery',
          params: {
            LaboratoryId: this.formData.id,
            page: 1,
            size: 99999,
            quickQry: this.quickQry,
          },
        }).then((res) => {
          if (res.obj.count) {
            this.selEqData = res.obj.rows
          }
        })
      }
    },
    cancelModal() {
      this.visible = false
    },
    oepnSelEqModal() {
      this.$refs.selectEquipRef.showModal('checkbox')
    },
    selectEquipData(d) {
      d.forEach((it) => {
        const flag = this.selEqData.some((rawIt) => {
          if (rawIt.id === it.id) {
            message.warn(`已存在:${it.name}`)
          }
          return rawIt.id === it.id
        })
        if (!flag) {
          this.selEqData.push(it)
        }
      })
    },
    handleSubmit() {
      if (this.isDetails) {
        this.visible = false
        return
      }

      if (!this.formData.name) {
        message.warn('请输入功能室名称')
        return
      }

      // 温湿度tab信息
      const tempHumFormData = this.$refs.TempHumFormRef.getFormData()
      if (tempHumFormData.iotEqList.some(i => i.ability.length === 0)) {
        this.activeKey = '3'
        window.$oAntdModal.warning({
          title: '提示',
          content: '请设置设备列表中的设备能力!',
        })
        return
      }

      // 调养箱信息
      const incubatorFormData = this.$refs.incubatorFormRef.getFormData()

      const p = {
        ...this.formData,
        storeCode: (this.formData.storeCode || []).join(','),
        equipmentIds: this.selEqData.map((it) => {
          return it.id
        }),
      }
      if (p.departments && p.departments.length) {
        const list = []
        const lables = p.departments.map(d => d.label)
        ;(function _each(trees) {
          if (!trees || trees.length === 0)
            return
          for (let i = 0; i < trees.length; i++) {
            const item = trees[i]
            if (lables.includes(item.title)) {
              list.push(item)
            }
            _each(item.children)
          }
        })(this.departmentData)
        p.departIds = list.map(it => it.key).join(',')
        p.departNames = list.map(it => it.title).join(',')
      }
      else {
        p.departIds = ''
        p.departNames = ''
      }
      delete p.departments

      if (this.selPersons.length) {
        p.biddingPersonIds = this.selPersons.map(d => d.id)
        p.biddingPersonNames = this.selPersons.map(d => d.name)
        // 兼容历史数据
        p.labDutyPerson = p.biddingPersonNames.toString()
        p.labDutyPersonId = p.biddingPersonIds.toString()
      }
      else {
        p.biddingPersonIds = []
        p.biddingPersonNames = []
        p.labDutyPerson = ''
        p.labDutyPersonId = ''
      }

      this.confirmLoading = true
      window.$oAjax({
        method: 'POST',
        url: 'rest/laboratoryController?saveLaboratory',
        data: {
          ...p,
          ...tempHumFormData,
          ...incubatorFormData,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      })
        .then((res) => {
          if (res && res.success) {
            message.success(res.message || res.msg)
            this.confirmLoading = false
            this.cancelModal()
            $emit(this, 'callback')
          }
          else {
            message.error(res.message || res.msg)
          }
          this.confirmLoading = false
        })
        .catch(() => {
          this.confirmLoading = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
.border-line {
  padding-bottom: 10px;
}
.ant-form-item {
  min-height: 30px;
}
.required label::before {
  content: '*';
  color: red;
}
.humiture {
  display: inline-flex;
  align-items: center;
  .anticon {
    margin-left: 2px;
    color: #1890ff;
    cursor: pointer;
  }
}
.humiture-hint {
  font-size: 12px;
  color: #999;
  line-height: 14px;
}
</style>
