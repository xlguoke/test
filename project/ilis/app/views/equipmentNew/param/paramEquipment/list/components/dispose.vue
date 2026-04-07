<!-- eslint-disable vue/no-unused-refs -->
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
        <a-form ref="formRef" :model="formState">
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
                    : data[item.field]
                }}
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item
            label="归还时状态"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-select v-model:value="formState.equipmentStatus" placeholder="请选择">
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
                v-permission="'modifyBorrower'"
                :span="6"

                style="text-align: right"
              >
                <a-button
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
          >
            <a-date-picker
              v-model:value="formState.operationTime"
              style="width: 100%"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
        </a-form>
      </div>
      <div v-else>
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
            <a-upload
              :multiple="true"
              :file-list="fileList"
              :action="uploadUrl"
              @change="handleChange"
            >
              <a-button>选择文件</a-button><span style="font-size: 12px; margin-left: 20px; color: #5ab266">请上传小于500M的文件</span>
            </a-upload>
          </a-col>
        </a-row>
      </a-form-item>
    </ht-modal>
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import qs from 'qs'
import { formatTime } from '~/providers/common/utils'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    TableTreePersonnel,
  },
  props: ['callback'],
  data() {
    return {
      fileList: [],
      attachmentIds: '',
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
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
      statusData: [],
    }
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
    showModal(record, status) {
      this.data = record
      this.status = status
      if (this.status == '40') {
        this.person = {
          id: record.BorrowUserId,
          name: record.borrowUser,
        }
      }
      this.visible = true
    },
    handleOk() {
      let data = {
        'operationType': this.status,
        'eqEgress.id': this.data.id,
        'attachmentIds': this.attachmentIds,
      }
      let url = window.$oApi.eqEgressList.dispose

      if (this.status == '40') {
        data = {
          ...data,
          ...this.formState,
        }
        data.operationTime = data.operationTime
          ? formatTime(data.operationTime, 'YYYY-MM-DD HH:mm:ss')
          : ''
        data.operator = this.person.name
        data.operatorId = this.person.id
        data.operationType = this.status
      }
      else {
        data.remark = this.remark
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

      this.confirmLoading = true
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
          this.fileList = []
          this.attachmentIds = ''
          this.formState = {}
          this.person = {}
          this.visible = false
          this.callback()
          this.remark = ''
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
      this.visible = false
      this.formState = {}
    },
    getPerson(idsPerson, acceptData) {
      this.person = acceptData[0] || {}
    },
  },
}
</script>

<style></style>
