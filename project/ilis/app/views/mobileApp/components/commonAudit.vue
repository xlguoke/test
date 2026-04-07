<template>
  <van-popup
    :show="value"
    position="bottom"
    closeable
    :style="{ height: '90%' }"
    v-bind="$attrs"
    :close-on-click-overlay="false"
    :close-on-popstate="true"
    @click-close-icon="onClose"
  >
    <div class="common-audit">
      <div class="common-audit-title">
        {{ title }}
      </div>
      <div class="common-audit-content">
        <van-cell-group>
          <van-field
            center
            label="审核人员"
            placeholder="请选择"
            input-align="right"
          >
            <template #input>
              <template v-for="(item, index) in processUserTaskList" :key="item.activitiNodeId">
                <van-tag
                  class="common-audit-user"
                  @click="!disabledAuditNodes?.includes(item.activitiNodeId) && onSelectUser(item)"
                >
                  {{ item.presetUserRealName || item.processTaskName }}
                </van-tag>
                <van-icon v-if="index < processUserTaskList.length - 1" :key="item.activitiNodeId" color="#999" name="arrow" />
              </template>
            </template>
          </van-field>

          <template v-for="item in formList" :key="item.id">
            <van-field
              v-if="item.type && item.type.name === 'long'"
              v-model="formPropertyJson[item.id]"
              :label="item.name"
              placeholder="请输入"
              input-align="right"
              type="number"
            />

            <FormItemDate
              v-else-if="item.type && item.type.name === 'date'"
              v-model:value="formPropertyJson[item.id]"
              :label="item.name"
            />

            <van-field
              v-else-if="item.type && item.type.name === 'boolean'"
              :label="item.name"
              input-align="right"
            >
              <template #input>
                <van-radio-group v-model="formPropertyJson[item.id]" direction="horizontal">
                  <van-radio name="1">
                    是
                  </van-radio>
                  <van-radio name="0">
                    否
                  </van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <van-field
              v-else-if="item.type.name === 'file'"
              :key="item.id"
              :label="item.name"
              input-align="right"
            >
              <template #input>
                <AttachmentHandler
                  business-type="WORKFLOW_FORM_FILE"
                  accept="*"
                  @init="formPropertyJson[item.id] = $event.qrUrl"
                ></AttachmentHandler>
              </template>
            </van-field>

            <FormItemPerson
              v-else-if="item.id === 'copyTo'"
              v-model:value="copyToPersons"
              enable-multiple
              :label="item.name"
            />

            <van-field
              v-else
              v-model="formPropertyJson[item.id]"
              :label="item.name"
              placeholder="请输入"
              input-align="right"
            />
          </template>

          <slot :form-property-json="formPropertyJson"></slot>
        </van-cell-group>
      </div>
      <div class="common-audit-btn">
        <van-button square @click="onClose">
          取消
        </van-button>
        <van-button square type="primary" @click="onSubmit">
          确定
        </van-button>
      </div>
    </div>
  </van-popup>

  <MobilePersonSelector v-model:open="selectPersonVisible" @select="getPerson" />
</template>

<script>
import AttachmentHandler from '~/views/mobileApp/components/AttachmentHandler.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import MobilePersonSelector from '~/views/mobileApp/components/MobileSelector/MobilePersonSelector.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  name: 'CommonAudit',
  components: {
    FormItemPerson,
    FormItemDate,
    MobilePersonSelector,
    AttachmentHandler,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '提交审核',
    },
    auditTypeId: {
      type: String,
      default: null,
    },
    /** # 禁用审核节点 */
    disabledAuditNodes: {
      type: Array,
      default: () => [],
    },
    /** # 默认指定节点人员 */
    defaultAuditers: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['update:value', 'onSubmit'],
  data() {
    return {
      formPropertyJson: {},
      processUserTaskList: [],
      formList: [],

      selectDateId: null,

      selectPersonVisible: false,
      selectPersonId: null,

      copyToPersons: [],
    }
  },
  watch: {
    value(val) {
      if (val === true) {
        this.init()
      }
      else {
        this.onClose()
      }
    },
  },
  methods: {
    init() {
      this.getProcessUserTaskList()
      this.getStartFormData()
    },
    onClose() {
      this.$emit('update:value', false)

      this.formPropertyJson = {}
      this.processUserTaskList = []
      this.formList = []
      this.selectDateId = null
      this.copyToPersons = []
    },
    async getProcessUserTaskList() {
      const res = await mRequest.get('rest/auditProcess/getProcessUserTaskList', {
        params: {
          auditTypeId: this.auditTypeId,
        },
      })

      this.processUserTaskList = res.data
      this.setDefaultAuditers()
    },
    setDefaultAuditers() {
      if (!this.defaultAuditers)
        return
      const nodeIds = Object.keys(this.defaultAuditers)
      nodeIds?.forEach((id) => {
        const index = this.processUserTaskList.findIndex(i => i.activitiNodeId === id)
        if (index !== -1) {
          this.processUserTaskList[index] = {
            ...this.processUserTaskList[index],
            ...this.defaultAuditers[id],
          }
        }
      })
    },
    async getStartFormData() {
      const res = await mRequest.get('rest/auditProcess/getStartFormData', {
        params: {
          auditTypeId: this.auditTypeId,
        },
      })

      if (res.code === 20010) {
        showDialog({ message: res.message || '获取审核表单失败' })
        return
      }

      const formPropertyJson = {}

      res.data.forEach((item) => {
        formPropertyJson[item.id] = ''
      })

      this.formList = res.data
      this.formPropertyJson = formPropertyJson
    },
    onSelectUser(item) {
      this.selectPersonId = item.activitiNodeId
      this.selectPersonVisible = true
    },
    getPerson(rows) {
      const row = rows[0]
      const index = this.processUserTaskList.findIndex(i => i.activitiNodeId === this.selectPersonId)
      const item = this.processUserTaskList[index]

      item.presetUserId = row.id
      item.presetUsername = row.account
      item.presetUserRealName = row.name
      this.selectPersonVisible = false
    },
    onSubmit() {
      this.$emit('onSubmit', this.processUserTaskList, this.formPropertyJson, this.copyToPersons)
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.van-popup__close-icon) {
  top: 10px;
  right: 10px;
}

.common-audit {
  display: flex;
  flex-direction: column;
  height: 100%;

  .common-audit-user {
    padding: 4px 8px;
    margin: 4px;
  }

  .common-audit-title {
    line-height: 42px;
    background: #154bd0;
    color: #fff;
    font-size: 14px;
    text-align: center;
  }

  .common-audit-content {
    flex: 1;
    overflow-y: auto;
  }

  .common-audit-btn {
    display: flex;
    align-items: center;

    button {
      flex: 1;
    }
  }
}
</style>
