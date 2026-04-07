<template>
  <div>
    <ht-modal
      :title="isEdit ? '外出信息' : '新增外出'"
      centered
      :open="visible"
      :confirm-loading="confirmLoading"
      width="800px"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-card v-if="!isEdit">
        <template #title>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <span>外出设备</span>
            <ScanCodeQuery1
              v-model:value="searchString"
              scan-type="equipment"
              placeholder="请输入设备编号、设备标签码或扫描设备标签码添加"
              @enter="scanCodeAddData"
            />
          </div>
        </template>
        <a-table
          :columns="columns"
          :data-source="equipmentDatas"
          :pagination="false"
          :scroll="{ y: 300 }"
        >
          <template #bodyCell="{ column, index }">
            <template v-if="column.dataIndex === 'handle'">
              <a-button type="link" @click="removeRow(index)">
                移除
              </a-button>
            </template>
          </template>
        </a-table>
        <br />
        <a-button
          type="dashed"
          style="height: 32px"
          block
          @click="openModal('eqVisible')"
        >
          + 选择设备
        </a-button>
      </a-card>
      <!-- 外出信息复用新增部分 -->
      <br v-if="!isEdit" />
      <a-card :title="isEdit ? '' : '外出信息'">
        <div style="padding-right: 20px">
          <a-form :model="formState">
            <div class="hitek-form-layout">
              <div class="hitek-form-layout-label">
                关联任务
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-flex>
                    <a-input v-model:value="formState.testTaskSn" class="flex-1 mr-2" placeholder="请选择关联任务" disabled />
                    <a-button
                      v-if="!!formState.testTaskSn" class="mr-2" @click="() => {
                        projectData = []
                        formState.testTaskSn = ''
                        formState.projectName = ''
                        formState.qualificationType = []
                      }"
                    >
                      清空
                    </a-button>
                    <a-button @click="openModal('taskVisible')">
                      选择
                    </a-button>
                  </a-flex>
                </a-form-item>
              </div>
            </div>
            <div class="hitek-form-layout">
              <div
                :class="
                  projectIsRequired
                    ? 'hitek-form-layout-label hitek-form-lable'
                    : 'hitek-form-layout-label'
                "
              >
                关联工程项目
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-flex>
                    <a-input v-model:value="formState.projectName" class="flex-1" placeholder="请选择工程项目或输入（多个用逗号分隔）" :disabled="!!formState.testTaskSn" allow-clear @blur="syncProjectData" />
                    <a-button
                      v-if="!formState.testTaskSn"
                      class="ml-2"
                      @click="
                        () => {
                          $refs.SelProjcet.showModal(
                            'checkbox',
                            'projectIds',
                            projectData,
                          )
                        }
                      "
                    >
                      选择
                    </a-button>
                  </a-flex>
                </a-form-item>
              </div>
            </div>
            <div v-if="EQ_ENGINEERING_FIELD" class="hitek-form-layout">
              <div class="hitek-form-layout-label">
                资质类型
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-select
                    v-model:value="formState.qualificationType"
                    placeholder="请选择资质类型"
                    :disabled="!!formState.testTaskSn"
                    :options="formState.testTaskSn ? allQualificationData : qualificationTypeData"
                    mode="multiple"
                    :field-names="{ label: 'name', value: 'id' }"
                    allow-clear
                  >
                  </a-select>
                </a-form-item>
              </div>
            </div>
            <div class="hitek-form-layout">
              <div class="hitek-form-layout-label hitek-form-lable">
                外出前状态
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-row :gutter="15">
                    <a-col :span="24">
                      <a-select
                        v-model:value="formState.beforeStatus"
                        class="w-full"
                        placeholder="请选择"
                      >
                        <a-select-option
                          v-for="(item, index) in statusData"
                          :key="index"
                          :value="item.typecode"
                        >
                          {{ item.typename }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                  </a-row>
                </a-form-item>
              </div>
            </div>
            <div class="hitek-form-layout">
              <div class="hitek-form-layout-label">
                借用人
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-row :gutter="15">
                    <a-col
                      v-if="person.name"
                      :span="18"
                      class=" leading-[28px]"
                      style="font-size: 12px"
                    >
                      {{ person.name }}
                    </a-col>
                    <a-col
                      v-else
                      :span="18"
                      class=" leading-[28px]"
                      style="font-size: 12px; color: #999;"
                    >
                      请选择借用人
                    </a-col>
                    <a-col
                      :span="6"
                      style="text-align: right"
                    >
                      <a-button
                        v-permission="'modifyBorrower'"
                        @click="
                          () => {
                            $refs.TableTreePersonnel.showModal(
                              'radio',
                              'person',
                              [person],
                            )
                          }
                        "
                      >
                        选择
                      </a-button>
                    </a-col>
                  </a-row>
                </a-form-item>
              </div>
            </div>
            <div class="hitek-form-layout">
              <div class="hitek-form-layout-label hitek-form-lable">
                外出时间
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-date-picker
                    v-model:value="formState.egressTime"
                    style="width: 100%"
                    :show-time="EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </a-form-item>
              </div>
            </div>
            <div class="hitek-form-layout">
              <div :class="`hitek-form-layout-label ${EQUIPMENT_EGRESS_DATE ? 'hitek-form-lable' : ''}`">
                预还时间
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-date-picker
                    v-model:value="formState.expectReturnTime"
                    style="width: 100%"
                    :show-time="EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </a-form-item>
              </div>
            </div>
            <div class="hitek-form-layout">
              <div class="hitek-form-layout-label">
                备注
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-input v-model:value="formState.remark" :max-length="200" />
                </a-form-item>
              </div>
            </div>

            <div class="hitek-form-layout">
              <div class="hitek-form-layout-label">
                附件上传
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <HtUploadFile
                    :key="egressId"
                    business-type="EQ_EGRESS"
                    force-init
                    :business-id="egressId"
                    @get-qr-code-key="accessoriesQrCode = $event"
                  />
                </a-form-item>
              </div>
            </div>
          </a-form>
        </div>
      </a-card>
    </ht-modal>

    <ht-modal
      title="选择外出设备"
      centered
      :open="eqVisible"
      width="80%"
      @cancel="cancelModal"
      @ok="getEq"
    >
      <iframe
        id="eqVisible"
        ref="eqIframe"
        style="border: 0"
        width="100%"
        height="400px"
        :src="eqVisibleUrl"
      ></iframe>
    </ht-modal>

    <ht-modal
      title="选择关联任务"
      centered
      :open="taskVisible"
      width="80%"
      @cancel="cancelModal"
      @ok="getTask"
    >
      <iframe
        v-if="taskVisible"
        id="taskVisible"
        style="border: 0"
        width="100%"
        height="400px"
        :src="`${taskVisibleUrl}&testPersons=${person.name}`"
      ></iframe>
    </ht-modal>

    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
    <SelProjcet ref="SelProjcet" :callback="getProjcet" />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import qs from 'qs'
import { HtUploadFile } from '~/components/htUploadFile'
import { formatTime } from '~/providers/common/utils'
// 与vue3组件重名，导致该引入失效，修改引用名称
import ScanCodeQuery1 from '~/providers/components/scanCodeQuery/index.vue'
import SelProjcet from '~/providers/components/selProjcet.vue'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

import { rootUrl } from '~/providers/configs/rootUrl'
import { editApplyInfo, queryQualificationApi } from '../api'

const equipmentColumns = [
  {
    title: '设备名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
    key: 'equipmentSn',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    key: 'standard',
  },
  {
    title: '操作',
    dataIndex: 'handle',
    key: 'handle',
    width: 80,
    scopedSlots: { customRender: 'handle' },
  },
]
export default {
  components: {
    TableTreePersonnel,
    SelProjcet,
    ScanCodeQuery1,
    HtUploadFile,
  },
  props: ['isAdd', 'callback'],
  data() {
    return {
      searchString: '',
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      eqVisible: false,
      eqVisibleUrl: `${rootUrl}/equipmentNewController.do?goEquipmentListNoAuth&onlySelect=1&loadAllQuery=1`,
      eqData: {},
      taskVisible: false,
      taskVisibleUrl: `${rootUrl}/reportCreateController.do?goRelationTaskChoosePage`,
      businessParamUrl: `/tSBusinessParamController.do?getBusinessParam&key=`,
      isSameProjectOutEquipment: false, // 获取业务控制参数 按照关联项目显示外出设备
      EQUIPMENT_EGRESS_DATE: false, // 业务控制参数：控制预还时间是否必填
      EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS: false, // 业务控制参数：控制外出时间、预还时间是否精确到时分秒
      statusData: [],
      projectData: [], // 工程项目
      person: {
        name:
          localStorage.getItem('userInfo')
          && JSON.parse(localStorage.getItem('userInfo')).realName,
        id: localStorage.getItem('userId'),
      },
      clonePerson: {
        name:
          localStorage.getItem('userInfo')
          && JSON.parse(localStorage.getItem('userInfo')).realName,
        id: localStorage.getItem('userId'),
      },
      columns: equipmentColumns,
      equipmentDatas: [],
      formState: {
        qualificationType: [],
      },
      isEdit: false,
      egressId: '',
      /** 表单是否显示资质类型 */
      EQ_ENGINEERING_FIELD: false,
      qualificationTypeData: [],
      allQualificationData: [],
      uniqueQualificationIds: [],
      accessoriesQrCode: '',
    }
  },
  computed: {
    projectIsRequired() {
      return localStorage.unitCode === 'hxcd' || this.isSameProjectOutEquipment
    },
  },
  async created() {
    try {
      await Promise.all([
        this.getqualificationTypeData(),
        this.getqualificationTypeDataAll(),
      ])
    }
    catch (error) {
      console.error(error)
    }
    this.getStatus()
    const [
      EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS,
      isSameProjectOutEquipment,
      EQUIPMENT_EGRESS_DATE,
      EQ_ENGINEERING_FIELD,
    ] = await Promise.all([
      this.getBusinessParam('EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS'),
      this.getBusinessParam('OUT_EQUIPMENT_LIMIT_SELECT'),
      this.getBusinessParam('EQUIPMENT_EGRESS_DATE'),
      this.getBusinessParam('EQ_ENGINEERING_FIELD'),
    ])
    this.EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS = EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS
    this.isSameProjectOutEquipment = isSameProjectOutEquipment
    this.EQUIPMENT_EGRESS_DATE = EQUIPMENT_EGRESS_DATE
    this.EQ_ENGINEERING_FIELD = EQ_ENGINEERING_FIELD
  },
  methods: {
    async getqualificationTypeData() {
      const { data } = await queryQualificationApi(0)
      this.qualificationTypeData = data.rows || []
    },
    async getqualificationTypeDataAll() {
      const { data } = await queryQualificationApi(1)
      this.allQualificationData = data.rows || []
    },
    async getBusinessParam(key) {
      const res = await this.$http.get(`${this.businessParamUrl}${key}`)
      return res.data.obj.value === '1'
    },
    getProjectData() {
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.project.list}`,
      })
    },
    getStatus() {
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.eqEgressList.status}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '402882cd5f998a58015f9998ff71001b',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.statusData = res.obj
        }
      })
    },
    showModal(isEdit, record) {
      if (isEdit) {
        this.isEdit = isEdit
        this.egressId = record.egressId
        // 无需处理数据直接回显
        this.formState = JSON.parse(JSON.stringify(record))
        this.formState.projectName = record.projectNames
        this.clonePerson.name = record.borrowUser
        // 处理关联任务回显
        if (record.testTaskSn) { // 关联任务
          this.formState.testTaskSn = record.testTaskSn
        }
        if (record.qualificationType) {
          const ids = record.qualificationType
          this.formState.qualificationType = ids.split(',')
        }
        else {
          this.formState.qualificationType = []
        }
        // 时间回显
        this.formState.egressTime = formatTime(record.egressTime, 'YYYY-MM-DD HH:mm:ss')
        if (this.formState.expectReturnTime == null) {
          this.formState.expectReturnTime = ''
        }
        else {
          this.formState.expectReturnTime = formatTime(record.expectReturnTime, 'YYYY-MM-DD HH:mm:ss')
        }
      }
      this.person = this.clonePerson
      this.visible = true
    },
    async handleOk(ignoreEgressTime) {
      const data = { ...this.formState }
      const equipmentDatas = this.equipmentDatas

      if (equipmentDatas.length === 0 && !this.isEdit) {
        return window.$oAntdMessage.warning('请选择外出设备')
      }
      if (this.isSameProjectOutEquipment && !this.formState.projectName) {
        return window.$oAntdMessage.warning('请选择关联工程项目')
      }
      if (!data.beforeStatus) {
        return window.$oAntdMessage.warning('请选择外出前状态')
      }
      else if (!data.egressTime) {
        return window.$oAntdMessage.warning('请选择外出时间')
      }
      if (this.EQUIPMENT_EGRESS_DATE && !this.formState.expectReturnTime) {
        return window.$oAntdMessage.warning('请选择预还时间')
      }

      data.egressTime = data.egressTime
        ? formatTime(data.egressTime, 'YYYY-MM-DD HH:mm:ss')
        : ''
      data.expectReturnTime = data.expectReturnTime
        ? formatTime(data.expectReturnTime, 'YYYY-MM-DD HH:mm:ss')
        : ''

      if (data.expectReturnTime && !this.isEdit) { // 编辑不做时间校验
        if (
          new Date(data.expectReturnTime).valueOf()
            <= new Date(data.egressTime).valueOf()
        ) {
          return window.$oAntdMessage.warning('预还时间必须要大于外出时间')
        }
      }
      else {
        if (
          ignoreEgressTime !== true
          && new Date().valueOf() >= new Date(data.egressTime).valueOf()
        ) {
          window.$oAntdConfirm({
            title: '请确认外出时间!',
            content: `外出时间（${formatTime(
              data.egressTime,
              'YYYY-MM-DD HH:mm:ss',
            )}）小于当前系统时间，请确认是否继续提交？`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
              this.handleOk(true)
            },
          })
          return
        }
      }

      data.egressTime = data.egressTime
        ? formatTime(data.egressTime, 'YYYY-MM-DD HH:mm:ss')
        : ''
      data.expectReturnTime = data.expectReturnTime
        ? formatTime(data.expectReturnTime, 'YYYY-MM-DD HH:mm:ss')
        : ''
      // data.equipmentId = this.eqData.id
      // data.equipmentName = this.eqData.name
      data.assetSn = this.eqData.assetSn
      data.borrowUser = this.person.name
      data.borrowUserId = this.person.id
      data.qrKey = this.accessoriesQrCode

      if (!this.formState.projectName && this.projectIsRequired) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请关联工程项目'))
        return
      }
      if (this.isEdit) {
        this.confirmLoading = true
        const param = {
          id: data.id,
          testTaskSn: data.testTaskSn,
          qualificationType: (data.qualificationType || []).join(','),
          beforeStatus: data.beforeStatus,
          borrowUser: data.borrowUser,
          borrowUserId: data.borrowUserId,
          egressTime: data.egressTime,
          expectReturnTime: data.expectReturnTime,
          projectName: data.projectName,
          remark: data.remark,
        }
        await editApplyInfo(param).then(() => {
          try {
            this.callback(this.egressId)
          }
          catch (e) {
            console.error(e)
          }
          message.success('操作成功')
        }).finally(() => {
          this.confirmLoading = false
          this.visible = false
        })
        return
      }

      data.projectName = this.handleProjectName((data.projectName || '').replaceAll('，', ','))
      data.qualificationType = (data.qualificationType || []).join(',')
      const ids = equipmentDatas.map(d => d.id)
      this.confirmLoading = true
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.eqEgressList.batchAdd,
        data: { eqEgress: data, equipmentIds: ids },
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.callback()
          this.handleCancel()
        }
        else {
          let msg = ''
          if (res.error && Array.isArray(res.error)) {
            res.error.forEach((d) => {
              msg += `[${d.eqName}][${d.eqSn}]`
            })
            window.$oAntdModal.warning(
              window.$oMsgTips.info(`${msg}已不在库存中，请重新选择外出设备`),
            )
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.eqData = {}
      this.person = {}
      this.projectData = []
      this.equipmentDatas = []
      this.visible = false
      this.formState = {}
    },
    openModal(field) {
      this[field] = true
    },
    cancelModal() {
      this.eqVisible = false
      this.taskVisible = false
      this.resetIframe()
    },
    // 移除设备
    removeRow(ind) {
      this.equipmentDatas.splice(ind, 1)
    },
    // 获取外出设备
    getEq() {
      const dataGrid = document
        .getElementById('eqVisible')
        .contentWindow
        .$('#dataGrid')
      // const data = dataGrid.datagrid('getSelections')
      const data = dataGrid?.data('getAllSelections')?.() || dataGrid.datagrid('getSelections') // 兼容无配套设备
      this.eqVisible = false
      if (data.length > 0) {
        const ids = this.equipmentDatas.map(d => d.id)
        const filterData = data.filter(d => !ids.includes(d.id))
        const list = data.filter(d => ids.includes(d.id))
        if (list.length > 0) {
          const equipments = []
          list.forEach((d) => {
            equipments.push(`${d.name}(${d.equipmentSn})`)
          })
          window.$oAntdMessage.warning(`请勿重复选择同一设备！`)
        }
        if (filterData.length === 0)
          return
        this.equipmentDatas.push(...filterData)
      }
      this.resetIframe()
    },
    resetIframe() { // 清除选中状态
      const iframe = this.$refs.eqIframe
      if (iframe) {
        iframe.src = this.eqVisibleUrl
      }
    },
    scanCodeAddData(res) {
      const { err, data } = res
      if (err) {
        return window.$oAntdMessage.error(err.message || '添加失败')
      }
      else if (data.length === 0) {
        return window.$oAntdMessage.warning('无法查到该设备信息')
      }
      const ids = this.equipmentDatas.map(d => d.id)
      const repeats = []
      const unValidStatus = []
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        const sn = d.equipmentSn ? `（${d.equipmentSn}）` : ''
        const msg = `${d.name}${sn}`
        if (ids.includes(d.id)) {
          repeats.push(msg)
        }
        else if (d.egressStatus != '10' && d.egressStatus != '30') {
          // 非库存状态和外出拒绝状态的，不能外出
          unValidStatus.push(msg)
        }
        else {
          this.equipmentDatas.push(d)
        }
      }
      if (repeats.length > 0 || unValidStatus.length > 0) {
        const repeatStr = repeats.join(',')
        const unValidStr = unValidStatus.join(',')
        let str = ''
        if (repeatStr)
          str = `【${repeatStr}】已存在，无需重复添加！`
        if (unValidStr)
          str += `【${unValidStr}】当前状态无法外出！`
        window.$oAntdMessage.warning(str)
      }
    },
    // 获取关联任务

    getTask() {
      const data = document
        .getElementById('taskVisible')
        .contentWindow
        .$('#dataGrid')
        .datagrid('getSelections')
      this.taskVisible = false

      if (data.length > 0) {
        this.uniqueQualificationIds = Array.from(
          new Set(
            data.flatMap((item) => {
              const idStr = item.qualificationTypeId || ''
              return idStr.split(',').map(id => id.trim()).filter(id => id)
            }),
          ),
        )
        this.formState.qualificationType = [...this.uniqueQualificationIds]
        this.formState.testTaskSn = data.map(item => item.testTaskCode).toString()

        const pData = []
        // eslint-disable-next-line array-callback-return
        data.map((item) => {
          pData.push({
            id: item.projectId,
            name: item.projectName,
          })
        })

        this.projectData = pData
      }
      else {
        this.formState.testTaskSn = ''
        this.projectData = []
      }

      this.formState.projectName = this.handleProjectName(this.projectData.map(i => i.name).join(','))
    },
    handleProjectName(val) {
      if (val) {
        const arr = val.split(',')
        return Array.from(new Set(arr)).join(',')
      }
      return val
    },
    getPerson(idsPerson, acceptData) {
      this.person = acceptData[0] || {}
    },
    // 获取关联工程项目
    getProjcet(idsPerson, acceptData) {
      const pNameArr = this.formState.projectName ? this.formState.projectName.replaceAll('，', ',').split(',') : []

      acceptData.forEach((item) => {
        if (!this.projectData.find(i => i.id === item.id)) {
          this.projectData.push({
            id: item.id,
            name: item.name,
          })
        }

        if (!pNameArr.includes(item.name)) {
          pNameArr.push(item.name)
        }
      })

      this.formState.projectName = pNameArr.join(',')
    },
    syncProjectData() {
      const pName = this.formState.projectName
      if (pName) {
        const pArr = pName.split(',')
        this.projectData = this.projectData.filter(p => pArr.includes(p.name))
      }
    },
    // 获取业务控制参数 按照关联项目显示外出设备
    async getBusinessParam(key) {
      const res = await window.$oAjax({
        method: 'GET',
        url: this.businessParamUrl + key,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
      if (res && res.success) {
        return res.obj === 'Y'
      }
      return false
    },
  },
}
</script>

<style lang="less">
.equipmentOutgo-add-modal {
  .ant-modal-body {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    background-color: #f1f2f5;
  }

  .ant-card-head-title {
    padding: 10px 0;
  }
  .ant-card-body {
    padding: 15px 20px;
  }
}
</style>
