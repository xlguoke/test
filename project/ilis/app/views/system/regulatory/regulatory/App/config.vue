<!-- eslint-disable vue/eqeqeq -->
<!-- eslint-disable vue/valid-v-for -->
<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="上报设置"
      ok-text="确定"
      width="70%"
      :body-style="bodyStyle"
      :destroy-on-close="true"
      :mask-closable="false"
      :keyboard="false"
    >
      <a-spin :spinning="spinning">
        <a-form ref="formRef" :model="data">
          <BaseTitle>上报范围</BaseTitle>
          <a-form-item
            v-for="(scope, i) in selectedScopeTypes"
            :key="scope.value"
            :label="scope.label"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: `${scope.label}为必填！` }]"
            :name="scope.value"
          >
            <div class="form-item-flex">
              <template v-if="scope.label === '试验结束日期'">
                <a-select
                  v-model:value="signDateScope"
                  style="margin-right: 10px; width: 120px"
                  @change="changeSignDateScope"
                >
                  <a-select-option value="大于">
                    大于
                  </a-select-option>
                  <a-select-option value="小于">
                    小于
                  </a-select-option>
                  <a-select-option value="介于">
                    介于
                  </a-select-option>
                </a-select>
                <a-date-picker
                  v-if="signDateScope != '介于'"
                  v-model:value="data[scope.value]"
                  style="width: 100%"
                  :placeholder="`请选择${scope.label}`"
                  value-format="YYYY-MM-DD"
                />
                <a-range-picker
                  v-else
                  v-model:value="data[scope.value]"
                  :placeholder="[
                    `请选择${scope.label}`,
                    `请选择${scope.label}`,
                  ]"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </template>
              <a-select
                v-else-if="scope.type === 'select'"
                v-model:value="data[scope.value]"
                mode="multiple"
                allow-clear
                :placeholder="`请选择${scope.label}`"
              >
                <a-select-option v-for="d in scope.options" :value="d.value">
                  {{
                    d.label
                  }}
                </a-select-option>
              </a-select>
              <a-tree-select
                v-else-if="scope.type === 'tree'"
                v-model:value="data[scope.value]"
                :tree-data="scope.options"
                :placeholder="`请选择${scope.label}`"
                show-search
                multiple
                allow-clear
                tree-default-expand-all
              />
              <a-range-picker
                v-else-if="scope.type === 'dateRange'"
                v-model:value="data[scope.value]"
                :placeholder="[`请选择${scope.label}`, `请选择${scope.label}`]"
                style="width: 100%"
              />
              <template v-else-if="scope.type === 'selectModal'">
                <a-input
                  v-model:value="data[scope.value]"
                  :placeholder="`请选择${scope.label}`"
                  disabled
                />
                <a-button type="primary" @click="scope.modalName">
                  选择
                </a-button>
              </template>
              <a-input
                v-else
                v-model:value="data[scope.value]"
                :placeholder="`请输入${scope.label}`"
              />
              <a-button danger @click="onDelScopeType(scope, i)">
                移除
              </a-button>
            </div>
          </a-form-item>
          <div
            v-if="selectedScopeTypes.length !== scopeTypes.length"
            style="padding: 10px 20%"
          >
            <a-button @click="addScope">
              <PlusOutlined />
            </a-button>
          </div>

          <BaseTitle>上报设置</BaseTitle>
          <a-form-item
            label="报告文件来源"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '报告文件来源不能为空！' }]"
            name="reportFileType"
          >
            <a-select
              v-model:value="data.reportFileType"
              @change="(value) => reportSourceChange(value)"
            >
              <a-select-option value="AUTO">
                系统生成
              </a-select-option>
              <a-select-option value="INTERVENED">
                手动上传
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="上报时报告状态"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '上报时报告状态不能为空！' }]"
            name="reportStatus"
          >
            <a-select
              v-model:value="data.reportStatus"
              @change="(value) => reportStatusChange(value)"
            >
              <!-- <a-select-option value="SUBMIT">已提交</a-select-option>
                <a-select-option value="RECHECK">已复核</a-select-option>
                <a-select-option value="AUDIT">已审核</a-select-option> -->
              <a-select-option value="APPROVE">
                已批准
              </a-select-option>
              <a-select-option value="PRINT">
                已打印
              </a-select-option>
              <a-select-option value="ISSUE">
                已发放
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-show="data.reportFileType === 'AUTO'"
            label="报告文件签字要求"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '报告文件签字要求不能为空！' }]"
            name="signature"
          >
            <a-select
              v-model:value="data.signature"
              mode="multiple"
              @change="(value) => signatureChange(value)"
            >
              <a-select-option value="NONE">
                无
              </a-select-option>
              <a-select-option value="RECORD">
                记录人
              </a-select-option>
              <a-select-option value="TESTER">
                检测人
              </a-select-option>
              <a-select-option value="RECHECK">
                复核人
              </a-select-option>
              <a-select-option value="AUDIT">
                审核
              </a-select-option>
              <a-select-option value="APPROVE">
                批准
              </a-select-option>
              <a-select-option value="ASSIST">
                协助人
              </a-select-option>
              <a-select-option value="COMPILE">
                报告编写人
              </a-select-option>
              <a-select-option value="PRINCIPAL">
                项目负责人
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-show="data.reportFileType === 'AUTO'"
            label="报告文件是否要求签章"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '报告文件是否要求签章不能为空！' }]"
            name="stamp"
          >
            <a-select v-model:value="data.stamp">
              <a-select-option value="true">
                是
              </a-select-option>
              <a-select-option value="false">
                否
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-show="data.reportFileType === 'AUTO'"
            label="防伪码添加方式"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '报告文件是否要求防伪码不能为空！' }]"
            name="securityCode"
          >
            <a-select v-model:value="data.securityCode">
              <a-select-option value="ALL">
                自动添加+手动添加
              </a-select-option>
              <a-select-option value="AUTO">
                自动添加
              </a-select-option>
              <a-select-option value="INTERVENED">
                手动添加
              </a-select-option>
              <a-select-option value="NONE">
                不添加
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="前置服务"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '前置服务不能为空！' }]"
            name="serviceUrl"
          >
            <a-input
              v-model:value="data.serviceUrl"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="处理程序"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '处理程序不能为空！' }]"
            name="processor"
          >
            <a-select
              v-model:value="data.processor"
              @change="(value) => processorChange(value)"
            >
              <a-select-option
                v-for="item in processors"
                :key="item.code"
                :value="item.code"
              >
                {{ item.describe }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <BaseTitle>信息配置</BaseTitle>
          <a-row v-if="false" style="padding-bottom: 10px">
            <a-col :offset="22">
              <a-button
                type="primary"

                @click.stop="control()"
              >
                数据条件
              </a-button>
            </a-col>
          </a-row>
          <a-row v-if="false" style="padding-bottom: 10px">
            <a-col :span="24">
              <a-table
                :columns="controlColumns"
                :data-source="data.controlList"
                :pagination="false"
                row-key="code"
                bordered
              >
                <template #bodyCell="{ column, record, text, index }">
                  <template v-if="column.dataIndex === 'value'">
                    <div key="value">
                      <a-input
                        v-if="record.editable"
                        style="margin: -5px 0"
                        :value="text"
                        @change="
                          (e) => extendValChange(e.target.value, record.code, col)
                        "
                      />
                      <template v-else>
                        {{ text }}
                      </template>
                    </div>
                  </template>

                  <template v-if="column.dataIndex === 'operation'">
                    <div class="editable-row-operations">
                      <template v-if="record.editable">
                        <a @click="() => controlSave(record.code)">保存</a>
                        <a-popconfirm
                          title="确定要取消吗?"
                          ok-text="确定"
                          cancel-text="取消"
                          @confirm="() => controlCancel(record.code)"
                        >
                          <a>取消</a>
                        </a-popconfirm>
                      </template>
                      <template v-else>
                        <a
                          :disabled="extendEdit !== ''"
                          @click="() => controlModify(record.code, index)"
                        >编辑</a>
                        <a
                          :disabled="extendEdit !== ''"
                          @click="() => controlDel(index)"
                        >删除</a>
                      </template>
                    </div>
                  </template>
                </template>
              </a-table>
            </a-col>
          </a-row>
          <a-row style="padding-bottom: 10px">
            <a-col :span="24">
              <a-table
                :columns="extendColumns"
                :data-source="data.extendList"
                :pagination="false"
                row-key="code"
                bordered
              >
                <template #bodyCell="{ column, record, text, index }">
                  <template v-if="['value', 'description'].includes(column.dataIndex)">
                    <div>
                      <a-input
                        v-if="record.editable"
                        style="margin: -5px 0"
                        :value="text"
                        @change="
                          (e) => extendValChange(e.target.value, record.code, column.dataIndex)
                        "
                      />
                      <template v-else>
                        {{ text }}
                      </template>
                    </div>
                  </template>

                  <template v-if="column.dataIndex === 'operation'">
                    <div class="editable-row-operations">
                      <template v-if="record.editable">
                        <a @click="() => extendSave(record.code)">保存</a>
                        <a-popconfirm
                          title="确定要取消吗?"
                          ok-text="确定"
                          cancel-text="取消"
                          @confirm="() => extendCancel(record.code)"
                        >
                          <a>取消</a>
                        </a-popconfirm>
                      </template>
                      <template v-else>
                        <a
                          :disabled="extendEdit !== ''"
                          @click="() => extendEditor(record.code, index)"
                        >编辑</a>
                      </template>
                    </div>
                  </template>
                </template>
              </a-table>
            </a-col>
          </a-row>
        </a-form>
        <Control ref="control" />
      </a-spin>
      <template #footer>
        <div class="clearfix">
          <a-button @click="visible = false">
            取消
          </a-button>
          <a-button type="primary" :disabled="spinning" @click="handleOk">
            确定
          </a-button>
        </div>
      </template>
    </ht-modal>

    <ht-modal
      v-model:open="scopeVisible"
      title="上报范围"
      width="300px"
      cancel-text="取消"
      :destroy-on-close="true"
      @ok="chooseScope"
    >
      <div class="scope-type">
        <a-checkbox v-model:checked="scopeKesAll" @change="changeScopeAll">
          全选
        </a-checkbox>
        <a-checkbox-group
          v-model:value="scopeKeys"
          :options="unSelectedScopeTypes"
          @change="changeScope"
        />
      </div>
    </ht-modal>

    <SelProjcet
      ref="selProjcet"
      consign-unit-id=""
      :callback="getConsignProject"
    />
  </div>
</template>

<script>
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import SelProjcet from '~/providers/components/selProjcet.vue'
import Control from './control.vue'

function handleProcessor(data) {
  const arr = []
  for (const key in data) {
    let configList = null
    if (data[key].configList) {
      configList = _handleExtend(data[key].configList)
    }
    arr.push({
      code: data[key].key,
      describe: data[key].describe,
      extend: configList,
    })
  }
  return arr
}

function _handleExtend(data) {
  const _arr = []
  for (const key in data) {
    _arr.push({
      code: data[key].value,
      value: data[key].defaulted,
      description: data[key].describe,
    })
  }
  return _arr
}

export default {
  name: 'Regulatory',
  components: {
    Control,
    SelProjcet,
    PlusOutlined,
  },
  data() {
    return {
      dayjs,
      spinning: false,
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
      visible: false,
      regulatory: {},
      data: {
        reportFileType: 'AUTO',
        reportStatus: 'APPROVE',
        signature: ['NONE'],
        stamp: 'false',
        securityCode: 'ALL',
      },
      pdfCirculation: false,
      processors: [],

      bodyStyle: {
        height: '480px',
        overflow: 'hidden',
        overflowY: 'scroll',
      },
      extendEdit: '',
      extendCacheData: [],
      extendCacheValue: '',
      extendColumns: [
        {
          title: '配置信息Key',
          dataIndex: 'code',
          key: 'code',
          width: '30%',
        },
        {
          title: '配置信息value',
          dataIndex: 'value',
          key: 'value',
          width: '35%',
          scopedSlots: { customRender: 'value' },
        },
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description',
          width: '25%',
          scopedSlots: { customRender: 'description' },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '10%',
          key: 'operation',
          scopedSlots: { customRender: 'operation' },
        },
      ],
      controlEdit: '',
      controlCacheData: [],
      controlColumns: [
        {
          title: '限制条件名称',
          dataIndex: 'name',
          key: 'name',
          width: '30%',
        },
        {
          title: '限制条件名称值',
          dataIndex: 'value',
          key: 'value',
          width: '35%',
          scopedSlots: { customRender: 'value' },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '10%',
          key: 'operation',
          scopedSlots: { customRender: 'operation' },
        },
      ],
      scopeTypes: [
        {
          label: '资质类型',
          value: 'qualification',
          type: 'select',
          ajaxName: this.getQualificationData,
          options: [],
        },
        {
          label: '检测类别',
          value: 'testType',
          type: 'tree',
          ajaxName: this.getTestTypeData,
          options: [],
        },
        {
          label: '编号类型',
          value: 'snType',
          type: 'select',
          ajaxName: this.getSnTypeData,
          options: [],
        },
        {
          label: '工程项目',
          value: 'projectName',
          type: 'selectModal',
          modalName: this.getProjectData,
        },
        { label: '试验结束日期', value: 'signDateArr', type: 'dateRange' },
      ],
      unSelectedScopeTypes: [],
      selectedScopeTypes: [],
      scopeVisible: false,
      scopeKesAll: false,
      scopeKeys: [],
      signDateScope: '大于',
      showDateRange: false,
    }
  },
  methods: {
    onDelScopeType(scope, i) {
      this.selectedScopeTypes.splice(i, 1)
      this.data[scope.value] = undefined

      if (scope.value === 'signDateArr') {
        this.data.effectiveEndDate = undefined
        this.data.effectiveStartDate = undefined
      }
    },
    // 打开选择上报范围弹窗
    addScope() {
      const values = this.selectedScopeTypes.map(item => item.value)
      const types = this.scopeTypes.filter(
        item => !values.includes(item.value),
      )
      this.scopeKeys = []
      this.scopeKesAll = false
      this.unSelectedScopeTypes = types
      this.scopeVisible = true
    },
    // 确认选择上报范围
    chooseScope() {
      const selected = this.unSelectedScopeTypes.filter(item =>
        this.scopeKeys.includes(item.value),
      )
      this.selectedScopeTypes = this.selectedScopeTypes.concat(selected)
      this.scopeVisible = false

      this.selectedScopeTypes.forEach((item) => {
        if (item.type === 'select' || item.type === 'tree') {
          if (!this.data[item.value]) {
            this.data[item.value] = []
          }
        }
      })

      this.getSelectOptions()
    },
    // 全选上报范围
    changeScopeAll() {
      if (this.scopeKesAll) {
        this.scopeKeys = this.unSelectedScopeTypes.map(d => d.value)
      }
      else {
        this.scopeKeys = []
      }
    },
    // 修改上报范围
    changeScope() {
      this.scopeKesAll
        = this.scopeKeys.length === this.unSelectedScopeTypes.length
    },
    // 修改签发日期范围
    changeSignDateScope() {
      const d = this.data.signDateArr
      if (this.signDateScope === '介于') {
        this.data.signDateArr = d ? [d, d] : []
      }
      else {
        if (Array.isArray(d)) {
          this.data.signDateArr = d[0]
        }
        else {
          this.data.signDateArr = d
        }
      }
    },
    // 获取下拉选择的数据
    async getSelectOptions() {
      this.spinning = true
      for (let i = 0; i < this.selectedScopeTypes.length; i++) {
        const item = this.selectedScopeTypes[i]
        if (item.ajaxName && (!item.options || item.options.length === 0)) {
          const res = await item.ajaxName()
          item.options = res
        }
      }
      this.spinning = false
    },
    // 获取上报范围各项下拉数据 - 资质类型
    async getQualificationData() {
      try {
        const res = await window.$oAjax.get('/rest/common-body/qualification/list')
        if (res.code !== 20010) {
          return res.data.map(d => ({ ...d, label: d.name, value: d.id }))
        }
        return []
      }
      catch (err) {
        console.error('获取资质类型异常：', err)
        return []
      }
    },
    // 获取上报范围各项下拉数据 - 检测类别
    async getTestTypeData() {
      try {
        const res = await window.$oAjax.get(
          'rest/system-config/inspect/combination',
        )
        if (res.code === 20000) {
          ;(function _each(datas) {
            for (let i = 0; i < datas.length; i++) {
              const d = datas[i]
              d.label = d.name
              d.value = d.id
              if (d.children && d.children.length) {
                d.disabled = true
                _each(d.children)
              }
            }
          })(res.data)
          return res.data
        }
        return []
      }
      catch (err) {
        console.error('获取检测类别异常：', err)
        return []
      }
    },
    // 获取上报范围各项下拉数据 - 编号类型
    async getSnTypeData() {
      try {
        const res = await window.$oAjax.get(
          'tSnCategoryController.do?getSnCategoryUser',
        )
        if (res.success) {
          return res.obj.map(d => ({ ...d, label: d.name, value: d.id }))
        }
        return []
      }
      catch (err) {
        console.error('获取编号类型异常：', err)
        return []
      }
    },
    // 获取上报范围各项下拉数据 - 工程项目
    getProjectData() {
      const ids = this.data.project ? this.data.project.split(',') : []
      this.$refs.selProjcet.showModal('checkbox', ids)
    },
    // 获取选中的工程项目
    getConsignProject(ids, datas) {
      this.data.project = datas.map(d => d.id).join(',')
      this.data.projectName = datas.map(d => d.name).join(',')
    },

    getData() {
      this.spinning = true
      window.$oRest
        .get(`/rest/regulatory/config/${this.regulatory.id}`)
        .then((res) => {
          this.spinning = false
          if (res && res.code === 20000) {
            const data = { ...res.data }
            const selectedScopeTypes = []
            for (const k in data) {
              const scopeItem = this.scopeTypes.find(d => d.value === k)
              if (scopeItem && data[k]) {
                selectedScopeTypes.push(scopeItem)
                if (k === 'projectName')
                  continue
                data[k] = data[k].split(',')
              }
            }
            if (data.effectiveStartDate || data.effectiveEndDate) {
              if (data.effectiveStartDate && data.effectiveEndDate) {
                this.signDateScope = '介于'
                data.signDateArr = [
                  dayjs(data.effectiveStartDate),
                  dayjs(data.effectiveEndDate),
                ]
              }
              else if (!data.effectiveStartDate && data.effectiveEndDate) {
                this.signDateScope = '小于'
                data.signDateArr = dayjs(data.effectiveEndDate)
              }
              else if (data.effectiveStartDate && !data.effectiveEndDate) {
                this.signDateScope = '大于'
                data.signDateArr = dayjs(data.effectiveStartDate)
              }
              selectedScopeTypes.push({
                label: '试验结束日期',
                value: 'signDateArr',
                type: 'dateRange',
              })
            }

            this.data = data
            this.selectedScopeTypes = selectedScopeTypes

            this.getSelectOptions()

            // 这个版本的 <a-select>标签不支持boolean类型的候选值，这个地方进行转换
            this.data.stamp = this.data.stamp === true ? 'true' : 'false'
            this.data.securityCode = this.data.securityCode
              ? this.data.securityCode
              : 'ALL'
            this.data.reportFileType = this.data.reportFileType
              ? this.data.reportFileType
              : 'AUTO'
            // signature 是允许多选的，数据库方便存储将其用|进行了拼接，这里也需要转换
            if (this.data.signature) {
              const sign = this.data.signature.split('|')
              delete this.data.signature
              this.data.signature = sign
            }
            else {
              this.data.signature = ['NONE']
            }
            // 如果系统没有配置extend(这种情况一般是第一次进这个页面) 那么配置信息直接从处理程序中默认
            if (!this.data.extendList || this.data.extendList.length < 1) {
              if (this.data.processor) {
                this.data.extendList = this.processors.find(
                  it => it.code === this.data.processor,
                ).extend
              }
            }
            if (this.data.extendList) {
              this.extendCacheData = this.data.extendList.map(item => ({
                ...item,
              }))
              this.extendCacheValue = this.data.processor
            }
          }
          else {
            window.$oAntdMessage.error('列表加载失败')
          }
        })
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const values = { ...this.data }
        const _data = { ...values, extendList: [...this.data.extendList] }
        const scopes = this.scopeTypes.map(d => d.value)
        for (const k in _data) {
          if (scopes.includes(k)) {
            if (k === 'signDateArr') {
              if (_data.signDateArr) {
                if (this.signDateScope === '介于') {
                  _data.effectiveStartDate = dayjs(_data[k][0]).format(
                    'YYYY-MM-DD',
                  )
                  _data.effectiveEndDate = dayjs(_data[k][1]).format(
                    'YYYY-MM-DD',
                  )
                }
                else if (this.signDateScope === '大于') {
                  _data.effectiveEndDate = ''
                  _data.effectiveStartDate = dayjs(_data[k]).format('YYYY-MM-DD')
                }
                else if (this.signDateScope === '小于') {
                  _data.effectiveEndDate = dayjs(_data[k]).format('YYYY-MM-DD')
                  _data.effectiveStartDate = ''
                }
              }
            }
            else {
              if (Array.isArray(_data[k])) {
                _data[k] = _data[k] ? _data[k].join(',') : ''
              }
            }
          }
        }
        if (_data.projectName) {
          _data.project = this.data.project
        }

        _data.regulatoryId = this.regulatory.id
        if (_data.signature) {
          const sign = _data.signature.join('|')
          delete _data.signature
          _data.signature = sign
        }
        this.spinning = true
        let request, defaultErrorMsg
        if (this.data.id) {
          defaultErrorMsg = '监管系统上传配置编辑失败'
          request = window.$oAjax.put(
            `rest/regulatory/config`,
            { ..._data, id: this.data.id },
            {
              headers: { 'content-type': 'application/json' },
            },
            false,
            true,
          )
        }
        else {
          defaultErrorMsg = '监管系统上传配置添加失败'
          request = window.$oAjax.post(
            `rest/regulatory/config`,
            _data,
            {
              headers: { 'content-type': 'application/json' },
            },
            false,
            true,
          )
        }
        request
          .then((res) => {
            this.spinning = false
            if (res.code === 22000 || res.code === 21000) {
              this.visible = false
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || defaultErrorMsg))
            }
          })
          .catch((err) => {
            this.spinning = false
            window.$oAntdModal.warning(window.$oMsgTips.info(err.msg || defaultErrorMsg))
          })
      })
    },
    show(regulatory) {
      const transfer = window.$oAjax.get(
        `tSBusinessParamController.do?getBusinessParam&key=REPORT_MANAGE_23`,
      )
      this.pdfCirculation = transfer === 'pdf' || transfer === 'PDF'
      this.processor()
      this.visible = true
      this.regulatory = regulatory
      this.getData()
    },

    control() {
      this.$refs.control.show()
    },

    /**
     * 获取系统配置的处理程序，以及处理程序附带的配置信息（extend）
     */
    processor() {
      window.$oRest.get('/rest/regulatory/config/processor').then((res) => {
        if (res && res.code === 20000) {
          const _data = res.data
          this.processors = handleProcessor(_data)
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info('列表加载失败'))
        }
      })
    },

    extendValChange(value, key, column) {
      const newData = [...this.data.extendList]
      const target = newData.find(item => key === item.code)
      if (target) {
        target[column] = value
        this.data.extendList = newData
      }
    },
    /**
     *  处理器切换
     *
     *  处理器切换时，对用的extend信息也会相应的切换，这里要做的就是处理切换前后的数据缓存与恢复
     * @param value 变化后的值
     */
    processorChange(value) {
      this.extendEdit = ''
      // extendCacheData 中永远缓存的是现在正在编辑的extend信息，如果切换处理器，当前编辑过的 extend信息全部还原
      const pro = this.processors.find(it => it.code === this.extendCacheValue)
      if (pro && this.extendCacheData.length > 0) {
        pro.extend = this.extendCacheData
      }
      // 将 配置中的 extend信息放在编辑区
      this.data.extendList = this.processors.find(
        it => it.code === value,
      ).extend
      // 将 配置中的 extend 缓存起，防止下一次切换
      this.extendCacheData = this.data.extendList

      this.extendCacheValue = value
    },

    /**
     * 上报时报告状态 切换
     *
     * @param value
     */
    reportSourceChange(value) {
      this.data.reportFileType = value
      if (value === 'INTERVENED') {
        this.data.signature = ['NONE']
        this.data.stamp = 'false'
        this.data.securityCode = 'ALL'
      }
    },

    /**
     * 签字要求变更
     *
     * 这里如果任意选择了一个签字人，则将默认的 none 去掉
     * @param value
     */
    signatureChange(value) {
      if (value && value.length > 1) {
        const none = value.findIndex(it => it === 'NONE')
        if (none > -1)
          value.splice(none, 1)
      }
      this.data.signature = value
    },

    /**
     * 上报时报告状态
     *
     *  这里主要是给提示
     * @param value
     */
    reportStatusChange(value) {
      const arr = ['SUBMIT', 'RECHECK', 'AUDIT']
      const _cacheVal = this.data.reportStatus
      if (arr.find(it => it === value) && !this.pdfCirculation) {
        // eslint-disable-next-line ts/no-this-alias
        const _this = this
        window.$oAntdModal.warning({
          title: '提示',
          content:
            '您已选择使用系统生成报告文件上报，为确保报告文件已生成，请将“审核批准时查看记录报告的方式”控制参数设置为PDF后，再进行设置',
          okText: '确定',
          onOk() {
            _this.data.reportStatus = _cacheVal
          },
        })
      }
    },

    /**
     *  control 单行编辑模式
     *
     * @param code
     * @param index
     */
    controlModify(code, index) {
      const newData = [...this.data.controlList]
      const target = newData[index]
      target.editable = true
      this.controlEdit = code
      if (target) {
        this.data.controlList[index] = target
      }
    },

    controlDel(index) {
      this.data.controlList = this.data.controlList.splice(index, 1)
      this.controlCacheData = this.controlCacheData.splice(index, 1)
    },
    /**
     * control 单行本地保存
     *
     * 该方法并不会将用户修改的结果保存在服务器中
     * @param key
     */
    controlSave(key) {
      const newData = [...this.data.controlList]
      const newCacheData = [...this.controlCacheData]
      const target = newData.find(item => key === item.code)
      const targetCache = newCacheData.find(item => key === item.code)
      if (target && targetCache) {
        delete target.editable
        this.data.controlList = newData
        Object.assign(targetCache, target)
        this.controlCacheData = newCacheData
      }
      this.controlEdit = ''
    },
    /**
     * control 退出单行编辑模式
     *
     * @param key
     */
    controlCancel(key) {
      const newData = [...this.data.controlList]
      const target = newData.find(item => key === item.code)
      this.controlEdit = ''
      if (target) {
        Object.assign(
          target,
          this.controlCacheData.find(item => key === item.code),
        )
        delete target.editable
        this.data.controlList = newData
      }
    },

    /**
     *  extend 单行编辑模式
     *
     * @param code
     * @param index
     */
    extendEditor(code, index) {
      const newData = [...this.data.extendList]
      const target = newData[index]
      target.editable = true
      this.extendEdit = code
      if (target) {
        this.data.extendList[index] = target
      }
    },
    /**
     * extend 单行本地保存
     *
     * 该方法并不会将用户修改的结果保存在服务器中
     * @param key
     */
    extendSave(key) {
      const newData = [...this.data.extendList]
      const newCacheData = [...this.extendCacheData]
      const target = newData.find(item => key === item.code)
      const targetCache = newCacheData.find(item => key === item.code)
      if (target && targetCache) {
        delete target.editable
        this.data.extendList = newData
        Object.assign(targetCache, target)
        this.extendCacheData = newCacheData
      }
      this.extendEdit = ''
    },
    /**
     * extend 退出单行编辑模式
     *
     * @param key
     */
    extendCancel(key) {
      const newData = [...this.data.extendList]
      const target = newData.find(item => key === item.code)
      this.extendEdit = ''
      if (target) {
        Object.assign(
          target,
          this.extendCacheData.find(item => key === item.code),
        )
        delete target.editable
        this.data.extendList = newData
      }
    },
  },
}
</script>

<style lang="less" scoped>
.form-item-flex {
  display: flex;
  align-items: center;
  button {
    margin-left: 10px;
  }
}
.scope-type {
  padding: 0 30px;
}
</style>
