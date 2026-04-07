<template>
  <div>
    <ht-modal
      title="主题详情"
      :open="visible"
      width="100%"
      :centered="true"
      class="dataCollection-detail"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="dataCollection-detail-name">
          {{ data.themeName }}
          <span
            class="dataCollection-detail-tag"
            :style="`background:${
              data.themeStatus === '0' ? '#247abb' : 'gray'
            }`"
          >{{ data.themeStatus === '0' ? '进行中' : '已结束' }}</span>
        </div>
        <div style="padding-top: 15px">
          项目简介：{{ data.themeIntroduction }}
        </div>
        <div>
          负责人：{{
            personData1.map((item) => item.personName).toString()
          }}
        </div>
        <div>
          参与人：{{
            personData2.map((item) => item.personName).toString()
          }}
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      data: {},
      spinning: false,
      personData1: [],
      personData2: [],
      nodeList: [],
    }
  },
  methods: {
    showModal(id) {
      this.getDetailData(id)
      this.visible = true
    },
    getDetailData(id) {
      this.spinning = true
      window.$oAjax({
        method: 'get',
        url: window.$oApi.dataCollection.detail,
        params: {
          id,
        },
        headers: {
          // "X-Requested-With": "XMLHttpRequest"
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          this.data = res.obj
          this.personData1 = res.obj.personList
            .filter(person => person.personType === '1')
            .map(person => ({
              personName: person.personName,
              personId: person.personId,
              personType: '1',
            }))
          this.personData2 = res.obj.personList
            .filter(person => person.personType === '2')
            .map(person => ({
              personName: person.personName,
              personId: person.personId,
              personType: '2',
            }))
          this.nodeList = res.obj.nodeList || []
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less">
.dataCollection-detail {
  .dataCollection-detail-name {
    font-size: 16px;
    font-weight: bold;
  }

  .dataCollection-detail-tag {
    font-size: 12px;
    border-radius: 3px;
    color: #fff;
    display: inline-block;
    padding: 2px 5px;
    margin-left: 5px;
  }

  .ant-modal-body {
    min-height: 300px;
  }
}
</style>
