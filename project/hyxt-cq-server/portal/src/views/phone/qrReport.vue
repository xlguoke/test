<template>
  <div :class="`phone-wrap ${showResult ? 'show-bg' : ''}`">
    <div class="phone-page-scroll">
      <div class="page-title">
        <h3 class="title">重庆市公路水运工程质量检测管理信息系统</h3>
        <h2 :class="`sub-title ${showResult ? 'black' : ''}`">试验检测报告查询</h2>
      </div>
      <div v-if="!showResult">
        <img src="@/assets/images/phone-qr.png" class="img" />
        <p style="font-size: 14px; color: #999; padding: 0 5% 10px">
          *查询范围：检测单位（包括注册地在重庆市的检测机构、来渝从业的市外检测机构、工地试验室及现场检测项目）在重庆市公路水运建设市场从业的检测报告
        </p>
        <div style="text-align: center">
          <a-button type="primary" size="large" :loading="loading" @click="scanQr">
            点击扫描
          </a-button>
          <!-- h5网页中测试 -->
          <a-input-search
            v-if="showSearch"
            v-model:value="val"
            style="margin-top: 30px"
            enter-button
            placeholder="输入报告防伪码查询"
            @search="searchData"
          />
        </div>
      </div>
      <template v-if="showResult">
        <ul class="report-result">
          <li v-if="form.id">
            <p class="icon-box">
              <i class="iconfont icon-chenggong"></i>
            </p>
            <p style="font-size: 16px; font-weight: bold">检测报告查询成功！</p>
            <p style="font-size: 18px">
              <span v-if="form.isQualified === true" class="success">合格</span>
              <span v-if="form.isQualified === false" class="error">不合格</span>
              <span v-if="form.isQualified === null" class="grey">不判定</span>
            </p>
          </li>
          <li v-else>
            <p class="icon-box">
              <i class="iconfont icon-shibai"></i>
            </p>
            <p style="font-size: 16px; font-weight: bold">检测报告查询失败！</p>
            <p style="color: #999">
              未找到防伪编码：{{ form.securityCode }}
              <br />
              的检测报告
            </p>
          </li>
        </ul>

        <div v-if="form.id">
          <p class="report-info-title">报告信息</p>
          <ul class="report-info">
            <li class="item">
              <span class="label">试验室名称</span>
              <span class="value">{{ form.laboratory }}</span>
            </li>
            <li class="item">
              <span class="label">委托方</span>
              <span class="value">{{ form.consignUnit }}</span>
            </li>
            <li class="item">
              <span class="label">委托类型</span>
              <span class="value">{{ checkTypeObj[form.checkType] }}</span>
            </li>
            <li class="item">
              <span class="label">委托编号</span>
              <span class="value">{{ form.consignSn }}</span>
            </li>
            <li class="item">
              <span class="label">委托时间</span>
              <span class="value">{{ form.consignDate ? formatDate(form.consignDate) : "-" }}</span>
            </li>
            <li class="item">
              <span class="label">报告编号</span>
              <span class="value">
                {{ form.sn }}
              </span>
            </li>
            <li class="item">
              <span class="label">签发时间</span>
              <span class="value">{{ form.signDate ? formatDate(form.signDate) : "-" }}</span>
            </li>
            <li class="item">
              <span class="label">检测样品</span>
              <span class="value">{{ form.sampleNames }}</span>
            </li>
            <li class="item">
              <span class="label">检测结果</span>
              <span class="value">{{ form.isQualifiedName }}</span>
            </li>
            <li class="item">
              <span class="label">防伪编码</span>
              <span class="value">{{ form.securityCode }}</span>
            </li>
            <li class="item">
              <span class="label">报告状态</span>
              <span class="value">{{ form.status }}</span>
            </li>
            <li class="item">
              <span class="label">更正次数</span>
              <a class="value blue" @click="changehistoryDetail">
                {{ form.amendVersion || 0 }}
              </a>
            </li>
            <li class="item">
              <span class="label">查询次数</span>
              <a class="value blue" @click="queryhistoryDetail">{{ form.queryCount || 1 }}</a>
            </li>
          </ul>
        </div>
        <div class="btns">
          <a-button type="primary" size="large" :loading="loading" @click="scanQr">
            重新扫描
          </a-button>
          <a-button v-if="form.id" type="primary" size="large" @click="showReport">
            查看报告原文件
          </a-button>
        </div>
      </template>
    </div>

    <!-- 附件列表 -->
    <a-modal v-model:visible="fileListVisble" width="650px" title="文件列表">
      <a-list item-layout="horizontal" size="small" bordered :data-source="fileList">
        <template #renderItem="{ item }">
          <a-list-item>
            <p class="fileRow_st">{{ item.name }}</p>
            <template #actions>
              <a key="list-loadmore-edit" @click="previewRewrite(item.url)">预览</a>
            </template>
          </a-list-item>
        </template>
      </a-list>

      <template #footer></template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import jsSHA from "jssha"
import { formatDate, previewPDF } from "@/assets/js/utils"
import request from "@/config/request.js"
import { message } from "ant-design-vue"
import wechat from "./wechat.js"
import { getMinioFileUrl } from "@/config/minio.config.js"
import { useRouter } from "vue-router"

const router = useRouter()
const appConfig = {
  appid: "wx9d43d527f39afe33",
  AppSecret: "72d21e103af8bb09977342e358a00164"
}
const fileListVisble = ref(false)

interface dataType {
  id: string
  consignUnit: string
  checkType: string
  consignSn: string
  consignDate: number | null // 委托日期
  laboratory: string
  sn: string
  snVersionSuffix?: string
  signDate: number | null // 签发日期
  sampleNames: string // 检测样品
  isQualified: boolean // 是否合格（为空标识不判定）
  isQualifiedName: string
  securityCode: string //防伪码
  status: string
  statusName: string
  attachments: {
    name: string
    url: string
    remark?: string
  }[]
  version: number
  amendVersion: number // 更正次数
  queryCount: number
}

const loading = ref<boolean>(false)
const showResult = ref<boolean>(false)
const checkTypeObj = {
  consign: "委托检测",
  quality: "质量抽检",
  simulation: "模拟抽检"
}
const form = ref<dataType>({
  id: "",
  consignUnit: "",
  checkType: "",
  consignSn: "",
  consignDate: null,
  laboratory: "",
  sn: "",
  signDate: null,
  sampleNames: "",
  isQualified: true,
  isQualifiedName: "",
  securityCode: "",
  status: "",
  statusName: "",
  attachments: [],
  version: 0,
  amendVersion: 0,
  queryCount: 0
})

onMounted(() => {
  document.title = "试验检测报告查询"
  // getDataSource("164089591044120576066")
  if (!wechat.isWeixin()) {
    showSearch.value = true
    return
  }
})

const showSearch = ref(false)
const val = ref("")
const searchData = () => {
  getDataSource(val.value)
}

const getDataSource = (securityCode: string) => {
  if (!securityCode) {
    console.log("请扫码获取防伪码")
    return
  }
  request({
    url: `/portal/report/securityCode/${securityCode}`
  })
    .then((res) => {
      showResult.value = true
      loading.value = false
      if (!res) {
        form.value.id = ""
        return
      }
      if (res.isQualified) {
        res.isQualifiedName = "合格"
      } else if (res.isQualified === false) {
        res.isQualifiedName = "不合格"
      } else {
        res.isQualifiedName = "不判定"
      }
      form.value = res
    })
    .catch(() => {
      loading.value = false
    })
}

const changehistoryDetail = () => {
  router.push({
    path: "/phone/changeHistory",
    query: {
      reportId: form.value.id,
      version: form.value.version - 1
    }
  })
}
const queryhistoryDetail = () => {
  router.push({
    path: "/phone/queryHistory",
    query: {
      reportId: form.value.id
    }
  })
}

const createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15)
}

const createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000 + "")
}

// 扫描
const scanQr = async () => {
  if (!wechat.isWeixin()) {
    message.error("请在微信环境中使用")
    return
  }
  try {
    loading.value = true
    const res = await createSignature()
    const scanRes = await wechat.scanQRCode({
      appId: appConfig.appid,
      timestamp: res?.timestamp,
      nonceStr: res?.noncestr,
      signature: res?.signature
    })
    console.log("返回值：", scanRes)
    const code = scanRes.resultStr.scan_code || scanRes.resultStr
    getDataSource(code)
  } catch (err) {
    loading.value = false
    getTicketErr(err)
  }
}

// 生产签名相关参数
const createSignature = async () => {
  try {
    const jsapi_ticket = await getJsapiTicket()
    if (!jsapi_ticket) {
      message.warning("获取jsapiTicket失败")
      return Promise.reject()
    }
    const noncestr = createNonceStr()
    const timestamp = createTimestamp()
    let url = window.location.href.split("#")[0]
    const _string = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`
    console.log(_string)
    const shaObj = new jsSHA("SHA-1", "TEXT")
    shaObj.update(_string)
    const signature = shaObj.getHash("HEX")
    return Promise.resolve({
      signature,
      noncestr,
      timestamp
    })
  } catch (err) {
    loading.value = false
    return Promise.reject(err)
  }
}

// 获取 jsapiTicket
const getJsapiTicket = async () => {
  return request({
    url: "/dash/wechat/jsapiTicket",
    method: "get"
  })
}

const getTicketErr = (err) => {
  console.log("获取微信授权失败", err)
  if (!err || !err.errMsg || err.errMsg.indexOf("cancel") !== -1) return
  message.warning("获取微信授权失败:" + err?.errMsg || "")
}

let fileList: any = ref([])
const showReport = async () => {
  fileList.value = form.value.attachments
  if (fileList.value.length > 1) {
    fileListVisble.value = true
  } else if (fileList.value.length == 1) {
    const url = fileList.value[0].url
    previewRewrite(url)
  }
}

const previewRewrite = async (url) => {
  const blobUrl = await getMinioFileUrl(url)
  if (blobUrl.includes(".pdf")) {
    previewPDF(blobUrl)
  } else {
    message.warning("只能预览pdf文件")
  }
}
</script>

<style lang="less" scoped>
.phone-wrap {
  width: 100%;
  height: 100vh;
  font-size: 14px;
  background: url("@/assets/images/phone-bg.png") center/cover no-repeat;
  box-sizing: border-box;
  overflow: hidden;
  .phone-page-scroll {
    padding: 10px;
    height: 100%;
    overflow: auto;
  }
  &.show-bg {
    background: #fff;
    .phone-page-scroll {
      height: calc(100vh - 70px);
    }
  }

  .page-title {
    padding-top: 10%;
    text-align: center;
    .title,
    .sub-title {
      font-weight: bold;
    }

    .title {
      font-size: 15px;
    }
    .sub-title {
      font-size: 18px;
    }

    .sub-title {
      color: @theme_color;
      &.black {
        color: #111;
      }
    }
  }
  .img {
    display: block;
    margin: -10px auto 10px;
    width: 90%;
  }

  .ant-btn {
    width: 80%;
  }
  .report-result {
    text-align: center;
    .icon-box {
      height: 70px;
      line-height: 70px;
    }
    .iconfont {
      font-size: 60px;
    }
    .icon-shibai {
      color: @error_color;
    }
    .icon-chenggong {
      color: @success_color;
    }
  }

  .report-info-title {
    padding-left: 12px;
    margin-top: 10px;
    margin-bottom: 5px;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 5px;
      width: 4px;
      height: 14px;
      background: @theme_color;
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }
  }

  .report-info {
    .item {
      padding: 10px 0;
      display: flex;
      border-bottom: 1px solid #f5f5f5;
      .label {
        width: 90px;
        text-align: center;
        color: #999;
      }
      .value {
        flex: 1;
        padding-right: 10px;
        width: 0;
        text-align: right;
      }
    }
  }

  .btns {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 10px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    box-shadow: 0 0 5px rgba(1, 1, 1, 0.1);
    z-index: 99;
    button {
      flex: 1;
      margin: 0 10px;
      max-width: 50%;
    }
  }

  .pdf-iframe {
    width: 100%;
    height: 100vh;
    border: none;
    overflow: auto;
  }
}
.fileRow_st {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 70%;
}
</style>
