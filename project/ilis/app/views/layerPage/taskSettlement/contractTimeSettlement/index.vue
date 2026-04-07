<!-- eslint-disable vue/eqeqeq -->
<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="issuance" style="padding: 20px">
    <a-form ref="formRef">
      <a-row>
        <a-col :span="24">
          <a-form-item
            label="结算单编号"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <span style="font-size: 12px">{{
              statementInfo.settlementCode
            }}</span>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            label="合同名称"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <span style="font-size: 12px">{{
              statementInfo.contractName
            }}</span>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            label="合同编号"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <span style="font-size: 12px">{{
              statementInfo.contractCode
            }}</span>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            label="合同类型"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <span
              v-if="statementInfo.contractType == 1"
              style="font-size: 12px"
              class="value"
            >全包合同</span>
            <span
              v-else-if="statementInfo.contractType == 2"
              style="font-size: 12px"
              class="value"
            >折扣合同</span>
            <span
              v-else-if="statementInfo.contractType == 4"
              style="font-size: 12px"
              class="value"
            >单价合同</span>
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item
            label="发票类型"
            required
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <a-select
              v-model:value="statementInfo.invoiceType"
              style="width: 200px"
              :disabled="isDetail"
            >
              <a-select-option value="VAT">
                增值税发票
              </a-select-option>
              <a-select-option value="ORDINARY">
                普通发票
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            label="结算期别"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <a-input-number
              v-model:value="statementInfo.settlementPeriod"
              placeholder="请输入期别"
              type=""
              style="width: 200px"
              :disabled="isDetail"
              @blur="chackPeriod"
            />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item
            label="结算事由"
            required
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <a-textarea
              v-model:value="statementInfo.matter"
              placeholder="请输入结算事由"
              style="width: 200px"
              :disabled="isDetail"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            label="结算金额(元)"
            required
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <a-input-number
              v-model:value="statementInfo.settlementAmount"
              style="width: 200px"
              placeholder="请输入结算金额"
              :disabled="isDetail"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            label="结算申请日期"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <a-date-picker
              v-model:value="statementInfo.settlementDate"
              :disabled="isDetail"
              value-format="YYYY-MM-DD"
              style="width: 200px"
            />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item
            label="备注"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <a-input
              v-model:value="statementInfo.remark"
              placeholder="请输入备注"
              :disabled="isDetail"
              style="width: 200px"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            label="附件"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <a-upload
              :multiple="true"
              :file-list="fileList"
              :action="uploadUrl"
              :disabled="isDetail"
              @change="handleFileChange"
            >
              <a-button>选择文件 </a-button><span style="font-size: 12px; margin-left: 20px; color: #5ab266">请上传小于500M的文件</span>
            </a-upload>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
  <!-- <a-button @click="confirmCallBack">结算办理</a-button> -->
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import ajax from '~/providers/common/ajax'
import { rootUrl } from '~/providers/configs/rootUrl'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { createFinalStatement } from '../api'

export default {
  components: {},
  props: [],
  emits: ['update:value'],
  data() {
    return {
      isDetail: false,
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      contractId: localStorage.getItem('contractId'),
      // consignIds: localStorage.getItem("consignIds"),

      statementInfo: {
        settlementDate: dayjs().format('YYYY-MM-DD'),
      },
      fileList: [],
      confirmLoading: false,
    }
  },
  watch: {},
  created() {
    this.getData()
    window.confirmCallBack = this.confirmCallBack
  },
  methods: {
    async chackPeriod() {
      if (
        this.statementInfo.settlementPeriod == ''
        || this.statementInfo.settlementPeriod == null
      ) {
        return
      }
      const res = await ajax.get(
        `/rest/fee/settlement/${this.contractId}/${this.statementInfo.settlementPeriod}/check-period`,
      )
      if (res.code !== 20000 || !res.data) {
        window.$oAntdMessage.warning(res.message || '结算期别重复!')
        this.statementInfo.settlementPeriod = null
      }
    },
    async confirmCallBack() {
      if (
        !this.statementInfo.invoiceType
        || !this.statementInfo.matter
        || !(this.statementInfo.settlementAmount >= 0)
      ) {
        window.$oAntdMessage.warning('请检查必填项是否填写完整')
        return
      }

      const files = []
      this.fileList.forEach((it) => {
        if (it.response.success) {
          files.push({ attachmentId: it.response.obj[0].id })
        }
      })
      const p = {
        ...this.statementInfo,
        attachments: files,
      }
      const res = await ajax.post(
        '/rest/fee/settlement/contract/settlement',
        JSON.stringify(p),
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      )
      return res
    },
    handleFileChange({ fileList }) {
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
    onCancel() {
      $emit(this, 'update:value', false)
      window.$oNextTick(() => {
        this.confirmLoading = false
      })
    },

    async getData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, queryParams, sortParams } = this
      const params = {
        settlementType: 'CONTRACT_PROCESS',
        // "consignIds": this.consignIds.split(","),
        contractId: this.contractId,
      }
      // 获取列表
      this.loading = true
      try {
        const res = await createFinalStatement(params)
        this.loading = false
        if (res.code === 20000) {
          // eslint-disable-next-line ts/no-unused-expressions
          res.data.invoiceType ? '' : (res.data.invoiceType = 'VAT')
          this.statementInfo = res.data
        }
        else {
          window.$oAntdConfirm({
            title: '提示',
            content: res.message,
            okText: '确认',
            mask: false,
            cancelText: '取消',
            onOk: () => {
              window.parent.layer.closeAll && window.parent.layer.closeAll()
            },
            onCancel() {
              window.parent.layer.closeAll && window.parent.layer.closeAll()
            },
          })
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        this.loading = false
      }
    },

    // 上传附件
    onUpload() {
      this.$refs.UploadComponent.showModal()
    },

    // 打开附件
    openFile(item) {
      window.open(item.url)
    },
  },
}
</script>

<style lang="less" scoped>
.issuance-filelist {
  &:hover {
    .anticon-delete {
      display: inline-block;
    }
  }

  .anticon-delete {
    display: none;
    color: red;
    vertical-align: middle;
    margin-left: 8px;
    cursor: pointer;
    font-size: 14px;
  }
}
</style>
