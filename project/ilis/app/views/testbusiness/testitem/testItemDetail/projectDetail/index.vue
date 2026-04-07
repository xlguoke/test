<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="projectDetail">
    <div class="projectDetail-title">
      <strong>{{ name || '' }}</strong>
      <span class="projectDetail-title-tag">{{
        status == 1 ? '已结束' : '检测中'
      }}</span>
      <span
        style="color: #1890ff; font-size: 10px; margin-left: 5px"
        @click="isOpen = !isOpen"
      >
        收起项目详情
        <DownOutlined v-if="isOpen" />
        <UpOutlined v-if="!isOpen" />
      </span>
    </div>
    <div v-if="isOpen">
      <div class="projectDetail-info">
        项目简介：{{ description || '' }}
      </div>
      <div class="projectDetail-info">
        项目负责人：<span>{{ person1 }}</span>
        <a-button
          v-permission="'set:person'"

          :disabled="isDetail"
          size="small"
          @click=" setPersonnel('请选择项目负责人', 'person1Ids') "
        >
          设置人员
        </a-button>
      </div>
      <div class="projectDetail-info">
        项目参与人：<span>{{ person2 }}</span>
        <a-button
          v-permission="'set:person'"

          :disabled="isDetail"
          size="small"
          @click=" setPersonnel('请选择项目参与人', 'person2Ids') "
        >
          设置人员
        </a-button>
      </div>
      <div class="projectDetail-info">
        默认编写人：<span>{{ person6 }}</span>
        <a-button
          v-permission="'set:person'"
          :disabled="isDetail"
          size="small"
          @click=" setPersonnel('请选择默认编写人', 'person6Ids') "
        >
          设置人员
        </a-button>
      </div>
      <div class="projectDetail-info">
        默认复核人：<span>{{ person5 }}</span>
        <a-button
          v-permission="'set:person'"

          :disabled="isDetail"
          size="small"
          @click=" setPersonnel('请选择默认复核人', 'person5Ids') "
        >
          设置人员
        </a-button>
      </div>
      <div class="projectDetail-info">
        默认审核人：<span class="selectPersonHtml">{{ person3 }}</span>
        <a-button
          v-permission="'set:person'"
          :disabled="isDetail"

          class="selectPersonBtn"
          size="small"
          @click=" setPersonnel('请选择默认审核人', 'person3Ids') "
        >
          设置人员
        </a-button>
      </div>
      <div class="projectDetail-info">
        默认签发人：<span class="selectPersonHtml">{{ person4 }}</span>
        <a-button
          v-permission="'set:person'"
          :disabled="isDetail"

          class="selectPersonBtn"
          size="small"
          @click=" setPersonnel('请选择默认签发人', 'person4Ids') "
        >
          设置人员
        </a-button>
      </div>
    </div>
    <div class="projectDetail-tab">
      <div class="projectDetail-tab-btn">
        <router-link to="/">
          检测报告
        </router-link>
        <router-link to="/otherAchievement">
          检测方案及成果
        </router-link>
        <router-link to="/appendix">
          附录
        </router-link>
        <router-link to="/contractAndWorks">
          合同段/工程划分
        </router-link>
        <router-link to="/progressManage">
          进度管理
        </router-link>
        <router-link to="/contacts">
          联系人
        </router-link>
        <router-link to="/archiveManage">
          归档管理
        </router-link>
      </div>
      <router-view></router-view>
    </div>
    <PersonSelector
      v-model:show="showPersonSelector"
      :title="personSelectorConfig.title"
      :multiple="personSelectorConfig.multiple"
      :checked-ids="personSelectorConfig.checkedIds"
      api-type="2"
      :params="{
        type: personSelectorConfig.authType,
      }"
      @confirm="confirmPersonSelector"
    />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { getUserFunctionByCode } from '~/api/common'
import PersonSelector from '~/components/PersonSelector.vue'
import { getQueryVariable } from '~/providers/common/utils'
import { $children } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  components: {
    PersonSelector,
    DownOutlined,
    UpOutlined,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      status: getQueryVariable('status'),
      isDetail: getQueryVariable('status') === '1',
      name: decodeURI(getQueryVariable('name')).replace(/_jinghao/g, '#'),
      description: decodeURI(getQueryVariable('description')).replace(
        /_jinghao/g,
        '#',
      ),
      showPersonSelector: false,
      person1: '',
      person1Ids: [],
      person2: '',
      person2Ids: [],
      person3: '',
      person3Ids: [],
      person4: '',
      person4Ids: [],
      person5: '',
      person5Ids: [],
      person6: '',
      person6Ids: [],
      resCode: {
        20000: '请求成功',
        20010: '请求失败',
        21000: '新增成功',
        22000: '修改成功',
        23000: '删除成功',
      },
      isOpen: true,
      personSelectorConfig: {
        title: '请选择人员',
        multiple: true,
        authType: '',
        checkedIds: [],
        idsPerson: '',
      },
      person4Multiple: false,
    }
  },
  async created() {
    this.getPersonInfo()
    this.person4Multiple = await getBusinessParam('REPORT_MANAGE_42') || false
  },
  methods: {
    async checkPerson() {
      const { data } = await getUserFunctionByCode('set:person')
      const hasSetPerson = data.obj.find(d => d.functioncode === 'set:person')
      if (!hasSetPerson) {
        return
      }

      const checkWay = await getBusinessParamValue('project_user_required_config')
      const tipPersons = []

      switch (checkWay) {
        case 'project_user_required_config_02':
          if (!this.person1Ids.length)
            tipPersons.push('【项目负责人】')
          break
        case 'project_user_required_config_03':
          if (!this.person2Ids.length)
            tipPersons.push('【项目参与人】')
          break
        case 'project_user_required_config_04':
          if (!this.person5Ids.length)
            tipPersons.push('【默认复核人】')
          break
        case 'project_user_required_config_05':
          if (!this.person1Ids.length)
            tipPersons.push('【项目负责人】')
          if (!this.person2Ids.length)
            tipPersons.push('【项目参与人】')
          break
        case 'project_user_required_config_06':
          if (!this.person1Ids.length)
            tipPersons.push('【项目负责人】')
          if (!this.person5Ids.length)
            tipPersons.push('【默认复核人】')
          break
        case 'project_user_required_config_07':
          if (!this.person2Ids.length)
            tipPersons.push('【项目参与人】')
          if (!this.person5Ids.length)
            tipPersons.push('【默认复核人】')
          break
        case 'project_user_required_config_08':
          if (!this.person1Ids.length)
            (tipPersons.push('【项目负责人】'))
          if (!this.person2Ids.length)
            tipPersons.push('【项目参与人】')
          if (!this.person5Ids.length)
            tipPersons.push('【默认复核人】')
          break
        default:
          break
      }

      if (tipPersons.length > 0) {
        Modal.warning(window.$oMsgTips.info(`请设置${Array.from(new Set(tipPersons)).join('、')}！`))
      }
    },
    /** 根据职能权限获取人员列表 */
    personAuthType(idsPerson) {
      let type = ''
      if (idsPerson === 'person5Ids') {
        type = '222212'
      }
      else if (idsPerson === 'person3Ids') {
        type = '222213'
      }
      else if (idsPerson === 'person4Ids') {
        type = '222214'
      }
      return type
    },
    getPersonInfo() {
      window.$oRest
        .get(`${window.$oApi.testItem.setPerson}/${this.id}`)
        .then((res) => {
          if (res && res.code) {
            if (res.data && Array.isArray(res.data)) {
              // eslint-disable-next-line array-callback-return
              res.data.map((item) => {
                if (item.personType == 1) {
                  this.person1 += `${item.personName}; `
                  this.person1Ids.push({
                    id: item.personId,
                    name: item.personName,
                  })
                }
                else if (item.personType == 2) {
                  this.person2 += `${item.personName}; `
                  this.person2Ids.push({
                    id: item.personId,
                    name: item.personName,
                  })
                }
                else if (item.personType == 3) {
                  this.person3 += `${item.personName}; `
                  this.person3Ids.push({
                    id: item.personId,
                    name: item.personName,
                  })
                }
                else if (item.personType == 4) {
                  this.person4 += `${item.personName}; `
                  this.person4Ids.push({
                    id: item.personId,
                    name: item.personName,
                  })
                }
                else if (item.personType == 5) {
                  this.person5 += `${item.personName}; `
                  this.person5Ids.push({
                    id: item.personId,
                    name: item.personName,
                  })
                }
                else if (item.personType == 6) {
                  this.person6 += `${item.personName}; `
                  this.person6Ids.push({
                    id: item.personId,
                    name: item.personName,
                  })
                }
              })
              if (!this.isDetail) {
                this.checkPerson()
              }
            }
          }
          else {
            Modal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
    },
    setPersonnel(title, idsPerson) {
      const authType = this.personAuthType(idsPerson)
      const persons = this[idsPerson] || []
      let multiple = true
      if (idsPerson === 'person4Ids') {
        multiple = this.person4Multiple
      }
      this.personSelectorConfig = {
        title,
        idsPerson,
        authType,
        multiple,
        checkedIds: persons.map(d => d.id),
      }
      this.showPersonSelector = true
    },
    getPersonType(idsPerson) {
      let personType
      if (idsPerson == 'person1Ids') {
        personType = 1
      }
      else if (idsPerson == 'person2Ids') {
        personType = 2
      }
      else if (idsPerson == 'person3Ids') {
        personType = 3
      }
      else if (idsPerson == 'person4Ids') {
        personType = 4
      }
      else if (idsPerson == 'person5Ids') {
        personType = 5
      }
      else if (idsPerson == 'person6Ids') {
        personType = 6
      }
      return personType
    },
    confirmPersonSelector(acceptData) {
      // person1: '选择项目负责人', person1Ids
      // person2: '选择项目参与人',person2Ids
      // person3: '选择默认审核人',person3Ids
      // person4: '选择默认签发人',person4Ids
      // person5: '选择默认复核人',person5Ids
      // person6: '选择默认编写人',person6Ids
      this.showPersonSelector = false

      const { idsPerson } = this.personSelectorConfig
      const personType = this.getPersonType(idsPerson)

      const selectData = acceptData.map(item => ({
        personType,
        projectId: this.id,
        personName: item.name,
        personId: item.id,
      }))
      const data = {}
      data.personList = selectData
      data.projectId = this.id
      data.personType = personType
      window.$oRest({
        method: 'POST',
        url: window.$oApi.testItem.setPerson,
        data,
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res && res.code) {
          message.success(res.message)
          if (personType) {
            const nameArr = acceptData.map(item => item.name)
            this[`person${personType}`] = nameArr.join(';')
            this[idsPerson] = acceptData
          }
          // eslint-disable-next-line array-callback-return
          $children(this).map((item) => {
            item.$route.path == '/contractAndWorks'
            && item.getData
            && item.getData()
          })
        }
        else {
          Modal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
