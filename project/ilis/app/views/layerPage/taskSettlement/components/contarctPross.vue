<!-- eslint-disable vue/eqeqeq -->
<template>
  <div>
    <ht-modal
      v-model:open="detailsVisible"
      title="详情"
      width="90%"
      @ok="detailsVisible = false"
      @cancel="detailsVisible = false"
    >
      <div class="issuance">
        <a-form>
          <a-row>
            <a-col :span="24">
              <a-form-item
                label="结算单编号"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <span>{{ statementInfo.settlementCode }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="合同名称"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <span>{{ statementInfo.contractName }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="合同编号"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <span>{{ statementInfo.contractCode }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="合同类型"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <span v-if="statementInfo.contractType == 1" class="value">全包合同</span>
                <span v-else-if="statementInfo.contractType == 2" class="value">折扣合同</span>
                <span v-else-if="statementInfo.contractType == 4" class="value">单价合同</span>
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
                <a-input
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
                <a-input
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
                  <a-button>选择文件</a-button><span
                    style="font-size: 12px; margin-left: 20px; color: #5ab266"
                  >请上传小于500M的文件</span>
                </a-upload>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <!-- <a-button @click="confirmCallBack">结算办理</a-button> -->
    </ht-modal>
  </div>
</template>

<script>
import ajax from '~/providers/common/ajax'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {},
  props: [],
  data() {
    return {
      detailsVisible: false,
      isDetail: true,
      statementInfo: {},
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      fileList: [],
      confirmLoading: false,
    }
  },
  watch: {},
  created() {},
  methods: {
    handleFileChange() {},
    async getData(id) {
      this.detailsVisible = true
      // 获取列表
      this.loading = true
      try {
        const res = await ajax.get(`/rest/fee/settlement/${id}`)

        this.loading = false
        if (res.code === 20000) {
          this.statementInfo = res.data
          this.fileList = res.data.attachments.map((it) => {
            return {
              status: 'done',
              name: it.attachmentName,
              url: it.attachmentPath,
              uid: it.attachmentId,
            }
          })
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        this.loading = false
      }
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
