<!-- eslint-disable vue/valid-v-for -->
<template>
  <div>
    <a-row class="title">
      <a-col :span="24">
        <h3>基本信息</h3>
      </a-col>
    </a-row>
    <a-row class="shortcuts-box">
      <a-form
        ref="formRef"
        :label-col="{ style: { width: '120px' } }"
        :wrapper-col="{ style: { flex: 1 } }"
        :model="formState"
        class="w-full"
      >
        <a-form-item hidden>
          <a-input
            v-model:value="formState.categoryId"
            hidden
          />
        </a-form-item>

        <a-col :span="24">
          <a-row class="rows">
            <a-col :span="8">
              <a-form-item label="检查日期" :rules="[{ required: true, message: '请选择检查日期' }]" name="testDate">
                <a-range-picker
                  v-model:value="formState.testDate"
                  :disabled="disable"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="检查人"
                :rules="[{ required: true, type: 'array', message: '请输入检查人' }]"
                name="persons"
              >
                <a-select
                  v-model:value="formState.persons"
                  mode="multiple"
                  :disabled="disable"
                  style="width: 100%"
                  :placeholder="getDynamicPlaceholder('请选择检查人', formState.persons)"
                >
                  <!--                                    <a-select-opt-group v-for=" dept in departPerson"> -->
                  <!--                                        <span slot="label">{{dept.departName}}</span> -->
                  <a-select-option
                    v-for="person in persons"
                    :key="person.userId"
                    :value="person.userId"
                  >
                    {{ person.userName }}
                  </a-select-option>
                  <!--                                    </a-select-opt-group> -->
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="检查对象">
                <a-input
                  v-model:value="formState.testObject"
                  :disabled="disable"
                  :placeholder="getDynamicPlaceholder('请输入检查对象', formState.testObject)"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row
            v-if="inspectionCustomColumns && inspectionCustomColumns.length > 0"
            class="rows"
          >
            <a-col v-for="column in inspectionCustomColumns" :span="8">
              <CustomProperties
                :column="column"
                :column-values="inspectionData.customizeValues"
                label="customizeValues"
                :object-id="inspectionData.id"
                :disabled="disable"
                :show-placeholder="!disable"
              />
            </a-col>
          </a-row>
          <a-row class="rows">
            <a-col :span="8">
              <a-form-item
                label="检查编号"
                :rules="[{ required: true, message: '请输入检查编号' }]"
                name="sn"
              >
                <a-input
                  v-model:value="formState.sn"
                  :disabled="disable"
                  :placeholder="getDynamicPlaceholder('请生成检查编号', formState.sn)"
                >
                  <template #suffix>
                    <a-button
                      v-if="!disable"
                      type="link"
                      @click="autoGenerateCode"
                    >
                      自动生成
                    </a-button>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="rows">
            <a-col :span="24">
              <a-form-item
                label="备注"
                :label-col="{ style: { width: '120px' } }"
                :wrapper-col="{ style: { flex: 1 } }"
              >
                <a-input
                  v-model:value="formState.remark"
                  :disabled="disable"
                  :placeholder="getDynamicPlaceholder('请输入备注', formState.remark)"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-col>
      </a-form>
    </a-row>
    <a-row class="title">
      <a-col :span="8">
        <div style="display: flex; align-items: center">
          <h3 style="margin-right: 8px">
            检查内容
          </h3>
          <a-button
            v-if="!disable"
            type="primary"

            @click="addKeyPoint"
          >
            添加
          </a-button>
        </div>
      </a-col>
      <a-col :span="8">
        <span style="margin-right: 5px">是否已检查筛选:</span>
        <a-radio-group
          v-model:value="testSearch"
          @change="(e) => testSearchChange(e.target.value)"
        >
          <a-radio :value="null" default-checked>
            全部
          </a-radio>
          <a-radio :value="true">
            已检查
          </a-radio>
          <a-radio :value="false">
            未检查
          </a-radio>
        </a-radio-group>
      </a-col>
      <a-col :span="8">
        <span style="margin-right: 5px">是否需要整改筛选:</span>
        <a-radio-group
          v-model:value="reformSearch"
          @change="(e) => reformChange(e.target.value)"
        >
          <a-radio :value="null" default-checked>
            全部
          </a-radio>
          <a-radio :value="true">
            需整改
          </a-radio>
          <a-radio :value="false">
            无需整改
          </a-radio>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-row class="body-box">
      <a-col :span="24">
        <a-table
          bordered
          :data-source="keypointData"
          :columns="keyPointColumns"
          :loading="keyPointLoading"
          row-key="id"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'keypoint'">
              <div
                @mouseenter="() => mouseenter(record, 'keypointDelete')"
                @mouseleave="() => mouseleave(record, 'keypointDelete')"
              >
                <a-checkbox
                  v-model:checked="record.inspected"
                  :disabled="disable"
                  class="keypoint"
                  @change="
                    (e) => {
                      inspectedChange(e.target.checked, record)
                    }
                  "
                >
                  {{ text }}
                  <a-button
                    v-if="record.keypointDelete"
                    class="line-button"
                    :disabled="disable"
                    type="link"
                    @click="() => deleteKeyPoint(record)"
                  >
                    删除
                  </a-button>
                </a-checkbox>
              </div>
            </template>

            <template v-if="column.dataIndex === 'situation'">
              <div
                class="editable-column"
                @mouseenter="() => mouseenter(record, 'situationPen')"
                @mouseleave="() => mouseleave(record, 'situationPen')"
              >
                <a-textarea
                  v-if="record.situationEdit && !disable"
                  v-model:value="record.situation"
                  @blur="() => columnBlur(record, 'situationEdit')"
                  @change="(value) => situationChange(value, record)"
                />
                <template v-else>
                  {{ text }}
                  <a-button
                    v-if="record.situationPen && !disable"
                    style="float: right; margin-right: 5px"
                    type="link"
                    @click="() => columnClick(record, 'situationEdit')"
                  >
                    编辑
                  </a-button>
                </template>
              </div>
            </template>

            <template v-if="column.dataIndex === 'testFiles'">
              <div :key="record.id">
                <FilePreview
                  :key="record.files.length"
                  :files="record.files"
                  :type="1"
                  @delete="(files) => deleteFilePreview(files, record, 1)"
                />
                <a-upload
                  v-if="!disable"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  accept="image/*,video/*"
                  name="file"
                  :action="fileUploadUrl"
                  @change="
                    (info) => {
                      uploadKeyPointTestFile(info, record, 1)
                    }
                  "
                >
                  <a-button type="link" size="small">
                    上传
                  </a-button>
                </a-upload>
              </div>
            </template>

            <template v-if="column.dataIndex === 'problems'">
              <div
                :key="record.id"
                class="editable-column"
                @mouseenter="() => mouseenter(record, 'problemsPen')"
                @mouseleave="() => mouseleave(record, 'problemsPen')"
              >
                <a-input
                  v-if="
                    !record.problemsSelected && record.problemsEdit && !disable
                  "
                  :ref="`problemsInput_${record.id}`"
                  v-model:value="record.problems[0].content"
                  @change="(e) => problemsInputChange(e.target.value, record)"
                >
                  <template #suffix>
                    <a-button
                      type="link"
                      @click.stop="
                        () => {
                          selectProblems(record)
                        }
                      "
                    >
                      选择
                    </a-button>
                  </template>
                </a-input>
                <template v-else>
                  {{ problemsFilter_filter(text) }}
                  <a-button
                    v-if="record.problemsPen && !disable"
                    style="float: right; margin-right: 5px"
                    type="link"
                    @click="() => columnClick(record, 'problemsEdit')"
                  >
                    编辑
                  </a-button>
                </template>
              </div>
            </template>

            <template v-if="column.dataIndex === 'level'">
              <div :key="record.id">
                <a-select
                  v-model:value="record.problems[0].level"
                  :disabled="disable"
                  style="min-width: 80px; width: 100%"
                  @change="(value) => problemLevelChange(value, record)"
                >
                  <a-select-option
                    v-for="item in problemLevel"
                    :key="item.typename"
                    :value="item.typename"
                  >
                    {{ item.typename }}
                  </a-select-option>
                </a-select>
              </div>
            </template>

            <template v-if="column.dataIndex === 'needReform'">
              <div :key="record.id">
                <a-switch
                  :disabled="disable"
                  :checked="
                    record.problems[0] ? record.problems[0].needReform : false
                  "
                  @change="(checked) => problemNeedReform(checked, record)"
                />
              </div>
            </template>

            <template v-if="column.dataIndex === 'reformDescription'">
              <div
                v-if="record.problems[0] && record.problems[0].needReform"
                class="editable-column"
                @mouseenter="() => mouseenter(record, 'reformDescriptionPen')"
                @mouseleave="() => mouseleave(record, 'reformDescriptionPen')"
              >
                <a-textarea
                  v-if="record.reformDescriptionEdit && (reform || !disable)"
                  v-model:value="record.problems[0].reformDescription"
                  @blur="() => columnBlur(record, 'reformDescriptionEdit')"
                  @change="(e) => reformDescriptionChange(e.target.value, record)"
                />
                <template v-else>
                  {{ reformDescriptionFilter_filter(record.problems) }}
                  <a-button
                    v-if="record.reformDescriptionPen && (!disable || reform)"
                    style="float: right; margin-right: 5px"
                    type="link"
                    @click="() => columnClick(record, 'reformDescriptionEdit')"
                  >
                    编辑
                  </a-button>
                </template>
              </div>
              <div v-else disabled class="disabled"></div>
            </template>

            <template v-if="column.dataIndex === 'reformFiles'">
              <div v-if="record.problems[0] && record.problems[0].needReform">
                <FilePreview
                  :key="record.problems[0].files.length"
                  :files="record.problems[0].files"
                  :type="2"
                  @delete="(files) => deleteFilePreview(files, record, 2)"
                />
                <span v-if="reform || !disable">
                  <a-upload
                    :show-upload-list="false"
                    name="file"
                    accept="image/*,video/*"
                    :action="fileUploadUrl"
                    @change="
                      (info) => {
                        uploadKeyPointTestFile(info, record.problems[0], 2)
                      }
                    "
                  >
                    <a-button type="link" size="small">
                      上传
                    </a-button>
                  </a-upload>
                </span>
              </div>
              <div v-else disabled class="disabled"></div>
            </template>
          </template>
        </a-table>
      </a-col>
    </a-row>
    <div style="margin-top: 20px; text-align: center">
      <a-button
        v-if="!disable || reform"
        type="primary"
        size="large"
        @click="submit"
      >
        保存
      </a-button>
      <a-button
        v-if="!disable || reform"
        type="default"
        style="margin-left: 20px"
        size="large"
        @click="saveAndCancel"
      >
        保存并返回
      </a-button>
      <a-button
        type="default"
        style="margin-left: 20px"
        size="large"
        @click="cancel('')"
      >
        返回
      </a-button>
    </div>
    <div class="local-modal">
      <ht-modal
        width="98%"
        :open="addKeyPointVisible"
        :closable="false"
        :mask-closable="false"
        :destroy-on-close="true"
        @ok="addKeyPointOk"
        @cancel="addKeyPointCancel"
      >
        <KeyPoint ref="keyPoint" :selected-category="categoryId" />
      </ht-modal>

      <ht-modal
        width="40%"
        title="常见问题"
        :open="selectProblemsVisible"
        :closable="false"
        :mask-closable="false"
        :destroy-on-close="true"
        @ok="selectProblemsOk"
        @cancel="selectProblemsCancel"
      >
        <SelectProblem
          ref="selectProblem"
          :data="tempProblems"
          :record="editKeyPointRecord"
        />
      </ht-modal>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatTime } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import requestApi from '../request'
import CustomProperties from './components/CustomProperties.vue'
import FilePreview from './components/FilePreview.vue'
import KeyPoint from './components/KeyPoint.vue'
import SelectProblem from './components/SelectProblem.vue'

export default {
  name: 'Add',
  components: {
    CustomProperties,
    FilePreview,
    KeyPoint,
    SelectProblem,
  },
  data() {
    return {
      categoryId: null,
      openType: this.$route.query.openType,
      disable: true,
      reform: false,
      inspectionData: {
        id: null,
        sn: null,
        testObject: null,
        testDate: null,
        remark: null,
        keypoints: [],
        customizeValues: [],
        persons: [],
      },
      keyPointLoading: false,
      // 人员(按部门分组后的结果）
      departPerson: [],
      // 单纯的人员结合（去重过后的）
      persons: [],
      // 问题级别
      problemLevel: [],
      // 自定义的属性
      inspectionCustomColumns: [],
      // 是否已检查筛选
      testSearch: null,
      // 是否需要整改筛选
      reformSearch: null,
      // 检查项(显示出来的检查项)
      keypointData: [],

      // 检查列表
      keyPointColumns: [
        {
          title: '分类',
          dataIndex: 'category',
          width: '10%',
          customRender: ({ text }) => {
            // if(!row.rowSpan){
            //     row.rowSpan = 0
            // }
            return text
          },
        },
        {
          title: '检查项',
          dataIndex: 'keypoint',
          scopedSlots: { customRender: 'keypoint' },
          width: '14%',
        },
        {
          title: '检查情况',
          dataIndex: 'situation',
          scopedSlots: { customRender: 'situation' },
          width: '12%',
        },
        {
          title: '检查附件',
          dataIndex: 'testFiles',
          scopedSlots: { customRender: 'testFiles' },
          width: '10%',
        },
        {
          title: '问题',
          dataIndex: 'problems',
          scopedSlots: { customRender: 'problems' },
          width: '15%',
        },
        {
          title: '问题级别',
          dataIndex: 'level',
          scopedSlots: { customRender: 'level' },
          width: '6%',
        },
        {
          title: '是否需要整改',
          dataIndex: 'needReform',
          scopedSlots: { customRender: 'needReform' },
          width: '8%',
        },
        {
          title: '整改情况',
          dataIndex: 'reformDescription',
          scopedSlots: { customRender: 'reformDescription' },
          width: '15%',
        },
        {
          title: '整改附件',
          dataIndex: 'reformFiles',
          scopedSlots: { customRender: 'reformFiles' },
          width: '10%',
        },
      ],
      // 文件上传路径
      fileUploadUrl: `${rootUrl}/uploadController.do?upload`,
      // 添加检查项相关
      addKeyPointVisible: false,
      // 新添加的检查项
      newInspectionId: {},
      // 选择常见问题
      selectProblemsVisible: false,
      tempProblems: [],
      editKeyPointRecord: {},
      formState: {},
    }
  },
  created() {
    this.categoryId = this.$route.query.categoryId
    this.initCustomColumn()
    this.initProblemLevel()
    this.initPerson()
    this.refreshInspection(this.$route.query.inspectionId)
    this.disable = this.openType !== 'edit'
    this.reform = this.openType === 'reform'
  },
  methods: {
    getDynamicPlaceholder(originalPlaceholder, value) {
      if (this.disable && (value === '' || value === null || value === undefined)) {
        return ''
      }
      return originalPlaceholder
    },
    levelFilter_filter(problems) {
      if (problems && problems.length > 0) {
        return problems[0].level
      }
      return ''
    },
    reformDescriptionFilter_filter(problems) {
      if (problems && problems.length > 0) {
        return problems[0].reformDescription
      }
      return ''
    },
    problemsFilter_filter(problems) {
      if (problems && problems.length > 0) {
        return problems[0].content
      }
      return ''
    },
    formatTime,
    dayjs,
    /**
     * 检查项变更
     */
    inspectedChange(value, record) {
      record.inspected = value
      this.inspectionData.keypoints.find(
        item => item.id === record.id,
      ).inspected = value
      if (this.testSearch !== null || this.reformSearch !== null) {
        this.testSearchChange(this.testSearch)
      }
    },
    /**
     * 是否已检查筛选
     */
    testSearchChange(value, flag) {
      this.testSearch = value
      if (this.testSearch === null) {
        this.keypointData = JSON.parse(
          JSON.stringify(this.inspectionData.keypoints),
        )
      }
      else if (this.testSearch) {
        this.keypointData = this.inspectionData.keypoints.filter(
          item => item.inspected,
        )
      }
      else {
        this.keypointData = this.inspectionData.keypoints.filter(
          item => !item.inspected,
        )
      }
      if (!flag) {
        this.reformChange(this.reformSearch)
      }
    },
    /**
     * 是否需要整改筛选
     */
    reformChange(value) {
      this.reformSearch = value
      this.testSearchChange(this.testSearch, true)
      if (this.reformSearch !== null) {
        if (this.reformSearch) {
          this.keypointData = this.keypointData.filter(
            item =>
              item.problems && item.problems[0] && item.problems[0].needReform,
          )
        }
        else {
          this.keypointData = this.keypointData.filter(
            item =>
              !item.problems
              || !item.problems[0]
              || !item.problems[0].needReform,
          )
        }
      }
    },
    /**
     * 初始化自定义属性
     */
    initCustomColumn() {
      requestApi.inspection
        .customProperties(`inspection_type_${this.categoryId}`)
        .then((res) => {
          this.inspectionCustomColumns = res.data || []
        })
    },
    /**
     * 初始化问题级别
     */
    initProblemLevel() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      requestApi.inspection.problemLevel().then((res) => {
        _this.problemLevel = res.rows
      })
    },
    /**
     * 初始化人员信息
     */
    initPerson() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this

      requestApi.inspection.persons().then((res) => {
        _this.persons = []
        _this.departPerson = res.data
        _this.departPerson.forEach((item) => {
          item.persons.forEach((it) => {
            const a = _this.persons.find(i => i.userId === it.userId)

            if (!a) {
              if (it.userId === '2c9284d07472d398017475c947750d72') { /* empty */ }
              _this.persons.push({
                ...it,
                inspectionId: _this.inspectionData.id,
              })
            }
          })
        })
      })
    },
    /**
     * 刷新当前页面
     */
    refreshInspection(id) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this

      return new Promise((resolve) => {
        if (id) {
          requestApi.inspection.entry(id).then((res) => {
            _this.inspectionData = res.data
            // eslint-disable-next-line ts/no-unused-expressions
            !_this.inspectionData.keypoints.forEach((item) => {
              if (!item.problems || !item.problems[0]) {
                item.problems = [
                  {
                    id: null,
                    level: null,
                    content: null,
                    needReform: false,
                  },
                ]
              }
            })

            _this.testSearchChange(_this.testSearch)

            let persons = _this.inspectionData.persons.map(
              item => item.userId,
            )
            persons = Array.from(new Set(persons))
            window.$oNextTick(() => {
              _this.formState.persons = persons
              _this.formState.testObject = _this.inspectionData.testObject
              _this.formState.sn = _this.inspectionData.sn
              _this.formState.remark = _this.inspectionData.remark
              _this.formState.testDate = [
                _this.inspectionData.testDate
                  ? dayjs(_this.inspectionData.testDate)
                  : null,
                _this.inspectionData.testDateEnd
                  ? dayjs(_this.inspectionData.testDateEnd)
                  : null,
              ]
              resolve()
            })
          })
        }
      })
    },
    /**
     * 点击事件
     */
    columnClick(record, type) {
      record[type] = true
    },
    /**
     * 失去焦点事件
     */
    columnBlur(record, type) {
      record[type] = false
      delete record[type]
    },
    /**
     * 悬停事件
     */
    mouseenter(record, type) {
      record[type] = true
    },
    /**
     * 悬停事件
     */
    mouseleave(record, type) {
      record[type] = false
    },
    /**
     * 删除检查项
     */
    deleteKeyPoint(record) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oAntdConfirm({
        title: '提示',
        content: '此检查项下的检查情况、附件等将一并被删除，是否继续？',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk() {
          _this.keypointData = _this.keypointData.filter(
            item => item.id !== record.id,
          )
          _this.inspectionData.keypoints
            = _this.inspectionData.keypoints.filter(
              item => item.id !== record.id,
            )
          // _this.mergedCell()
        },
      })
    },
    /**
     * 编辑检查情况
     */
    situationChange(value, record) {
      record.situation = value.target.value
      record.inspected = true
      this.inspectionData.keypoints.find(
        item => item.id === record.id,
      ).inspected = true
      this.inspectionData.keypoints.find(
        item => item.id === record.id,
      ).situation = value.target.value
    },
    /**
     * 问题选择
     */
    selectProblems(record) {
      requestApi.keyPoint.entry(record.keypointId).then((res) => {
        this.tempProblems = res.data.problems
        this.editKeyPointRecord = record
        this.selectProblemsVisible = true
      })
    },
    /**
     * 问题变更
     */
    problemsInputChange(value, record) {
      let temp = record.problems[0]
      if (!temp) {
        temp = {
          id: null,
          content: value,
          files: [],
        }
      }
      else {
        temp.content = value
      }
      record.problems[0] = temp
      this.inspectionData.keypoints.find(
        item => item.id === record.id,
      ).problems[0] = temp
      record.inspected = true
      this.inspectionData.keypoints.find(
        item => item.id === record.id,
      ).inspected = true
      record.problemsSelected = false
      delete record.problemsSelected
    },
    /**
     * 问题变更
     */
    selectProblemsOk() {
      const record = this.$refs.selectProblem.record
      const value = this.$refs.selectProblem.rowKeys
      const key = value ? value[0] : null
      const problem = record.problems[0]
      const selected = this.tempProblems
        .filter(item => item.id === key)
        .map((t) => {
          return {
            id: problem ? problem.id : null,
            content: t.content,
            level: t.level,
            files: [],
          }
        })
      record.problems = selected
      record.inspected = true
      this.inspectionData.keypoints.find(
        item => item.id === record.id,
      ).inspected = true
      this.inspectionData.keypoints.find(
        item => item.id === record.id,
      ).problems = selected
      const ref = `problemsInput_${record.id}`
      window.$oNextTick(() => {
        this.$refs[ref].focus()
        this.tempProblems = []
        this.editKeyPointRecord = {}
        this.selectProblemsVisible = false
      })
    },
    selectProblemsCancel() {
      this.selectProblemsVisible = false
    },
    /**
     * 问题变更
     */
    problemsBlur(record) {
      if (!record.problemsSelected) {
        record.problemsEdit = false
        delete record.problemsEdit
        delete record.tempProblems
      }
    },
    /**
     * 修改问题级别
     */
    problemLevelChange(value, record) {
      if (
        !record.problems
        || !record.problems[0]
        || !record.problems[0].content
      ) {
        window.$oAntdMessage.error('请先选择/填写问题内容')
        return false
      }
      record.problems[0].level = value
      this.inspectionData.keypoints.find(
        item => item.id === record.id,
      ).problems[0].level = value
    },
    /**
     * 修改整改情况
     */
    reformDescriptionChange(value, record) {
      record.problems[0].reformDescription = value
      this.inspectionData.keypoints.find(
        item => item.id === record.id,
      ).problems[0].reformDescription = value
    },
    /**
     * 问题是否需要整改
     */
    problemNeedReform(checked, record) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      if (
        !record.problems
        || !record.problems[0]
        || !record.problems[0].content
      ) {
        window.$oAntdMessage.error('请先选择/填写问题内容')
        return false
      }

      if (
        !checked
        && ((record.problems[0].reformDescription !== ''
          && record.problems[0].reformDescription !== null
          && record.problems[0].reformDescription !== undefined)
        || (record.problems[0].files && record.problems[0].files.length > 0))
      ) {
        window.$oAntdConfirm({
          title: '提示',
          content:
            ' 当前已录入了整改内容，若关闭开关则将清空整改内容，是否继续？',
          okText: '确定',
          okType: 'primary',
          cancelText: '取消',
          onOk() {
            record.problems[0].needReform = checked
            record.problems[0].files = []
            record.problems[0].reformDescription = ''

            _this.inspectionData.keypoints.find(
              item => item.id === record.id,
            ).problems[0].needReform = checked
            _this.inspectionData.keypoints.find(
              item => item.id === record.id,
            ).problems[0].files = []
            _this.inspectionData.keypoints.find(
              item => item.id === record.id,
            ).problems[0].reformDescription = ''
            _this.testSearchChange(_this.testSearch)
          },
        })
      }
      else {
        record.problems[0].needReform = checked
        _this.inspectionData.keypoints.find(
          item => item.id === record.id,
        ).problems[0].needReform = checked
        _this.testSearchChange(_this.testSearch)
      }
    },
    /**
     * 添加检查项
     */
    addKeyPoint() {
      this.addKeyPointVisible = true
    },
    beforeUpload(file) {
      if (!file.type.includes('image/') && !file.type.includes('video/')) {
        window.$oAntdMessage.error('只支持图片和视频文件上传')
        return false
      }
    },
    /**
     * 上传附件
     */
    uploadKeyPointTestFile(info, record, type) {
      if (info.file.status === 'uploading') {
        this.keyPointLoading = true
      }
      else if (info.file.response) {
        this.keyPointLoading = false
        if (info.file.response.success || info.file.response.code === 20000) {
          const res = info.file.response.obj[0]
          const file = {
            id: null,
            attachmentId: res.id,
            objectId: record.id,
            name: res.attachmenttitle,
            url: res.realpath,
            type,
          }
          if (!record.files) {
            record.files = []
          }
          const files = record.files
          files.push(file)
          record.files = files

          if (type === 1) {
            this.keypointData.find(item => item.id === record.id).files
              = files
            this.inspectionData.keypoints.find(
              item => item.id === record.id,
            ).files = files
            record.inspected = true
            this.inspectionData.keypoints.find(
              item => item.id === record.id,
            ).inspected = true
          }
          else {
            this.keypointData.find(
              item => item.problems[0].id === record.id,
            ).problems[0].files = files
            this.inspectionData.keypoints.find(
              item => item.problems[0].id === record.id,
            ).problems[0].files = files
          }

          window.$oAntdMessage.success('上传成功')
        }
        else {
          window.$oAntdMessage.error(
            `上传失败：${info.file.response.msg || info.file.response.message}`,
          )
        }
      }
    },
    /**
     * 删除文件
     */
    deleteFilePreview(files, record, type) {
      if (type === 1) {
        this.keypointData.find(item => item.id === record.id).files = files
        this.inspectionData.keypoints.find(
          item => item.id === record.id,
        ).files = files
        record.inspected = true
        this.inspectionData.keypoints.find(
          item => item.id === record.id,
        ).inspected = true
      }
      else {
        this.keypointData.find(
          item => item.problems[0].id === record.id,
        ).problems[0].files = files
        this.inspectionData.keypoints.find(
          item => item.problems[0].id === record.id,
        ).problems[0].files = files
      }
    },
    /**
     * 添加检查要点确认事件
     */
    addKeyPointOk() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      let keyPointIds = this.$refs.keyPoint.keyPointSelectedRowKeys
      // 排除现在列表中已经有的数据
      _this.keypointData.forEach((item) => {
        if (keyPointIds.includes(item.keypointId)) {
          keyPointIds = keyPointIds.filter(it => it !== item.keypointId)
        }
      })

      const keyPointAll = this.$refs.keyPoint.keyPointData
      keyPointAll.forEach((item) => {
        if (keyPointIds.includes(item.id)) {
          const idIndex = Object.getOwnPropertyNames(this.newInspectionId).length
          const id = `_new_${idIndex}`
          this.newInspectionId[id] = true
          const keyPoint = {
            id,
            category: item.category,
            categoryId: item.categoryId,
            keypoint: item.keypoint,
            keypointId: item.id,
            inspected: false,
            situation: null,
            orderNumber: item.sort,
            files: [],
            problems: [
              {
                id: null,
                level: null,
                content: null,
                needReform: false,
              },
            ],
          }

          // 当前筛选状态，
          if (!_this.testSearch && !_this.reformSearch) {
            _this.keypointData.push(keyPoint)
          }

          _this.inspectionData.keypoints.push(keyPoint)
        }
      })
      _this.keypointData.sort(item => item.orderNumber)
      _this.inspectionData.keypoints.sort(item => item.orderNumber)
      // 合并单元格
      // _this.mergedCell()
      this.addKeyPointVisible = false
    },
    /**
     * 添加检查要点取消事件
     */
    addKeyPointCancel() {
      this.addKeyPointVisible = false
    },
    /**
     * 合并单元格
     */
    mergedCell() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      // 合并单元格
      let rowSpan = 1
      let itemTitle = null
      let lastIndex = 0
      _this.keypointData.sort((it1, it2) => _this.localSort(it1, it2))
      const temp = JSON.parse(JSON.stringify(_this.keypointData))
      if (temp && temp.length > 0) {
        itemTitle = temp[0].category
        temp.forEach((item, index) => {
          if (itemTitle && item.category === itemTitle) {
            rowSpan++
          }
          else {
            _this.keypointData[lastIndex].rowSpan = rowSpan
            rowSpan = 1
            lastIndex = index
          }
        })
      }
    },
    localSort(item1, item2) {
      const o1 = item1.orderNumber.split('-')
      const o2 = item2.orderNumber.split('-')
      if (o2.length > o1.length) {
        if (o1.find((o, i) => o >= o2[i])) {
          return 1
        }
      }
      else {
        if (o2.find((o, i) => o >= o1[i])) {
          return -1
        }
      }
    },
    /**
     * 自动生成编号
     */
    async autoGenerateCode() {
      try {
        // 验证除sn以外的所有必填字段
        await this.$refs.formRef.validateFields(['testate', 'persons'])
        this.save({ ...this.formState }, true)
      }
      catch (err) {
        console.error(err)
        window.$oAntdMessage.error(err.errorFields[0].errors[0] || '请填写必填项')
      }
    },
    /**
     * 提交数据
     */
    submit() {
      return new Promise((resolve) => {
        this.$refs.formRef.validateFields().then(() => {
          const value = { ...this.formState }
          this.save(value, false).then(() => {
            resolve(value)
          })
        })
      })
    },
    /**
     * 保存数据
     */
    save(entry, generateCode) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      // 查看是否生成了编号，没有就先生成编号再提交
      const tempData = JSON.parse(JSON.stringify(_this.inspectionData.keypoints))

      tempData.forEach((item) => {
        if (_this.newInspectionId[item.id]) {
          item.id = null
        }
      })
      _this.inspectionData = { ..._this.inspectionData, ...entry }
      _this.inspectionData.keypoints = tempData

      if (!_this.inspectionData.categoryId) {
        _this.inspectionData.categoryId = this.categoryId
      }

      _this.inspectionData.customizeValues = this.inspectionCustomColumns.map(i => ({
        objectId: this.inspectionData.id || null,
        columnId: i.id,
        columnType: i.columnType,
        columnValue: i.columnValue,
      }))

      let flag = true
      // eslint-disable-next-line ts/no-unused-expressions
      !_this.inspectionData.keypoints.forEach((item, index) => {
        if (!item.files) {
          item.files = []
        }

        if (
          !item.problems
          || !item.problems[0]
          || (!item.problems[0].content && !item.problems[0].level)
        ) {
          item.problems = []
        }
        else if (!item.problems[0].content || !item.problems[0].level) {
          window.$oAntdMessage.error(`第${index + 1}行问题信息没有填写完整`)
          flag = false
        }
        else if (!item.problems[0].files) {
          item.problems[0].files = []
        }
      })
      if (!flag) {
        return false
      }

      // 处理日期格式
      const testDate = JSON.parse(JSON.stringify(_this.inspectionData.testDate))
      if (testDate.length < 2) {
        window.$oAntdMessage.error('检查日期格式错误')
      }
      _this.inspectionData.testDate = new Date(testDate[0])
      _this.inspectionData.testDateEnd = new Date(testDate[1])

      // 人员处理
      const ps = []
      _this.inspectionData.persons.forEach((v) => {
        const person = _this.persons.find(item => item.userId === v)
        ps.push(person)
      })
      _this.inspectionData.persons = ps

      return new Promise((resolve) => {
        requestApi.inspection.edit(_this.inspectionData).then((res) => {
          if (generateCode) {
            _this.inspectionData.id = res.data
            _this.generate(_this.inspectionData.id).then(() => {
              resolve()
            })
          }
          else {
            window.$oAntdMessage.success('保存成功')
            _this.refreshInspection(res.data).then(() => {
              resolve()
            })
          }
        })
      })
    },
    /**
     * 真正生成编号的位置
     */
    generate(inspectionId) {
      return new Promise((resolve) => {
        requestApi.inspection.generateSn(inspectionId).then((res) => {
          this.inspectionData.sn = res.data
          window.$oAntdMessage.success('编号生成成功')
          this.formState.sn = res.data
          // 在生成编号后，触发表单验证以更新验证状态
          this.$nextTick(() => {
            this.$refs.formRef.validateFields(['sn'])
          })
          resolve()
        })
      })
    },
    /**
     * 返回list
     */
    saveAndCancel() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.submit().then(() => {
        _this.cancel(1)
      })
    },
    /**
     * 返回list
     */
    cancel(type) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      if ((type !== 1 && !_this.disable) || (type !== 1 && _this.reform)) {
        window.$oAntdConfirm({
          title: '提示',
          content: '点击返回本页面没有保存的数据将会丢失，确定要现在返回吗？',
          okText: '确定',
          okType: 'primary',
          cancelText: '取消',
          onOk() {
            _this.$router.push({
              name: 'list',
              query: { categoryDefaultCheckedKeys: [_this.categoryId] },
            })
          },
        })
      }
      else {
        _this.$router.push({
          name: 'list',
          query: { categoryDefaultCheckedKeys: [_this.categoryId] },
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.keypoint {
  font-size: 12px;
}
.title {
  padding: 10px 0 5px 40px;
  border-bottom: 2px var(--colorSplit) solid;
  h3 {
    font-weight: bold;
  }
}
.shortcuts-box {
  padding: 10px 0 5px 40px;
  .rows {
    margin-bottom: 5px;
  }
}
.body-box {
  .line-button {
    height: 17.98px;
  }
}
.bottom-box {
  padding: 10px 0 5px 40px;
  button {
    padding: 5px 20px;
  }
}
.editable-column {
  min-height: 28px;
  min-width: 50px;
}
.disabled {
  width: 100%;
  height: inherit;
  background-color: #f5f5f5;
}
</style>

<style scoped>
.ant-radio-wrapper {
  font-size: 12px;
}
</style>
