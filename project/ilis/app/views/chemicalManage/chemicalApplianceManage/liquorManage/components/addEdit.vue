<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <ht-modal
      v-if="visible"
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="80%"
      class="hitek-add-modal"
      @cancel="
        () => {
          visible = false
        }
      "
    >
      <div class="show-required">
        <SpecialCharacterModal @select="inputSpecialChar"></SpecialCharacterModal>
      </div>
      <a-spin :spinning="spinning">
        <a-form ref="formRef" style="width: 100%" :model="formData">
          <a-collapse v-model:active-key="activeKey">
            <a-collapse-panel key="1" header="基本信息">
              <ul class="form_wrap">
                <li>
                  <a-form-item
                    label="化学名称"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    :rules="[{ required: true, message: `请选择` }]"
                    name="categoryName"
                  >
                    <a-space>
                      <a-input
                        v-model:value="formData.categoryName"
                        :disabled="true"
                        placeholder="请选择"
                      />
                      <a-button :disabled="isDetail" @click="handleAddChemicals">
                        选择
                      </a-button>
                    </a-space>
                  </a-form-item>
                </li>
                <li>
                  <a-form-item
                    label="配置溶液名称"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    :rules="[{ required: true, message: `请输入` }]"
                    name="name"
                  >
                    <a-input
                      ref="name"
                      v-model:value="formData.name"
                      ref-val="name"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </li>
                <li>
                  <a-form-item
                    label="溶液编号"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    :rules="[{ required: true, message: `请输入` }]"
                    name="sn"
                  >
                    <a-input
                      ref="sn"
                      v-model:value="formData.sn"
                      ref-val="sn"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </li>

                <li>
                  <a-form-item
                    label="溶液浓度"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    :rules="[{ required: true, message: `请输入` }]"
                    name="concentration"
                  >
                    <a-input
                      ref="concentration"
                      v-model:value="formData.concentration"
                      ref-val="concentration"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </li>
                <li>
                  <a-form-item
                    label="计量单位"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    name="unit"
                  >
                    <a-input
                      ref="unit"
                      v-model:value="formData.unit"
                      ref-val="unit"
                      :disabled="true"
                      placeholder="选择化学名称后，自动关联计量单位"
                    />
                  </a-form-item>
                </li>

                <li>
                  <a-form-item
                    label="配置数量"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    :rules="[{ required: true, message: `请输入` }]"
                    name="confectAmount"
                  >
                    <a-input-number
                      v-model:value="formData.confectAmount"
                      style="width: 100%"
                      :min="0"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </li>

                <li>
                  <a-form-item
                    label="配置日期"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    :rules="[{ required: true, message: `请选择` }]"
                    name="confectDate"
                  >
                    <a-date-picker
                      v-model:value="formData.confectDate"
                      :disabled="isDetail"
                      placeholder="请选择"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                    />
                  </a-form-item>
                </li>

                <li>
                  <a-form-item
                    label="失效日期"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    :rules="[{ required: true, message: `请选择` }]"
                    name="overdueDate"
                  >
                    <a-date-picker
                      v-model:value="formData.overdueDate"
                      :disabled="isDetail"
                      placeholder="请选择"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                    />
                  </a-form-item>
                </li>

                <li class="required_row">
                  <a-form-item
                    label="配置人"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                  >
                    <a-space>
                      <a-input
                        v-model:value="personFormat"
                        placeholder="请选择"
                        readonly
                        disabled
                      />
                      <a-button :disabled="isDetail" @click="selPersonFun()">
                        选择
                      </a-button>
                    </a-space>
                  </a-form-item>
                </li>

                <li>
                  <a-form-item
                    label="用途"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    :rules="[{ required: true, message: `请输入` }]"
                    name="usageInfo"
                  >
                    <a-input
                      ref="usageInfo"
                      v-model:value="formData.usageInfo"
                      ref-val="usageInfo"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </li>
                <li>
                  <a-form-item
                    label="配置方法"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    name="configMethod"
                  >
                    <a-input
                      ref="configMethod"
                      v-model:value="formData.configMethod"
                      ref-val="configMethod"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </li>
                <li>
                  <a-form-item
                    label="配置过程描述"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    name="confectProcess"
                  >
                    <a-input
                      ref="confectProcess"
                      v-model:value="formData.confectProcess"
                      ref-val="confectProcess"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </li>
                <li>
                  <a-form-item
                    label="备注"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    name="remark"
                  >
                    <a-input
                      ref="remark"
                      v-model:value="formData.remark"
                      ref-val="remark"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </li>
              </ul>
            </a-collapse-panel>
            <a-collapse-panel key="2" header="配置化学用品">
              <a-table
                :columns="columns"
                :data-source="chemicalsMingle"
                :pagination="false"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'totalAmount'">
                    <a-input-number
                      v-model:value="record.totalAmount"
                      :min="1"
                      :disabled="isDetail"
                    />
                  </template>
                  <template v-if="column.dataIndex === 'actions'">
                    <a
                      :disabled="isDetail"
                      href="javascript:;"
                      @click="onChemicalsRemove(record)"
                    >移除</a>
                  </template>
                </template>
              </a-table>
            </a-collapse-panel>
            <a-collapse-panel v-if="customProperties && customProperties.length" key="3" header="平行试验结果">
              <!-- 自定义属性部分 -->
              <IlisCustomPropertiesForm
                ref="customizeFormRef"
                :key="formData.id"
                customize-type="chemicalSolution"
                :label-col="{
                  span: 8,
                }"
                :cols="3"
                :default-value="formData.customizeValueList"
                :disabled="isDetail"
              >
              </IlisCustomPropertiesForm>
            </a-collapse-panel>
            <a-collapse-panel key="4" header="附件管理">
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
            </a-collapse-panel>
          </a-collapse>
        </a-form>
      </a-spin>

      <template #footer>
        <div>
          <a-button v-if="!isDetail" @click="handleCancel">
            取消
          </a-button>
          <a-button
            v-if="!isDetail"
            type="primary"
            :loading="spinning"
            @click="handleSaveOk"
          >
            暂存
          </a-button>
          <a-button
            v-if="!isDetail"
            type="primary"
            :loading="spinning"
            @click="handlePutStorageOk"
          >
            提交入库
          </a-button>
          <a-button
            v-if="!isDetail"
            type="primary"
            :loading="spinning"
            @click="handleShipmentOk"
          >
            领用出库
          </a-button>
        </div>
      </template>
    </ht-modal>

    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
    <SelChemicals ref="selChemicalsRef" :callback="getChemicalsData" />

    <PutStorage ref="putStorageRef" :callback="putStorageCallBack" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import qs from 'qs'
import { useCustomPropertiesHooks } from '~/hooks/useCustomPropertiesHooks'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import SelChemicals from '../../components/selChemicals.vue'
import PutStorage from './putStorage.vue'

const columns = [
  {
    title: '化学品名称编号',
    dataIndex: 'sn',
  },
  {
    title: '化学名称',
    dataIndex: 'name',
  },
  {
    title: '管理等级',
    dataIndex: 'manageLevel',
  },
  {
    title: '计量单位',
    dataIndex: 'unit',
  },
  {
    title: '[单位体积（质量)] 掺量',
    dataIndex: 'blendAmount',
  },
  {
    title: '实际使用数量',
    dataIndex: 'totalAmount',
  },
]

let selDomObj = null

export default {
  components: { TableTreePersonnel, SelChemicals, PutStorage },
  props: ['callback'],
  data() {
    return {
      selPersonData: [],
      chemicalsMingle: [],
      id: '',
      editType: 1, // 1 新增  2 修改
      fileList: [],
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      addEditTitle: '新增',
      visible: false,
      data: [],
      activeKey: [1, 2, 3, 4],
      spinning: false,
      isDetail: false,
      dayjs,
      columns,
      dataSource: [],
      customFields: [],
      formData: {
        categoryName: '',
        categoryId: '',
        confectDate: dayjs(new Date()).format('YYYY-MM-DD'),
      },
      selPersonData: [],
      measurementUnit: [],
      safetyType: [],
      featureType: [],
      levelList: [],

      selManageLeve: {},
      selChemicalsData: [],

      customProperties: [],
    }
  },
  computed: {
    // 计算属性的 getter
    personFormat() {
      const nameArr = this.selPersonData.map((it) => {
        return it.name
      })
      return nameArr.join()
    },
  },
  created() {
    this.init()
    const {
      customProperties,
    } = useCustomPropertiesHooks({
      customizeType: 'chemicalSolution',
    })
    this.customProperties = customProperties
    document.body.addEventListener('click', (event) => {
      if (event.target.tagName === 'INPUT') {
        selDomObj = event.target
      }
    })
  },
  methods: {
    inputSpecialChar(v) {
      const d = selDomObj
      try {
        const refVal = d.getAttribute('ref-val')
        const cursorIndex = d.selectionStart // 获取光标下标
        const nowValArr = d.value.split('') // 转换成数组
        nowValArr.splice(cursorIndex, 0, v) // 分割数组，并添加新的成员

        const customItem = this.customFields.find(i => i.id === refVal)
        if (customItem) {
          customItem.columnValue = nowValArr.join('')
        }
        else {
          this.formData[refVal] = nowValArr.join('')
        }

        d.selectionStart = cursorIndex + 1 // 光标移动+1
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (error) {
        console.error('特殊字符录入失败！')
      }
    },
    init() {
      // this.dictionary("chemical_measurement_unit_id").then((res) => {
      //   this.measurementUnit = res.obj;
      // });
      // this.dictionary("chemical_safety_type_id").then((res) => {
      //   this.safetyType = res.obj;
      // });
      // this.dictionary("chemical_feature_id").then((res) => {
      //   this.featureType = res.obj;
      // });
      // this.getLevelList();
    },

    async openModel(id, isDetail) {
      this.isDetail = isDetail
      this.clearForm()
      this.visible = true
      if (id) {
        this.id = id
        this.addEditTitle = '编辑'
        if (isDetail) {
          this.addEditTitle = '详情'
        }
        this.editType = 2
        const res = await window.$oAjax.get(`/rest/chemical/solution/${id}`)
        if (res.code === 20000) {
          this.formData = res.data

          if (res.data.personIds) {
            res.data.personIds.split(',').forEach((it, index) => {
              this.selPersonData.push({
                name: res.data.personNames.split(',')[index],
                id: it,
              })
            })
          }

          if (res.data.solutionBlendeds && res.data.solutionBlendeds.length) {
            this.chemicalsMingle = res.data.solutionBlendeds
          }

          this.selChemicalsData = [
            {
              name: res.data.categoryName,
              id: res.data.categoryId,
            },
          ]

          if (res.data.attachments.length) {
            this.fileList = res.data.attachments.map((it) => {
              return {
                uid: it.id,
                name: it.attachmenttitle,
                status: 'done',
                response: {
                  success: true,
                  obj: [it],
                },
                url: it.realpath,
              }
            })
          }
        }
      }
      else {
        this.addEditTitle = '新增'
      }
    },
    clearForm() {
      this.id = ''
      this.formData = {}
      this.selPersonData = []
      this.selManageLeve = []
      this.selChemicalsData = []
      this.fileList = []
      this.activeKey = [1, 2, 3, 4]
      this.chemicalsMingle = []
    },
    async dictionary(type) {
      const res = await window.$oAjax.post(
        window.$oApi.common.getDictionaryData,
        qs.stringify({
          dictGroupId: type,
        }),
      )
      return res
    },
    async getLevelList() {
      window.$oAjax
        .get(`/rest/chemical/level/all`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code == '20000') {
            this.levelList = res.data
          }
        })
    },

    changeManageLeve(value, option) {
      this.selManageLeve = option.data.attrs.data
    },

    selPersonFun() {
      // this.$refs.TableTreePersonnel.showModal(type, idsPerson, acceptData, title);
      this.$refs.TableTreePersonnel.showModal(
        '',
        '',
        this.selPersonData,
        '选择人员',
      )
    },
    handleCancel() {
      this.visible = false
    },
    formDataFormat(callback) {
      this.$refs.formRef.validateFields().then(async () => {
        const customizeValueList = await this.$refs.customizeFormRef.getFormData()
        const data = { ...this.formData, customizeValueList }
        if (this.selPersonData.length) {
          const nameArr = []
          const idArr = []
          this.selPersonData.forEach((it) => {
            nameArr.push(it.name)
            idArr.push(it.id)
          })
          data.personNames = nameArr.join()
          data.personIds = idArr.join()
        }

        if (this.fileList.length) {
          data.attachments = this.fileList.map((it) => {
            return it.response.obj[0]
          })
        }
        data.categoryName = this.selChemicalsData[0].name
        data.categoryId = this.selChemicalsData[0].id

        data.solutionBlendeds = this.chemicalsMingle

        if (this.id) {
          data.id = this.id
        }

        if (callback) {
          callback(data)
        }
      })
    },
    handlePutStorageOk() {
      this.formDataFormat(async (data) => {
        this.$refs.putStorageRef.openModel(data)
      })
    },

    handleShipmentOk() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      this.formDataFormat(async (data) => {
        window.$oAntdConfirm({
          title: '是否直接领用出库？',
          content:
            '领用出库后，已登记溶液将自动在系统中完成入库、出库记录且出库数量等于入库数量。',
          async onOk() {
            that.spinning = true
            const res = await window.$oAjax.post(
              'rest/chemical/solution/passInventory',
              data,
              {
                headers: {
                  'content-type': 'application/json',
                },
              },
            )
            that.spinning = false
            if (res.code === 20000) {
              window.$oAntdMessage.success('操作成功')
              that.visible = false
              that.callback()
            }
            else {
              window.$oAntdMessage.warning(res.message)
            }
          },
          onCancel() {},
        })
      })
    },
    handleSaveOk() {
      this.formDataFormat(async (data) => {
        this.spinning = true
        const res = await window.$oAjax.post('rest/chemical/solution/save', data, {
          headers: {
            'content-type': 'application/json',
          },
        })
        this.spinning = false
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.visible = false
          this.callback()
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
      })
    },
    async putStorageCallBack(d) {
      this.spinning = true
      this.$refs.putStorageRef.closeModel()
      const res = await window.$oAjax.post(
        'rest/chemical/solution/submitInventory',
        d,
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      )
      this.spinning = false
      if (res.code === 20000) {
        window.$oAntdMessage.success('操作成功')
        this.visible = false
        this.callback()
      }
      else {
        window.$oAntdMessage.warning(res.message)
      }
    },

    getPerson(idsPerson, acceptData) {
      this.selPersonData = acceptData
    },

    handleAddChemicals() {
      this.$refs.selChemicalsRef.showModal('radio')
    },
    getChemicalsData(row) {
      // this.$set(this.formData, "categoryName", row[0].name);
      // this.$set(this.formData, "categoryId", row[0].id);
      this.formData.name = row[0].name
      this.formData.confectProcess = row[0].confectProcess
      this.formData.categoryName = row[0].name
      this.formData.categoryId = row[0].id
      this.formData.unit = row[0].unit
      this.formData.usageInfo = row[0].effect
      this.formData.configMethod = row[0].configMethod

      // this.$set(this.formData, "confectProcess", row[0].confectProcess);

      if (row[0].keeperIds) {
        const nameArr = row[0].keepers.split(',')
        this.selPersonData = row[0].keeperIds.split(',').map((it, index) => {
          return {
            id: it,
            name: nameArr[index],
          }
        })
      }

      this.selChemicalsData = row
      // this.formData['categoryName']=row[0].name
      // this.formData['categoryId']=row[0].id
      // this.selChemicalsData = row;
      this.getChemicalsDet(row[0].id)
    },
    async getChemicalsDet(id) {
      const res = await window.$oAjax.get(`/rest/chemical/category/${id}`)
      if (res.code === 20000) {
        if (res.data.blends) {
          this.chemicalsMingle = res.data.blends.map((it) => {
            it.id = ''
            return it
          })
        }
        else {
          this.chemicalsMingle = []
        }
      }
    },
    onChemicalsRemove(row) {
      this.selChemicalsData.forEach((it, index) => {
        if (row.id == it.id) {
          this.selChemicalsData.splice(index, 1)
        }
      })
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
  },
}
</script>

<style lang="less">
.form_wrap {
  li {
    display: inline-block;
    width: 360px;
    height: 45px;
  }
  .required_row .ant-form-item-label:before {
    content: '*';
    color: #c30000;
    margin-right: 5px;
  }
}
</style>

<style>
/* .hitek-add-modal .ant-modal-body {
  max-height: calc(100vh - 180px) !important;
  min-height: 300px !important;
} */
.ant-collapse > .ant-collapse-item > .ant-collapse-header {
  line-height: 15px !important;
}
.show-required {
  position: absolute;
  right: 40px;
  top: 65px;
  z-index: 100;
  color: #1677ff;
}
</style>
