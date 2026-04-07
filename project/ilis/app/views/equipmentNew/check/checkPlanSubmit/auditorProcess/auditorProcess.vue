<!-- eslint-disable vue/require-v-for-key -->
<template>
  <a-form-item
    label="审核人员"
    :label-col="{ span: 5 }"
    :wrapper-col="{ span: 15 }"
  >
    <div>
      <span v-for="(item, index) in personData">
        <a-tag
          closable
          @close="preventDefault(item.activitiNodeId)"
          @click="setPersonnels('radio', item.activitiNodeId, '请选择人员')"
        >
          {{ item.presetUserRealName || item.processTaskName }}
        </a-tag>
        <RightOutlined v-if="index < personData.length - 1" style="margin-right: 10px" />
      </span>
    </div>
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </a-form-item>
</template>

<script>
import { RightOutlined } from '@ant-design/icons-vue'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

export default {
  components: {
    // TreeComponent,
    // UploadComponent,
    TableTreePersonnel,
    // FormLayout,
    // CorrectDetail
    RightOutlined,
  },
  props: ['callback', 'auditTypeId'],
  data() {
    return {

      personData: [
        {
          activitiNodeId: '1',
          processTaskName: '一校',
          presetUserId: '',
          presetUserRealName: '部门管理员审批',
          presetUsername: 'zhanghopng',
        },
        {
          activitiNodeId: '2',
          processTaskName: '二校',
          presetUserId: '',
          presetUserRealName: '部门管理员审批',
          presetUsername: 'zhanghopng',
        },
        {
          activitiNodeId: '3',
          processTaskName: '三校',
          presetUserId: '',
          presetUserRealName: '部门管理员审批',
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
        method: 'get',
        url: `rest/auditProcess/getProcessUserTaskList?auditTypeId=${this.auditTypeId || '30'}`,
      }).then((res) => {
        if (res.code === 20000) {
          this.personData = res.data
        }
        else {
          this.personData = []
        }
        this.spinning = false
      })
    },
    setPersonnels(type, idsPerson, title) {
      const acceptData = [
        {
          id: this.personData.find(item => idsPerson === item.activitiNodeId)
            .presetUserId,
          name: this.personData.find(
            item => idsPerson === item.activitiNodeId,
          ).presetUserRealName,
        },
      ]
      this.$refs.TableTreePersonnel.showModal(
        type,
        idsPerson,
        acceptData,
        title,
      )
    },
    getPerson(idsPerson, acceptData) {
      this.personData = this.personData.map((item) => {
        if (idsPerson === item.activitiNodeId) {
          return {
            ...item,
            presetUserId: acceptData[0].id,
            presetUserRealName: acceptData[0].name,
            presetUsername: acceptData[0].account,
          }
        }
        else {
          return { ...item }
        }
      })
    },
    preventDefault(activitiNodeId) {
      event.preventDefault()
      event.stopPropagation()
      this.personData = this.personData.map(item => ({
        ...item,
        presetUserId:
          activitiNodeId === item.activitiNodeId ? '' : item.presetUserId,
        presetUserRealName:
          activitiNodeId === item.activitiNodeId
            ? item.processTaskName
            : item.presetUserRealName,
        presetUsername:
          activitiNodeId === item.activitiNodeId ? '' : item.presetUsername,
      }))
    },
  },
}
</script>

<style scoped></style>
