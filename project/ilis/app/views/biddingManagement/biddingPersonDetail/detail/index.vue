<template>
  <div class="projectDetail text-sm">
    <div class="projectDetail-title">
      <strong>{{ data.personName }}</strong>
      <span v-if="data.gender" class="projectDetail-title-tag">{{
        data.gender
      }}</span>
      <span v-if="data.jobTitle" class="projectDetail-title-tag">{{
        data.jobTitle
      }}</span>
      <span class="projectDetail-title-tag">{{
        data.personStatus == 0 ? '在职' : '离职'
      }}</span>
    </div>
    <div style="padding-top: 10px">
      <a-button type="primary" @click="edit">
        编辑
      </a-button>
      <a-button

        @click="() => (propertyProfileVisible = true)"
      >
        人员信息项配置
      </a-button>
    </div>
    <div class="flex gap-6">
      <div style="width: 80%; padding-top: 10px">
        <a-row
          style="border-left: solid 1px #e2e2e2; border-top: solid 1px #e2e2e2"
        >
          <a-col
            v-for="(item, index) in fieldsData"
            v-show="index <= 3 || showMore"
            :key="item.field"
            span="12"
            style="
            border-right: solid 1px #e2e2e2;
            border-bottom: solid 1px #e2e2e2;
          "
          >
            <a-row>
              <a-col span="8" style="text-align: right">
                <div
                  :title="item.name"
                  style="
                  padding: 5px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  background: #f5f5f5;
                  border-right: solid 1px #e2e2e2;
                "
                >
                  {{ item.name }}
                </div>
              </a-col>
              <a-col v-if="item.date" span="16">
                <div style="padding: 5px">
                  {{
                    data[item.field]
                      ? dayjs(data[item.field]).format('YYYY-MM-DD')
                      : ''
                  }}
                </div>
              </a-col>
              <a-col v-else span="16">
                <div
                  :title="data[item.field]"
                  style="
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  padding: 5px;
                "
                >
                  {{ data[item.field] }}
                </div>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <a
          href="javascript:"
          style="
          display: inline-block;
          text-decoration: underline;
          margin-top: 5px;
        "
          class="text-blue-500"
          @click="
            () => {
              showMore = !showMore
            }
          "
        >{{ showMore ? '收起' : '更多' }}>></a>
      </div>
      <div v-if="data.tsAttachment" class="w-[110px] h-[140px] p-1 border ml-2 mt-[10px]">
        <img :src="data.tsAttachment.realpath" class="block h-full w-full object-contain">
      </div>
      <div class="w-[120px] h-[120px] p-1 border ml-2 mt-[10px]" :title="qrSource">
        <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="二维码" style="width: 100%; height: 100%; object-fit: contain;">
      </div>
    </div>
    <div class="projectDetail-tab">
      <div class="projectDetail-tab-btn">
        <router-link to="/">
          工作记录
        </router-link>
        <router-link to="/Certificate">
          人员证书
        </router-link>
        <router-link to="/Performance">
          人员业绩
        </router-link>
        <router-link to="/AdultEducation">
          继续教育登记
        </router-link>
        <router-link to="/ReferenceRecord">
          招投标引用记录
        </router-link>
        <router-link to="/Accessories">
          人员附件
        </router-link>
      </div>
      <router-view></router-view>
    </div>
    <EditModal ref="EditModal" :callback="getCustomFields" />
    <ht-modal
      v-model:open="propertyProfileVisible"
      title="人员自定义信息项配置"
      @ok="handleProfile"
    >
      <CustomProperty customize-type="bidding-person" />
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import QRCode from 'qrcode'
import { getQueryVariable } from '~/providers/common/utils'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import EditModal from '../../biddingPerson/list/components/editModal.vue'

export default {
  components: {
    EditModal,
    CustomProperty,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      fields: [
        { name: '出生日期', field: 'dateOfBirth', date: true },
        { name: '身份证号', field: 'identityNumber' },
        { name: '组织机构', field: 'department' },
        { name: '工作职务', field: 'position' },
        { name: '电话号码', field: 'phone' },
        { name: '入职时间', field: 'entryTime', date: true },
        { name: '从事检测工作年份', field: 'yearOfWork' },
        { name: '最高学历', field: 'education' },
        { name: '毕业院校', field: 'graduatedSchool' },
        { name: '所学专业', field: 'profession' },
        { name: '毕业时间', field: 'graduatedDate', date: true },
        { name: '劳动合同开始日期', field: 'contractStartTime', date: true },
        { name: '劳动合同结束日期', field: 'contractEndTime', date: true },
        { name: '社会保险种类', field: 'socialSecurityCategory' },
      ],
      fieldsData: [],
      showMore: false,
      data: {},
      dayjs,
      customFields: [],
      propertyProfileVisible: false,
      qrCodeUrl: '', // 用于存储二维码的base64数据
      qrSource: '',
    }
  },
  watch: {
    data: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.generateQRCode()
        }
      },
      deep: true,
    },
  },
  created() {
    this.getCustomFields()
  },
  mounted() {
    this.generateQRCode()
  },
  methods: {
    getCustomFields() {
      // window.$oAjax.get(window.$oApi.common.customProperties, {
      //   params: {
      //     customizeType: 'bidding-person'
      //   }
      // }).then(res => {
      //   this.customFields = res.data || []
      //
      //   this.fieldsData = [...this.fields, ...this.customFields.map(item=>({
      //     name: item.columnName,
      //     field: item.id
      //   }))]
      // });
      this.getDetailInfo()
    },
    async getDetailInfo() {
      const resArr = await Promise.all([
        this.getDictByCode('biddingPersonPosition'), // 职务
        this.getDictByCode('biddingPersonEducation'), // 学历
      ])
      window.$oAjax.get(window.$oApi.biddingPerson.personDetail, {
        params: { id: this.id },
      }).then((res) => {
        if (res && res.success) {
          this.data = res.obj
          this.data.position = resArr[0].find(item => item.typeCode === this.data.position) && resArr[0].find(item => item.typeCode === this.data.position).typeName
          this.data.education = resArr[1].find(item => item.typeCode === this.data.education) && resArr[1].find(item => item.typeCode === this.data.education).typeName
          this.fieldsData = [...this.fields, ...this.data.biddingCustomizeValueEntities.map(item => ({
            name: item.columnName,
            field: item.columnId,
          }))]
          this.data.biddingCustomizeValueEntities.forEach((item) => {
            this.data[item.columnId] = item.columnValue
          })
        }
      })
    },
    async getDictByCode(dictCode) {
      const { data, code } = await window.$oAjax.get('rest/type/getTypesByGroupCode', { params: { groupCode: dictCode } })
      if (code === 20000) {
        return data
      }
    },
    edit() {
      this.$refs.EditModal.showModal(this.data)
    },
    configPersonInfo() {
      this.$refs.ConfigPersonInfo.showModal()
    },
    handleProfile() {
      this.propertyProfileVisible = false
      this.getCustomFields()
    },
    async generateQRCode() {
      try {
        const unitCode = localStorage.getItem('unitCode') || ''
        const fullUrl = new URL(
          `/ilis2/rest/biddingPersonController/barcode/${this.id}/${unitCode}`,
          location.origin,
        ).href
        this.qrSource = fullUrl
        this.qrCodeUrl = await QRCode.toDataURL(fullUrl, {
          width: 120,
          height: 120,
          margin: 1,
        })
      }
      catch (error) {
        console.error('生成二维码失败:', error)
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
