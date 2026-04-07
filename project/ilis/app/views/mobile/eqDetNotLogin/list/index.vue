<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="equipmentOutgo-wrap" style="padding: 0 24px 50px">
    <div
      style="
        text-align: center;
        font-size: 24px;
        margin: 33px 0;
        font-weight: 900;
        color: #0066ec;
        text-shadow: 0px 2px 2px rgba(0, 102, 236, 0.29);
      "
    >
      {{ dataInfo.unitName || '-' }}
    </div>
    <ul class="eq_info block_wrap">
      <li v-for="item in costomFields" v-show="!['eqAuthUser'].includes(item.columnKey)" :key="item.field">
        <span class="lt">{{ item.columnName }}：</span>
        <template v-if="item.columnKey">
          <span v-if="item.columnKey !== 'egressStatus'" class="rt">
            {{ dataInfo[item.columnKey] || '-' }}</span>
          <span v-else class="rt">{{
            egressStatusObj[dataInfo[item.columnKey]] || '-'
          }}</span>
        </template>
      </li>
    </ul>
    <div v-if="showAuthUserInfo" class="block_wrap attachment_wrap">
      <p
        style="
          color: #0066ec;
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          font-size: 14px;
        "
      >
        <van-icon name="friends" style="vertical-align: text-top;font-size: 16px;" />
        <span style="margin-left: 2px">授权人员</span>
      </p>
      <div v-if="authUserList.length" class="max-h-[250px] overflow-y-auto">
        <div
          v-for="item in authUserList"
          :key="item.id"
          style="color:#151515; padding: 4px 0;word-wrap: break-word;"
        >
          <div class="flex items-center justify-between">
            <div>
              {{ item.personName }}
              (
              {{ item.personStatus === '0' ? '在职' : '离职' }}
              <template v-if="['20', '40'].includes(item.authStatus)">
                - {{ item.authStatus === '40' ? '生效中' : '审核中' }}
              </template>
              )
            </div>
            <a href="javascript:;" class="text-blue-500" @click="checkAuthMore(item)">更多设备({{ item.eqCount }}) >></a>
          </div>
        </div>
      </div>
      <div v-else style="color:#151515;">
        无
      </div>
    </div>
    <div v-if="isAssign" class="block_wrap attachment_wrap">
      <p
        style="
          color: #0066ec;
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          font-size: 14px;
        "
      >
        <img
          style="vertical-align: text-top"
          :src="iconImg"
        />
        <span style="margin-left: 2px">{{ checkCertificateFileName }}</span>
      </p>
      <template v-if="dataInfo.checkCertificateFile && dataInfo.checkCertificateFile.length">
        <div
          v-for="(fItem, fIndex) in dataInfo.checkCertificateFile"
          v-show="fIndex <= 4"
          :key="fItem.id"
          style="color:#151515; padding: 4px 0;word-wrap: break-word;"
          @click="openFile(fItem.url)"
        >
          {{ fItem.name }}
        </div>

        <div v-if="dataInfo.checkCertificateFile.length > 5" style="color: #999;margin-top: 4px;">
          更多资料请前往PC端查看！
        </div>
      </template>
      <div v-else style="color:#151515;">
        无
      </div>
    </div>
    <div v-if="isDesc" class="block_wrap attachment_wrap">
      <p
        style="
          color: #0066ec;
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          font-size: 14px;
        "
      >
        <img
          style="vertical-align: text-top"
          :src="iconImg"
        />
        <span style="margin-left: 2px">{{ instructionsForUseFileName }}</span>
      </p>
      <template v-if="dataInfo.instructionsForUseFile && dataInfo.instructionsForUseFile.length">
        <div
          v-for="(fItem, fIndex) in dataInfo.instructionsForUseFile"
          v-show="fIndex <= 4"
          :key="fItem.id"
          style="color:#151515; padding: 4px 0;word-wrap: break-word;"
          @click="openDesc(fItem.url)"
        >
          {{ fItem.name }}
        </div>

        <div v-if="dataInfo.instructionsForUseFile.length > 5" style="color: #999;margin-top: 4px;">
          更多资料请前往PC端查看！
        </div>
      </template>
      <div v-else style="color:#151515;">
        无
      </div>
    </div>
    <div
      v-for="item in costomFile"
      :key="item.id"
      class="block_wrap attachment_wrap"
    >
      <p
        style="
          color: #0066ec;
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          font-size: 14px;
        "
      >
        <img
          style="vertical-align: text-top"
          :src="iconImg"
        />
        <span style="margin-left: 2px">{{ item.columnName }}</span>
      </p>
      <template v-if="dataInfo.customizeFile && dataInfo.customizeFile[item.columnKey] && dataInfo.customizeFile[item.columnKey].length">
        <div
          v-for="(fItem, fIndex) in dataInfo.customizeFile[item.columnKey]"
          v-show="fIndex <= 4"
          :key="fItem.id"
          style="color:#151515; padding: 4px 0;word-wrap: break-word;"
          @click="openFileByKey(fItem.url)"
        >
          {{ fItem.name }}
        </div>

        <div v-if="dataInfo.customizeFile[item.columnKey].length > 5" style="color: #999;margin-top: 4px;">
          更多资料请前往PC端查看！
        </div>
      </template>
      <div v-else style="color:#151515;">
        无
      </div>
    </div>
    <div class="handle-btns">
      <a-button
        v-if="!dataInfo.egressStatus || dataInfo.egressStatus == '10'"
        v-permission="'mobile_equipmentEgress'"
        type="primary"
        @click="addEqGoout"
      >
        外出
      </a-button>
      <a-button
        v-if="dataInfo.egressStatus == '40' || dataInfo.egressStatus == '60' || dataInfo.egressStatus == '70'"
        v-permission="'mobile_equipmentReturn'"
        type="primary"
        @click="egressDispose('40')"
      >
        归还
      </a-button>
      <a-button
        v-if="dataInfo.egressStatus == '40' || dataInfo.egressStatus == '70' || dataInfo.egressStatus == '90'"
        v-permission="'mobile_equipmentPostpone'"
        type="primary"
        @click="egressDispose('70')"
      >
        延期
      </a-button>
      <a-button
        v-if="dataInfo.egressStatus == '80'"
        v-permission="'mobile_equipmentPostpone'"
        type="primary"
        @click="egressDispose('90')"
      >
        确认延期
      </a-button>
      <a-button
        v-if="dataInfo.egressStatus == '80'"
        v-permission="'mobile_equipmentPostpone'"
        type="primary"
        @click="egressDispose('95')"
      >
        拒绝延期
      </a-button>
      <template v-if="dataInfo.egressStatus == '20'">
        <a-button v-permission="'mobile_equipmentEgressConfirm'" type="primary" @click="egressDispose('20')">
          确认外出
        </a-button>
        <a-button v-permission="'mobile_equipmentEgressConfirm'" @click="egressDispose('30')">
          拒绝外出
        </a-button>
      </template>
      <template v-if="dataInfo.egressStatus == '50'">
        <a-button v-permission="'mobile_equipmentReturnConfirm'" type="primary" @click="egressDispose('50')">
          确认归还
        </a-button>
        <a-button v-permission="'mobile_equipmentReturnConfirm'" @click="egressDispose('60')">
          拒绝归还
        </a-button>
      </template>
      <a-button v-if="detailPage" style="flex: 0.5" @click="$router.go(-1)">
        返回
      </a-button>
    </div>
  </div>
</template>

<script>
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import { Modal } from 'ant-design-vue'
import { getQueryVariable } from '~/providers-moblie/common/utils'
import { rootUrl } from '~/providers-moblie/configs/rootUrl'
import mApi from '~/providers-moblie/common/api'
import mAjax from '~/providers-moblie/common/ajax'
import {getEqAuthList} from "~/views/mobile/eqDetNotLogin/api.js";
import {AnyDialogHelper} from "~/anyThing/helper/AnyDialogHelper.js";
import CheckAuthEq from "./components/checkAuthEq.vue";
import {getBusinessParamNotAuth} from "~/utils/getBusinessParam.js";

const egressStatusObj = {
  10: '库存',
  20: '外出待确认',
  30: '外出被拒绝',
  40: '外出',
  50: '归还待确认',
  60: '归还被拒绝',
  70: '外出延期',
  80: '延期待确认',
  90: '延期被拒绝',
}

export default {
  data() {
    return {
      unitCode: '',
      id: '',
      detailPage: false,
      dataInfo: {},
      columnInChooseEntitiesData: [],
      isAssign: false,
      isDesc: false,
      checkCertificateFileName: '检校证书',
      instructionsForUseFileName: '使用说明',
      egressStatusObj,
      authUserList: [],
      iconImg: new URL('~/providers-moblie/assets/icont_1.png', import.meta.url).href
    }
  },
  async created() {
    const { unitCode, id, detailPage } = this.$route.query
    this.unitCode = unitCode || getQueryVariable('unitCode')
    this.id = id || getQueryVariable('id')
    this.detailPage = detailPage == '1'
    this.getData()
  },
  computed: {
    showAuthUserInfo() {
      const list = this.dataInfo.columnInChooseEntities || []
      return this.dataInfo.isIot === '1' && list.some(item => item.columnKey === 'eqAuthUser')
    },
    // 要展展示的自定义字段
    costomFields() {
      const list = this.dataInfo.columnInChooseEntities || []
      return list.filter((item) => {
        return !item.columnKey.includes('customize')
      })
    },
    // 要展展示的自定义文件
    costomFile() {
      const list = this.dataInfo.columnInChooseEntities || []
      return list.filter((item) => {
        return item.columnKey.includes('customize')
      })
    },
  },
  methods: {
    checkAuthMore(item) {
      AnyDialogHelper.showModel(CheckAuthEq, {
        id: item.personId,
        unitCode: this.unitCode,
        title: `${item.personName}（${item.personStatus === '0' ? '在职' : '离职'}）的授权设备`
      })
    },
    // 打开文件
    openFileByKey(url) {
      if (url.includes('.pdf')) {
        window.open(
          'http://' +
            window.location.host +
            '/ilis2/pdfjs_module/web/viewer.html?file=' +
            url,
          '_self'
        )
      } else if (
        url.includes('.jpg') ||
        url.includes('.jpeg') ||
        url.includes('.png') ||
        url.includes('.bmp')
      ) {
        window.open(url, '_self')
      } else {
        window.open(url, '_self')
      }
    },
    // 打开文件
    openFile(url) {
      if (url.includes('.pdf')) {
        window.open(
          'http://' +
            window.location.host +
            '/ilis2/pdfjs_module/web/viewer.html?file=' +
            url,
          '_self'
        )
      } else if (
        url.includes('.jpg') ||
        url.includes('.jpeg') ||
        url.includes('.png') ||
        url.includes('.bmp')
      ) {
        window.open(url, '_self')
      } else {
        window.open(url, '_self')
      }
    },
    // 使用说明
    openDesc(url) {
      if (url.includes('.pdf')) {
        window.open(
          'http://' +
            window.location.host +
            '/ilis2/pdfjs_module/web/viewer.html?file=' +
            url,
          '_self'
        )
      } else if (
        url.includes('.jpg') ||
        url.includes('.jpeg') ||
        url.includes('.png') ||
        url.includes('.bmp')
      ) {
        window.open(url, '_self')
      } else {
        window.open(url, '_self')
      }
    },

    async getData() {
      let resDetail = await mAjax({
        method: 'GET',
        url: `${mApi.eqEgressList.getByIdWithoutLogin}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id: this.id || '',
          unitCode: this.unitCode || '',
        },
      })

      if (resDetail.code == '20000') {
        this.dataInfo = resDetail.data
        let customBidding = [...this.dataInfo.biddingCustomizeValueEntities]
        const columnInChooseEntitiesData =
          this.dataInfo.columnInChooseEntities || []
        // 将自定义属性平铺到dataInfo上，方便直接进行检索
        customBidding.forEach((it) => {
          this.dataInfo[it.columnId] = it.columnValue
        })
        // 新增判断
        const columnInChooseEntities = columnInChooseEntitiesData.filter(
          (item) => {
            if (item.columnKey == 'checkCertificateFile') {
              this.isAssign = true
              this.checkCertificateFileName = item.columnName
            }
            if (item.columnKey == 'instructionsForUseFile') {
              this.isDesc = true
              this.instructionsForUseFileName = item.columnName
            }
            return (
              item.columnKey != 'checkCertificateFile' &&
              item.columnKey != 'instructionsForUseFile'
            )
          }
        )
        this.dataInfo.columnInChooseEntities = columnInChooseEntities || []

        // 获取授权人员列表
        if (this.showAuthUserInfo) {
          getEqAuthList(this.id, {
            companyId: this.unitCode,
            page: 1,
            size: 999
          }).then((res) => {
            this.authUserList = res.data.rows
          })
        }
      } else {
        console.error('请求错误')
      }
    },
    async egressDispose(status) {
      if (!(await this.isLogin(status))) return
      this.$router.push({
        name: 'dispose',
        params: {
          id: this.dataInfo.id,
          status,
          isLogin: this.detailPage ? '' : 1,
        },
      })
    },
    async addEqGoout() {
      if (!(await this.isLogin())) return
      this.$router.push({
        name: 'add',
        params: {
          unitCode: this.unitCode,
          isLogin: this.detailPage ? '' : 1,
        },
      })
    },
    async isLogin(status) {
      return new Promise((resolve) => {
        const userId = localStorage.getItem('userId')
        if (!!userId) {
          return resolve(true)
        }
        Modal.confirm({
          title: '当前操作需要登录',
          content: '是否前往登录？',
          centered: true,
          onOk: () => {
            let backUrl = ''
            const n = this.detailPage ? '' : 1
            if (status) {
              backUrl = encodeURIComponent(
                `${location.href}dispose/${this.dataInfo.id}/${status}/${n}`
              )
            } else {
              backUrl = encodeURIComponent(
                `${location.href}add/${this.unitCode}/${n}`
              )
            }

            location.href = `${rootUrl}/loginController.do?goAppLogin&targetUrl=${backUrl}`
          },
        })
        resolve(false)
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
