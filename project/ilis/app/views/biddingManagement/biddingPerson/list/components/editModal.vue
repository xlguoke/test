<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="isAdd ? '新增' : '编辑'"
      centered
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      width="840px"
      :body-style="{ 'max-height': `${height - 300}px`, 'overflow-y': 'auto' }"
      class="biddingPerson-editModal"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" class="pr-2">
        <FormLayout
          :data-source="formLayoutData"
          :form-layout="formLayout"
          :form-state="formState"
        />
      </a-form>
    </ht-modal>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import FormLayout from './formLayout.vue'

const sexData = [
  { name: '男', value: '男' },
  { name: '女', value: '女' },
]
const statusData = [
  { name: '在职', value: '0' },
  { name: '离职', value: '1' },
]
// eslint-disable-next-line unused-imports/no-unused-vars
const booleanData = [
  { name: '是', value: '1' },
  { name: '否', value: '0' },
]
const booleanData2 = [
  { name: '是', value: true },
  { name: '否', value: false },
]
const booleanData3 = [
  { name: '正式员工', value: true },
  { name: '非正式员工', value: false },
]

function getBirth(idCard) {
  let birthday = ''
  if (idCard != null && idCard != '') {
    if (idCard.length == 15) {
      birthday = `19${idCard.slice(6, 12)}`
    }
    else if (idCard.length == 18) {
      birthday = idCard.slice(6, 14)
    }
    birthday = birthday.replace(/(.{4})(.{2})/, '$1-$2-')
  }
  return birthday
}

function getSex(idCard) {
  let sexStr = ''
  if (Number.parseInt(idCard.slice(-2, -1)) % 2 == 1) {
    sexStr = 'man'
  }
  else {
    sexStr = 'woman'
  }
  return sexStr
}

export default {
  components: {
    FormLayout,
  },
  props: ['callback'],
  data() {
    return {
      formState: {},
      visible: false,
      confirmLoading: false,
      data: {},
      isAdd: true,
      customFields: [],
      height: document.body.clientHeight,
      formLayout: {
        gutter: 8,
        span: 12,
        labelCol: 7,
        wrapperCol: 17,
      },
      formLayoutData: [
        {
          field: 'personName',
          name: '姓名',
          rules: true,
          type: 'input',
          option: {},
        },
        {
          field: 'identityNumber',
          name: '身份证号',
          rules: false,
          type: 'input',
          option: {},
        },
        {
          field: 'gender',
          name: '性别',
          rules: false,
          type: 'radio',
          option: {},
          data: sexData,
          dataField: { value: 'value', name: 'name' },
        },
        {
          field: 'dateOfBirth',
          name: '出生日期',
          rules: false,
          type: 'date',
          option: {},
        },
        {
          field: 'phone',
          name: '手机号码',
          rules: false,
          type: 'input',
          option: {
            rules: [
              {
                pattern: /^1\d{10}$/,
                message: '请输入正确格式的手机号码！',
              },
            ],
          },
        },
        {
          field: 'department',
          name: '组织机构',
          rules: false,
          type: 'input',
          option: {},
        },
        {
          field: 'position',
          name: '工作职务',
          rules: false,
          type: 'input',
          option: {},
        },
        {
          field: 'jobTitle',
          name: '职称',
          rules: false,
          type: 'input',
          option: {},
        },
        {
          field: 'jobTitleLevel',
          name: '职称级别',
          rules: false,
          type: 'input',
          option: {},
        },
        {
          field: 'entryTime',
          name: '入职时间',
          rules: false,
          type: 'date',
          option: {},
        },
        {
          field: 'personStatus',
          name: '人员状态',
          rules: false,
          type: 'select',
          option: {},
          default: '0',
          data: statusData,
          dataField: { value: 'value', name: 'name' },
        },
        {
          field: 'yearOfWork',
          name: '从事检测工作年份',
          rules: false,
          type: 'input',
          option: {},
        },
        {
          field: 'education',
          name: '最高学历',
          rules: false,
          type: 'input',
          option: {},
        },
        {
          field: 'graduatedSchool',
          name: '毕业院校',
          rules: false,
          type: 'input',
          option: {},
        },
        {
          field: 'profession',
          name: '所学专业',
          rules: false,
          type: 'input',
          option: {},
        },
        {
          field: 'graduatedDate',
          name: '毕业日期',
          rules: false,
          type: 'date',
          option: {},
        },
        {
          field: 'contractStartTime',
          name: '劳动合同开始日期',
          rules: false,
          type: 'date',
          option: {},
        },
        {
          field: 'contractEndTime',
          name: '劳动合同结束日期',
          rules: false,
          type: 'date',
          option: {},
        },
        {
          field: 'socialSecurityCategory',
          name: '社会保险种类',
          rules: false,
          type: 'input',
          option: { placeholder: '如五险，五险一金等' },
        },
        {
          field: 'specialEquipmentOperator',
          name: '特种设备作业人员',
          rules: false,
          type: 'radio',
          option: {},
          data: booleanData2,
          dataField: { value: 'value', name: 'name' },
        },
        {
          field: 'retirementStatus',
          name: '退休状态',
          rules: false,
          type: 'radio',
          option: {},
          data: booleanData2,
          dataField: { value: 'value', name: 'name' },
        },
        {
          field: 'employmentType',
          name: '雇佣形式',
          rules: false,
          type: 'radio',
          data: booleanData3,
          dataField: { value: 'value', name: 'name' },
        },
        {
          field: 'photoUrl',
          name: '上传照片',
          rules: false,
          type: 'ilisUpload',
        },
      ],
      rules: {
        identityNumber: [
          // { required: true, message: ` ` },
          { validator: this.checkIdentityNumber, trigger: 'blur' },
        ],
        yearOfWork: [
          { validator: this.checkYearOfWork, trigger: 'blur' },
        ],
      },
    }
  },
  async created() {
    this.getFilingStatus()

    const resArr = await Promise.all([
      this.getDictByCode('biddingPersonPosition'), // 职务
      this.getDictByCode('biddingPersonJobTitle'), // 职称
      this.getDictByCode('biddingPersonEducation'), // 学历
      this.getDictByCode('biddingPersonJobTitleLevel'), // 职称级别
    ])

    const positionIndex = this.formLayoutData.findIndex(item => item.field === 'position')
    const jobTitleIndex = this.formLayoutData.findIndex(item => item.field === 'jobTitle')
    const jobTitleLevelIndex = this.formLayoutData.findIndex(item => item.field === 'jobTitleLevel')
    const educationIndex = this.formLayoutData.findIndex(item => item.field === 'education')
    this.createFormOption(resArr[0], positionIndex)
    this.createFormOption(resArr[1], jobTitleIndex)
    this.createFormOption(resArr[2], educationIndex)
    this.createFormOption(resArr[3], jobTitleLevelIndex)
  },
  methods: {
    getFilingStatus() {
      window.$oAjax
        .get(
          'dictionaryController.do?getListByGroupId&dictGroupId=person_archive_status',
        )
        .then((res) => {
          if (res.success) {
            this.formLayoutData.splice(this.formLayoutData.length - 1, 0, {
              field: 'archiveStatus',
              name: '备案状态',
              rules: false,
              type: 'select',
              option: {},
              default: res.obj[0].typecode,
              data: res.obj,
              dataField: { value: 'typecode', name: 'typename' },
            })
          }
        })
    },
    async createFormOption(data, index) {
      if (!data.length) {
        return
      }
      this.formLayoutData.splice(
        index,
        1,
        { ...this.formLayoutData[index], type: 'select', option: {}, default: undefined, data, dataField: { value: 'typeCode', name: 'typeName' },
        },
      )
    },
    async getDictByCode(dictCode) {
      const { data, code } = await window.$oAjax.get('rest/type/getTypesByGroupCode', { params: { groupCode: dictCode } })
      if (code === 20000) {
        return data
      }
    },
    getCustomFields() {
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'bidding-person',
          },
        })
        .then((res) => {
          this.customFields = res.data || []
          if (
            this.data.biddingCustomizeValueEntities
            && this.data.biddingCustomizeValueEntities.length > 0
          ) {
            this.customFields = [
              ...this.customFields,
              ...this.data.biddingCustomizeValueEntities
                .filter(c => c.disabled)
                .map((c) => {
                  const copy = { ...c }
                  copy.id = c.columnId
                  return copy
                }),
            ]
          }
          const custom = this.customFields.map((item) => {
            const obj = {
              field: item.id,
              name: item.columnName,
              rules: false,
              type: item.columnType,
              option: {},
              custom: true,
              disabled: item.disabled,
            }
            if (item.columnType === 'radio') {
              obj.data = [
                { value: '是', name: '是' },
                { value: '否', name: '否' },
              ]
              obj.dataField = { value: 'value', name: 'name' }
            }
            else if (item.columnType === 'select') {
              obj.data = item.columnValue
                ? item.columnValue.split(',').map((v) => {
                    return { value: v, name: v }
                  })
                : []
              obj.dataField = { value: 'value', name: 'name' }
            }
            return obj
          })

          this.formLayoutData = this.formLayoutData
            .concat(custom)
            .map(item => ({
              ...item,
              default: this.getDefaultVal(item),
            }))
        })
    },
    getDefaultVal(item) {
      if (item.field === 'specialEquipmentOperator') {
        return this.data[item.field] || false
      }

      return this.data[item.field] || item.default
    },
    showModal(data) {
      this.data = data || {}
      this.isAdd = !data

      if (
        this.data.biddingCustomizeValueEntities
        && this.data.biddingCustomizeValueEntities.length > 0
      ) {
        const obj = {}
        // eslint-disable-next-line array-callback-return
        this.data.biddingCustomizeValueEntities.map((item) => {
          obj[item.columnId] = item.columnValue
        })
        this.data = {
          ...this.data,
          ...obj,
        }
      }

      this.formState = this.data
      const { dateOfBirth, entryTime, graduatedDate, contractStartTime, contractEndTime } = this.formState
      this.formState.dateOfBirth = dateOfBirth ? dayjs(dateOfBirth).format('YYYY-MM-DD') : null
      this.formState.entryTime = entryTime ? dayjs(entryTime).format('YYYY-MM-DD') : null
      this.formState.graduatedDate = graduatedDate ? dayjs(graduatedDate).format('YYYY-MM-DD') : null
      this.formState.contractStartTime = contractStartTime ? dayjs(contractStartTime).format('YYYY-MM-DD') : null
      this.formState.contractEndTime = contractEndTime ? dayjs(contractEndTime).format('YYYY-MM-DD') : null

      this.formLayoutData = this.formLayoutData.map(item => ({
        ...item,
        default: this.data[item.field] || item.default,
      }))
      this.getCustomFields()
      this.visible = true
    },
    cancelModal() {
      this.visible = false
      this.formLayoutData = this.formLayoutData
        .filter(item => !item.custom)
        .map((item) => {
          let _default
          if (item.field == 'personStatus') {
            _default = '0'
          }
          if (item.field == 'archiveStatus') {
            _default = 'onJob'
          }
          return {
            ...item,
            default: _default,
          }
        })
      this.formState = {}
      this.$refs.formRef.clearValidate()
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true
        const values = { ...this.formState }
        const data = values
        const biddingCustomizeValueEntities = []
        this.customFields
          .filter(c => !c.disabled)
          // eslint-disable-next-line array-callback-return
          .map((item) => {
            biddingCustomizeValueEntities.push({
              columnId: item.id,
              columnValue: data[item.id],
            })
            delete data[item.id]
          })
        if (!this.isAdd) {
          data.id = this.data.id
        }

        if (biddingCustomizeValueEntities.length > 0) {
          data.biddingCustomizeValueEntities = biddingCustomizeValueEntities
        }

        window.$oAjax({
          method: 'POST',
          url: `${window.$oApi.biddingPerson.person}`,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res && res.success) {
              this.cancelModal()
              message.success(res.message || res.msg)
              this.formState = {}
              this.callback()
            }
            else {
              message.error(res.message || res.msg)
            }
            this.confirmLoading = false
          },
        ).catch(() => {
          this.confirmLoading = false
        })
      })
    },
    checkYearOfWork(rule, value, callback) {
      if (value) {
        const reg = /^\d{4}$/
        if (
          reg.test(value) === true
          && Number.parseInt(value) <= new Date().getFullYear()
        ) {
          callback()
        }
        else {
          callback(new Error('请输入正确格式的工作年份!'))
        }
      }
      else {
        callback()
      }
    },
    checkIdentityNumber(rule, value, callback) {
      // var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      // var reg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      if (value) {
        if (this.IDCardCheck(value) === false) {
          callback(new Error('身份证号码输入不合规!'))
        }
        else {
          if (!this.formState.gender) {
            const gender = getSex(value)
            this.formState.gender = gender === 'man' ? '男' : '女'
          }

          if (!this.formState.dateOfBirth) {
            const dateOfBirth = getBirth(value)
            this.formState.dateOfBirth = dayjs(dateOfBirth).format('YYYY-MM-DD')
          }
          callback()
        }
      }
      else {
        // callback(new Error('请输入身份证号码!'))
        callback()
      }
    },
    IDCardCheck(num) {
      num = num.toUpperCase()
      // eslint-disable-next-line regexp/no-unused-capturing-group
      if (!/(^\d{15}$)|(^\d{17}([0-9X])$)/.test(num)) {
        return false
      }
      let len, re
      // eslint-disable-next-line prefer-const
      len = num.length
      if (len == 15) {
        // eslint-disable-next-line prefer-regex-literals
        re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/)
        // eslint-disable-next-line no-var, vars-on-top, block-scoped-var
        var arrSplit = num.match(re)

        // eslint-disable-next-line vars-on-top, no-var, block-scoped-var
        var dtmBirth = new Date(
          // eslint-disable-next-line block-scoped-var
          `19${arrSplit[2]}/${arrSplit[3]}/${arrSplit[4]}`,
        )
        // eslint-disable-next-line vars-on-top, no-var, block-scoped-var
        var bGoodDay = dtmBirth.getYear() == Number(arrSplit[2])
        // eslint-disable-next-line block-scoped-var
          && dtmBirth.getMonth() + 1 == Number(arrSplit[3])
        // eslint-disable-next-line block-scoped-var
          && dtmBirth.getDate() == Number(arrSplit[4])
        // eslint-disable-next-line block-scoped-var
        if (!bGoodDay) {
          return false
        }
        else {
          // eslint-disable-next-line vars-on-top, no-var, block-scoped-var
          var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
          // eslint-disable-next-line vars-on-top, no-var, block-scoped-var
          var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
          // eslint-disable-next-line vars-on-top, no-var, block-scoped-var
          var nTemp = 0
          // eslint-disable-next-line vars-on-top, no-var
          var i
          num = `${num.substr(0, 6)}19${num.substr(6, num.length - 6)}`
          // eslint-disable-next-line block-scoped-var
          for (i = 0; i < 17; i++) {
            // eslint-disable-next-line block-scoped-var
            nTemp += num.substr(i, 1) * arrInt[i]
          }
          // eslint-disable-next-line block-scoped-var
          num += arrCh[nTemp % 11]
          return true
        }
      }
      if (len == 18) {
        // eslint-disable-next-line prefer-regex-literals
        re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9X])$/)
        // eslint-disable-next-line vars-on-top, no-var, ts/no-redeclare, block-scoped-var
        var arrSplit = num.match(re)

        // eslint-disable-next-line vars-on-top, no-var, ts/no-redeclare, block-scoped-var
        var dtmBirth = new Date(
          // eslint-disable-next-line block-scoped-var
          `${arrSplit[2]}/${arrSplit[3]}/${arrSplit[4]}`,
        )
        // eslint-disable-next-line vars-on-top, no-var, block-scoped-var, ts/no-redeclare
        var bGoodDay = dtmBirth.getFullYear() == Number(arrSplit[2])
        // eslint-disable-next-line block-scoped-var
          && dtmBirth.getMonth() + 1 == Number(arrSplit[3])
        // eslint-disable-next-line block-scoped-var
          && dtmBirth.getDate() == Number(arrSplit[4])
        // eslint-disable-next-line block-scoped-var
        if (!bGoodDay) {
          return false
        }
        else {
          let valnum
          // eslint-disable-next-line vars-on-top, no-var, block-scoped-var, ts/no-redeclare
          var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
          // eslint-disable-next-line vars-on-top, no-var, block-scoped-var, ts/no-redeclare
          var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
          // eslint-disable-next-line vars-on-top, no-var, block-scoped-var, ts/no-redeclare
          var nTemp = 0
          // eslint-disable-next-line vars-on-top, no-var, ts/no-redeclare
          var i
          // eslint-disable-next-line block-scoped-var
          for (i = 0; i < 17; i++) {
            // eslint-disable-next-line block-scoped-var
            nTemp += num.substr(i, 1) * arrInt[i]
          }
          // eslint-disable-next-line prefer-const, block-scoped-var
          valnum = arrCh[nTemp % 11]
          if (valnum != num.substr(17, 1)) {
            return false
          }
          return true
        }
      }
      return false
    },
  },
}
</script>

<style lang="less">
.ant-form-explain {
  font-size: 12px;
}
.biddingPerson-editModal {
  .ant-form-item-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
