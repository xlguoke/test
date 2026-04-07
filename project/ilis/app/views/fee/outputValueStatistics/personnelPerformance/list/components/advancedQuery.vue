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
          <span class="label">检测参数类别：</span>
          <a-select
            v-model:value="queryForm.paramCategory"
            style="width: 405px"
            placeholder="请选择"
          >
            <a-select-option
              v-for="item in testParamCategory"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </p>

        <p class="query_row">
          <span class="label">参数名称：</span>
          <a-input
            v-model:value="queryForm.paramName"
            style="width: 405px"
            placeholder="请输入参数名称"
          />
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
          <span class="label">报告编号：</span>
          <a-input
            v-model:value="queryForm.reportNumber"
            style="width: 405px"
            placeholder="请输入报告编号"
          />
        </p>

        <p class="query_row">
          <span class="label">检测大类：</span>
          <a-input
            v-model:value="queryForm.bigCategory"
            style="width: 405px"
            placeholder="请输入检测大类"
          />
        </p>

        <p class="query_row">
          <span class="label">检测类别：</span>
          <a-select
            v-model:value="queryForm.testType"
            style="width: 405px"
            placeholder="请选择"
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
          <span class="label">资质类别：</span>
          <a-select
            v-model:value="queryForm.qualificationType"
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
          <span class="label">缴费状态：</span>
          <a-select
            v-model:value="queryForm.feeStatus"
            style="width: 405px"
            placeholder="请选择"
          >
            <a-select-option value="">
              全部
            </a-select-option>
            <a-select-option value="1">
              已结清
            </a-select-option>
            <a-select-option value="2">
              部分缴费
            </a-select-option>
            <a-select-option value="3">
              未缴费
            </a-select-option>
          </a-select>
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
          <span class="label">工程项目：</span>
          <a-input
            v-model:value="queryForm.consignProject"
            style="width: 405px"
            placeholder="请输入工程项目"
          />
        </p>

        <p class="query_row">
          <span class="label">合同编号：</span>
          <a-input
            v-model:value="queryForm.contractSn"
            style="width: 405px"
            placeholder="请输入合同编号"
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
          <span class="label">合同类型：</span>
          <a-select
            v-model:value="queryForm.contractType"
            style="width: 405px"
            allow-clear
            placeholder="请选择合同类型"
          >
            <a-select-option value="">
              全部
            </a-select-option>
            <a-select-option value="1">
              全包合同
            </a-select-option>
            <a-select-option value="2">
              折扣合同
            </a-select-option>
            <a-select-option value="4">
              参数单价合同
            </a-select-option>
          </a-select>
        </p>

        <p class="query_row">
          <span class="label">检测部门：</span>
          <a-tree-select
            v-model:value="queryForm.testDepart"
            style="width: 405px"
            :dropdown-style="{ maxHeight: '405px', overflow: 'auto' }"
            placeholder="请选择部门"
            allow-clear
            :tree-data="departmentData"
            tree-default-expand-all
            show-search
          />
        </p>

        <p class="query_row">
          <span class="label">登记人员：</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.actualTester"
              :key="item.id"
              closable
              @close="delPerson('actualTester', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('actualTester')">
            选择
          </a-button>
        </p>

        <!-- <p class="query_row">
                      <span class="label">参与人员：</span>
                      <span class="sel_person_wrap">
                          <a-tag v-for="item in queryForm.auditPersons" :key="item.id" closable
                              @close="delPerson('auditPersons', item.id)"> {{
                                  item.name
                              }}</a-tag>
                      </span>
                      <a-button @click="openPersonModel('auditPersons')">选择</a-button>
                  </p> -->

        <p class="query_row">
          <span class="label">检测人员：</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.tester"
              :key="item.id"
              closable
              @close="delPerson('tester', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('tester')">
            选择
          </a-button>
        </p>
        <p class="query_row">
          <span class="label">复核人员：</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.reviewer"
              :key="item.id"
              closable
              @close="delPerson('reviewer', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('reviewer')">
            选择
          </a-button>
        </p>
        <p class="query_row">
          <span class="label">审核人员：</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.auditor"
              :key="item.id"
              closable
              @close="delPerson('auditor', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('auditor')">
            选择
          </a-button>
        </p>
        <p class="query_row">
          <span class="label">批准人员：</span>
          <span class="sel_person_wrap">
            <a-tag
              v-for="item in queryForm.approver"
              :key="item.id"
              closable
              @close="delPerson('approver', item.id)"
            >
              {{ item.name }}</a-tag>
          </span>
          <a-button @click="openPersonModel('approver')">
            选择
          </a-button>
        </p>

        <!-- <p class="query_row">
                      <span class="label">委托日期：</span>
                      <a-date-picker v-model="queryForm.consignDateStart" style="width: 195px;" valueFormat="YYYY-MM-DD" />
                      -
                      <a-date-picker v-model="queryForm.consignDateEnd" style="width: 195px;" valueFormat="YYYY-MM-DD" />
                  </p> -->
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
        <a-button :style="{ marginRight: '8px' }" @click="clearForm">
          清空条件
        </a-button>
      </div>
    </a-drawer>

    <SelectPersonnel ref="SelectPersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import getDepartmentData from '~/providers/api/getDepartment'
import SelectPersonnel from '~/providers/components/tableTreePersonnel.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  components: {
    SelectPersonnel,
  },
  props: {
    visible: {
      type: Boolean,
      required: true, // 父组件必须传递该数据
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
          label: '报告已批准',
          value: 'REPORT_APPROVED',
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
      queryForm: {
        paramCategory: '',
        paramName: '',
        consignCode: '',
        reportNumber: '',
        bigCategory: '',
        testType: '',
        qualificationType: '',
        feeStatus: '',
        consignProject: '',
        contractSn: '',
        contractName: '',
        testDepart: '',

        actualTester: [],
        tester: [],
        auditor: [],
        approver: [],
        reviewer: [],
        consignDateStart: '',
        consignDateEnd: '',

        // process: "",
        // qualificationType: [],
        // consignCode: "",
        // testObjectCode: "",
        // sampleSender: "",

        // department: "",
        // checkType: "",
        // codeType: "",
        // dataFrom: "",
        // issueWay: "",
        // consignType: "",
        // consignUnit: "",
        // consignDateStart: "",
        // consignDateEnd: "",
        // determineRequiredDateExternalStart: "",
        // determineRequiredDateExternalEnd: "",
        // determineRequiredInternalDateStart: "",
        // determineRequiredInternalDateEnd: "",
        // projectNature: "",
        // cooperativeUnit: "",
        // contractName: "",
        // projectName: "",
        // subpackage: "",
        // projectCode: "",
        // buildProjectName: "",
        // sampleName: "",
        // projectPart: "",
        // testParams: "",
        // contractNo: "",
        // contractType: "",
        // feeStatus: "",
        // paymentCompany: "",
        // chargeDateStart: "",
        // chargeDateEnd: "",
        // taskCode: "",
        // recordCode: "",
        // reportNumber: "",
        // auditPersons: [],
        // approvePersons: [],
        // projectPrincipal: [],
        // projectCreator: [],
        // allocDateStart: "",
        // allocDateEnd: "",
        // testTimeStart: "",
        // testTimeEnd: "",
        // submitReportTimeStart: "",
        // submitReportTimeEnd: "",
        // reportQualifications: [],
        // issueDateStart: "",
        // issueDateEnd: "",
        // approveDateStart: "",
        // approveDateEnd: "",
        // signDateStart: "",
        // signDateEnd: "",
      },

      defaultForm: {},

      testParamCategory: [],
    }
  },
  async created() {
    //
    // // 获取部门下拉数据
    // this.departmentData = await getDepartmentData();
    // this.getCheckType();
    // this.getCodeType();
    // this.getQualification();

    this.defaultForm = JSON.parse(JSON.stringify(this.queryForm))

    this.getTestParamCategory()
    this.getCheckType()
    this.getQualification()

    // 获取部门下拉数据
    getDepartmentData().then((res) => {
      res.unshift({ label: '全部', value: '' })
      this.departmentData = res
    })
  },
  methods: {
    getTestParamCategory() {
      window.$oAjax.get(`rest/testParamCategory/all`).then((res) => {
        if (res && res.code === 20000) {
          this.testParamCategory = res.data.map((it) => {
            return {
              label: it.name,
              value: it.id,
            }
          })
          this.testParamCategory.unshift({ label: '全部', value: '' })

          // this.pagination.total = res.data.count;
          // this.pagination.current = page;
          // this.pagination.pageSize = size;
        }
      })
    },

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
    // 获取资质数据
    getQualification() {
      window.$oAjax
        .get(
          '/rest/common-body/qualification/list',
          // qs.stringify({ id: this.selectedRowKeys[0] })
        )
        .then((res) => {
          if (res && res.code !== 20010) {
            res.data.unshift({ name: '全部', id: '' })
            this.qualificationList = res.data
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
    closeModel() {
      $emit(this, 'visibleControl', false)
    },
    queryData() {
      const keyArr = Object.keys(this.queryForm)
      const newData = {}
      keyArr.forEach((it) => {
        if (
          it === 'actualTester'
          || it === 'tester'
          || it === 'auditor'
          || it === 'approver'
          || it === 'reviewer'
        ) {
          newData[it] = this.queryForm[it]
            .map((p) => {
              return p.id
            })
            .join(',')
        }
        else {
          newData[it] = this.queryForm[it]
        }
      })

      $emit(this, 'ok', newData)
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
    clearForm() {
      this.queryForm = { ...this.defaultForm }
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
