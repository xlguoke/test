<template>
  <div>
    <SubTitle>基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      问题列表
    </SubTitle>
    <CardForm :data="list" />
  </div>
</template>

<script>
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import CardForm from './CardForm.vue'
import DetailForm from './DetailForm.vue'
import SubTitle from './SubTitle.vue'

const typeObj = {
  10011: '综合检测大纲',
  10010: '综合检测方案',
  10086: '检测细则',
  10000: '其它',
}

export default {
  components: {
    DetailForm,
    SubTitle,
    CardForm,
  },
  props: ['businessKey', 'processInstanceId'],
  data() {
    return {
      data: [],
      list: [],
    }
  },
  created() {
    this.getDetail()
    this.getList()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get(
          `rest/synthesis/achievement/getAchievementById?id=${this.businessKey}`,
        )
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const data = res.data

        this.data = [
          { label: '成果范围', value: data.name || data.projectName },
          { label: '成果类型', value: typeObj[data.achievementType] },
          {
            label: '成果文件',
            fileList: [
              {
                name: data.achievementName,
                url: `/ilis2/uploadController.do?download&accessoryId=${
                  data.attachmentId
                }&${encodeURIComponent(data.achievementName)}`,
              },
            ],
          },
        ]
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getList() {
      const res = await mRequest.get(
        '/rest/auditProcessProblem/getByProcessInstanceId',
        {
          params: {
            page: -1,
            size: -1,
            processInstanceId: this.processInstanceId,
          },
        },
      )

      if (res.code !== 20010) {
        this.list = res.data.map(item => [
          { label: '问题描述', value: item.description },
          { label: '问题类型', value: item.severity },
          {
            label: '问题截图',
            fileList: (item.processProblemFileVos || []).map(pItem => ({
              name: pItem.name,
              url: pItem.fileUrl,
            })),
          },
          { label: '提出人', value: item.createName },
          { label: '修正情况', value: item.isRecovered ? '已修正' : '未修正' },
          { label: '修正人', value: item.recoverUser },
        ])
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
  },
}
</script>
