<template>
  <div>
    <ht-modal
      title="发起审批"
      :open="visible"
      :keyboard="false"
      :mask-closable="false"
      width="700px"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning" style="min-height: 400px">
        <a-form
          ref="formRef"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
          :model="formState"
        >
          <a-form-item label="流程类型" name="businessType" :rules="[{ required: true, message: '请选择流程类型' }]">
            <a-select
              v-model:value="formState.businessType"
              placeholder="请选择流程类型"
              allow-clear
              @change="getStartFrom"
            >
              <a-select-option
                v-for="item in allProcessList"
                :key="item.businessType"
                :value="item.businessType"
              >
                {{ item.businessName }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-for="(item, i) in startFormList"
            :key="i"
            :label="item.name"
            :name="item.id"
            :rules="[
              { required: item.required, message: `请输入${item.name}` },
            ]"
          >
            <a-input-number
              v-if="item.type.name === 'long'"
              v-model:value="formState[item.id]"
              :placeholder="`请输入${item.name}`"
              :min="0"
              style="width: 100%"
              allow-clear
            />
            <a-date-picker
              v-else-if="item.type.name === 'date'"
              v-model:value="formState[item.id]"
              value-format="YYYY-MM-DD"
              :placeholder="`请选择${item.name}`"
              style="width: 100%"
              allow-clear
            />
            <a-radio-group
              v-else-if="item.type.name === 'boolean'"
              v-model:value="formState[item.id]"
            >
              <a-radio value="1">
                是
              </a-radio>
              <a-radio value="0">
                否
              </a-radio>
            </a-radio-group>
            <HtUploadFile
              v-else-if="item.type.name === 'file'"
              :business-type="BUSINES_TYPE.WORKFLOW_FORM_FILE"
              @get-data="formState[item.id] = $event.qrCodeUrl"
            />
            <div
              v-else-if="item.type.name === 'string' && item.id === 'copyTo'"
              class="personer-list-form"
            >
              <a-input
                v-model:value="formState[item.id]"
                style="display: none"
              />
              <p class="personers personers-copy-to">
                <span v-if="!item.value" class="no-personer">请选择人员</span>
                <span v-else>{{ item.value }}</span>
                <CloseCircleOutlined
                  v-if="item.value"
                  theme="filled"
                  @click="
                    () => {
                      item.value = ''
                    }
                  "
                />
              </p>
              <a-button @click="openPersonModal('copyTo', i)">
                选择
              </a-button>
            </div>
            <a-input
              v-else
              v-model:value="formState[item.id]"
              :placeholder="`请输入${item.name}`"
              style="width: 100%"
              allow-clear
            />
          </a-form-item>
          <a-form-item v-show="showProcessPerson" label="流程人员">
            <a-steps
              :current="presetAuditers.length"
              progress-dot
              direction="vertical"
            >
              <a-step
                v-for="(user, i) in presetAuditers"
                :key="user.activitiNodeId"
                :title="user.processTaskName"
              >
                <template #description>
                  <div class="personer-list">
                    <ul class="personers">
                      <li v-if="!user.presetUserId" class="no-personer">
                        请选择人员
                      </li>
                      <li v-else class="ant-tag">
                        {{ user.presetUserRealName }}
                        <CloseOutlined
                          @click="
                            () => {
                              user.presetUserId = ''
                              user.presetUsername = ''
                              user.presetUserRealName = ''
                              $set(presetAuditers, i, user)
                            }
                          "
                        />
                      </li>
                    </ul>
                    <PlusSquareOutlined
                      class="add-person"
                      @click="openPersonModal('process', i, user)"
                    />
                  </div>
                </template>
              </a-step>
            </a-steps>

            <span class="hint">注意：未指定流程人员时，将根据流程审核权限配置查询可审核人员</span>
          </a-form-item>
        </a-form>
      </a-spin>
      <template #footer>
        <a-button :disabled="confirmLoading" @click="handleCancel">
          取消
        </a-button>
        <a-button type="primary" :loading="confirmLoading" @click="save">
          提交
        </a-button>
      </template>
    </ht-modal>

    <SelectPersonnel ref="selPersonnelRef" :callback="getPersonnelData" />
  </div>
</template>

<script>
import { CloseCircleOutlined, CloseOutlined, PlusSquareOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import SelectPersonnel from '~/providers/components/tableTreePersonnel.vue'

export default {
  components: {
    SelectPersonnel,
    CloseCircleOutlined,
    CloseOutlined,
    PlusSquareOutlined,
    HtUploadFile,
  },
  props: ['callback'],
  data() {
    return {
      dayjs,
      BUSINES_TYPE,
      dateFormat: 'YYYY-MM-DD',
      visible: false,
      confirmLoading: false,
      spinning: false,

      processInstanceId: '',
      allProcessList: [],
      startFormList: [], // 流程表单
      presetAuditers: [], // 预设流程人员
      applyContent: '',
      comment: '',
      scroll: { y: 500 },
      dragIndex: '',
      enterIndex: '',
      timeout: null,
      showProcessPerson: false,
      chooseIndex: -1,
      businessKey: '',
      formState: {},
    }
  },
  methods: {
    showModal(id) {
      this.processInstanceId = id || ''
      this.visible = true
      this.getAllProcessList()

      id && this.getDetailData()
    },
    // 获取详情数据
    async getDetailData() {
      const res = await window.$oAjax.get(
        `${window.$oApi.auditProcess.detail}/${this.processInstanceId}`,
      )
      if (res.code !== 20000) {
        window.$oAntdMessage.error(res.message || '获取详情失败')
        return
      }
      const forms = res.data.formProperties
        ? JSON.parse(res.data.formProperties)
        : {}
      const presetAuditers = res.data.presetAuditers
        ? JSON.parse(res.data.presetAuditers)
        : []
      this.startFormList = res.data.startFormProperties.filter((d) => {
        d.value = forms[d.id] || ''
        return d.readable
      })
      this.businessKey = res.data.businessKey
      this.getProcessNode(res.data.processTypeId, presetAuditers)
      window.$oNextTick(() => {
        this.formState = {
          ...this.formState,
          businessType: res.data.processTypeId,
          ...forms,
        }
      })
    },
    // 获取审核类型
    getAllProcessList() {
      window.$oAjax
        .get(
          `${window.$oApi.auditProcessRelation.getRelations}?processType=common`,
        )
        .then((res) => {
          this.allProcessList = res.data || []
        })
    },
    // 获取动态表单
    getStartFrom(e) {
      if (!e) {
        this.startFormList = []
        this.presetAuditers = []
        return
      }
      this.spinning = true
      window.$oAjax
        .get(`${window.$oApi.common.getProcessFormUrl}?auditTypeId=${e}`)
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            const list = res.data.filter(d => d.readable)
            this.startFormList = list
          }
          else {
            window.$oAntdMessage.error(res.message || '获取表单失败')
          }
        })
        .catch((err) => {
          this.spinning = false
          window.$oAntdMessage.error(err.message || '获取表单失败')
        })
      this.getProcessNode(e)
    },
    // 获取审核节点
    getProcessNode(typeId, values) {
      this.showProcessPerson = Boolean(typeId)
      this.spinning = true
      window.$oAjax
        .get(`${window.$oApi.common.getProcessUserUrl}?auditTypeId=${typeId}`)
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            const list = res.data || []
            if (values) {
              for (let i = 0; i < list.length; i++) {
                const item = list[i]
                const findItem = values.find(
                  d => d.activitiNodeId === item.activitiNodeId,
                )
                if (!findItem)
                  continue
                list[i] = {
                  ...item,
                  ...findItem,
                }
              }
            }
            this.presetAuditers = list
          }
          else {
            window.$oAntdMessage.error(res.message || '获取审核节点失败')
          }
        })
        .catch((err) => {
          this.spinning = false
          window.$oAntdMessage.error(err.message || '获取审核节点失败')
        })
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
    save() {
      this.$refs.formRef.validateFields().then(() => {
        const value = { ...this.formState }
        const formProperties = {}
        for (let i = 0; i < this.startFormList.length; i++) {
          const item = this.startFormList[i]
          if (value[item.id]) {
            if (item.type.name === 'date') {
              formProperties[item.id] = dayjs(value[item.id]).format(
                this.dateFormat,
              )
            }
            else {
              formProperties[item.id] = value[item.id]
            }
          }
        }
        const data = {
          businessType: value.businessType,
          businessKey: this.businessKey,
          formProperties,
          presetAuditers: this.presetAuditers,
        }
        this.confirmLoading = true
        window.$oAjax({
          url: window.$oApi.auditProcess.submit,
          method: 'post',
          data,
          dataType: 'json',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        })
          .then((res) => {
            this.confirmLoading = false
            if (res.code === 20000) {
              window.$oAntdMessage.success('操作成功')
              this.visible = false
              this.$parent.search()
            }
            else {
              window.$oAntdMessage.error(res.message || '发起审批失败')
            }
          })
          .catch((err) => {
            this.confirmLoading = false
            window.$oAntdMessage.error(err.message || '发起审批失败')
          })
      })
    },
    // 确定审批结果
    confirmResult() {
      this.handleCancel()
      this.callback()
    },
    // 打开人员选择弹窗
    openPersonModal(type, ind, users) {
      this.personType = type
      this.chooseIndex = ind
      const _t = type === 'process' ? 'radio' : 'checkbox'
      const ids = []
      const datas = []
      if (type === 'process' && users.presetUserId) {
        ids.push(users.presetUserId || '')
        datas.push({
          id: users.presetUserId || '',
          name: users.presetUserRealName || '',
          account: users.presetUsername || '',
        })
      }
      this.$refs.selPersonnelRef.showModal(_t, ids, datas)
    },
    // 选择人员
    getPersonnelData(ids, data) {
      if (this.personType === 'process') {
        const personObj = data[0]
        const item = this.presetAuditers[this.chooseIndex]
        item.presetUserId = personObj.id
        item.presetUsername = personObj.account
        item.presetUserRealName = personObj.name
        this.presetAuditers[this.chooseIndex] = item
        this.chooseIndex = -1
      }
      else {
        const accounts = data.map(d => d.account)
        const item = this.startFormList[this.chooseIndex]
        item.value = accounts.join(',')
        this.startFormList[this.chooseIndex] = item
        this.formState[item.id] = item.value
      }
    },
    handleCancel() {
      this.comment = ''
      this.isBatch = false
      this.batchDatas = []
      this.visible = false
      this.showResult = false
      this.confirmLoading = false
    },
  },
}
</script>

<style lang="less" scoped>
.audit-result {
  width: 100%;
  line-height: 25px;
}
.textarea-font-num {
  float: right;
  margin-right: 5px;
  margin-top: -28px;
  font-size: 12px;
  color: #999;
  z-index: 100;
  position: relative;
}
.personer-list,
.personer-list-form {
  display: flex;
  min-height: 28px;
  border-bottom: 1px solid #f5f5f5;
  .personers {
    flex: 1;
  }
  .add-person {
    margin-top: 6px;
    font-size: 16px;
    opacity: 0.7;
    cursor: pointer;
    &:hover {
      opacity: 1;
    }
  }
  .no-personer {
    color: #aaa;
  }
}
.personer-list-form {
  border: none;
  .personers {
    margin-right: 10px;
    height: 28px;
    line-height: 26px;
    padding: 0 8px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 12px;
  }

  .anticon {
    float: right;
    margin-top: 8px;
    color: #ccc;
    transition: 0.3s;
    &:hover {
      color: #999;
    }
  }
}
:deep(.ant-steps-dot .ant-steps-item-content) {
  width: auto;
  .ant-steps-item-title {
    font-size: 14px;
  }
}
.hint {
  font-size: 12px;
  color: #999;
}
</style>
