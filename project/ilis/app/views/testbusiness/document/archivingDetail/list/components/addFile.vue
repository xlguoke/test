<template>
  <div>
    <ht-modal
      :title="editId ? '编辑归档' : '新增归档'"
      :open="visible"
      :mask-closable="false"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form ref="formRef" :model="dataObj">
            <a-form-item
              label="档案名称"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              :rules="[{ required: true, message: '档案名称不能为空!' }]"
              name="dataName"
            >
              <a-input
                v-model:value="dataObj.dataName"
                :disabled="isDetail"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="归档地址"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              :rules="[{ required: true, message: '归档地址不能为空!' }]"
              name="archiveAddress"
            >
              <a-row :gutter="15">
                <a-col :span="18">
                  <a-input
                    v-model:value="dataObj.archiveAddress"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-button
                    :disabled="isDetail"
                    style="float: right"
                    @click="adsVisible = true"
                  >
                    选择
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item
              label="档案编号"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="dataNo"
            >
              <a-textarea
                v-model:value="dataObj.dataNo"
                :disabled="isDetail"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="归档日期"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="archiveTime"
            >
              <a-date-picker
                v-model:value="dataObj.archiveTime"
                style="width: 100%"
                :disabled="isDetail"
                placeholder="请选择"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
      <ht-modal
        title="选择归档地址"
        :open="adsVisible"
        width="80%"
        @cancel="cancelModal"
        @ok="getAddress"
      >
        <iframe
          id="adsVisible"
          style="border: 0"
          width="100%"
          height="400px"
          :src="adsVisibleUrl"
        ></iframe>
      </ht-modal>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      spinning: false,
      rootUrl,
      formLaydeparts: 'horizontal',
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
      dayjs,
      visible: false,
      isDetail: false,
      editId: '',
      eqData: null,
      dataObj: {},
      adsVisible: false,
      adsVisibleUrl: `${rootUrl}/archiveSiteController.do?goArchiveSitePage&onlySelect=1`,
    }
  },
  created() {},
  methods: {
    cancelModal() {
      this.adsVisible = false
    },
    // 获取归档地址
    getAddress() {
      const data = document
        .getElementById('adsVisible')
        .contentWindow
        .$('#dataGrid')
        .datagrid('getSelections')
      if (data.length > 0) {
        this.adsVisible = false
        this.dataObj.archiveAddress = data[0].site
        this.eqData = data[0]
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择归档地址'))
      }
    },
    showModal(dataObj, isDetail) {
      this.visible = true
      this.isDetail = isDetail
      if (dataObj) {
        this.editId = dataObj.id
        this.dataObj = dataObj
        this.eqData = { site: dataObj.archiveAddress }
      }
    },
    dataRequired() {
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = this.dataObj
        const data = {
          ...fieldsValue,
          archiveTime: fieldsValue.archiveTime,
          archiveAddress: this.eqData ? this.eqData.site : '',
        }

        if (this.dataObj.id) {
          data.id = this.dataObj.id
        }

        if (this.dataRequired(data)) {
          this.spinning = true
          if (this.editId) {
            window.$oAjax({
              url: window.$oApi.archivingDetail.updateArchives,
              method: 'PUT',
              data,
              headers: {
                'Content-Type': 'application/json',
              },
            }).then((res) => {
              if (res.code === 20000) {
                window.$oAntdMessage.success('修改成功')
                this.handleCancel()
                window.$oNextTick(() => {
                  this.$parent.reloadList()
                })
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
          }
          else {
            this.callback(data)
          }
        }
      })
    },
    handleCancel() {
      this.spinning = false
      this.editId = ''
      this.dataObj = {}
      this.eqData = null
      this.visible = false
    },
  },
}
</script>

<style scoped></style>
