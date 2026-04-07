<template>
  <div>
    <ht-modal
      title="操作"
      :open="visible"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div v-if="status == '40'">
        <a-form :model="formState">
          <a-form-item
            label="外出设备"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-row :gutter="15">
              <a-col :span="24" style="font-size: 12px">
                {{
                  data.equipmentName
                }}
              </a-col>
            </a-row>
            <div v-if="data.equipmentName" style="font-size: 12px">
              设备编号：{{ data.equipmentSn }} 设备规格：{{ data.standard }}
            </div>
          </a-form-item>
          <a-form-item
            v-for="(item, index) in fields"
            :key="index"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :label="item.name"
          >
            <a-row :gutter="15">
              <a-col :span="18" style="font-size: 12px">
                {{
                  item.field == 'egressTime' || item.field == 'expectReturnTime'
                    ? formatTime(data[item.field], 'YYYY-MM-DD HH:mm:ss')
                    : item.field == 'beforeStatus'
                      ? beforeFilter(data[item.field])
                      : data[item.field]
                }}
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item
            label="归还时状态"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :rules="[{ required: true, message: '请选择归还时状态' }]"
            name="equipmentStatus"
          >
            <a-select
              v-model:value="formState.equipmentStatus"
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
          <a-form-item
            label="归还人"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-row :gutter="15">
              <a-col v-if="person.name" :span="18" style="font-size: 12px">
                {{
                  person.name
                }}
              </a-col>
              <a-col v-else :span="18" style="font-size: 12px; color: #999">
                请选择归还人
              </a-col>
              <a-col
                :span="6"
                style="text-align: right"
              >
                <a-button
                  v-permission="'modifyBorrower'"
                  @click="
                    () => {
                      $refs.TableTreePersonnel.showModal('radio', 'person', [
                        person,
                      ])
                    }
                  "
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="归还时间"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :rules="[{ required: true, message: '请选择归还时间' }]"
            name="operationTime"
          >
            <a-date-picker
              v-model:value="formState.operationTime"
              style="width: 100%"
              show-time
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
          <a-form-item
            label="备注"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            placeholder="请输入"
            name="remark"
          >
            <a-input v-model:value="formState.remark">
            </a-input>
          </a-form-item>
        </a-form>
      </div>
      <div v-else>
        <a-form-item
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
          label="确认人"
        >
          <a-row :gutter="15">
            <a-col :span="18" style="font-size: 12px">
              <a-input
                v-model:value="operator"
                :max-length="200"
                :readonly="true"
              ></a-input>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
          label="确认时间"
        >
          <a-row :gutter="15">
            <a-col :span="18" style="font-size: 12px">
              <a-date-picker
                v-model:value="operationTime"
                show-time
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                placeholder="请选择"
              />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
          label="备注信息"
        >
          <a-row :gutter="15">
            <a-col :span="18" style="font-size: 12px">
              <a-textarea
                v-model:value="remark"
                :row="4"
                :max-length="200"
                placeholder="请输入备注"
              ></a-textarea>
            </a-col>
          </a-row>
        </a-form-item>
      </div>

      <a-form-item
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 17 }"
        label="附件材料"
      >
        <a-row :gutter="15">
          <a-col :span="18" style="font-size: 12px">
            <HtUploadFile
              v-if="visible"
              :business-id="id"
              business-type="EQ_EGRESS"
              @get-qr-code-key="accessoriesQrCode = $event"
            />
          </a-col>
        </a-row>
      </a-form-item>
    </ht-modal>
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import qs from 'qs'
import { HtUploadFile } from '~/components/htUploadFile'
import { formatTime } from '~/providers/common/utils'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import { detailApi, editConfirmInfo, rejectOtherApplyApi } from '../api'
import { TransitionStatus } from '../OperationEntity'

export default {
  components: {
    TableTreePersonnel,
    HtUploadFile,
  },
  props: ['callback'],
  data() {
    return {
      formatTime,
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      formState: {},
      status: '',
      fields: [
        { name: '关联任务', field: 'testTaskSn' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '借用人', field: 'borrowUser' },
        { name: '外出时间', field: 'egressTime' },
        { name: '预还时间', field: 'expectReturnTime' },
      ],
      person: {},
      remark: '',
      operator: '',
      operationTime: '',
      statusData: [],
      isEdit: false,
      id: '', // 确认记录id
      egressId: '', // 日志id
      operatorId: '',
      accessoriesQrCode: '',
    }
  },
  created() {
    this.getStatus()
  },
  methods: {
    beforeFilter(val) {
      if (!val)
        return ''
      return this.statusData.find(it => it.typecode === val).typename
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
    showModal(record, status, isEdit) {
      this.data = JSON.parse(JSON.stringify(record))
      this.status = status
      this.egressId = record.egressId
      this.id = undefined
      // 确认人信息
      if (record.borrowUser && record.borrowUserId) {
        this.person = {
          id: record.borrowUserId,
          name: record.borrowUser,
        }
      }
      // 外出-延期-归还确认人信息为当前登录用户
      if (localStorage.getItem('userInfo') && !this.isEdit) {
        const confirmUser = JSON.parse(localStorage.getItem('userInfo'))
        this.operator = confirmUser.realName
      }
      // 确认时间默认当前时间
      this.operationTime = formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss')

      // 编辑回显处理-详情修改确认记录专用
      if (record && isEdit) {
        this.isEdit = isEdit
        this.id = record.id
        this.operator = record.operator // 详情编辑的操作人信息
        this.operatorId = record.operatorId
        this.operationTime = formatTime(record.operationTime, 'YYYY-MM-DD HH:mm:ss')
        this.remark = record.remark
      }
      if (this.status == '40') {
        this.person = {
          id: record.borrowUserId,
          name: record.borrowUser,
        }
      }
      this.visible = true
    },
    // 详情修改确认记录专用
    async handleConfirmOk(data) {
      this.confirmLoading = true
      await editConfirmInfo(data).then(() => {
        try {
          this.callback(this.egressId)
        }
        catch (e) {
          console.error(e)
        }
        message.success('操作成功')
      }).finally(() => {
        this.visible = false
        this.confirmLoading = false
      })
    },
    async handleOk() {
      let data = {
        'operationType': this.status,
        'eqEgress.id': this.data.id,
        'qrKey': this.accessoriesQrCode,
      }

      if (this.isEdit) { // 详情修改确认记录专用
        data.operator = this.operator
        data.operationTime = this.operationTime
        data.id = this.id
        data.operatorId = this.operatorId
        data.remark = this.remark
        delete data['eqEgress.id']
        delete data.operationType

        this.handleConfirmOk(data)
        return
      }
      let url = window.$oApi.eqEgressList.dispose

      if (this.status == '40') {
        const formVal = { ...this.formState }
        if (!formVal.equipmentStatus) {
          return window.$oAntdMessage.warning(`请选择归还时状态`)
        }
        else if (!formVal.operationTime) {
          return window.$oAntdMessage.warning(`请选择归还时间`)
        }
        data = {
          ...data,
          ...formVal,
        }
        data.operator = this.person.name
        data.operatorId = this.person.id
        data.operationType = this.status
        const { data: detailData } = await detailApi(this.data.id)
        if (detailData.transitionStatus === TransitionStatus.CREATE) {
          await new Promise((resolve, reject) => {
            Modal.confirm({
              title: '存在转场申请，是否继续?',
              okText: '确认',
              okType: 'danger',
              onOk: async () => {
                this.confirmLoading = true
                await rejectOtherApplyApi(this.data.id).finally(() => {
                  this.confirmLoading = false
                })
                resolve()
              },
              onCancel: reject,
            })
          })
        }
      }
      else {
        data.remark = this.remark
      }

      if (
        new Date(this.data.egressTime).valueOf()
          >= new Date(data.operationTime).valueOf()
      ) {
        return window.$oAntdMessage.warning('归还时间必须大于外出时间')
      }

      if (this.status == '20' || this.status == '30') {
        url = window.$oApi.eqEgressList.confirm
      }
      else if (this.status == '40') {
        url = window.$oApi.eqEgressList.return
      }
      else if (this.status == '50' || this.status == '60') {
        url = window.$oApi.eqEgressList.returnConfirm
      }
      else if (this.status == '90' || this.status == '95') {
        url = `/rest/eqEgress/batch-operation`
        this.confirmLoading = true
        window.$oAjax({
          method: 'put',
          url,
          data: {
            ids: [this.data.id],
            operation: {
              qrKey: this.accessoriesQrCode,
              operationType: this.status,
              remark: this.remark,
              operator: this.operator, // 延期确认/拒绝新增操作人
              operationTime: this.operationTime,
            },
          },
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        }).then((res) => {
          if (res.code && res.code !== 20010) {
            window.$oAntdMessage.success('操作成功')
            this.formState = {}
            this.person = {}
            this.visible = false
            this.callback()
            this.remark = ''
            this.operator = ''
            this.operationTime = ''
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.confirmLoading = false
        })

        return
      }

      this.confirmLoading = true
      // 三类确认的operationTime与归还的operationTime属性名重叠，在接口调用前单独添加
      data.operationTime = this.formState.operationTime
      window.$oAjax({
        method: 'POST',
        url,
        data: qs.stringify(data),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.formState = {}
          this.person = {}
          this.visible = false
          this.callback()
          this.remark = ''
          this.operator = ''
          this.operationTime = ''
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.accessoriesQrCode = ''
      this.visible = false
      this.formState = {}
      this.remark = ''
      this.operationTime = ''
    },
    getPerson(idsPerson, acceptData) {
      this.person = acceptData[0] || {}
    },
  },
}
</script>

<style></style>
