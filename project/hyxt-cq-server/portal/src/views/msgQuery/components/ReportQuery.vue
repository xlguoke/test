<template>
  <div class="report-query">
    <div class="query-form">
      <a-form ref="refForm" :model="formState" autocomplete="off" layout="inline" @finish="getDataSource">
        <a-form-item label="机构名称" name="orgName" :rules="[{ required: true, message: '请输入机构名称' }]">
          <a-input v-model:value="formState.orgName" placeholder="请输入机构名称" />
        </a-form-item>
        <a-form-item label="报告编号" name="reportSN" :rules="[{ required: true, message: '请输入报告编号' }]">
          <a-input v-model:value="formState.reportSN" placeholder="请输入报告编号" />
        </a-form-item>
        <a-form-item label="防伪码" name="queryCode" :rules="[{ required: true, message: '请输入防伪码' }]">
          <a-input v-model:value="formState.queryCode" style="width: 140px" placeholder="请输入防伪码" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="spinning">查询</a-button>
        </a-form-item>
      </a-form>
    </div>
    <template v-if="showResult">
      <ul class="report-result">
        <li v-if="form.id">
          <p class="icon-box">
            <i class="iconfont icon-chenggong"></i>
          </p>
          <p>检测报告查询成功</p>
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
          <p>检测报告查询失败</p>
          <p>
            未找到报告编号：{{ form.sn }}
            <br />
            的检测报告或验证码错误
          </p>
          <a-button type="primary" @click="reSearch">重新查验</a-button>
        </li>
      </ul>

      <div v-if="form.id">
        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item label="委托方">{{ form.consignUnit }}</a-descriptions-item>
          <a-descriptions-item label="委托类型">{{ checkTypeObj[form.checkType] }}</a-descriptions-item>
          <a-descriptions-item label="委托编号">{{ form.consignSn }}</a-descriptions-item>
          <a-descriptions-item label="委托时间">
            {{ form.consignDate ? formatDate(form.consignDate) : "-" }}
          </a-descriptions-item>
          <a-descriptions-item label="报告编号">
            {{ form.sn }}
          </a-descriptions-item>
          <a-descriptions-item label="签发时间">
            {{ form.signDate ? formatDate(form.signDate) : "-" }}
          </a-descriptions-item>
          <a-descriptions-item label="检测样品">{{ form.sampleNames }}</a-descriptions-item>
          <a-descriptions-item label="检测结果">{{ form.isQualifiedName }}</a-descriptions-item>
          <a-descriptions-item label="防伪编码">{{ form.securityCode }}</a-descriptions-item>
          <a-descriptions-item label="报告状态">{{ form.status }}</a-descriptions-item>
          <a-descriptions-item label="更正次数">
            <span>{{ form.amendVersion }}</span>
            <a v-if="form.amendVersion > 0" class="blue fr" @click="showChangeHistory">点击查看</a>
          </a-descriptions-item>
          <a-descriptions-item label="查询次数">
            {{ form.queryCount || 0 }}
            <a v-if="form.queryCount > 0" class="blue fr" @click="showQueryCount">点击查看</a>
          </a-descriptions-item>
        </a-descriptions>

        <div class="btns">
          <router-link to="/">
            <a-button type="primary">返回首页</a-button>
          </router-link>
          <a-button v-if="form.attachments?.length > 0" type="primary" @click="showReport">查看报告原文件</a-button>
        </div>
      </div>
    </template>
    <ChangeHistory v-if="form.version > 1" ref="changeHistory" />

    <a-modal v-model:visible="visible" title="查询记录" width="400px">
      <template #footer>
        <a-button type="primary" @click="visible = false">关闭</a-button>
      </template>
      <QueryHistory v-if="form.id" :key="queryKey" :report-id="form.id" />
    </a-modal>

    <!-- 附件列表 -->
    <a-modal v-model:visible="fileListVisble" width="650px" title="文件列表">
    <a-list item-layout="horizontal" size="small" bordered :data-source="fileList">
    <template #renderItem="{ item }">
      <a-list-item>
        {{ item.name }}
        <template #actions>
          <a key="list-loadmore-edit" @click="previewRewrite(item.url)">预览</a>
        </template>
      </a-list-item>
    </template>
    </a-list>

    <template #footer>
    <a-button type="primary" @click="fileListVisble = false">关闭</a-button>
    </template>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue"
import { previewPDF } from "@/assets/js/utils"
import { reportQuery } from "@/api/home.api"
import { formatDate } from "@/assets/js/utils"
import { getMinioFileUrl } from "@/config/minio.config.js"
import ChangeHistory from "@/components/changeHistory/ChangeHistory.vue"
import QueryHistory from "@/components/changeHistory/QueryHistory.vue"
import { message } from 'ant-design-vue';

const spinning = ref<boolean>(false)
const showResult = ref<boolean>(false)
const formState = reactive({
  orgName: "",
  reportSN: "",
  queryCode: ""
})

interface dataType {
  id: string
  consignUnit: string
  checkType: string
  consignSn: string
  consignDate: number | null // 委托日期
  sn: string
  snVersionSuffix?: string // 报告编号后缀 - 变更标识
  signDate: number | null // 签发日期
  sampleNames: string // 检测样品
  isQualified: boolean // 是否合格（为空标识不判定）
  isQualifiedName: string
  securityCode: string //防伪码
  status: string
  statusName: string
  version: number //主版本
  queryCount: number // 查询次数
  amendVersion:string|number,  //更正次数
  attachments: {
    name: string
    url: string
    remark?: string
  }[]
}

const fileListVisble=ref(false)

const queryKey = computed(() => form.value.id + form.value.queryCount)

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
  sn: "",
  signDate: null,
  sampleNames: "",
  isQualified: true,
  isQualifiedName: "",
  securityCode: "",
  status: "",
  statusName: "",
  version: 0,
  queryCount: 0,
  attachments: [],
  amendVersion:""
})
const getDataSource = () => {
  spinning.value = true
  reportQuery(formState)
    .then((res) => {
      spinning.value = false
      showResult.value = true
      if (!res) {
        form.value.id = ""
        form.value.sn = formState.reportSN
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
      spinning.value = false
    })
  return false
}

// 重新查验
const refForm = ref()
const reSearch = async () => {
  await refForm.value.validateFields()
  getDataSource()
}

let fileList:any=ref([])
const showReport = async () => {
   fileList.value = form.value.attachments;
  if(fileList.value.length>1){
    fileListVisble.value=true
  }else if(fileList.value.length==1){
    const url = fileList.value[0].url 
    previewRewrite(url)
  }
}

const previewRewrite=async(url)=>{
  const blobUrl = await getMinioFileUrl(url)
  if(blobUrl.includes('.pdf')){
    previewPDF(blobUrl)
  }else{
    message.warning('只能预览pdf文件');
  }
}


// 更正记录
const changeHistory = ref()
const showChangeHistory = () => {
  changeHistory.value.openModal(form.value.id)
}

// 查询次数
const visible = ref<boolean>(false)
const showQueryCount = () => {
  visible.value = true
}
</script>

<style lang="less" scoped>
.report-query {
  :deep(.ant-descriptions-item-label) {
    width: 100px;
    text-align: center;
  }
}
.report-result {
  margin-bottom: 20px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  .icon-box {
    font-weight: 400;
    .iconfont {
      font-size: 60px;
    }
    .icon-chenggong {
      color: @success_color;
    }
    .icon-shibai {
      color: @error_color;
    }
  }
  button {
    margin-top: 15px;
  }
}
.btns {
  padding-top: 30px;
  padding-bottom: 20px;
  text-align: center;
  button {
    margin: 0 10px;
  }
}
</style>
