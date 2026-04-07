<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form ref="formRef" :model="dataObj">
          <a-form-item
            label="选择设备"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '设备不能为空!' }]"
            name="name"
          >
            <a-row :gutter="15">
              <a-col :span="18">
                <a-input
                  v-model:value="dataObj.name"
                  :disabled="true"
                  :class="{ readonlyCls: !isDetail }"
                  placeholder="请选择"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="setEquip"
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="报废类型"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '报废类型不能为空!' }]"
            name="scrapType"
          >
            <a-select
              v-model:value="dataObj.scrapType"
              :disabled="isDetail"
              placeholder="请选择"
              @change="handleSelectChange"
            >
              <a-select-option
                v-for="(comItem) in statusData"
                :key="comItem.id"
                :value="comItem.typename"
              >
                {{ comItem.typename }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="报废单号"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            name="scrapSn"
          >
            <a-input
              v-model:value="dataObj.scrapSn"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="申请时间"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-date-picker
              v-model:value="dataObj.applyTime"
              :disabled="isDetail"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item
            label="报废时间"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-date-picker
              v-model:value="dataObj.scrapTime"
              :disabled="isDetail"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item
            label="经办部门"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-tree-select
              v-model:value="dataObj.operationDepart"
              :disabled="isDetail"
              style="width: 100%"
              :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
              placeholder="请选择经办部门"
              allow-clear
              :tree-data="departmentData"
              tree-default-expand-all
              show-search
            />
          </a-form-item>
          <a-form-item
            label="文件号"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.fileSn"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="处理依据"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.gist"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="报废原因"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-auto-complete
              v-model:value="dataObj.reason"
              :data-source="resonDataList"
              style="width: 100%"
              placeholder="请选择或输入"
            />
          </a-form-item>
          <a-form-item
            label="备注"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.remark"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="附件材料"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-button v-if="!isDetail" @click="upload">
              上传文件
            </a-button>
            <div v-for="(item, index) in fileLists" :key="index">
              <a
                :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`"
              >{{ item.name }}</a>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-spin>
    <SelectEquip ref="SelectEquip" :callback="getEquip" />
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
import qs from 'qs'
import { getQueryVariable } from '~/providers/common/utils'
import SelectEquip from '~/providers/components/equip/selectEquip.vue'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    TableTreePersonnel,
    UploadComponent,
    SelectEquip,
  },
  props: ['callback', 'departmentData'],
  data() {
    return {
      spinning: false,
      rootUrl,
      formLayout: 'horizontal',

      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dayjs,
      statusData: [],
      isDetail: false,
      dataObj: {},
      eqObj: null,
      fileLists: [],
      personDatas: { applyPerson: [{ id: '', name: '' }] },
      clonepersonDatas: { applyPerson: [{ id: '', name: '' }] },
      resonDataList: [],
    }
  },
  async created() {
  // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id
        = getQueryVariable('businessKey') || '4028826372409ea8017240e5e926000b'
      this.showModal(id, true)
    }
    const data = await this.getDictByCode('scrapReasonType')
    this.resonDataList = data.map(i => i.typeName)
  },
  methods: {
    handleSelectChange() {

    },
    async getDictByCode(dictCode) {
      const { data, code } = await window.$oAjax.get('rest/type/getTypesByGroupCode', { params: { groupCode: dictCode } })
      if (code === 20000) {
        return data
      }
    },
    getStatus() {
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.common.getDictionaryData}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '402882206b72e01e016b72f8bfd800x1',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.statusData = res.obj
        }
        else {
          this.statusData = []
        }
      })
    },
    // 选择设备  setEquip
    setEquip() {
      const acceptData = this.eqObj ? [this.eqObj] : []
      this.$refs.SelectEquip.showModal('radio', acceptData)
    },
    // 选择设备 回显
    getEquip(acceptData) {
      this.eqObj = acceptData[0]
      this.dataObj.name = this.eqObj.name
    },
    getPerson(idsPerson, acceptData) {
      this.personDatas[idsPerson] = acceptData
      this.dataObj[idsPerson] = acceptData[0].name
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
    showModal(editId, isDetail) {
      this.isDetail = isDetail
      this.getStatus()
      if (editId) {
        this.spinning = true
        window.$oAjax({
          method: 'get',
          url: window.$oApi.equipScrap.getById,
          params: { id: editId },
        }).then((res) => {
          if (res.success) {
            this.dataObj = res.obj
            this.dataObj.name = this.dataObj.equipmentName
            this.dataObj.applyTime = this.dataObj.applyTime ? dayjs(this.dataObj.applyTime).format('YYYY-MM-DD') : ''
            this.dataObj.scrapTime = this.dataObj.scrapTime ? dayjs(this.dataObj.scrapTime).format('YYYY-MM-DD') : ''
            this.eqObj = {
              id: this.dataObj.equipmentId,
              name: this.dataObj.equipmentName,
            }
            this.personDatas.applyPerson = [
              {
                id: this.dataObj.applyPersonId,
                name: this.dataObj.applyPerson,
              },
            ]
            this.fileLists = this.dataObj.files.map(item => ({
              uid: item.attachmentId,
              name: item.name,
              url: item.url,
            }))
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.dataObj = {}
          }
          this.spinning = false
        })
        this.spinning = false
      }
    },
    upload() {
      this.$refs.UploadComponent.showModal()
    },
    uploadcall(res) {
      this.fileLists = res.map(item => ({
        uid: item.id || item.uid,
        name: item.attachmenttitle || item.name,
        status: 'done',
        url: item.realpath || item.url,
      }))
    },
    dataRequired() {
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.dataObj }
        const data = {
          ...fieldsValue,
          applyPersonId: fieldsValue.applyPerson
            ? this.personDatas.applyPerson[0].id
            : '',
          scrapTime: fieldsValue.scrapTime || '',
          applyTime: fieldsValue.applyTime || '',
          attachmentIds: this.fileLists.length > 0 ? this.fileLists[0].uid : '',
        }
        if (this.eqObj) {
          data.equipmentId = this.eqObj.id
          data.equipmentName = this.eqObj.name // 设备名称
          // data.equipmentSn = this.eqObj.equipmentSn;
          // data.type = this.eqObj.type; // 设备类别
          // data.standard = this.eqObj.standard; // 规格型号
          // data.laboratoryName =this.eqObj.laboratoryName;
          // data.laboratoryId =this.eqObj.laboratoryId;
        }

        if (this.dataObj.id) {
          data.id = this.dataObj.id
        }

        if (this.dataRequired(data)) {
          this.spinning = true
          delete data.createDate
          delete data.updateDate
          window.$oAjax({
            method: 'POST',
            url: window.$oApi.equipScrap.saveUrl,
            data: qs.stringify(data),
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          }).then((res) => {
            if (res.success) {
              window.$oAntdMessage.success('操作成功')
              this.handleCancel()
              this.callback()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
        }
      })
    },
    handleCancel() {
      this.dataObj = {}
      this.eqObj = null
      this.fileLists = []
      this.personDatas = JSON.parse(JSON.stringify(this.clonepersonDatas))
    },
  },
}
</script>

<style lang="less">
.equipmentOutgo-add-modal {
  .ant-modal-body {
    max-height: 450px;
    overflow-y: auto;
  }
  .text-right {
    text-align: right;
  }
}
</style>
