<template>
  <div>
    <ht-modal
      :title="title"
      centered
      :open="visible"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      width="800px"
      wrap-class-name="equipmentOutgo-add-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-card title="延期设备">
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
      </a-card>
      <br />
      <a-card title="延期信息">
        <div style="padding-right: 20px">
          <a-form :model="formState">
            <div class="hitek-form-layout">
              <div class="hitek-form-layout-label hitek-form-lable">
                延期类型
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-select v-model:value="selType" placeholder="请选择">
                    <a-select-option value="0">
                      项目延期
                    </a-select-option>
                    <a-select-option value="1">
                      项目流转
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </div>
            </div>

            <div v-if="selType == 1" class="hitek-form-layout">
              <div class="hitek-form-layout-label">
                关联任务
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-flex>
                    <a-input v-model:value="formState.testTaskSn" class="flex-1 mr-2" placeholder="请选择关联任务" disabled></a-input>
                    <a-button
                      v-if="!!formState.testTaskSn" class="mr-2" @click="() => {
                        projectData = []
                        formState.testTaskSn = ''
                        formState.projectName = ''
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
            <div v-if="selType == 1" class="hitek-form-layout">
              <div class="hitek-form-layout-label hitek-form-lable">
                关联工程项目
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-flex>
                    <a-input v-model:value="formState.projectName" class="flex-1 mr-2" placeholder="请选择工程项目或输入（多个用逗号分隔）" :disabled="!!formState.testTaskSn" allow-clear @blur="syncProjectData"></a-input>
                    <a-button
                      v-if="!formState.testTaskSn"
                      @click="
                        () => {
                          $refs.SelProjcet.showModal(
                            'radio',
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
            <div class="hitek-form-layout">
              <div class="hitek-form-layout-label hitek-form-lable">
                延期前状态
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-select
                    v-model:value="formState.beforeStatus"
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
                </a-form-item>
              </div>
            </div>
            <div class="hitek-form-layout">
              <div class="hitek-form-layout-label">
                延期申请人
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-row :gutter="15">
                    <a-col
                      v-if="person.name"
                      :span="18"
                      style="font-size: 12px"
                      class="pt-1"
                    >
                      {{ person.name }}
                    </a-col>
                    <a-col
                      v-else
                      :span="18"
                      style="font-size: 12px; color: #999"
                    >
                      请选择借用人
                    </a-col>
                    <a-col
                      v-permission="'modifyBorrower'"
                      :span="6"

                      style="text-align: right"
                    >
                      <a-button
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
                延期归还日期
              </div>
              <div class="hitek-form-layout-con">
                <a-form-item>
                  <a-date-picker
                    v-model:value="formState.expectReturnTime"
                    style="width: 100%"
                    show-time
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
                    :key="visible"
                    business-type="EQ_EGRESS"
                    force-init
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
    <SelProjcet ref="SelProjcet" :callback="getProject" />
  </div>
</template>

<script>
import qs from 'qs'
import { HtUploadFile } from '~/components/htUploadFile'
import { formatTime } from '~/providers/common/utils'
import SelProjcet from '~/providers/components/selProjcet.vue'

import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

const equipmentColumns = [
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
    key: 'equipmentName',
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
    title: '关联任务',
    dataIndex: 'testTaskSn',
    key: 'testTaskSn',
    width: 140,
  },
  {
    title: '工程项目',
    dataIndex: 'projectName',
    key: 'projectName',
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
    HtUploadFile,
  },
  props: ['isAdd', 'callback'],
  data() {
    return {
      title: '',
      selType: '0',
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      formState: {},
      eqVisible: false,
      eqVisibleUrl: `${rootUrl}/equipmentNewController.do?goEquipmentListNoAuth&onlySelect=1`,
      eqData: {},
      taskVisible: false,
      taskVisibleUrl: `${rootUrl}/reportCreateController.do?goRelationTaskChoosePage`,
      businessParamUrl: `tSBusinessParamController.do?getBusinessParam&key=OUT_EQUIPMENT_LIMIT_SELECT`,
      isSameProjectOutEquipment: false,
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
      accessoriesQrCode: '',
    }
  },
  computed: {
    projectIsRequired() {
      return (localStorage.unitCode === 'hxcd' || this.isSameProjectOutEquipment) && this.selType == 1
    },
  },
  created() {
    this.getStatus()
    this.getBusinessParam()
  },
  methods: {
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
    showModal(title, selRows) {
      this.title = title
      this.equipmentDatas = selRows
      this.person = this.clonePerson
      this.visible = true
      this.selType = '0'
    },
    handleOk() {
      const data = { ...this.formState }
      const equipmentDatas = this.equipmentDatas

      if (equipmentDatas.length === 0) {
        return window.$oAntdMessage.warning('请选择延期设备')
      }
      if (this.selType == 1 && !data.projectName) {
        return window.$oAntdMessage.warning('请选择或输入关联项目')
      }

      if (!data.beforeStatus) {
        return window.$oAntdMessage.warning('请选择延期前状态')
      }
      else if (!data.expectReturnTime) {
        return window.$oAntdMessage.warning('请选择延期归还时间')
      }

      data.egressTime = data.egressTime
        ? formatTime(data.egressTime, 'YYYY-MM-DD HH:mm:ss')
        : ''
      data.expectReturnTime = data.expectReturnTime
        ? formatTime(data.expectReturnTime, 'YYYY-MM-DD HH:mm:ss')
        : ''

      if (new Date(data.expectReturnTime).valueOf() <= new Date().valueOf()) {
        return window.$oAntdMessage.warning('延期归还时间必须要大于当前时间')
      }

      // data.equipmentId = this.eqData.id
      // data.equipmentName = this.eqData.name
      data.assetSn = this.eqData.assetSn
      data.borrowUser = this.person.name
      data.borrowUserId = this.person.id
      data.qrKey = this.accessoriesQrCode

      if (!data.projectName && this.projectIsRequired) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请关联工程项目'))
        return
      }

      data.projectName = this.handleProjectName((data.projectName || '').replaceAll('，', ','))

      this.confirmLoading = true
      window.$oAjax({
        method: 'put',
        url: `/rest/eqEgress/batch-operation`,
        data: {
          operation: {
            operationType: 80,
            qrKey: this.accessoriesQrCode,
            equipmentStatus: data.beforeStatus,
            remark: data.remark,
            type: this.selType,
            eqEgress: {
              expectReturnTime: data.expectReturnTime,
              testTaskSn: data.testTaskSn || null,
              projectName: data.projectName || null,
            },
          },
          ids: this.equipmentDatas.map(it => it.id),
        },
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
              msg += `[${d.eqName}/${d.eqSn}]`
            })
            window.$oAntdModal.warning(window.$oMsgTips.info(msg + res.message))
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.accessoriesQrCode = ''
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
      const data = dataGrid.datagrid('getSelections')
      dataGrid.datagrid('clearSelections')
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
    getProject(idsPerson, acceptData) {
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
    getBusinessParam() {
      window.$oAjax({
        method: 'GET',
        url: this.businessParamUrl,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.isSameProjectOutEquipment = res.obj === 'Y'
        }
      })
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
