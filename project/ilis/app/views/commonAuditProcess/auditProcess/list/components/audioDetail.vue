<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="审批详情"
      width="80%"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content" style="padding: 4px 12px">
          <div>
            <a-form
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
            >
              <a-form-item label="流程类型">
                {{ processName }}
                <span
                  v-if="businessType === '40'"
                  style="display: inline-block"
                >
                  <!-- 其它成果审核时，显示文件操作按钮 -->
                  <FileItem :show-file-name="false" :file-data="fileData" />
                </span>
              </a-form-item>
            </a-form>
            <a-form
              ref="formRef"
              :model="formState"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
            >
              <template v-for="(item, index) in formLayout" :key="index">
                <a-form-item
                  v-show="item.readable"
                  v-if="item.id !== 'skip_check_process_problem'"
                  :label="item.name"
                  :required="item.required"
                  :name="item.id"
                  :rules="[{ required: item.required, message: '必填项' }]"
                >
                  <a-select
                    v-if="item.type.name === 'select'"
                    v-model:value="formState[item.id]"
                    :placeholder="`请选择${item.name}`"
                    :disabled="!item.writable"
                    style="width:100%;"
                  >
                    <a-select-option v-for="(comItem, n) in item.data" :key="n" :value="comItem[item.dataField.value]">
                      {{ comItem[item.dataField.name] }}
                    </a-select-option>
                  </a-select>
                  <a-radio-group
                    v-else-if="item.type.name === 'boolean'"
                    v-model:value="formState[item.id]"
                    :disabled="!item.writable"
                    :name="item.id"
                  >
                    <a-radio value="1">
                      是
                    </a-radio>
                    <a-radio value="0">
                      否
                    </a-radio>
                  </a-radio-group>
                  <a-date-picker
                    v-else-if="item.type.name === 'date'"
                    v-model:value="formState[item.id]"
                    :placeholder="`请选择${item.name}`"
                    :disabled="!item.writable"
                    style="width:100%;"
                    value-format="YYYY-MM-DD"
                  />
                  <a-input-number
                    v-else-if="item.type.name === 'long'"
                    v-model:value="formState[item.id]"
                    :placeholder="`请输入${item.name}`"
                    :disabled="!item.writable"
                    style="width:100%;"
                  />
                  <a-select
                    v-else-if="item.type.name === 'enum'"
                    v-model:value="formState[item.id]"
                    :placeholder="`请选择${item.name}`"
                    :options="options[item.id] || []"
                    :disabled="!item.writable"
                    style="width:100%;"
                  />
                  <HtUploadFile
                    v-else-if="item.type.name === 'file'"
                    :key="formState[item.id]"
                    :qr-code-url="formState[item.id]"
                    :business-type="BUSINES_TYPE.WORKFLOW_FORM_FILE"
                    :is-reandonly="!item.writable"
                  />
                  <a-input
                    v-else
                    v-model:value="formState[item.id]"
                    :placeholder="`请输入${item.name}`"
                    :disabled="!item.writable"
                    style="width:100%;"
                  />
                </a-form-item>
              </template>

              <a-form-item label="审批意见">
                <a-textarea
                  v-model:value="comment"
                  :rows="3"
                  placeholder="请输入审批意见"
                />
              </a-form-item>
              <a-form-item label="备注">
                <a-textarea
                  v-model:value="remark"
                  :rows="3"
                  placeholder="请输入"
                />
              </a-form-item>
              <a-form-item
                v-if="processType === 'common' && auditers.length > 0"
                label="审批记录"
              >
                <a-steps progress-dot :current="activeKey" direction="vertical">
                  <a-step
                    v-for="(item) in auditers"
                    :key="item.activitiNodeId"
                    :status="passStatus(item.pass)"
                    :title="`${item.taskName}：${item.userRealName}`"
                  >
                    <template v-if="item.comment" #description>
                      <CheckCircleOutlined
                        v-if="item.pass"
                        style="color: #52c41a"
                      />
                      <CloseCircleOutlined
                        v-else
                        style="color: #cc3030"
                      />
                      {{ item.comment }}
                    </template>
                  </a-step>
                </a-steps>
              </a-form-item>
            </a-form>
            <CorrectList
              v-show="processInstanceId && processType !== 'common'"
              ref="CorrectList"
              :process-instance-id="processInstanceId"
              :business-type="businessType"
              :business-id="businessId"
              :change-spinning="
                (status) => {
                  spinning = status
                }
              "
            />
          </div>
        </div>
      </a-spin>
      <template #footer>
        <a-button
          :loading="auditRefuseLoading"
          :disabled="auditPassLoading"
          @click="auditHandle('auditRefuse')"
        >
          审核不通过<span v-if="auditRefuseLoading && batchDatas.length > 1">
            {{ auditCount }}/{{ batchDatas.length }}
          </span>
        </a-button>
        <a-button
          type="primary"
          :loading="auditPassLoading"
          :disabled="auditRefuseLoading"
          @click="auditHandle('auditPass')"
        >
          审核通过<span v-if="auditPassLoading && batchDatas.length > 1">
            {{ auditCount }}/{{ batchDatas.length }}
          </span>
        </a-button>
      </template>
    </ht-modal>
    <ht-modal
      v-model:open="showResult"
      title="审批结果"
      :footer="null"
      width="800px"
      @cancel="confirmResult"
    >
      <a-table
        :columns="columns"
        :data-source="batchDatas"
        :scroll="scroll"
        bordered
        :pagination="false"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'response'">
            <span :style="`font-size:18px;color:${text ? '#2bbf2b' : 'red'}`">
              {{ text ? '√' : '×' }}
            </span>
          </template>
        </template>
      </a-table>
      <div style="margin-top: 10px; text-align: right">
        <a-button type="primary" @click="confirmResult">
          确定
        </a-button>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getDictByCode } from '~/api/common'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import FileItem from '~/views/testbusiness/testitem/testItemDetail/otherAchievement/components/FileItem.vue'
import CorrectList from './correctList.vue'

const columns = [
  {
    title: '流程标题',
    dataIndex: 'processName',
    key: 'processName',
  },
  {
    title: '流程摘要',
    dataIndex: 'processSummary',
    key: 'processSummary',
  },
  {
    title: '审批结果',
    dataIndex: 'response',
    width: '10%',
  },
]

export default {
  components: {
    FileItem,
    CorrectList,
    CheckCircleOutlined,
    CloseCircleOutlined,
    HtUploadFile,
  },
  props: ['callback'],
  data() {
    return {
      dayjs,
      columns,
      BUSINES_TYPE,
      visible: false,
      auditRefuseLoading: false,
      auditPassLoading: false,
      spinning: false,
      requireData: {},
      formLayout: [],
      processName: '',
      comment: '',
      remark: '',
      processInstanceId: '',
      businessId: '',
      businessType: '',
      scroll: { y: 500 },
      showResult: false, // 显示审批结果
      isBatch: false, // 是否是批量审批
      batchDatas: [], // 批量审批的流程数据
      activeKey: -1,
      auditers: [],
      processType: 'business',
      fileData: {},
      formState: {},
      options: {},
      auditCount: 0,
    }
  },
  methods: {
    passStatus(pass) {
      if (pass)
        return 'finish'
      if (pass === false)
        return 'error'
      return 'wait'
    },

    getData(taskId) {
      this.processInstanceId = ''
      this.spinning = true
      this.taskId = taskId
      window.$oAjax
        .get(window.$oApi.auditProcess.auditDetail, {
          params: {
            taskId,
          },
        })
        .then((res) => {
          if (res.code && res.code !== 20010) {
            this.formLayout = res.data.formProperties || []
            this.formState = this.formLayout?.reduce((pre, cur) => {
              pre[cur.id] = cur.value
              return pre
            }, {}) || {}
            const enumList = this.formLayout?.filter(i => i?.type?.name === 'enum')
            enumList?.forEach(async (i) => {
              const { data } = await getDictByCode(i.id)
              this.options[i.id] = data?.map((i) => {
                return {
                  label: i.typeName,
                  value: i.typeName,
                }
              })
            })

            this.processName = res.data.processName
            this.auditers = res.data.auditRecords
              ? JSON.parse(res.data.auditRecords)
              : []
            this.activeKey = this.auditers.length - 1
            if (res.data.problemSeverityDictGroupId) {
              this.processInstanceId = res.data.processInstanceId
              this.businessType = res.data.processTypeId // 业务类型
              this.businessId = res.data.businessKey // 业务id
              this.$refs.CorrectList.getTypeData(
                res.data.problemSeverityDictGroupId,
              )
              // eslint-disable-next-line ts/no-unused-expressions
              this.processInstanceId
                ? this.$refs.CorrectList.getData(this.processInstanceId)
                : ''
            }
            else {
              this.spinning = false
            }
            // eslint-disable-next-line array-callback-return
            this.formLayout.map((item) => {
              this.requireData[item.id] = {
                name: item.name,
                required: item.required,
              }
            })
            this.getBusinessDetail()
          }
          else {
            message.error(res.message)
            this.spinning = false
          }
        })
    },
    /*
     *  @params   param       流程id【为批量审批时，id为数组】
     *            isBatch  是否批量审批-默认false
     *            processType 审核流程类型:business - 业务流程 common - 通用流程
     * */
    showModal(param, isBatch = false, processType) {
      this.visible = true
      this.isBatch = isBatch
      this.processType = processType
      if (isBatch) {
        this.batchDatas = JSON.parse(JSON.stringify(param))
        this.getData(param[0].id)
      }
      else {
        this.getData(param)
      }
    },
    checkData() {
      const data = { ...this.formState }
      for (const key in this.requireData) {
        if (this.requireData[key].required && data[key] === '') {
          message.warn(`${this.requireData[key].name}为必填!`)
          return false
          break
        }
      }
      return true
    },
    /*  审批操作
     *   @params  auditType (auditPass-通过，auditRefuse-不通过)
     * */
    async auditHandle(auditType) {
      if (!this.checkData())
        return
      this[`${auditType}Loading`] = true
      // 单个审批
      if (!this.isBatch) {
        await this.$refs.formRef.validate().catch((err) => {
          this[`${auditType}Loading`] = false
          throw err
        })
        this.auditRequest(auditType, this.taskId)
        return
      }
      const datas = this.batchDatas
      let resCount = 0
      for (let i = 0; i < datas.length; i++) {
        const batchRow = datas[i]
        this.auditCount++
        const resData = (await this.auditRequest(auditType, batchRow.id)) || {}
        if (resData.code && resData.code === 20000) {
          datas[i].response = true
        }
        else {
          datas[i].response = false
        }
        resCount++
        if (resCount === this.batchDatas.length) {
          this.showResult = true
          this.visible = false
        }
      }
      this[`${auditType}Loading`] = false
      this.auditCount = 0
      this.batchDatas = [...datas]
    },
    // 审批请求
    async auditRequest(auditType, taskId) {
      const data = { ...this.formState }
      const apiUrl = window.$oApi.auditProcess[auditType]
      return await window.$oAjax({
        method: 'POST',
        url: apiUrl,
        params: {
          taskId,
          'formPropertyJson': JSON.stringify(data),
          'auditRecord.comment': this.comment,
          'auditRecord.remark': this.remark,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
        .then((res) => {
          if (!this.isBatch) {
            this[`${auditType}Loading`] = false
          }
          if (this.isBatch) {
            return res
          }
          else {
            if (res.code && res.code !== 20010) {
              message.success('操作成功')
              this.handleCancel()
              this.callback()
            }
            else {
              message.error(res.msg || res.message)
            }
          }
        })
        .catch((err) => {
          window.$oAntdMessage.error(err.message || '审核失败')
          if (!this.isBatch) {
            this[`${auditType}Loading`] = false
          }
        })
    },
    // 确定审批结果
    confirmResult() {
      this.handleCancel()
      this.callback()
    },
    /* auditPass() {
          if (!this.checkData())return;
          this.confirmLoading = true;
          let data = this.form.getFieldsValue();
          window.$oAjax({
              method: "POST",
              url: window.$oApi.auditProcess.auditPass,
              params: {
                  taskId: this.taskId,
                  formPropertyJson: JSON.stringify(data),
                  "auditRecord.comment": this.comment,
                  "auditRecord.remark": this.remark
              },
              headers: {
                  "X-Requested-With": "XMLHttpRequest"
              }
          }).then(res => {
              if (res.code && res.code !== 20010) {
                  message.success("操作成功");
                  this.handleCancel();
                  this.callback();
              } else {
                  message.error(res.msg || res.message);
              }
              this.confirmLoading = false;
          })
      },
      auditRefuse() {
          if (!this.checkData())return;
          this.confirmLoading = true;
          let data = this.form.getFieldsValue();
          window.$oAjax({
              method: "POST",
              url: window.$oApi.auditProcess.auditRefuse,
              params: {
                  taskId: this.taskId,
                  formPropertyJson: JSON.stringify(data),
                  "auditRecord.comment": this.comment,
                  "auditRecord.remark": this.remark
              },
              headers: {
                  "X-Requested-With": "XMLHttpRequest"
              }
          }).then(res => {
              if (res.code && res.code !== 20010) {
                  message.success("操作成功");
                  this.handleCancel();
                  this.callback();
              } else {
                  message.error(res.msg || res.message);
              }
              this.confirmLoading = false;
          })
      }, */
    handleCancel() {
      this.formLayout = []
      this.processName = ''
      this.comment = ''
      this.remark = ''
      this.isBatch = false
      this.batchDatas = []
      this.visible = false
      this.showResult = false
      this.confirmLoading = false
      this.$refs.CorrectList.data = []
      this.$refs.CorrectList.cacheData = []
    },
    /**
     * 获取业务详情
     * 目前仅其它成果审核详情展示额外操作
     */
    getBusinessDetail() {
      this.fileData = {}
      if (this.businessType !== '40')
        return ''
      window.$oAjax
        .get(`api/synthesis/achievement/detail/${this.businessId}`, {
          headers: {
            'Unit-Code': localStorage.getItem('unitCode'),
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.fileData = {
              uid: res.data.attachmentId,
              name: res.data.achievementName,
              url: res.data.fileUrl,
            }
          }
        })
    },
  },
}
</script>

<style lang="less" scoped>
.spin-content {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}
.audit-result {
  width: 100%;
  line-height: 25px;
}
:deep(.ant-steps-dot .ant-steps-item-content) {
  width: auto;
  .ant-steps-item-title {
    font-size: 14px;
  }
}
</style>
