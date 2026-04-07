<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form-item>
          <a-row type="flex">
            <a-col class="hitek-label">
              成果范围：
            </a-col>
            <a-col>
              <span
                style="font-size: 12px; width: 245px; display: inline-block"
              >{{ data.name || data.projectName }}</span>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item>
          <a-row type="flex">
            <a-col class="hitek-label">
              <span style="color: red">* </span>成果类型：
            </a-col>
            <a-col>
              <span
                style="font-size: 12px; width: 245px; display: inline-block"
              >
                {{ typeObj[data.achievementType] || '' }}
              </span>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item>
          <a-row type="flex">
            <a-col class="hitek-label">
              成果文件：
            </a-col>
            <a-col>
              <div v-for="(item, index) in fileLists" :key="index">
                <a
                  :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`"
                >{{ item.name }}</a>
              </div>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item>
          <a-row type="flex">
            <a-col class="hitek-label">
              审核人员：
            </a-col>
            <a-col>
              <span v-for="(item, index) in personData">
                <a-tag>
                  {{ item.presetUserRealName || item.processTaskName }}
                </a-tag>
                <RightOutlined v-if="index < personData.length - 1" style="margin-right: 10px" />
              </span>
            </a-col>
          </a-row>
        </a-form-item>
        <CorrectDetail
          ref="CorrectDetail"
          :process-instance-id="processInstanceId"
          :change-spinning="
            (status) => {
              spinning = status
            }
          "
        />
      </div>
    </a-spin>
  </div>
</template>

<script>
import { RightOutlined } from '@ant-design/icons-vue'
import { getProcessUser } from '~/providers/api/achievement'
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import CorrectDetail from './components/correctDetail.vue'

export default {
  components: {
    CorrectDetail,
    RightOutlined,
  },
  props: ['treeInfo', 'callback', 'node', 'isAdd'],
  data() {
    return {
      rootUrl,
      spinning: false,
      id: getQueryVariable('id'),
      processInstanceId: getQueryVariable('processInstanceId'),

      detail: getQueryVariable('detail') || '', // &detail=detailPage
      data: {
        name: '',
        achievementType: undefined,
        upload: '',
      },
      fileLists: [],
      typeObj: {
        10011: '综合检测大纲',
        10010: '综合检测方案',
        10086: '检测细则',
        10000: '其它',
      },
      personData: [
        {
          activitiNodeId: '1',
          processTaskName: '一校',
          presetUserId: '',
          presetUserRealName: '张红',
          presetUsername: 'zhanghopng',
        },
        {
          activitiNodeId: '2',
          processTaskName: '二校',
          presetUserId: '',
          presetUserRealName: '张红',
          presetUsername: 'zhanghopng',
        },
        {
          activitiNodeId: '3',
          processTaskName: '三校',
          presetUserId: '',
          presetUserRealName: '张红',
          presetUsername: 'zhanghopng',
        },
      ],
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.spinning = true
      window.$oAjax({
        methed: 'get',
        url: window.$oApi.testItem.achievementById,
        params: { id: this.id },
      }).then((res) => {
        if (res.code === 21000) {
          this.detailData(res.data)
        }
      })
      getProcessUser().then((res) => {
        if (res.code === 20000) {
          this.personData = res.data
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
        }
      })
    },
    detailData(data) {
      this.data = data
      this.fileLists = [
        {
          uid: data.attachmentId,
          name: data.achievementName,
          status: 'done',
          url: '',
        },
      ]
      window.$oAjax
        .get(window.$oApi.testItem.getPresetAuditer, {
          params: {
            processInstanceId: this.processInstanceId,
          },
        })
        .then((res) => {
          if (res.code && res.code === 20000) {
            // eslint-disable-next-line array-callback-return
            this.personData = this.personData.map((item) => {
              for (let i = 0; i < res.data.length; i++) {
                const itemEdit = res.data[i]
                if (item.activitiNodeId === itemEdit.activitiNodeId) {
                  return {
                    ...item,
                    presetUserId: itemEdit.presetUserId,
                    presetUsername: itemEdit.presetUsername,
                    presetUserRealName: itemEdit.presetUserRealName,
                  }
                }
              }
            })
          }
        })
      this.$refs.CorrectDetail.getData(this.processInstanceId)
    },
  },
}
</script>

<style scoped>
.hitek-label {
  width: 120px;
  text-align: right;
}
.ant-tag{
  line-height: 24px;
}
</style>
