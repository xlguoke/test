<template>
  <ht-modal
    v-model:open="visible"
    title="消息变更推送设置"
    centered
    :confirm-loading="confirmLoading"
    :mask-closable="false"
    width="640px"
    @ok="handleSubmit"
    @cancel="cancelModal"
  >
    <a-form class="mt-2" :model="formState" :label-col="{ style: { width: '150px' } }">
      <a-form-item label="消息推送人">
        <a-select
          v-model:value="formState.roleIds"
          placeholder="请选择推送设置"
          mode="multiple"
          :options="roleList"
        />
      </a-form-item>

      <a-form-item label="支持变更提醒的信息">
        <a-select
          v-model:value="formState.names"
          placeholder="请选择推送方式"
          mode="multiple"
          :options="variableList"
        />
      </a-form-item>
    </a-form>
  </ht-modal>
</template>

<script>
import { message } from 'ant-design-vue'
import { getRoles } from '~/views/unit-config/userMgt/api.js'

export default {
  data() {
    return {
      formState: {},
      visible: false,
      roleList: [],
      variableList: [],
      confirmLoading: false,
    }
  },
  methods: {
    async initRoleList() {
      if (this.roleList.length) {
        return
      }

      const res = await getRoles()

      this.roleList = res.data.rows.map(i => ({
        label: i.roleName,
        value: i.id,
      }))

      this.roleList.unshift({
        label: '所在部门负责人',
        value: null,
        disabled: true,
      })
    },
    showModal() {
      this.initRoleList()
      this.getConfig()
      this.visible = true
    },
    cancelModal() {
      this.visible = false
      this.formState = {}
    },
    async getConfig() {
      const res = await window.$oAjax({
        url: `/biddingPersonController/msg/config`,
      })

      const data = res.data

      this.variableList = data.templateVariable.map(i => ({
        label: i.describe,
        value: i.name,
      }))

      this.formState = {
        roleIds: data.roleIds ? data.roleIds.split(',') : [],
        names: this.getVariableByContent(data.content),
      }

      this.formState.roleIds.unshift(null)
    },
    getVariableByContent(str) {
      const regex = /\[(.*?)\]/g
      const matches = []
      let match
      // eslint-disable-next-line no-cond-assign
      while ((match = regex.exec(str)) !== null) {
        matches.push(match[1])
      }
      return matches
    },
    async handleSubmit() {
      const { roleIds, names } = this.formState

      this.confirmLoading = true
      const res = await window.$oAjax({
        method: 'POST',
        url: `/biddingPersonController/msg/config`,
        data: JSON.stringify({
          roleIds: roleIds.filter(i => isDefined(i)).join(','),
          names: names.join(','),
        }),
        headers: {
          'content-type': 'application/json',
        },
      }).finally(() => { this.confirmLoading = false })

      if (res.code !== 20010) {
        this.cancelModal()
        message.success('保存成功！')
      }
      else {
        message.error(res.message || res.msg)
      }
    },
  },
}
</script>
