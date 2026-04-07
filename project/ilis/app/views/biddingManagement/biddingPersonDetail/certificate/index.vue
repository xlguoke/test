<template>
  <div style="padding: 15px 0; padding-top: 5px">
    <a-spin :spinning="spinning">
      <div>
        <div
          v-for="item in data"
          :key="item.id"
          style="padding: 10px 0; border-bottom: solid 1px #e2e2e2"
        >
          <div style="font-size: 14px">
            <span style="color: #000; font-weight: bold">证书编号：{{ item.certificateNumber }}</span>
            <a
              href="javascript:;"
              title="编辑"
              style="font-size: 14px; margin-left: 5px"
              class="text-blue-500"
              @click="edit(item)"
            >
              编辑
            </a>
            <a
              href="javascript:;"
              title="删除"
              style="font-size: 14px; color: red; margin-left: 5px"
              @click="deleteRow(item)"
            >
              删除
            </a>
          </div>
          <a-row style="color: gray">
            <a-col span="12">
              证书类型：{{ item.certificateCategory || '试验检测证书' }}
            </a-col>
            <template v-if="item.certificateCategory === '其他'">
              <a-col span="12">
                专业范围：{{ item.scopeExpertise }}
              </a-col>
              <a-col span="12">
                发证单位：{{ item.issueUnit }}
              </a-col>
              <a-col span="12">
                证书等级：{{ item.certificateGrade }}
              </a-col>
            </template>
            <template v-else>
              <a-col span="12">
                持证专业：{{ item.certificateProfessional }}
              </a-col>
              <a-col span="12">
                持证类型：{{ item.certificateType }}
              </a-col>
            </template>
          </a-row>
          <a-row style="color: gray">
            <a-col span="12">
              <p>证书文件：</p>
              <div v-for="file in item.certificateAttach" :key="file.id">
                <a
                  href="javascript:;"
                  style="text-decoration: underline"
                  :title="file.name"
                  class="text-blue-500"
                  @click="
                    () => {
                      downloadAccessory(file.attachmentId)
                    }
                  "
                >{{ file.name }}</a>
              </div>
            </a-col>
            <a-col v-if="item.certificateCategory === '试验检测证书'" span="12">
              证书有效期：
              <template v-if="item.firstCollectionDate">
                {{ dayjs(item.firstCollectionDate).format('YYYY-MM-DD') }} ~ {{ dayjs(item.expirationDate).format('YYYY-MM-DD') }}
              </template>
            </a-col>
          </a-row>
        </div>
      </div>
    </a-spin>
    <div style="padding-top: 10px">
      <a-button type="primary" @click="addCertificate">
        添加证书
      </a-button>
    </div>
    <EditModal :id="id" ref="EditModal" :callback="getData" />
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { downloadAccessory, getQueryVariable } from '~/providers/common/utils'
import EditModal from './components/editModal.vue'

export default {
  components: {
    EditModal,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      data: [],
      spinning: false,
      downloadAccessory,
      dayjs,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.biddingPerson.certificateList, {
          params: { biddingPersonId: this.id },
        })
        .then((res) => {
          if (res && res.success) {
            this.data = res.obj
          }
          this.spinning = false
        })
    },
    addCertificate() {
      this.$refs.EditModal.showModal()
    },
    edit(data) {
      this.$refs.EditModal.showModal(data)
    },
    deleteRow(data) {
      Modal.confirm({
        title: '删除',
        content: `确认删除证书 ${data.certificateNumber} 的吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .get(window.$oApi.biddingPerson.certificateDelete, {
              params: { id: data.id },
            })
            .then((res) => {
              if (res && res.success) {
                message.success(res.msg || res.message)
                this.getData()
              }
              else {
                message.error(res.msg || res.message)
              }
            })
        },
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
