<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <ht-modal
      v-model:open="_value"
      :title="modalTitle"
      :mask-closable="false"
      :centered="true"
      width="640px"
      :confirm-loading="confirmLoading"
      @ok="handleSubmit"
      @cancel="onCancel"
    >
      <div class="issuance">
        <a-form ref="formRef">
          <a-row>
            <a-col :span="24">
              <a-form-item
                label="发放方式"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-radio-group
                  v-model:value="dataSource.issuanceType"
                  name="radioGroup"
                  :disabled="readonly"
                >
                  <a-radio :value="1">
                    自取
                  </a-radio>
                  <a-radio :value="2">
                    邮寄
                  </a-radio>
                  <a-radio :value="3">
                    传真
                  </a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="经办人"
                required
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-input
                  v-model:value="dataSource.fptt"
                  :disabled="readonly"
                  placeholder="请输入经办人"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="发放日期"
                required
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-date-picker
                  v-model:value="dataSource.ffrq"
                  style="width: 100%"
                  placeholder="请选择"
                  :disabled="readonly"
                  :allow-clear="false"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </a-col>

            <template v-if="dataSource.issuanceType === 1">
              <a-col :span="24">
                <a-form-item
                  label="领取人"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-input
                    v-model:value="dataSource.lqr"
                    placeholder="请输入领取人"
                    :disabled="readonly"
                  />
                </a-form-item>
              </a-col>
            </template>
            <template v-if="dataSource.issuanceType === 2">
              <a-col :span="24">
                <a-form-item
                  label="邮寄信息"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-flex>
                    <a-input
                      v-model:value="dataSource.yjxx"
                      :style="`width:${readonly ? '100%' : '408px'}`"
                      placeholder="请输入邮寄信息"
                      :disabled="readonly"
                    />
                    <a-button
                      v-if="!readonly"
                      type="primary"
                      class="toolBtn-bar ml-2"
                      @click="sVisible = true"
                    >
                      选择邮寄信息
                    </a-button>
                  </a-flex>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item
                  label="收件人"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-input
                    v-model:value="dataSource.sjr"
                    placeholder="请输入收件人"
                    :disabled="readonly"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item
                  label="收件人电话"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-input
                    v-model:value="dataSource.sjrdh"
                    placeholder="请输入收件人电话"
                    :disabled="readonly"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item
                  label="邮寄地址"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-input
                    v-model:value="dataSource.yjdz"
                    placeholder="请输入邮寄地址"
                    :disabled="readonly"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item
                  label="邮寄公司"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-select
                    v-model:value="dataSource.yjgs"
                    placeholder="请输入邮寄公司"
                    :disabled="readonly"
                  >
                    <a-select-option
                      v-for="item in expressCompanyData"
                      :key="item.id"
                    >
                      {{ item.typename }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item
                  label="邮寄单号"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-input
                    v-model:value="dataSource.yjdh"
                    placeholder="请输入邮寄单号"
                    :disabled="readonly"
                  />
                </a-form-item>
              </a-col>
            </template>
            <template v-if="dataSource.issuanceType === 3">
              <a-col :span="24">
                <a-form-item
                  label="传真号"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-input
                    v-model:value="dataSource.czh"
                    placeholder="请输入传真号"
                    :disabled="readonly"
                  />
                </a-form-item>
              </a-col>
            </template>
            <a-col :span="24">
              <a-form-item
                label="备注"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-input
                  v-model:value="dataSource.bz"
                  :disabled="readonly"
                  placeholder="请输入备注"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="附件"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-button v-if="!readonly" type="primary" @click="onUpload">
                  上传
                </a-button>
                <p
                  v-for="(item, index) in dataSource.fileLists"
                  :key="index"
                  class="issuance-filelist"
                >
                  <a href="javascript:;" @click="openFile(item)">{{
                    item.name
                  }}</a>
                  <DeleteOutlined title="删除" @click="deleteFile(item)" />
                </p>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <template v-if="type == 'detail'" #footer>
        <a-button type="primary" @click="onCancel">
          关闭
        </a-button>
        <div style="clear: both"></div>
      </template>
      <template v-else #footer>
        <a-button @click="onCancel">
          取消
        </a-button>
        <a-button type="primary" @click="handleSubmit">
          确定
        </a-button>
        <div style="clear: both"></div>
      </template>
    </ht-modal>

    <SelectMailList
      v-model:value="sVisible"
      :invoice-ids="invoiceIds"
      @on-change="getMail"
    />
    <UploadComponent
      ref="UploadComponent"
      :uploadcall="uploadcall"
      :file-lists="dataSource.fileLists"
    />
  </div>
</template>

<script>
import { DeleteOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { addIssuance } from '../../api'
import SelectMailList from './selectMailList.vue'

export default {
  components: {
    SelectMailList,
    UploadComponent,
    DeleteOutlined,
  },
  props: ['value', 'invoiceIds', 'type', 'rowData'],
  emits: ['update:value', 'on-success'],
  data() {
    return {

      dataSource: {
        issuanceType: 1,
        fileLists: [],
      },
      confirmLoading: false,
      modalTitle: '发票发放',
      readonly: false,
      sVisible: false,
      expressCompanyData: [],
      userInfo: {},
    }
  },
  computed: {
    _value() {
      return this.value
    },
  },
  watch: {
    'dataSource.issuanceType': function () {
      if (!this.dataSource.fptt) {
        this.dataSource.fptt = this.userInfo.realName
      }
    },
    value(val) {
      if (val === true && this.type === 'add') {
        this.dataSource.fptt = this.userInfo.realName
        this.dataSource.ffrq = dayjs(new Date()).format('YYYY-MM-DD')
      }
    },
    type(val) {
      if (val === 'add') {
        this.modalTitle = '发票发放'
      }
      else if (val === 'edit') {
        this.modalTitle = '编辑发票发放'
      }
      else if (val === 'detail') {
        this.modalTitle = '查看发票发放详情'
      }
      else {
        this.modalTitle = ''
      }

      if (val === 'detail') {
        this.readonly = true
      }
      else {
        this.readonly = false
      }
    },
    rowData() {
      if (this.type === 'edit' || this.type === 'detail') {
        this.dataSource = {
          ...this.rowData,
          fileLists: this.rowData.fileLists || [],
        }
      }
    },
  },
  created() {
    this.getExpressData()

    try {
      this.userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  },
  methods: {
    onCancel() {
      $emit(this, 'update:value', false)
      window.$oNextTick(() => {
        this.confirmLoading = false
        this.dataSource = {
          issuanceType: 1,
          fileLists: [],
        }
      })
    },
    // 获取邮寄公司
    getExpressData() {
      const formData = new FormData()
      formData.append('dictGroupId', '402882206762317b0167626787270002')

      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.expressCompanyData = res.obj
        }
        else {
          message.error(res.msg)
        }
      })
    },
    // 获取选择的邮寄信息
    getMail(row) {
      if (row) {
        const { receiver, phone, address, expressCompany, infoSubject } = row
        this.dataSource.sjr = receiver
        this.dataSource.yjxx = infoSubject
        this.dataSource.sjrdh = phone
        this.dataSource.yjdz = address
        this.dataSource.yjgs = expressCompany
      }
    },
    // 上传附件
    onUpload() {
      this.$refs.UploadComponent.showModal()
    },
    uploadcall(res) {
      this.dataSource.fileLists = res.map(item => ({
        uid: item.id || item.uid,
        name: item.attachmenttitle || item.name,
        status: 'done',
        url: item.realpath || item.url,
      }))
    },
    // 打开附件
    openFile(item) {
      window.open(item.url)
    },
    // 删除附件
    deleteFile(item) {
      this.dataSource.fileLists = this.dataSource.fileLists.filter(
        file => file.id !== item.id,
      )
    },
    async handleSubmit() {
      if (!this.dataSource.fptt) {
        message.warning('请输入经办人')
        return
      }

      if (!this.dataSource.ffrq) {
        message.warning('请选择发放日期')
        return
      }

      const formData = {
        ids: this.invoiceIds,
        issuanceType: this.dataSource.issuanceType,
        issuanceDate: this.dataSource.ffrq,
        issuanceContent: { ...this.dataSource },
      }

      if (formData.issuanceContent.ffrq) {
        formData.issuanceContent.ffrq = dayjs(
          formData.issuanceContent.ffrq,
        ).format('YYYY-MM-DD')
      }
      formData.issuanceContent = JSON.stringify(formData.issuanceContent)

      this.confirmLoading = true
      try {
        const res = await addIssuance(formData)
        this.confirmLoading = false
        if (res.code !== 20010) {
          message.success('操作成功')
          this.onCancel()
          $emit(this, 'on-success')
        }
        else {
          message.error(res.message || res.msg)
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        this.confirmLoading = false
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
