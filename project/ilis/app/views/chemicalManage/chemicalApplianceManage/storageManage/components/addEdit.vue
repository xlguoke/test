<!-- eslint-disable vue/no-unused-refs -->
<!-- eslint-disable vue/valid-v-for -->
<template>
  <div>
    <ht-modal
      :title="modalTitle"
      centered
      :open="visible"
      :mask-closable="false"
      :keyboard="false"
      width="80%"
      @cancel="
        () => {
          visible = false
        }
      "
      @ok="save"
    >
      <div class="show-required">
        <SpecialCharacterModal class="mr-2" @select="inputSpecialChar"></SpecialCharacterModal>
        <a-checkbox v-model:checked="showRequired">
          <span style="font-size: 12px">仅显示必填信息</span>
        </a-checkbox>
      </div>
      <a-spin :spinning="spinning">
        <a-collapse v-model:active-key="activeKey">
          <a-collapse-panel key="1" header="基本信息">
            <a-form
              ref="chemicalVORef"
              :model="chemicalVO"
              :label-col="{ style: 'width: 120px' }"
              :wrapper-col="{ style: 'flex: 1' }"
            >
              <a-form-item
                label="化学名称"
                name="categoryName"
                :rules="[{ required: true, message: `请选择化学名称` }]"
              >
                <div class="flex gap-2">
                  <a-input
                    v-model:value="chemicalVO.categoryName"
                    placeholder="请选择化学名称"
                    disabled
                  />
                  <a-button v-if="!isDetail" @click="chooseChemicals">
                    选择
                  </a-button>
                </div>
              </a-form-item>
              <a-form-item
                label="品名" name="name"
                :rules="[{ required: true, message: `请输入品名` }]"
              >
                <a-input
                  ref="nameRef"
                  v-model:value="chemicalVO.name"
                  placeholder="请输入品名"
                  :disabled="isDetail"
                  ref-val="nameRef"
                ></a-input>
              </a-form-item>
              <a-form-item
                label="品名编号" name="sn"
                :rules="[
                  { required: true, message: `请输入品名编号` },
                  { validator: checkSnRepeat, triggle: 'blur' },
                ]"
              >
                <a-input
                  ref="snRef"
                  v-model:value="chemicalVO.sn"
                  placeholder="请输入品名编号"
                  :disabled="isDetail"
                  ref-val="snRef"
                ></a-input>
              </a-form-item>
              <a-form-item
                label="管理级别" name="manageLevel"
                :rules="[
                  { required: true, message: `管理级别不能为空` },
                ]"
              >
                <a-input
                  v-model:value="chemicalVO.manageLevel"
                  placeholder="选择化学名称后，自动关联管理级别"
                  :disabled="isDetail"
                />
              </a-form-item>
              <a-form-item v-show="!showRequired" label="计量单位">
                <a-input
                  ref="unitRef"
                  v-model:value="chemicalVO.unit"
                  placeholder="选择化学名称后，自动关联计量单位"
                  disabled
                  ref-val="unitRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="纯度">
                <a-input
                  ref="purityRef"
                  v-model:value="chemicalVO.purity"
                  placeholder="请输入纯度"
                  :disabled="isDetail"
                  ref-val="purityRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="浓度">
                <a-input
                  ref="concentrationRef"
                  v-model:value="chemicalVO.concentration"
                  placeholder="请输入浓度"
                  :disabled="isDetail"
                  ref-val="concentrationRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="规格型号">
                <a-input
                  ref="specificationRef"
                  v-model:value="chemicalVO.specification"
                  placeholder="请输入规格型号"
                  :disabled="isDetail"
                  ref-val="specificationRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="用途">
                <a-input
                  ref="effectRef"
                  v-model:value="chemicalVO.effect"
                  placeholder="请输入用途"
                  :disabled="isDetail"
                  ref-val="effectRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="包装方式">
                <a-input
                  ref="packingRef"
                  v-model:value="chemicalVO.packing"
                  placeholder="请输入包装方式"
                  :disabled="isDetail"
                  ref-val="packingRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="化学品来源">
                <a-select
                  v-model:value="chemicalVO.sourceFrom"
                  placeholder="请选择化学品来源"
                  disabled
                >
                  <a-select-option v-for="t in $types" :value="t">
                    {{ t }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="状态描述">
                <a-input
                  ref="statusRef"
                  v-model:value="chemicalVO.status"
                  placeholder="请输入状态描述"
                  :disabled="isDetail"
                  ref-val="statusRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="缩写标识">
                <a-input
                  ref="acronymRef"
                  v-model:value="chemicalVO.acronym"
                  placeholder="请输入缩写标识"
                  :disabled="isDetail"
                  ref-val="acronymRef"
                ></a-input>
              </a-form-item>
              <a-form-item label="生产日期" name="productionDate" :rules="[{ required: true, message: `请选择生产日期` }]">
                <a-date-picker
                  v-model:value="chemicalVO.productionDate"
                  placeholder="请选择生产日期"
                  value-format="YYYY-MM-DD"
                  :disabled="isDetail"
                  class="w-full"
                ></a-date-picker>
              </a-form-item>
              <a-form-item
                v-if="
                  detailObj.chemicalVO
                    && detailObj.chemicalVO.sourceFrom === ZIPEI
                "
                label="配置日期"
                name="confectDate"
                :rules="[{ required: true, message: `请选择配置日期` }]"
              >
                <a-date-picker
                  v-model:value="chemicalVO.confectDate"
                  placeholder="请选择配置日期"
                  value-format="YYYY-MM-DD"
                  disabled
                  class="w-full"
                ></a-date-picker>
              </a-form-item>
              <a-form-item
                label="失效日期"
                name="invalidDate"
                :rules="[{ required: true, message: `请选择失效日期` }]"
              >
                <a-date-picker
                  v-model:value="chemicalVO.invalidDate"
                  placeholder="请选择失效日期"
                  value-format="YYYY-MM-DD"
                  :disabled="isDetail"
                  class="w-full"
                ></a-date-picker>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="备注">
                <a-input
                  ref="remarkRef"
                  v-model:value="chemicalVO.remark"
                  placeholder="请输入备注"
                  :disabled="isDetail"
                  ref-val="remarkRef"
                ></a-input>
              </a-form-item>
              <a-form-item
                label="保管人"
                name="keeperIds"
                :rules="[{ required: true, message: `请选择保管人` }]"
              >
                <div class="flex gap-2">
                  <a-input
                    v-model:value="chemicalVO.keepers"
                    placeholder="请选择保管人"
                    disabled
                  />
                  <a-button
                    v-if="!isDetail"
                    @click="choosePersoner('keepersData')"
                  >
                    选择
                  </a-button>
                </div>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="验收人">
                <div class="flex gap-2">
                  <a-input
                    v-model:value="chemicalVO.acceptors"
                    disabled
                    placeholder="请选择验收人"
                  />
                  <a-button v-if="!isDetail" @click="choosePersoner('acceptorsData')">
                    选择
                  </a-button>
                </div>
              </a-form-item>
            </a-form>
          </a-collapse-panel>
          <a-collapse-panel v-if="detailObj.purchaseVO" key="2" header="采购信息">
            <a-form
              ref="purchaseVORef"
              :model="purchaseVO"
              :label-col="{ style: 'width: 120px' }"
              :wrapper-col="{ style: 'flex: 1' }"
            >
              <a-form-item v-show="!showRequired" label="生产厂家">
                <a-input
                  ref="manufacturerRef"
                  v-model:value="purchaseVO.manufacturer"
                  placeholder="请输入生产厂家"
                  :disabled="isDetail"
                  ref-val="manufacturerRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="生产批号">
                <a-input
                  ref="batchSnRef"
                  v-model:value="purchaseVO.batchSn"
                  placeholder="请输入生产批号"
                  :disabled="isDetail"
                  ref-val="batchSnRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="证书编号">
                <a-input
                  ref="certificateSnRef"
                  v-model:value="purchaseVO.certificateSn"
                  placeholder="请输入证书编号"
                  :disabled="isDetail"
                  ref-val="certificateSnRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="供应商">
                <a-input
                  ref="supplierRef"
                  v-model:value="purchaseVO.supplier"
                  placeholder="请输入供应商"
                  :disabled="isDetail"
                  ref-val="supplierRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="采购日期">
                <a-date-picker
                  v-model:value="purchaseVO.purchaseDate"
                  placeholder="请选择采购日期"
                  value-format="YYYY-MM-DD"
                  :disabled="isDetail"
                  class="w-full"
                ></a-date-picker>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="采购批号">
                <a-input
                  ref="purchaseSnRef"
                  v-model:value="purchaseVO.purchaseSn"
                  placeholder="请输入采购批号"
                  :disabled="isDetail"
                  ref-val="purchaseSnRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="采购数量">
                <a-input-number
                  v-model:value="purchaseVO.purchaseAmount"
                  placeholder="请输入采购数量"
                  :disabled="isDetail"
                  class="!w-full"
                ></a-input-number>
              </a-form-item>
            </a-form>
          </a-collapse-panel>
          <a-collapse-panel key="3" header="入库信息">
            <a-form
              ref="inventoryInVORef"
              :model="inventoryInVO"
              :label-col="{ style: 'width: 120px' }"
              :wrapper-col="{ style: 'flex: 1' }"
            >
              <a-form-item v-show="!showRequired" label="入库批号">
                <a-input
                  ref="batchSnRef"
                  v-model:value="inventoryInVO.batchSn"
                  placeholder="请输入入库批号"
                  :disabled="isDetail"
                  ref-val="batchSnRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="入库批次">
                <a-input
                  ref="batchRef"
                  v-model:value="inventoryInVO.batch"
                  placeholder="请输入入库批次"
                  :disabled="isDetail"
                  ref-val="batchRef"
                ></a-input>
              </a-form-item>
              <a-form-item
                label="入库类型"
                name="type"
                :rules="[{ required: true, message: '请选择入库类型' }]"
              >
                <a-select
                  v-model:value="inventoryInVO.type"
                  placeholder="请选择入库类型"
                  disabled
                  allow-clear
                >
                  <a-select-option v-for="t in $types" :value="t">
                    {{ t }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                label="入库数量"
                name="amount"
                :rules="[{ required: true, message: '请输入入库数量' }]"
              >
                <a-input-number
                  v-model:value="inventoryInVO.amount"
                  placeholder="请输入入库数量"
                  :disabled="isDetail"
                  class="!w-full"
                ></a-input-number>
              </a-form-item>
              <a-form-item
                v-if="
                  detailObj.chemicalVO
                    && detailObj.chemicalVO.sourceFrom === ZIPEI
                "
                label="配置数量"
                nam="amount"
                :rules="[{ required: true, message: `请输入配置数量` }]"
              >
                <a-input-number
                  v-model:value="inventoryInVO.amount"
                  placeholder="请输入配置数量"
                  disabled
                  class="!w-full"
                ></a-input-number>
              </a-form-item>
              <a-form-item
                label="入库日期"
                name="putawayDate"
                :rules="[{ required: true, message: `请选择入库日期` }]"
              >
                <a-date-picker
                  v-model:value="inventoryInVO.putawayDate"
                  placeholder="请选择入库日期"
                  value-format="YYYY-MM-DD"
                  :disabled="isDetail"
                  class="w-full"
                ></a-date-picker>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="存放位置">
                <a-input
                  ref="storageLocationRef"
                  v-model:value="inventoryInVO.storageLocation"
                  placeholder="请输入存放位置"
                  :disabled="isDetail"
                  ref-val="storageLocationRef"
                ></a-input>
              </a-form-item>
              <a-form-item v-show="!showRequired" label="监管人">
                <div class="flex gap-2">
                  <a-input
                    v-model:value="inventoryInVO.managers"
                    placeholder="请选择监管人"
                    disabled
                  ></a-input>
                  <a-button
                    v-if="!isDetail"
                    @click="choosePersoner('managersData')"
                  >
                    选择
                  </a-button>
                </div>
              </a-form-item>
              <a-form-item
                label="更换容器存储"
                name="allowChangeContainer"
                :rules="[{ required: true, message: `请选择更换容器存储` }]"
              >
                <a-tooltip placement="top">
                  <template #title>
                    <div style="font-size: 12px">
                      <p style="width: 280px">
                        化学品出库时是否支持采用临时容器进行存储
                      </p>
                      （否，出库数量必须等于可用余量）
                    </div>
                  </template>
                  <InfoCircleOutlined />
                </a-tooltip>
                <a-radio-group
                  v-model:value="inventoryInVO.allowChangeContainer"
                  style="margin-left: 20px"
                  :disabled="isDetail"
                >
                  <a-radio value="true">
                    是
                  </a-radio>
                  <a-radio value="false">
                    否
                  </a-radio>
                </a-radio-group>
              </a-form-item>
            </a-form>
          </a-collapse-panel>
          <a-collapse-panel key="4" header="自定义字段">
            <a-form
              v-if="customValues.length > 0"
              :label-col="{ style: 'width: 120px' }"
              :wrapper-col="{ style: 'flex: 1' }"
            >
              <a-form-item
                v-for="item in customValues"
                :key="item.id"
                :label="item.columnName"
              >
                <template v-if="item.columnType === 'inputNumber'">
                  <a-input-number
                    v-model:value="item.columnValue"
                    :disabled="isDetail"
                    class="!w-full"
                    :placeholder="`请输入${item.columnName}`"
                  />
                </template>
                <template v-else-if="item.columnType === 'input'">
                  <a-input
                    :ref="item.id"
                    v-model:value="item.columnValue"
                    :disabled="isDetail"
                    :ref-val="item.id"
                    :placeholder="`请输入${item.columnName}`"
                  />
                </template>
                <template v-else-if="item.columnType === 'radio'">
                  <a-radio-group
                    v-model:value="item.columnValue"
                    :disabled="isDetail"
                    name="radioGroup"
                  >
                    <a-radio value="是">
                      是
                    </a-radio>
                    <a-radio value="否">
                      否
                    </a-radio>
                  </a-radio-group>
                </template>
                <template v-else-if="item.columnType === 'select'">
                  <a-select
                    v-model:value="item.columnValue"
                    allow-clear
                    :disabled="isDetail"
                    :placeholder="`请选择${item.columnName}`"
                  >
                    <a-select-option
                      v-for="(v, index) in item.columnOption"
                      :key="index"
                      :value="v"
                    >
                      {{ v }}
                    </a-select-option>
                  </a-select>
                </template>
                <template v-else-if="item.columnType === 'textArea'">
                  <a-textarea
                    :ref="item.id"
                    v-model:value="item.columnValue"
                    :ref-val="item.id"
                    :disabled="isDetail"
                    :rows="1"
                  />
                </template>
                <span v-else-if="item.columnType === 'date'">
                  <a-date-picker
                    v-model:value="item.columnValue"
                    :disabled="isDetail"
                    :placeholder="`请选择${item.columnName}`"
                    class="w-full"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </span>
              </a-form-item>
            </a-form>
            <p v-else class="no-data">
              暂未配置自定义字段
            </p>
          </a-collapse-panel>
          <a-collapse-panel key="5" header="附件信息">
            <a-form
              :label-col="{ style: 'width: 120px' }"
              :wrapper-col="{ style: 'flex: 1' }"
            >
              <a-form-item label="上传附件信息">
                <UploadFile2 ref="uploadFileRef" :read-only="isDetail" />
              </a-form-item>
            </a-form>
          </a-collapse-panel>
        </a-collapse>
      </a-spin>
      <template #footer>
        <a-button @click="visible = false">
          关 闭
        </a-button>
        <template v-if="!isDetail">
          <a-button style="width: 70px" :loading="saveLoading" @click="save()">
            暂 存
          </a-button>
          <a-button type="primary" :loading="saveLoading" @click="putaway">
            确认入库
          </a-button>
        </template>
      </template>
    </ht-modal>

    <!-- 化学品 -->
    <SelChemicals ref="selChemicalsRef" :callback="getChemicalsData" />
    <!-- 选择人员 -->
    <SelectPersonnel ref="SelectPersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import {
  snRepeat,
  storageInDetail,
  storageInPutaway,
  storageInSave,
} from '~/providers/api/chemicals'
import { debounce } from '~/providers/common/utils'
import SelectPersonnel from '~/providers/components/tableTreePersonnel.vue'
import UploadFile2 from '~/providers/components/upload.vue'
import SelChemicals from '../../components/selChemicals.vue'

let selDomObj = null

export default {
  components: {
    UploadFile2,
    SelChemicals,
    SelectPersonnel,
    InfoCircleOutlined,
  },
  data() {
    return {
      $types: [
        '采购',
        '自配',
        '自配直接使用',
        '领用返还',
      ],
      CAIGOU: '采购',
      ZIPEI: '自配',
      STATUS_CREATE: '创建中',
      STATUS_INSTOCK: '已入库',
      STATUS_GET: '已领取',
      modalTitle: '新增',
      showRequired: false,
      spinning: false,
      saveLoading: false,
      visible: false,
      isDetail: false,
      activeKey: ['1', '2', '3', '4', '5'],
      chemicalVO: {
        sourceFrom: '采购',
      }, // 基本信息
      purchaseVO: {
        type: '采购',
      }, // 采购信息
      inventoryInVO: {
        type: '采购',
      }, // 入库信息
      customValues: [], // 自定义字段
      customFieldsRes: [], // 接口返回的最新的自定义字段
      attachments: [], // 附件信息
      selChemicalsData: [], // 化学名称
      keepersData: [], // 已选保管人
      managersData: [], // 已选监管人
      acceptorsData: [], // 已选验收人
      editPersonerKey: '',
      detailObj: {
        chemicalVO: {},
        purchaseVO: {},
        inventoryInVO: {},
      },
      formState: {},
    }
  },
  created() {
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
        const refVal = (d.getAttribute('ref-val') || '').replace('Ref', '')

        if (!refVal) {
          return
        }

        const cursorIndex = d.selectionStart // 获取光标下标
        const nowValArr = d.value.split('') // 转换成数组
        nowValArr.splice(cursorIndex, 0, v) // 分割数组，并添加新的成员

        const customItem = this.customValues.find(i => i.id === refVal)
        if (customItem) {
          customItem.columnValue = nowValArr.join('')
        }
        else if (this.chemicalVO[refVal]) {
          this.chemicalVO[refVal] = nowValArr.join('')
        }
        else if (this.purchaseVO[refVal]) {
          this.purchaseVO[refVal] = nowValArr.join('')
        }
        else if (this.inventoryInVO[refVal]) {
          this.inventoryInVO[refVal] = nowValArr.join('')
        }

        d.selectionStart = cursorIndex + 1 // 光标移动+1
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (error) {
        console.error('特殊字符录入失败！')
      }
    },
    checkSnRepeat(rule, value, callback) {
      debounce(async () => {
        if (!value) {
          callback()
          return
        }
        const id = this.detailObj.chemicalVO
          ? this.chemicalVO.categoryId
          : ''
        const res = await snRepeat({ sn: value, id })
        if (res.code === 20000 && res.data) {
          callback(new Error('化学品编号已存在，请重新输入'))
        }
        else {
          callback()
        }
      }, 300)
    },
    async openModel(title = '新增', id, isDetail) {
      this.modalTitle = title
      this.isDetail = isDetail
      this.visible = true
      await this.getCustomFields()

      if (id) {
        this.getDetailData(id)
      }
    },
    // 获取详情
    getDetailData(id) {
      this.spinning = true
      storageInDetail(id)
        .then((res) => {
          if (res.code !== 20000) {
            window.$oAntdMessage.error(res.message || '获取详情数据失败')
            return
          }
          this.detailObj = res.data
          const chemicalVO = res.data.chemicalVO || {}
          const purchaseVO = res.data.purchaseVO || {}
          const inventoryInVO = res.data.inventoryInVO || {}
          this.chemicalVO = { ...chemicalVO }
          this.purchaseVO = { ...purchaseVO }
          this.inventoryInVO = {
            ...inventoryInVO,
            managers: chemicalVO.managers,
            managerIds: chemicalVO.managerIds,
            allowChangeContainer: chemicalVO.allowChangeContainer
              ? 'true'
              : 'false',
            storageLocation: chemicalVO.storageLocation,
          }
          this.attachments = res.data.attachments || []
          this.$refs.uploadFileRef.setFileList(this.attachments)
          this.selChemicalsData = [{ id: chemicalVO.categoryId }]
          this.initCustomValues(res.data.customValues)
          this.spinning = false
        })
        .catch((err) => {
          this.spinning = false
          window.$oAntdMessage.error(err.message || '获取详情数据失败')
        })
    },
    // 获取自定义字段
    async getCustomFields() {
      const url
        = `${window.$oApi.common.customProperties}?customizeType=chemicalInventoryIn`
      await window.$oAjax.get(url).then((res) => {
        if (res.code !== 20000)
          return
        for (let i = 0; i < res.data.length; i++) {
          const d = res.data[i]
          if (d.columnType === 'select') {
            d.columnOption = d.columnValue.split(',')
            d.columnValue = undefined
          }
        }
        this.customValues = res.data
        return res
      })
    },
    // 编辑时，初始化自定义字段
    initCustomValues(resData) {
      if (!resData || resData.length === 0 || this.customValues.length === 0)
        return
      for (let i = 0; i < resData.length; i++) {
        const item = resData[i]
        if (item.columnType !== 'select')
          continue
        for (let j = 0; j < this.customValues.length; j++) {
          const field = this.customValues[j]
          if (item.columnId === field.id) {
            item.columnOption = field.columnOption
          }
        }
      }
      this.customValues = resData
    },
    // 选择化学名称
    chooseChemicals() {
      this.$refs.selChemicalsRef.showModal('radio', this.selChemicalsData, '')
    },
    // 选择化学品回调
    getChemicalsData(data) {
      const item = data.length > 0 ? data[0] : {}
      this.selChemicalsData = data
      this.chemicalVO = {
        ...this.chemicalVO,
        categoryName: item.name,
        categoryId: item.id,
        name: item.name,
        manageLevel: item.manageLevel,
        manageLevelId: item.manageLevelId,
        unit: item.unit,
        purity: item.purity,
        concentration: item.concentration,
        specification: item.specification,
        effect: item.effect,
        packing: item.packing,
      }

      setTimeout(() => {
        this.$refs.chemicalVORef.validate(['categoryName', 'name', 'manageLevel'])
      }, 300)
    },
    // 选择人员
    choosePersoner(key) {
      this.editPersonerKey = key
      const list = this[key]
      const ids = list.map(d => d.id)
      this.$refs.SelectPersonnel.showModal('checkbox', ids, list)
    },
    // 选择人员 - 回调
    getPerson(ids, data) {
      this[this.editPersonerKey] = data
      const idStr = data.map(d => d.id).join(',')
      const nameStr = data.map(d => d.name).join(',')
      if (this.editPersonerKey === 'keepersData') {
        this.chemicalVO.keepers = nameStr
        this.chemicalVO.keeperIds = idStr
        this.$refs.chemicalVORef.validate(['keeperIds'])
      }
      else if (this.editPersonerKey === 'managersData') {
        this.inventoryInVO.managers = nameStr
        this.inventoryInVO.managerIds = idStr
      }
      else if (this.editPersonerKey === 'acceptorsData') {
        this.chemicalVO.acceptors = nameStr
        this.chemicalVO.acceptorIds = idStr
      }
    },
    async formatParams() {
      let result = null
      await this.$refs.chemicalVORef.validateFields().then(async () => {
        await this.$refs.purchaseVORef.validateFields().then(async () => {
          await this.$refs.inventoryInVORef.validateFields().then(async () => {
            const chemicalVO = { ...this.chemicalVO }
            const purchaseVO = { ...this.purchaseVO }
            const inventoryInVO = { ...this.inventoryInVO }
            const attachments = this.$refs.uploadFileRef.fileList
            chemicalVO.managers = inventoryInVO.managers
            chemicalVO.managerIds = inventoryInVO.managerIds
            chemicalVO.allowChangeContainer = inventoryInVO.allowChangeContainer
            chemicalVO.storageLocation = inventoryInVO.storageLocation
            delete purchaseVO.productionDate
            delete purchaseVO.invalidDate
            delete inventoryInVO.managers
            delete inventoryInVO.managerIds
            delete inventoryInVO.allowChangeContainer
            delete inventoryInVO.storageLocation
            const chemicalObj = this.detailObj.chemicalVO
            if (chemicalObj) {
              const purchase = this.detailObj.purchaseVO || {}
              const inventoryIn = this.detailObj.inventoryInVO || {}
              chemicalVO.id = chemicalObj.id
              purchaseVO.id = purchase.id || ''
              inventoryInVO.id = inventoryIn.id || ''
              purchaseVO.chemicalId = chemicalObj.id
              inventoryInVO.chemicalId = chemicalObj.id
            }

            result = {
              chemicalVO,
              purchaseVO,
              inventoryInVO,
              customValues: this.customValues.map(d => ({
                columnId: d.columnId || d.id,
                columnValue: d.columnValue,
              })),
              attachments,
            }
          })
        })
      })

      return result
    },
    // 保存
    async save(flag) {
      const params = await this.formatParams()
      if (!params)
        return
      this.saveLoading = true
      try {
        const res = await storageInSave(params)
        this.saveLoading = false
        if (res.code !== 20000) {
          window.$oAntdMessage.error(res.message)
          return
        }
        if (flag)
          return res.data
        this.visible = false
        this.$parent.getData()
        window.$oAntdMessage.success('保存成功')
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '保存失败')
        this.saveLoading = false
      }
    },
    // 入库
    async putaway() {
      const res = await this.save(true)
      if (!res)
        return
      await storageInPutaway(res)
      this.spinning = false
      this.visible = false
      this.$parent.getData()
      window.$oAntdMessage.success('入库成功')
    },
  },
}
</script>

<style lang="less" scoped>
.show-required {
  position: absolute;
  right: 20px;
  top: 14px;
  z-index: 100;
}
.ant-form::after {
  content: '';
  clear: both;
  display: block;
  visibility: hidden;
}
:deep(.ant-form-item) {
  float: left;
  width: 25%;
  min-height: 30px;
  @media screen and (max-width: 1600px) {
    width: 33.333333%;
  }
  @media screen and (max-width: 1300px) {
    width: 50%;
  }
}

.no-data {
  line-height: 100px;
  text-align: center;
  color: #aaa;
}
:deep(.ant-modal .ant-modal-footer) {
  &::after {
    content: '';
    display: block;
    clear: both;
    height: 0;
  }
}
</style>
