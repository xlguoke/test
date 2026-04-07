<template>
  <div>
    <!-- <a-spin :spinning="spinning"> -->
    <!-- <div class="spin-content"> -->
    <a-form ref="formRef" :model="dataObj">
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="供应商名称"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: `供应商名称不能为空!` }]"
            name="name"
          >
            <a-row :gutter="15">
              <a-col :span="18">
                <a-input
                  v-model:value="dataObj.name"
                  :disabled="true"
                  :class="{ readonlyCls: !isDetail }"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="eqVisible = true"
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="联系人"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.contacts"
              :disabled="true"
              :class="{ readonlyCls: !isDetail }"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="邮编"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.postcode"
              :disabled="true"
              :class="{ readonlyCls: !isDetail }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="地址"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.site"
              :disabled="true"
              :class="{ readonlyCls: !isDetail }"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="联系电话"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.tel"
              :disabled="true"
              :class="{ readonlyCls: !isDetail }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="手机"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.mobile"
              :readonly="true"
              :disabled="isDetail"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="经营内容"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-textarea
              v-model:value="dataObj.operationContent"
              :disabled="true"
              :class="{ readonlyCls: !isDetail }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="备注"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-textarea
              v-model:value="dataObj.remark"
              :disabled="true"
              :class="{ readonlyCls: !isDetail }"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <div>质保体系资料</div>
      <a-row class="filesBox">
        <a-col :span="rowCol">
          <a-form-item
            label="营业执照"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <!-- <a-button @click="upload('1')">上传文件</a-button> -->
            <div v-for="(item, index) in fileGroup[1].tEqFileVos" :key="index">
              <a
                :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.attachmentId}`"
              >{{ item.name }}</a>
            </div>
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="产品认证"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <!-- <a-button @click="upload('4')">上传文件</a-button> -->
            <div v-for="(item, index) in fileGroup[4].tEqFileVos" :key="index">
              <a
                :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.attachmentId}`"
              >{{ item.name }}</a>
            </div>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="通过质保体系"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <!-- <a-button @click="upload('5')">上传文件</a-button> -->
            <div v-for="(item, index) in fileGroup[5].tEqFileVos" :key="index">
              <a
                :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.attachmentId}`"
              >{{ item.name }}</a>
            </div>
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="税务登记证"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <!-- <a-button @click="upload('2')">上传文件</a-button> -->
            <div v-for="(item, index) in fileGroup[2].tEqFileVos" :key="index">
              <a
                :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.attachmentId}`"
              >{{ item.name }}</a>
            </div>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="组织机构代码证"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <!-- <a-button @click="upload('3')">上传文件</a-button> -->
            <div v-for="(item, index) in fileGroup[3].tEqFileVos" :key="index">
              <a
                :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.attachmentId}`"
              >{{ item.name }}</a>
            </div>
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="其他"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <!-- <a-button @click="upload('0')">上传文件</a-button> -->
            <div v-for="(item, index) in fileGroup[0].tEqFileVos" :key="index">
              <a
                :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.attachmentId}`"
              >{{ item.name }}</a>
            </div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <!-- </div> -->
    <!-- </a-spin> -->
    <ht-modal
      title="选择供应商"
      :open="eqVisible"
      width="80%"
      @cancel="cancelModal"
      @ok="getEq"
    >
      <!-- supplierController.do?goSupplierList -->
      <iframe
        id="eqVisible"
        style="border: 0"
        width="100%"
        height="400px"
        :src="eqVisibleUrl"
      ></iframe>
    </ht-modal>
    <!-- <AddOrg ref="AddOrg" :callback="getOrg" /> -->
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
    <UploadComponent
      ref="UploadComponent"
      :max="1"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    TableTreePersonnel,
    // AddOrg,
    UploadComponent,
  },
  props: ['callback'],
  data() {
    return {
      isDetail: false,
      rootUrl,
      formLayout: 'horizontal',

      dayjs,
      labelCol: { span: 7 },
      wrapperCol: { span: 16 },
      rowCol: 12,
      eqVisible: false,
      eqVisibleUrl: `${rootUrl}/supplierController.do?goSupplierList&onlySelect=1`,
      eqData: null,
      personDatas: {
        contacts: [{ id: '', name: '' }],
      },
      clonePersonDatas: {
        contacts: [{ id: '', name: '' }],
      },
      dataObj: {},
      // orgData: [{id: "", name: ""}],
      fileLists: [],
      obj: {
        0: '其他',
        1: '营业执照',
        2: '税务登记证',
        3: '组织机构代码证',
        4: '产品认证',
        5: '通过质保体系',
      },
      fileGroup: {
        0: { tEqFileVos: [], fileLists: [] },
        1: { tEqFileVos: [], fileLists: [], numbers: 1 },
        2: { tEqFileVos: [], fileLists: [], numbers: 1 },
        3: { tEqFileVos: [], fileLists: [], numbers: 1 },
        4: { tEqFileVos: [], fileLists: [], numbers: 1 },
        5: { tEqFileVos: [], fileLists: [], numbers: 1 },
      },
      cloneFileGroup: {
        0: { tEqFileVos: [], fileLists: [] },
        1: { tEqFileVos: [], fileLists: [], numbers: 1 },
        2: { tEqFileVos: [], fileLists: [], numbers: 1 },
        3: { tEqFileVos: [], fileLists: [], numbers: 1 },
        4: { tEqFileVos: [], fileLists: [], numbers: 1 },
        5: { tEqFileVos: [], fileLists: [], numbers: 1 },
      },
      fileGroupType: '',
      editId: '',
    }
  },
  created() {
    // this.getStatus()
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id = getQueryVariable('id') || '4028826372358837017236030137001f'
      this.showModal(id, true)
    }
  },
  methods: {
    getPerson(idsPerson, acceptData) {
      this.dataObj.contacts = ''
      this.personDatas[idsPerson] = acceptData
    },
    setPersonnels(type, idsPerson, title) {
      const acceptData = this.personDatas[idsPerson]
      this.$refs.TableTreePersonnel.showModal(
        type,
        idsPerson,
        acceptData,
        title,
      )
    },
    showModal(dataObj, isDetail) {
      this.isDetail = isDetail
      if (dataObj) {
        this.dataObj = dataObj
        this.editId = this.dataObj.id
        this.eqData = { id: this.dataObj.supplierId }
        this.filesCallback()
      }
      else {
        this.fileLists = []
      }
    },
    dataRequired() {
      return true
    },
    validateFields() {
      let data
      return new Promise((resolve) => {
        this.$refs.formRef.validateFields().then(() => {
          const values = { ...this.dataObj }
          data = {
            ...values,
            contactsId:
              this.personDatas.contacts.length > 0
              && values.contacts === this.personDatas.contacts[0].name
                ? this.personDatas.contacts[0].id
                : '',
            contacts: values.contacts ? values.contacts : '',
            buyTime: values.buyTime
              ? dayjs(values.buyTime).format('YYYY-MM-DD')
              : '',
            supplierId: this.eqData ? this.eqData.id : '',
          }
          const fileGroupArr = []
          for (const index in this.fileGroup) {
            fileGroupArr.push({
              relationFunctionFileType: index,
              tEqFileVos: this.fileGroup[index].tEqFileVos,
            })
          }
          data.fileGroupStr = JSON.stringify(fileGroupArr)
          if (this.dataObj.id) {
            if (this.editId) {
              data.id = this.editId
            }
            else {
              delete data.id
            }
          }
          resolve(data)
        }).catch(() => {
          resolve(null)
        })
      })
    },
    async handleOk() {
      const data = await this.validateFields()
      if (data && this.dataRequired(data)) {
        return data
      }
    },
    handleCancel() {
      this.dataObj = {}
      this.personDatas = JSON.parse(JSON.stringify(this.clonePersonDatas))
      this.fileGroup = JSON.parse(JSON.stringify(this.cloneFileGroup))
      // this.orgData = [];
    },
    setOrg() {
      // this.$refs.AddOrg.showModal('radio', 'depart', this.orgData);
    },
    getOrg() {
      // this.orgData = orgData;
    },
    upload(type) {
      this.fileGroupType = type
      this.fileLists = this.fileGroup[type].tEqFileVos
      this.$refs.UploadComponent.showModal()
    },
    uploadcall(res) {
      this.fileGroup[this.fileGroupType].tEqFileVos = res.map(item => ({
        uid: item.id || item.uid,
        name: item.attachmenttitle || item.name,
        url: item.realpath || item.url,
      }))
    },
    cancelModal() {
      this.eqVisible = false
    },
    // 获取供应商
    getEq() {
      const data = document
        .getElementById('eqVisible')
        .contentWindow
        .$('#dataGrid')
        .datagrid('getSelections')
      if (data.length > 0) {
        this.eqVisible = false
        this.dataObj.name = {}
        this.eqData = data[0]
        this.dataObj = this.eqData
        this.filesCallback()
        this.$refs.formRef.validateFields(['name'])
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择供应商'))
      }
    },
    filesCallback() {
      // this.fileGroup = this.cloneFileGroup;
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.equipBuyList.getSupplier,
        params: { relationEntityId: this.dataObj.id },
      }).then((res) => {
        if (res.success && res.obj.length > 0) {
          for (const index in this.fileGroup) {
            let isEqual = false
            for (let j = 0; j < res.obj.length; j++) {
              const arr = res.obj[j].tEqFileVos
              if (index === res.obj[j].relationFunctionFileType) {
                isEqual = true
                this.fileGroup[index].tEqFileVos = arr.map(item => ({
                  id: item.id || item.uid,
                  name: item.attachmenttitle || item.name,
                  url: item.realpath || item.url,
                  attachmentId: item.attachmentId,
                }))
                continue
              }
            }
            if (!isEqual) {
              this.fileGroup[index].tEqFileVos = []
            }
          }
        }
        else {
          this.fileGroup = this.cloneFileGroup
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.hitek-add-modal .ant-form-item-label {
  width: 94px !important;
}
</style>
