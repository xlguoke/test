<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <ht-modal
      title="新增外出"
      centered
      :open="visible"
      :confirm-loading="confirmLoading"
      width="520px"
      wrap-class-name="equipmentOutgo-add-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div style="padding-right: 20px">
        <a-form ref="formRef" :model="formState">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label hitek-form-lable">
              外出设备
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item>
                <a-row :gutter="15">
                  <a-col
                    v-if="eqData.name"
                    :span="18"
                    style="font-size: 12px"
                  >
                    {{ eqData.name }}
                  </a-col>
                  <a-col v-else :span="18" style="font-size: 12px; color: #999">
                    请选择外出设备
                  </a-col>
                  <a-col :span="6" style="text-align: right">
                    <a-button @click="openModal('eqVisible')">
                      选择
                    </a-button>
                  </a-col>
                </a-row>
                <div v-if="eqData.name" style="font-size: 12px">
                  设备编号：{{ eqData.equipmentSn }} 设备规格：{{
                    eqData.standard
                  }}
                </div>
              </a-form-item>
            </div>
          </div>
          <!-- <a-form-item -->
          <!-- label="外出设备" -->
          <!-- :label-col="{ span: 5 }" -->
          <!-- :wrapper-col="{ span: 17 }" -->
          <!-- &gt; -->
          <!-- <a-row :gutter="15"> -->
          <!-- <a-col :span="18" style="font-size:12px;" v-if="eqData.name">{{ eqData.name }}</a-col> -->
          <!-- <a-col :span="18" style="font-size:12px;color:#999" v-else>请选择外出设备</a-col> -->
          <!-- <a-col :span="6" style="text-align:right;"> -->
          <!-- <a-button @click="openModal('eqVisible')">选择</a-button> -->
          <!-- </a-col> -->
          <!-- </a-row> -->
          <!-- <div style="font-size:12px;" v-if="eqData.name">设备编号：{{ eqData.equipmentSn }} 设备规格：{{ eqData.standard }}</div> -->
          <!-- </a-form-item> -->
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">
              关联任务
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item>
                <a-row :gutter="15">
                  <a-col v-if="taskData" :span="18" style="font-size: 12px">
                    {{
                      taskData
                    }}
                  </a-col>
                  <a-col v-else :span="18" style="font-size: 12px; color: #999">
                    请选择关联任务
                  </a-col>
                  <a-col :span="6" style="text-align: right">
                    <a-button @click="openModal('taskVisible')">
                      选择
                    </a-button>
                  </a-col>
                </a-row>
              </a-form-item>
            </div>
          </div>
          <div class="hitek-form-layout">
            <div
              :class="
                isHxcd
                  ? 'hitek-form-layout-label hitek-form-lable'
                  : 'hitek-form-layout-label'
              "
            >
              关联工程项目
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item>
                <a-row :gutter="15">
                  <a-col
                    v-if="projcetData.length > 0"
                    :span="18"
                    style="font-size: 12px"
                  >
                    {{
                      projcetData.map((item) => item.name).join('; ')
                    }}
                  </a-col>
                  <a-col v-else :span="18" style="font-size: 12px; color: #999">
                    请选择关联工程项目
                  </a-col>
                  <a-col :span="6" style="text-align: right">
                    <a-button
                      @click="
                        () => {
                          $refs.SelProjcet.showModal(
                            'checkbox',
                            'projectIds',
                            projcetData,
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
              外出前状态
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item>
                <a-row :gutter="15">
                  <a-col>
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
                    style="font-size: 12px"
                  >
                    {{ person.name }}
                  </a-col>
                  <a-col v-else :span="18" style="font-size: 12px; color: #999">
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
              外出时间
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item>
                <a-date-picker
                  v-model:value="formState.egressTime"
                  style="width: 100%"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </div>
          </div>
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">
              预还时间
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item>
                <a-date-picker
                  v-model:value="formState.expectReturnTime"
                  style="width: 100%"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
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
                <a-input v-model:value="formState.remark" />
              </a-form-item>
            </div>
          </div>

          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">
              附件上传
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item>
                <a-upload
                  :multiple="true"
                  :file-list="fileList"
                  :action="uploadUrl"
                  @change="handleChange"
                >
                  <a-button>选择文件</a-button><span
                    style="font-size: 12px; margin-left: 20px; color: #5ab266"
                  >请上传小于500M的文件</span>
                </a-upload>
              </a-form-item>
            </div>
          </div>
        </a-form>
      </div>
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
        id="taskVisible"
        style="border: 0"
        width="100%"
        height="400px"
        :src="taskVisibleUrl"
      ></iframe>
    </ht-modal>

    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
    <SelProjcet ref="SelProjcet" :callback="getProjcet" />
  </div>
</template>

<script>
import qs from 'qs'
import { formatTime } from '~/providers/common/utils'
import SelProjcet from '~/providers/components/selProjcet.vue'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    TableTreePersonnel,
    SelProjcet,
  },
  props: ['isAdd', 'callback'],
  data() {
    return {
      fileList: [],
      attachmentIds: '',
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      formState: {},
      eqVisible: false,
      eqVisibleUrl: `${rootUrl}/equipmentNewController.do?goEquipmentList&onlySelect=1`,
      eqData: {},
      taskVisible: false,
      taskVisibleUrl: `${rootUrl}/reportCreateController.do?goRelationTaskChoosePage`,
      taskData: '',
      statusData: [],
      projcetData: [], // 工程项目
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
    }
  },
  computed: {
    isHxcd() {
      return localStorage.unitCode === 'hxcd'
    },
  },
  created() {
    this.getStatus()
  },
  methods: {
    handleChange({ fileList }) {
      this.fileList = fileList
      const idArr = []
      fileList.forEach((item) => {
        if (item.status == 'done') {
          if (item.response.success) {
            idArr.push(item.response.obj[0].id)
          }
          else {
            item.status = 'error'
          }
        }
      })
      this.attachmentIds = idArr.join(',')
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
    showModal() {
      this.person = this.clonePerson
      this.visible = true
    },
    handleOk() {
      const data = { ...this.formState }
      data.egressTime = data.egressTime
        ? formatTime(data.egressTime, 'YYYY-MM-DD HH:mm:ss')
        : ''
      data.expectReturnTime = data.expectReturnTime
        ? formatTime(data.expectReturnTime, 'YYYY-MM-DD HH:mm:ss')
        : ''
      data.equipmentId = this.eqData.id
      data.equipmentName = this.eqData.name
      data.assetSn = this.eqData.assetSn
      data.testTaskSn = this.taskData
      data.borrowUser = this.person.name
      data.borrowUserId = this.person.id
      data.attachmentIds = this.attachmentIds
      if (this.projcetData.length > 0) {
        data.projectIds = this.projcetData.map(item => item.id).toString()
      }
      else {
        if (this.isHxcd) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请关联工程项目'))
          return
        }
      }

      this.confirmLoading = true
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.eqEgressList.add,
        data: qs.stringify(data),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.callback()
          this.handleCancel()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.fileList = []
      this.attachmentIds = ''
      this.eqData = {}
      this.taskData = ''
      this.person = {}
      this.projcetData = []
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
    // 获取外出设备
    getEq() {
      const data = document
        .getElementById('eqVisible')
        .contentWindow
        .$('#dataGrid')
        .datagrid('getSelections')
      this.eqVisible = false
      if (data.length > 0) {
        this.eqData = data[0]
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
        this.taskData = data.map(item => item.testTaskCode).toString()
        // eslint-disable-next-line array-callback-return
        data.map((item) => {
          if (item.projectId && this.projcetData.length > 0) {
            const obj = this.projcetData.find(
              itemP => itemP.id === item.projectId,
            )

            // eslint-disable-next-line ts/no-unused-expressions
            !obj
              ? this.projcetData.push({
                  id: item.projectId,
                  name: item.projectName,
                })
              : ''
          }
          else {
            this.projcetData.push({
              id: item.projectId,
              name: item.projectName,
            })
          }
        })
      }
    },
    getPerson(idsPerson, acceptData) {
      this.person = acceptData[0] || {}
    },
    // 获取关联工程项目
    getProjcet(idsPerson, acceptData) {
      this.projcetData = acceptData.map(item => ({
        id: item.id,
        name: item.name,
      }))
    },
  },
}
</script>

<style lang="less">
.equipmentOutgo-add-modal {
  .ant-modal-body {
    max-height: 450px;
    overflow-y: auto;
  }
}
</style>
