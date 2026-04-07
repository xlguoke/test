<template>
  <a-modal
    v-model:visible="visible"
    title="查看人员"
    :mask-closable="false"
    :keyboard="false"
    cancel-text="关闭"
    width="1000px"
    @ok="handleOk"
  >
    <a-spin :spinning="spinning">
      <a-descriptions bordered size="small" :column="3">
        <a-descriptions-item
          :label-style="{ display: 'none' }"
          :content-style="{ fontWeight: '700' }"
          :span="3"
        >
          <p class="detail-title">检测人员基本信息</p>
        </a-descriptions-item>
        <a-descriptions-item label="姓名">{{ form.name }}</a-descriptions-item>
        <a-descriptions-item label="性别">
          {{ form.gender == "0" ? "女" : "男" }}
        </a-descriptions-item>
        <a-descriptions-item style="position: relative; width: 75px">
          <div class="person-phone">
            <a-image v-if="form.photo" :src="partBaseUrl + form.photo" />
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="证件类型">{{ form.idName }}</a-descriptions-item>
        <a-descriptions-item label="证件号码">{{ form.idNum }}</a-descriptions-item>
        <a-descriptions-item></a-descriptions-item>
        <a-descriptions-item label="出生日期">
          {{ form.dateOfBirth ? formatDate(form.dateOfBirth) : "" }}
        </a-descriptions-item>
        <a-descriptions-item label="职称">{{ form.jobTitle }}</a-descriptions-item>
        <a-descriptions-item></a-descriptions-item>
        <a-descriptions-item label="职务">{{ form.duties }}</a-descriptions-item>
        <a-descriptions-item label="学历">{{ form.degree }}</a-descriptions-item>
        <a-descriptions-item></a-descriptions-item>
        <a-descriptions-item label="从事检测年限">{{ form.serviceYear }}</a-descriptions-item>
        label-style
        <a-descriptions-item label="初次录入时间">
          {{ form.firstInputTime ? formatDate(form.firstInputTime) : "" }}
        </a-descriptions-item>
        <a-descriptions-item></a-descriptions-item>
        <a-descriptions-item label="入职时间">
          {{ form.entryTime ? formatDate(form.entryTime) : "" }}
        </a-descriptions-item>
        <a-descriptions-item label="劳动合同年限" :span="2">
          {{ form.contractYear }}
        </a-descriptions-item>
        <a-descriptions-item label="社会保险种类" :span="3">
          {{ form.socialInsuranceType }}
        </a-descriptions-item>

        <a-descriptions-item
          :label-style="{ display: 'none' }"
          :content-style="{ fontWeight: '700' }"
          :span="3"
        >
          <p class="detail-title">证书信息</p>
        </a-descriptions-item>
        <a-descriptions-item
          :label-style="{ display: 'none', width: 0 }"
          :span="3"
          class="certificate-con"
        >
          <a-table
            :data-source="form.certs"
            :columns="columns"
            :pagination="false"
            size="small"
            bordered
            row-key="id"
          ></a-table>
        </a-descriptions-item>
        <a-descriptions-item
          :label-style="{ display: 'none' }"
          :content-style="{ fontWeight: '700' }"
          :span="3"
        >
          <p class="detail-title">证书</p>
        </a-descriptions-item>
        <a-descriptions-item
          :label-style="{ display: 'none', width: 0 }"
          :span="3"
          class="certificate-con"
        >
          <p style="padding: 20px">
            <a
              :href="`${partBaseUrl}/PCWeb/OrgQuery/PersonDetails?cardNo=${form.idNum}&personName=${form.name}`"
              target="_blank"
            >
              相关证书，请前往部平台查看
            </a>
          </p>
        </a-descriptions-item>
      </a-descriptions>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from "vue"
import { getDetail } from "@/api/personnel.api"
import { formatDate } from "@/assets/js/common"

const partBaseUrl = ref(import.meta.env.VITE_PART_API)

const visible = ref(false)
const openModal = (id: string) => {
  visible.value = true
  nextTick(() => {
    document.getElementsByClassName("certificate-con")[1]?.setAttribute("colspan", "6")
  })
  id && getDatas(id)
}
defineExpose({
  openModal
})

const form = ref<any>({
  certs: []
})
const spinning = ref(false)
const getDatas = (id: string) => {
  spinning.value = true
  getDetail(id).then((res) => {
    spinning.value = false
    form.value = res
  })
}

const columns = reactive([
  {
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }: any) => {
      return index + 1
    }
  },
  {
    title: "证书类型",
    dataIndex: "certType",
    key: "certType"
  },
  {
    title: "证书编号",
    dataIndex: "certNo",
    key: "certNo"
  },
  {
    title: "检测专业",
    dataIndex: "testMajor",
    key: "testMajor"
  },
  {
    title: "发证日期",
    dataIndex: "issueDate",
    key: "issueDate",
    customRender: ({ text }: any) => {
      return text ? formatDate(text) : ""
    }
  },
  {
    title: "管理编号",
    dataIndex: "manageNum",
    key: "manageNum"
  },
  {
    title: "证书状态",
    dataIndex: "certStatus",
    key: "certStatus"
  },
  {
    title: "发证类型",
    dataIndex: "issueType",
    key: "issueType"
  }
])

const handleOk = () => {
  visible.value = false
}
</script>

<style scoped lang="less">
:deep(.ant-descriptions-item-label) {
  width: 120px;
}
:deep(.certificate-con) {
  padding: 0 !important;
}
.detail-title {
  margin: 5px 0;
}
.person-phone {
  position: absolute;
  right: 0;
  top: 0;
  width: 116px;
  height: 154px;
  background: url("@/assets/images/avatar-bg.png") no-repeat center 45px/100% #f5f5f5;
  border-left: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  :deep(.ant-image),
  :deep(.ant-image-img) {
    width: 100%;
    height: 100%;
  }
}
</style>
