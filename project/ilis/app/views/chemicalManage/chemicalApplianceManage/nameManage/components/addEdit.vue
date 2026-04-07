<!-- eslint-disable vue/no-unused-refs -->
<!-- eslint-disable vue/eqeqeq -->
<!-- eslint-disable vue/valid-v-for -->
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
      <div style="height: 800px">
        <div class="show-required">
          <SpecialCharacterModal @select="inputSpecialChar"></SpecialCharacterModal>
        </div>
        <a-spin :spinning="spinning">
          <a-alert
            v-if="addEditTitle == '编辑'"
            style="margin-bottom: 5px"
            message="化学名称编号、管理级别、计量单位、所属类别、化学品类型 关联化学品后不支持更新"
            type="info"
          />
          <a-form ref="formRef" style="width: 100%" :model="formData">
            <a-collapse v-model:active-key="activeKey">
              <a-collapse-panel key="1" header="必填信息">
                <ul class="form_wrap">
                  <li>
                    <a-form-item
                      label="化学名称"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="name"
                      :rules="[{ required: true, message: `请输入` }]"
                    >
                      <a-input
                        ref="name"
                        v-model:value="formData.name"
                        :disabled="isDetail"
                        ref-val="name"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>
                  <li>
                    <a-form-item
                      label="化学名称编号"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="sn"
                      :rules="[{ required: true, message: `请输入` }]"
                    >
                      <a-input
                        ref="sn"
                        v-model:value="formData.sn"
                        ref-val="sn"
                        :disabled="isDetail"
                        placeholder="请输入"
                        @blur="chackSn"
                      />
                    </a-form-item>
                  </li>
                  <li>
                    <a-form-item
                      label="用途"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="effect"
                      :rules="[{ required: true, message: `请输入` }]"
                    >
                      <a-input
                        ref="effect"
                        v-model:value="formData.effect"
                        ref-val="effect"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="纯度"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="purity"
                      :rules="[{ required: true, message: `请输入` }]"
                    >
                      <a-input
                        ref="purity"
                        v-model:value="formData.purity"
                        ref-val="purity"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="规格型号"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="specification"
                      :rules="[{ required: true, message: `请输入` }]"
                    >
                      <a-input
                        ref="specification"
                        v-model:value="formData.specification"
                        ref-val="specification"
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
                      :rules="[{ required: true, message: `请选择` }]"
                    >
                      <a-select
                        v-model:value="formData.unit"
                        :disabled="isDetail"
                      >
                        <a-select-option
                          v-for="item in measurementUnit"
                          :key="item.id"
                          :value="item.typename"
                        >
                          {{ item.typename }}
                        </a-select-option>
                      </a-select>
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="管理级别"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="unit"
                      :rules="[{ required: true, message: `请选择` }]"
                    >
                      <a-select
                        v-model:value="formData.manageLevelId"
                        :disabled="isDetail"
                        @change="changeManageLeve"
                      >
                        <template v-for="item in levelList">
                          <a-select-option
                            v-if="item.enabled"
                            :value="item.id"
                            :data="item"
                          >
                            {{ item.displayName }}
                          </a-select-option>
                        </template>
                      </a-select>
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="所属类别"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="chemicalType"
                      :rules="[{ required: true, message: `请选择` }]"
                    >
                      <a-select
                        v-model:value="formData.chemicalType"
                        :disabled="isDetail"
                      >
                        <a-select-option value="化学试剂">
                          化学试剂
                        </a-select-option>
                        <a-select-option value="化学溶液">
                          化学溶液
                        </a-select-option>
                      </a-select>
                    </a-form-item>
                  </li>
                  <li>
                    <a-form-item
                      label="预警数量"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="warningAmount"
                      :rules="[{ required: true, message: `请输入` }]"
                    >
                      <a-input-number
                        v-model:value="formData.warningAmount"
                        style="width: 100%"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>
                </ul>
              </a-collapse-panel>
              <a-collapse-panel key="2" header="选填信息">
                <ul class="form_wrap">
                  <li>
                    <a-form-item
                      label="别名"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="alias"
                    >
                      <a-input
                        ref="alias"
                        v-model:value="formData.alias"
                        ref-val="alias"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>
                  <li>
                    <a-form-item
                      label="英文名"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="nameEn"
                    >
                      <a-input
                        ref="nameEn"
                        v-model:value="formData.nameEn"
                        ref-val="nameEn"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>
                  <li>
                    <a-form-item
                      label="CAS号"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="casNo"
                    >
                      <a-input
                        ref="casNo"
                        v-model:value="formData.casNo"
                        ref-val="casNo"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="缩写标识"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="acronym"
                    >
                      <a-input
                        ref="acronym"
                        v-model:value="formData.acronym"
                        ref-val="acronym"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="分子量"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="acronym"
                    >
                      <a-input
                        ref="molWt"
                        v-model:value="formData.molWt"
                        ref-val="molWt"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="浓度"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
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
                      label="状态描述"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="status"
                    >
                      <a-input
                        ref="status"
                        v-model:value="formData.status"
                        ref-val="status"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="化学品特性"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="feature"
                    >
                      <a-select
                        v-model:value="formData.feature"
                        mode="multiple"
                        placeholder="请选择"
                        :disabled="isDetail"
                      >
                        <a-select-option
                          v-for="item in featureType"
                          :key="item.id"
                          :value="item.typename"
                        >
                          {{ item.typename }}
                        </a-select-option>
                      </a-select>
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="化学品类型"
                      placeholder="请选择"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-select
                        v-model:value="formData.safetyType"
                        :disabled="isDetail"
                      >
                        <a-select-option
                          v-for="item in safetyTypeList"
                          :key="item.id"
                          :value="item.typename"
                        >
                          {{ item.typename }}
                        </a-select-option>
                      </a-select>
                    </a-form-item>
                  </li>

                  <li v-if="formData.safetyType == '危险化学品'">
                    <a-form-item
                      label="危险种类"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="dangerKind"
                    >
                      <a-input
                        ref="dangerKind"
                        v-model:value="formData.dangerKind"
                        ref-val="dangerKind"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li v-if="formData.safetyType == '危险化学品'">
                    <a-form-item
                      label="危险性类别"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="dangerCategory"
                    >
                      <a-input
                        ref="dangerCategory"
                        v-model:value="formData.dangerCategory"
                        ref-val="dangerCategory"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li v-if="formData.safetyType == '危险化学品'">
                    <a-form-item
                      label="危险性说明"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="dangerExplain"
                    >
                      <a-input
                        ref="dangerExplain"
                        v-model:value="formData.dangerExplain"
                        ref-val="dangerExplain"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>
                  <li>
                    <a-form-item
                      label="有效期"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                      name="validityPeriod"
                    >
                      <a-input-number
                        v-model:value="formData.validityPeriod"
                        style="width: 100%"
                        :min="0"
                        :disabled="isDetail"
                        placeholder="请输入"
                        :formatter="(value) => `${value}天`"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="存放位置"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        ref="storageSite"
                        v-model:value="formData.storageSite"
                        ref-val="storageSite"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="存储要求"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        ref="storageRequirement"
                        v-model:value="formData.storageRequirement"
                        ref-val="storageRequirement"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="约定归还时长"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input-number
                        v-model:value="formData.appointedReturnDuration"
                        style="width: 100%"
                        :min="0"
                        :disabled="isDetail"
                        placeholder="请输入"
                        :formatter="(value) => `${value}小时`"
                      />
                    </a-form-item>
                  </li>
                  <li>
                    <a-form-item
                      label="是否自配"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-radio-group
                        v-model:value="formData.autonomousConfect"
                        :disabled="isDetail"
                        name="radioGroup"
                      >
                        <a-radio :value="true">
                          是
                        </a-radio>
                        <a-radio :value="false">
                          否
                        </a-radio>
                      </a-radio-group>
                    </a-form-item>
                  </li>

                  <li v-if="formData.chemicalType == '化学溶液'">
                    <a-form-item
                      label="配置依据"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        ref="confectAccordance"
                        v-model:value="formData.confectAccordance"
                        ref-val="confectAccordance"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li v-if="formData.chemicalType == '化学溶液'">
                    <a-form-item
                      label="介质"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        ref="confectMedium"
                        v-model:value="formData.confectMedium"
                        ref-val="confectMedium"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>
                  <li v-if="formData.chemicalType == '化学溶液'">
                    <a-form-item
                      label="配置方法"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
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
                  <li v-if="formData.chemicalType == '化学溶液'">
                    <a-form-item
                      label="配置过程描述"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
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
                  <li v-show="formData.autonomousConfect">
                    <a-form-item
                      label="是否关联掺配信息"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-radio-group
                        v-model:value="formData.blended"
                        :disabled="isDetail"
                        name="radioGroup"
                      >
                        <a-radio :value="true">
                          是
                        </a-radio>
                        <a-radio :value="false">
                          否
                        </a-radio>
                      </a-radio-group>
                    </a-form-item>
                  </li>

                  <li v-if="formData.autonomousConfect">
                    <a-form-item
                      label="单位用量"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        ref="blendDosage"
                        v-model:value="formData.blendDosage"
                        ref-val="blendDosage"
                        :disabled="isDetail"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="保管人"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <div
                        style="display: flex; justify-content: space-between"
                      >
                        <a-input
                          v-model:value="personFormat"
                          placeholder="请选择"
                          readonly
                          style="width: 80%"
                        />
                        <a-button :disabled="isDetail" @click="selPersonFun()">
                          选择
                        </a-button>
                      </div>
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="备注"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
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
              <a-collapse-panel
                v-if="formData.blended && formData.autonomousConfect"
                header="单位用量掺配信息"
              >
                <a-button
                  style="margin-bottom: 8px"
                  :disabled="isDetail"
                  @click="handleAddChemicals"
                >
                  添加
                </a-button>
                <a-table
                  :columns="columns"
                  :data-source="selChemicalsData"
                  :pagination="false"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'blendAmount'">
                      <a-input-number
                        v-model:value="record.blendAmount"
                        :min="0"
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
              <a-collapse-panel key="4" header="自定义字段">
                <ul v-if="customFields.length > 0" class="form_wrap">
                  <li v-for="item in customFields" :key="item.id">
                    <a-form-item
                      :label="item.columnName"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <span v-if="item.columnType === 'inputNumber'">
                        <a-input-number
                          v-model:value="item.columnValue"
                          :disabled="isDetail"
                          style="width: 100%"
                          :placeholder="`请输入${item.columnName}`"
                        />
                      </span>
                      <span v-else-if="item.columnType === 'input'">
                        <a-input
                          :ref="item.id"
                          v-model:value="item.columnValue"
                          :ref-val="item.id"
                          :disabled="isDetail"
                          :placeholder="`请输入${item.columnName}`"
                        />
                      </span>
                      <span v-else-if="item.columnType === 'radio'">
                        <a-radio-group
                          v-model:value="item.columnValue"
                          :disabled="isDetail"
                          name="radioGroup"
                        >
                          <a-radio value="是">是</a-radio>
                          <a-radio value="否">否</a-radio>
                        </a-radio-group>
                      </span>
                      <span v-else-if="item.columnType === 'select'">
                        <a-select
                          v-model:value="item.columnValue"
                          :disabled="isDetail"
                          :placeholder="`请选择${item.columnName}`"
                        >
                          <a-select-option
                            v-for="(v, index) in item.options
                              ? item.options.split(',')
                              : []"
                            :key="index"
                            :value="v"
                          >
                            {{ v }}
                          </a-select-option>
                        </a-select>
                      </span>
                      <span v-else-if="item.columnType === 'textArea'">
                        <a-textarea
                          :ref="item.id"
                          v-model:value="item.columnValue"
                          :ref-val="item.id"
                          :disabled="isDetail"
                        />
                      </span>
                      <span v-else-if="item.columnType === 'date'">
                        <a-date-picker
                          v-model:value="item.columnValue"
                          :disabled="isDetail"
                          :placeholder="`请选择${item.columnName}`"
                          style="width: 100%"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                        />
                      </span>
                    </a-form-item>
                  </li>
                </ul>
              </a-collapse-panel>
              <a-collapse-panel key="5" header="附件管理">
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
      </div>

      <template #footer>
        <div>
          <a-button v-if="!isDetail" @click="handleCancel">
            取消
          </a-button>
          <a-button
            v-if="!isDetail"
            type="primary"
            :loading="loading"
            @click="handleOk"
          >
            确定
          </a-button>
          <a-button v-if="isDetail" type="primary" @click="handleCancel">
            关闭
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>

    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
    <SelChemicals ref="selChemicalsRef" :callback="getChemicalsData" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import qs from 'qs'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import SelChemicals from '../../components/selChemicals.vue'

const columns = [
  {
    title: '化学名称编号',
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
    title: '操作',
    dataIndex: 'actions',
    align: 'center',
    width: '80px',
  },
]

let selDomObj = null

export default {
  components: { TableTreePersonnel, SelChemicals },
  props: ['callback'],
  data() {
    return {
      loading: false,
      blendedVal: false,
      autonomousConfectVal: false,
      safetyTypeVal: '',
      chemicalTypeVal: '',
      id: '',
      fileList: [],
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      addEditTitle: '新增',
      visible: false,
      data: [],
      activeKey: [1, 2, 3, 4, 5],
      spinning: false,
      isDetail: false,
      dayjs,
      columns,
      dataSource: [],
      customFields: [],
      formData: {
        warningAmount: 0,
        feature: [],
      },
      selPersonData: [],
      measurementUnit: [],
      safetyTypeList: [],
      featureType: [],
      levelList: [],

      selManageLeve: {},
      selChemicalsData: [],
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
    this.getCustomField()

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
      this.dictionary('chemical_measurement_unit_id').then((res) => {
        this.measurementUnit = res.obj
      })

      this.dictionary('chemical_safety_type_id').then((res) => {
        this.safetyTypeList = res.obj
      })

      this.dictionary('chemical_feature_id').then((res) => {
        this.featureType = res.obj
      })

      this.getLevelList()
    },
    async chackSn(d) {
      const v = d.target.value
      const res = await window.$oAjax.get(
        `/rest/chemical/category/snRepeat?sn=${v}&id=${this.id}`,
      )
      if (res.data) {
        window.$oAntdMessage.warning('当前化学名称编号已存在')
      }
    },
    async openModel(id, isDetail) {
      this.isDetail = isDetail
      this.clearForm()
      this.visible = true
      if (id) {
        this.id = id
        this.addEditTitle = isDetail ? '详情' : '编辑'
        const res = await window.$oAjax.get(`/rest/chemical/category/${id}`)

        if (res.code === 20000) {
          this.formData = res.data

          if (res.data.keeperIds) {
            res.data.keeperIds.split(',').forEach((it, index) => {
              this.selPersonData.push({
                name: res.data.keepers.split(',')[index],
                id: it,
              })
            })
          }

          if (res.data.feature) {
            this.formData.feature = res.data.feature.split(',').filter(it => it) // 过滤空字符串
          }
          else { // 空字符串，最终被解析为['']，出现冗余显示
            this.formData.feature = []
          }

          if (res.data.blends && res.data.blends.length) {
            this.selChemicalsData = res.data.blends
          }

          if (res.data.safetyType) {
            this.safetyTypeVal = res.data.safetyType
          }

          if (res.data.chemicalType) {
            this.chemicalTypeVal = res.data.chemicalType
          }

          this.blendedVal = res.data.blended
          this.autonomousConfectVal = res.data.autonomousConfect

          res.data.customValues.forEach((it) => {
            this.customFields.forEach((cit) => {
              if (it.columnId == cit.id) {
                cit.columnValue = it.columnValue
              }
            })
          })

          if (res.data.manageLevelId) {
            this.levelList.forEach((it) => {
              if (it.id == res.data.manageLevelId) {
                this.selManageLeve = {
                  displayName: it.displayName,
                  id: res.data.manageLevelId,
                }
              }
            })
          }
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
      this.formData = {
        warningAmount: 0,
        feature: [],
      }
      this.selPersonData = []
      this.selManageLeve = []
      this.selChemicalsData = []
      this.fileList = []
      this.getCustomField()
      this.blendedVal = false
      this.autonomousConfectVal = false
      this.activeKey = [1, 2, 3, 4, 5]
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
      this.selManageLeve = option.data
    },

    selPersonFun() {
      // this.$refs.TableTreePersonnel.showModal(type, idsPerson, acceptData, title);
      // let eaho=this.selPersonData.map(it=>{
      //   it.id=it.keeperIds
      // return it
      // })
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
    handleOk() {
      this.$refs.formRef.validateFields().then(async () => {
        this.loading = true
        const data = { ...this.formData }
        data.manageLevel = this.selManageLeve.displayName
        data.manageLevelId = this.selManageLeve.id
        if (this.selPersonData.length) {
          const nameArr = []
          const idArr = []
          this.selPersonData.forEach((it) => {
            nameArr.push(it.name)
            idArr.push(it.id)
          })
          data.keepers = nameArr.join()
          data.keeperIds = idArr.join()
        }
        if (this.selChemicalsData.length) {
          data.blends = this.selChemicalsData
        }

        if (data.feature.length) {
          data.feature = data.feature.join(',')
        }
        else {
          data.feature = ''
        }
        data.customValues = this.customFields.map((it) => {
          return {
            columnId: it.id,
            columnValue: it.columnValue,
          }
        })
        if (this.fileList.length) {
          data.attachments = this.fileList.map((it) => {
            return it.response.obj[0]
          })
        }

        if (!data.autonomousConfect) {
          data.blends = []
          data.blendDosage = ''
          data.blended = null
        }

        if (this.id) {
          data.id = this.id
        }
        const url = this.id
          ? 'rest/chemical/category/modify'
          : 'rest/chemical/category/add'

        const res = await window.$oAjax.post(url, data, {
          headers: {
            'content-type': 'application/json',
          },
        })
        this.loading = false
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
    getPerson(idsPerson, acceptData) {
      this.selPersonData = acceptData
    },

    handleAddChemicals() {
      this.$refs.selChemicalsRef.showModal(
        'checkbox',
        this.selChemicalsData.map((it) => {
          return {
            ...it,
            id: it.blendCategoryId,
          }
        }),
        this.id,
      )
    },
    getChemicalsData(row) {
      this.selChemicalsData = row.map((it) => {
        return {
          id: '',
          categoryId: '',
          blendCategoryId: it.id,
          blendAmount: 0,
          name: it.name,
          sn: it.sn,
          manageLevel: it.manageLevel,
          unit: it.unit,
        }
      })
    },
    onChemicalsRemove(row) {
      this.selChemicalsData.forEach((it, index) => {
        if (row.blendCategoryId == it.blendCategoryId) {
          this.selChemicalsData.splice(index, 1)
        }
      })
    },

    // 获取自定义字段
    async getCustomField() {
      this.visible = false
      this.spinning = true
      const res = await window.$oAjax.get(window.$oApi.common.customProperties, {
        params: {
          customizeType: 'chemicalCategory',
        },
      })
      this.spinning = false
      this.customFields = res.data.map((it) => {
        if (it.columnType == 'select') {
          it.options = it.columnValue
          it.columnValue = null
        }
        return it
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

<style lang="less" scoped>
.form_wrap {
  li {
    display: inline-block;
    width: 360px;
    height: 45px;
  }
}
</style>

<style scoped>
.ant-collapse > .ant-collapse-item > .ant-collapse-header {
  line-height: 15px !important;
}
.ant-select-selection--multiple > ul > li,
.ant-select-selection--multiple .ant-select-selection__rendered > ul > li {
  width: auto !important;
}
.show-required {
  position: absolute;
  right: 16px;
  top: 14px;
  z-index: 100;
  color: #1677ff;
}
</style>
