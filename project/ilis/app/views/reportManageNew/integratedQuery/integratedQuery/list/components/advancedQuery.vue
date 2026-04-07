<template>
  <div>
    <a-drawer
      title="高级查询"
      placement="left"
      :closable="true"
      :open="visible"
      :width="620"
      @close="closeModel"
    >
      <div class="form_box">
        <p class="query_row">
          <span class="label">数据状态：</span>
          <a-select v-model:value="queryForm.process" style="width: 405px">
            <a-select-option
              v-for="item in processList"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </p>

        <p class="query_row">
          <span class="label">委托编号：</span>
          <a-input
            v-model:value="queryForm.consignCode"
            style="width: 405px"
            placeholder="请输入委托编号"
          />
        </p>

        <p class="query_row">
          <span class="label">样品编号：</span>
          <a-input
            v-model:value="queryForm.testObjectCode"
            style="width: 405px"
            placeholder="请输入样品编号"
          />
        </p>

        <p class="query_row">
          <span class="label">任务编号：</span>
          <a-input
            v-model:value="queryForm.taskCode"
            style="width: 405px"
            placeholder="请输入任务编号"
          />
        </p>

        <p class="query_row">
          <span class="label">记录编号：</span>
          <a-input
            v-model:value="queryForm.recordCode"
            style="width: 405px"
            placeholder="请输入记录编号"
          />
        </p>

        <p class="query_row">
          <span class="label">报告编号：</span>
          <a-input
            v-model:value="queryForm.reportNumber"
            style="width: 405px"
            placeholder="请输入报告编号"
          />
        </p>

        <p class="query_row">
          <span class="label">合同名称：</span>
          <a-input
            v-model:value="queryForm.contractName"
            style="width: 405px"
            placeholder="请输入合同名称"
          />
        </p>

        <p class="query_row">
          <span class="label">合同编号：</span>
          <a-input
            v-model:value="queryForm.contractNo"
            style="width: 405px"
            placeholder="请输入合同编号"
          />
        </p>

        <p class="query_row">
          <span class="label">工程项目：</span>
          <a-input
            v-model:value="queryForm.projectName"
            style="width: 405px"
            placeholder="请输入工程项目"
          />
        </p>

        <p class="query_row">
          <span class="label">委托单位：</span>
          <a-input
            v-model:value="queryForm.consignUnit"
            style="width: 405px"
            placeholder="请输入委托单位"
          />
        </p>

        <p class="query_row">
          <span class="label">检测参数：</span>
          <a-input
            v-model:value="queryForm.testParams"
            style="width: 405px"
            placeholder="请输入检测参数"
          />
        </p>

        <p class="query_row">
          <span class="label">样品名称：</span>
          <a-input
            v-model:value="queryForm.sampleName"
            style="width: 405px"
            placeholder="请输入样品名称"
          />
        </p>

        <!-- <p class="query_row">
                      <span class="label">检测部门：</span>
                      <a-tree-select v-model="queryForm.departId" style="width: 405px"
                          :dropdownStyle="{ maxHeight: '405px', overflow: 'auto' }" placeholder="请选择部门" allowClear
                          :treeData="departmentData" treeDefaultExpandAll showSearch />
                  </p> -->

        <p class="query_row">
          <span class="label">委托日期：</span>
          <a-date-picker
            v-model:value="queryForm.consignDateStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.consignDateEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>

        <p class="query_row">
          <span class="label">检测日期：</span>
          <a-date-picker
            v-model:value="queryForm.testTimeStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.testTimeEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>

        <p class="query_row">
          <span class="label">审核日期：</span>
          <a-date-picker
            v-model:value="queryForm.auditDateStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.auditDateEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>

        <p class="query_row">
          <span class="label">检测人员：</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.testPersons"
              :key="item.id"
              closable
              @close="delPerson('testPersons', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('testPersons')">
            选择
          </a-button>
        </p>

        <p class="query_row">
          <span class="label">复核人员：</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.reviewPersons"
              :key="item.id"
              closable
              @close="delPerson('reviewPersons', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('reviewPersons')">
            选择
          </a-button>
        </p>

        <p class="query_row">
          <span class="label">审核人员：</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.auditPersons"
              :key="item.id"
              closable
              @close="delPerson('auditPersons', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('auditPersons')">
            选择
          </a-button>
        </p>

        <p class="query_row">
          <span class="label">批准人员：</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.approvePersons"
              :key="item.id"
              closable
              @close="delPerson('approvePersons', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('approvePersons')">
            选择
          </a-button>
        </p>
        <p class="query_row">
          <span class="label">委托类别：</span>
          <a-select v-model:value="queryForm.consignType" :options="consignTypeOptions" style="width: 405px" />
        </p>

        <p class="query_row">
          <span class="label">检测类别：</span>
          <a-select
            v-model:value="queryForm.checkType"
            style="width: 405px"
            placeholder="请选择检测类别"
          >
            <a-select-option
              v-for="item in checkTypeList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </p>
        <p class="query_row">
          <span class="label">编号类别：</span>
          <a-select
            v-model:value="queryForm.codeType"
            style="width: 405px"
            placeholder="请选择编号类别："
          >
            <a-select-option
              v-for="item in codeTypeList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </p>
        <p class="query_row">
          <span class="label">委托人：</span>
          <a-input
            v-model:value="queryForm.sampleSender"
            style="width: 405px"
            placeholder="请输入委托人"
          />
        </p>

        <p class="query_row">
          <span class="label">记录人：</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.testTaskRecordPersons"
              :key="item.id"
              closable
              @close="delPerson('testTaskRecordPersons', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('testTaskRecordPersons')">
            选择
          </a-button>
        </p>

        <p class="query_row">
          <span class="label">要求报告日期(用户)：</span>
          <a-date-picker
            v-model:value="queryForm.determineRequiredDateExternalStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.determineRequiredDateExternalEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>
        <p class="query_row">
          <span class="label">要求报告日期(内部)：</span>
          <a-date-picker
            v-model:value="queryForm.determineRequiredInternalDateStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.determineRequiredInternalDateEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>
        <p class="query_row">
          <span class="label">数据来源：</span>
          <a-select v-model:value="queryForm.dataFrom" :options="dataFromOptions" style="width: 405px" />
        </p>
        <p class="query_row">
          <span class="label">项目性质：</span>
          <a-select
            v-model:value="queryForm.projectNature"
            :options="projectNatureOptions"
            style="width: 405px"
          />
        </p>
        <p class="query_row">
          <span class="label">协作单位：</span>
          <a-input
            v-model:value="queryForm.cooperativeUnit"
            style="width: 405px"
            placeholder="请输入协作单位"
          />
        </p>
        <p class="query_row">
          <span class="label">是否分包：</span>
          <a-select v-model:value="queryForm.subpackage" :options="subpackageOptions" style="width: 405px" />
        </p>
        <p class="query_row">
          <span class="label">项目编号：</span>
          <a-input
            v-model:value="queryForm.projectCode"
            style="width: 405px"
            placeholder="请输入项目编号"
          />
        </p>
        <p class="query_row">
          <span class="label">建设项目：</span>
          <a-input
            v-model:value="queryForm.buildProjectName"
            style="width: 405px"
            placeholder="请输入建设项目"
          />
        </p>
        <p class="query_row">
          <span class="label">工程部位/用途：</span>
          <a-input
            v-model:value="queryForm.projectPart"
            style="width: 405px"
            placeholder="请输入工程部位/用途"
          />
        </p>
        <p class="query_row">
          <span class="label">合同类型:</span>
          <a-select v-model:value="queryForm.contractType" :options="contractTypeOptions" style="width: 405px" />
        </p>
        <p class="query_row">
          <span class="label">费用状态:</span>
          <a-select v-model:value="queryForm.feeStatus" :options="feeStatusOptions" style="width: 405px" />
        </p>
        <p class="query_row">
          <span class="label">缴费单位:</span>
          <a-input
            v-model:value="queryForm.paymentCompany"
            style="width: 405px"
            placeholder="请输入缴费单位"
          />
        </p>
        <p class="query_row">
          <span class="label">收费日期:</span>
          <a-date-picker
            v-model:value="queryForm.chargeDateStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.chargeDateEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>
        <p class="query_row">
          <span class="label">所属部门:</span>
          <a-tree-select
            v-model:value="queryForm.department"
            style="width: 405px"
            :dropdown-style="{ maxHeight: '405px', overflow: 'auto' }"
            placeholder="请选择部门"
            allow-clear
            :tree-data="departmentData"
            tree-default-expand-all
            show-search
            @change="onChangeDepartment"
          />
        </p>
        <p class="query_row">
          <span class="label">报告编写人:</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.reportEditor"
              :key="item.id"
              closable
              @close="delPerson('reportEditor', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('reportEditor')">
            选择
          </a-button>
        </p>
        <p class="query_row">
          <span class="label">项目负责人:</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.projectPrincipal"
              :key="item.id"
              closable
              @close="delPerson('projectPrincipal', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('projectPrincipal')">
            选择
          </a-button>
        </p>
        <p class="query_row">
          <span class="label">项目创建人:</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.projectCreator"
              :key="item.id"
              closable
              @close="delPerson('projectCreator', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('projectCreator')">
            选择
          </a-button>
        </p>
        <p class="query_row">
          <span class="label">分配日期:</span>
          <a-date-picker
            v-model:value="queryForm.allocDateStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.allocDateEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>
        <p class="query_row">
          <span class="label">报告提交日期:</span>
          <a-date-picker
            v-model:value="queryForm.submitReportTimeStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.submitReportTimeEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>
        <p class="query_row">
          <span class="label">资质类型:</span>
          <a-select
            v-model:value="queryForm.qualificationType"
            mode="multiple"
            style="width: 405px"
            placeholder="请选择"
          >
            <a-select-option
              v-for="item in qualificationList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </p>
        <p class="query_row">
          <span class="label">报告资质:</span>
          <a-select
            v-model:value="queryForm.reportQualifications"
            mode="multiple"
            style="width: 405px"
            placeholder="请选择"
          >
            <a-select-option
              v-for="item in qualificationList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </p>
        <p class="query_row">
          <span class="label">报告印章:</span>
          <a-select
            v-model:value="queryForm.reportSeal"
            style="width: 405px"
            placeholder="请选择"
          >
            <a-select-option
              v-for="item in reportSealList"
              :key="item.sealId"
              :value="item.sealId"
            >
              {{ item.sealName }}
            </a-select-option>
          </a-select>
        </p>
        <p class="query_row">
          <span class="label">打印日期:</span>
          <a-date-picker
            v-model:value="queryForm.printDateStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.printDateEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>
        <p class="query_row">
          <span class="label">发放方式:</span>
          <a-select v-model:value="queryForm.issueWay" :options="issueWayOptions" style="width: 405px" />
        </p>
        <p class="query_row">
          <span class="label">发放日期:</span>
          <a-date-picker
            v-model:value="queryForm.issueDateStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.issueDateEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>
        <p class="query_row">
          <span class="label">
            <a-popover>
              <template #content>
                <p>报告中的批准日期</p>
              </template>
              <InfoCircleOutlined />
            </a-popover>
            <span>签发日期:</span>
          </span>
          <a-date-picker
            v-model:value="queryForm.signDateStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.signDateEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>
        <p class="query_row">
          <span class="label">
            <a-popover>
              <template #content>
                <p>系统中“批准通过”操作的实际日期</p>
              </template>
              <InfoCircleOutlined />
            </a-popover>
            <span> 签发操作日期:</span>
          </span>
          <a-date-picker
            v-model:value="queryForm.approveDateStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-date-picker
            v-model:value="queryForm.approveDateEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>
        <p class="query_row">
          <span class="label">签章时间：</span>
          <a-date-picker v-model:value="queryForm.stampDateStart" style="width: 195px;" value-format="YYYY-MM-DD" />
          -
          <a-date-picker v-model:value="queryForm.stampDateEnd" style="width: 195px;" value-format="YYYY-MM-DD" />
        </p>
        <p class="query_row">
          <span class="label">签章状态：</span>
          <a-select v-model:value="queryForm.eleSignStampStatus" :options="eleSignStampStatusOptions" style="width: 405px" />
        </p>
        <p class="query_row">
          <span class="label">签章人：</span>
          <a-input v-model:value="queryForm.stampUserName" style="width: 405px" placeholder="请输入签章人" />
        </p>
      </div>
      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 1,
        }"
      >
        <a-button type="primary" @click="queryData">
          查询
        </a-button>
        <a-button :style="{ marginRight: '8px' }" @click="clearForm(true)">
          清空条件
        </a-button>
      </div>
    </a-drawer>

    <SelectPersonnel ref="SelectPersonnel" :callback="getPerson" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import getDepartmentData from '~/providers/api/getDepartment'
import SelectPersonnel from '~/providers/components/tableTreePersonnel.vue'
import { QualificationService } from '~/providers/providers/services/common-body-qualification'
import { SealService } from '~/providers/providers/services/common-body-seal.js'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  components: {
    SelectPersonnel,
    InfoCircleOutlined,
  },
  props: {
    visible: {
      type: Boolean,
      required: true, // 父组件必须传递该数据
    },
    defaultTestDate: {
      type: Array,
      default: () => [],
    },

  },
  emits: ['visibleControl', 'ok'],
  data() {
    return {
      currentField: '',
      processList: [
        {
          label: '全部',
          value: '',
        },
        {
          label: '委托填写中',
          value: 'CONSIGN_EDITOR',
        },
        {
          label: '退回委托修改中',
          value: 'CONSING_ROLLBACK',
        },
        {
          label: '通知修改委托',
          value: 'CONSING_NOTICE_MODIFY',
        },
        {
          label: '委托已作废',
          value: 'CONSIGN_ABANDONED',
        },
        {
          label: '复核确认中',
          value: 'REPORT_REVIEWING',
        },
        {
          label: '报告审核中',
          value: 'REPORT_AUDITING',
        },
        {
          label: '报告批准中',
          value: 'REPORT_APPROVE',
        },
        {
          label: '报告打印中',
          value: 'REPORT_PRINT',
        },
        {
          label: '报告发放中',
          value: 'REPORT_ISSUE',
        },
        {
          label: '报告归档中',
          value: 'REPORT_ARCHIVING',
        },
        {
          label: '报告已归档',
          value: 'REPORT_ARCHIVED',
        },
        {
          label: '报告编制中',
          value: 'REPORT_EDITOR',
        },
        {
          label: '试验检测中',
          value: 'TEST_TESTING',
        },
        {
          label: '收费确认中',
          value: 'FEE_CONFIRMING',
        },
        {
          label: '待分配任务',
          value: 'TASK_ASSIGN',
        },
      ],
      checkTypeList: [],
      codeTypeList: [],
      departmentData: [],
      qualificationList: [],
      reportSealList: [],
      queryForm: {
        process: '',
        qualificationType: [],
        consignCode: '',
        testObjectCode: '',
        sampleSender: '',
        testPersons: [],
        reviewPersons: [],
        reportEditor: [],
        department: '',
        checkType: '',
        codeType: '',
        dataFrom: '',
        issueWay: '',
        consignType: '',
        consignUnit: '',
        consignDateStart: this.defaultTestDate[0],
        consignDateEnd: this.defaultTestDate[1],
        determineRequiredDateExternalStart: '',
        determineRequiredDateExternalEnd: '',
        determineRequiredInternalDateStart: '',
        determineRequiredInternalDateEnd: '',
        projectNature: '',
        cooperativeUnit: '',
        contractName: '',
        projectName: '',
        subpackage: '',
        projectCode: '',
        buildProjectName: '',
        sampleName: '',
        projectPart: '',
        testParams: '',
        contractNo: '',
        contractType: '',
        feeStatus: '',
        paymentCompany: '',
        chargeDateStart: '',
        chargeDateEnd: '',
        taskCode: '',
        recordCode: '',
        reportNumber: '',
        auditPersons: [],
        testTaskRecordPersons: [],
        approvePersons: [],
        projectPrincipal: [],
        projectCreator: [],
        allocDateStart: '',
        allocDateEnd: '',
        testTimeStart: '',
        testTimeEnd: '',
        auditDateStart: '',
        auditDateEnd: '',
        submitReportTimeStart: '',
        submitReportTimeEnd: '',
        reportQualifications: [],
        issueDateStart: '',
        issueDateEnd: '',
        printDateStart: '',
        printDateEnd: '',
        approveDateStart: '',
        approveDateEnd: '',
        signDateStart: '',
        signDateEnd: '',
        stampDateStart: '',
        stampDateEnd: '',
        eleSignStampStatus: '',
        stampUserName: '',
      },
      defaultForm: {},
      departmentId2Names: {},
      consignTypeOptions: [
        { label: '原材料检测', value: '0' },
        { label: '现场检测', value: '1' },
      ],
      dataFromOptions: [
        { label: '全部', value: '' },
        { label: '正常试验', value: '1' },
        { label: '综合实验', value: '2' },
      ],
      projectNatureOptions: [
        { label: '全部', value: '' },
        { label: '自营项目', value: '自营项目' },
        { label: '协作项目', value: '协作项目' },
      ],
      subpackageOptions: [
        { label: '全部', value: '' },
        { label: '是', value: 'true' },
        { label: '否', value: 'false' },
      ],
      contractTypeOptions: [
        { label: '全部', value: '' },
        { label: '全包合同', value: '1' },
        { label: '折扣合同', value: '2' },
        { label: '指定参数折扣合同', value: '3' },
        { label: '指定参数价格合同', value: '4' },
      ],
      feeStatusOptions: [
        { label: '全部', value: '' },
        { label: '完成收费', value: '1' },
        { label: '部分收费', value: '2' },
        { label: '未收费', value: '3' },
      ],
      issueWayOptions: [
        { label: '全部', value: '' },
        { label: '自取', value: '1' },
        { label: '邮寄', value: '2' },
        { label: '传真', value: '3' },
      ],
      eleSignStampStatusOptions: [
        { label: '全部', value: '' },
        { label: '已签章', value: '1' },
        { label: '未签章', value: '0' },
      ],
    }
  },
  async created() {
    // 获取部门下拉数据
    this.departmentData = await getDepartmentData()
    this.getCheckType()
    this.getCodeType()
    this.getQualification()
    this.getReportSeal()

    this.defaultForm = JSON.parse(JSON.stringify(this.queryForm))
  },
  methods: {

    // 获取检测类型
    getCheckType() {
      window.$oAjax
        .post(
          'checkTypeController.do?getAll',
          // qs.stringify({ id: this.selectedRowKeys[0] })
        )
        .then((res) => {
          if (res && res.length) {
            res.unshift({ name: '全部', id: '' })
            this.checkTypeList = res
          }
        })
    },
    // 获取编号类别
    getCodeType() {
      window.$oAjax
        .get(
          'tSnCategoryController.do?getSnCategoryUser',
          // qs.stringify({ id: this.selectedRowKeys[0] })
        )
        .then((res) => {
          if (res && res.success) {
            res.obj.unshift({ name: '全部', id: '' })
            this.codeTypeList = res.obj
          }
        })
    },
    // 获取资质数据
    getQualification() {
      const qualificationService = new QualificationService()

      qualificationService.list().then((res) => {
        if (res.code !== 20010) {
          this.qualificationList = res.data
        }
      })
    },
    // 获取报告印章
    getReportSeal() {
      const sealService = new SealService()
      sealService.list().then((res) => {
        if (res.code !== 20010) {
          this.reportSealList = res.data
        }
      })
    },
    closeModel() {
      $emit(this, 'visibleControl', false)
    },
    queryData() {
      const keyArr = Object.keys(this.queryForm)
      const newData = {}
      keyArr.forEach((it) => {
        if (
          it == 'testPersons'
          || it == 'reviewPersons'
          || it == 'reportEditor'
          || it == 'projectCreator'
          || it == 'approvePersons'
          || it == 'auditPersons'
          || it == 'projectPrincipal'
          || it == 'testTaskRecordPersons'
        ) {
          newData[it] = this.queryForm[it]
            .map((p) => {
              return p.id
            })
            .join(',')
        }
        else if (it == 'qualificationType' || it == 'reportQualifications') {
          // 资质拼接
          newData[it] = this.queryForm[it].join(',')
        }
        else if (it === 'stampDateStart') {
          newData[it] = this.queryForm[it] ? `${this.queryForm[it]} 00:00:00` : this.queryForm[it]
        }
        else if (it === 'stampDateEnd') {
          newData[it] = this.queryForm[it] ? `${this.queryForm[it]} 23:59:59` : this.queryForm[it]
        }
        else {
          newData[it] = this.queryForm[it]
        }
      })

      $emit(this, 'ok', newData, this.createQueryTag(this.queryForm))
    },
    createQueryTag(data) {
      const key2Names = {
        process: '数据状态',
        consignCode: '委托编号',
        testObjectCode: '样品编号',
        taskCode: '任务编号',
        recordCode: '记录编号',
        reportNumber: '报告编号',
        contractName: '合同名称',
        contractNo: '合同编号',
        projectName: '工程项目',
        consignUnit: '委托单位',
        testParams: '检测参数',
        sampleName: '样品名称',
        consignDateStart: '开始委托日期',
        consignDateEnd: '结束委托日期',
        testTimeStart: '开始检测日期',
        testTimeEnd: '结束检测日期',
        auditDateStart: '开始审核日期',
        auditDateEnd: '结束审核日期',
        testPersons: '检测人员',
        reviewPersons: '复核人员',
        auditPersons: '审核人员',
        approvePersons: '批准人员',
        consignType: '委托类别',
        checkType: '检测类别',
        codeType: '编号类别',
        sampleSender: '委托人',
        testTaskRecordPersons: '记录人',
        determineRequiredDateExternalStart: '开始要求报告日期(用户)',
        determineRequiredDateExternalEnd: '结束要求报告日期(用户)',
        determineRequiredInternalDateStart: '开始要求报告日期(内部)',
        determineRequiredInternalDateEnd: '结束要求报告日期(内部)',
        dataFrom: '数据来源',
        projectNature: '项目性质',
        cooperativeUnit: '协作单位',
        subpackage: '是否分包',
        projectCode: '项目编号',
        buildProjectName: '建设项目',
        projectPart: '工程部位/用途',
        contractType: '合同类型',
        feeStatus: '费用状态',
        paymentCompany: '缴费单位',
        chargeDateStart: '开始收费日期',
        chargeDateEnd: '结束收费日期',
        department: '所属部门',
        reportEditor: '报告编写人',
        projectPrincipal: '项目负责人',
        projectCreator: '项目创建人',
        allocDateStart: '开始分配日期',
        allocDateEnd: '结束分配日期',
        submitReportTimeStart: '开始报告提交日期',
        submitReportTimeEnd: '结束报告提交日期',
        qualificationType: '资质类型',
        reportQualifications: '报告资质',
        reportSeal: '报告印章',
        printDateStart: '开始打印日期',
        printDateEnd: '结束打印日期',
        issueWay: '发放方式',
        issueDateStart: '开始发放日期',
        issueDateEnd: '结束发放日期',
        signDateStart: '开始签发日期',
        signDateEnd: '结束签发日期',
        approveDateStart: '开始签发操作日期',
        approveDateEnd: '结束签发操作日期',
        stampDateStart: '开始签章时间',
        stampDateEnd: '结束签章时间',
        eleSignStampStatus: '签章状态',
        stampUserName: '签章人',
      }
      const tags = []

      for (const key in data) {
        let val = data[key]
        const label = key2Names[key]

        if (
          val === null
          || val === undefined
          || val === ''
          || (Array.isArray(val) && !val.length)
        ) {
          continue
        }

        if ([
          'testPersons',
          'reviewPersons',
          'approvePersons',
          'auditPersons',
          'testTaskRecordPersons',
          'reportEditor',
          'projectPrincipal',
          'projectCreator',
        ].includes(key)) {
          val = val.map(i => i.name).join(',')
        }

        if (['process'].includes(key)) {
          val = this.processList.find(i => i.value === val).label
        }

        if (['consignType'].includes(key)) {
          val = this.consignTypeOptions.find(i => i.value === val).label
        }

        if (['checkType'].includes(key)) {
          val = this.checkTypeList.find(i => i.id === val).name
        }

        if (['codeType'].includes(key)) {
          val = this.codeTypeList.find(i => i.id === val).name
        }

        if (['dataFrom'].includes(key)) {
          val = this.dataFromOptions.find(i => i.value === val).label
        }

        if (['subpackage'].includes(key)) {
          val = this.subpackageOptions.find(i => i.value === val).label
        }

        if (['contractType'].includes(key)) {
          val = this.contractTypeOptions.find(i => i.value === val).label
        }

        if (['feeStatus'].includes(key)) {
          val = this.feeStatusOptions.find(i => i.value === val).label
        }

        if (['qualificationType', 'reportQualifications'].includes(key)) {
          val = this.qualificationList.filter(i => val.includes(i.id)).map(i => i.name).join(',')
        }

        if (['reportSeal'].includes(key)) {
          val = this.reportSealList.find(i => i.sealId === val).sealName
        }

        if (['issueWay'].includes(key)) {
          val = this.issueWayOptions.find(i => i.value === val).label
        }

        if (['eleSignStampStatus'].includes(key)) {
          val = this.eleSignStampStatusOptions.find(i => i.value === val).label
        }

        if (['department'].includes(key)) {
          val = this.departmentId2Names[val]
        }

        tags.push({
          key,
          label,
          value: val,
        })
      }

      return tags
    },
    onChangeDepartment(id, names) {
      if (id) {
        this.departmentId2Names[id] = names[0]
      }
    },
    getPerson(idsPerson, data) {
      this.queryForm[this.currentField] = data
    },
    openPersonModel(field) {
      this.currentField = field
      // this.$refs.SelectPersonnel.showModal("选择人员");

      this.$refs.SelectPersonnel.showModal(
        undefined,
        '',
        this.queryForm[field],
        '选择人员',
      )
    },
    delPerson(field, id) {
      this.queryForm[field].forEach((item, index) => {
        if (item.id == id) {
          this.queryForm[field].splice(index, 1)
        }
      })
    },
    clearForm(clearDate = false) {
      this.queryForm = {
        ...this.defaultForm,
        consignDateStart: clearDate ? '' : this.queryForm.consignDateStart,
        consignDateEnd: clearDate ? '' : this.queryForm.consignDateEnd,
      }
    },
  },
}
</script>

<style lang="less">
.form_box {
  margin-bottom: 60px;
}
.query_row {
  margin: 10px 0;
  .label {
    width: 170px;
    display: inline-block;
    text-align: right;
  }
}
.sel_person_wrap {
  border: 1px solid #cccc;
  padding: 3px;
  display: inline-block;
  border-radius: 5px;
  width: 356px;
  overflow: hidden;
  vertical-align: middle;
  min-height: 30px;
  white-space: nowrap;
}
</style>

<style>
.ant-drawer-body {
  padding: 0 !important;
}
</style>
