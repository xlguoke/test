<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '90%', height: '100%' }"
      :show="visible"
    >
      <div class="select-item">
        <MobileTitleBar title="引用检校计划" />
        <div class="select-item-list">
          <van-tree-select
            v-model:active-id="eqChecked"
            v-model:main-active-index="planIndex"
            :items="planList"
            height="100%"
          />
          <van-empty v-if="planList.length === 0" description="暂无数据" />
        </div>

        <div class="select-item-btns">
          <van-button block square @click="onCancel">
            关闭
          </van-button>
          <van-button type="primary" block square @click="onOk">
            确定
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
  },
  emits: ['select'],
  data() {
    return {
      planList: [],
      planIndex: null,
      eqChecked: [],
      visible: false,
    }
  },
  watch: {
    planIndex() {
      if (this.visible) {
        this.eqChecked = []
        this.getEqList()
      }
    },
  },
  methods: {
    open() {
      this.getPlanList()
      this.visible = true
    },
    async getPlanList() {
      const formData = new FormData()
      formData.append('page', 1)
      formData.append('rows', 999)

      const toastLoading = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest
        .post('/rest/checkPlanController.do?datagrid', formData)
        .finally(() => {
          toastLoading.close()
        })

      this.planList = res.rows.map(item => ({
        id: item.id,
        text: item.name,
        children: [],
      }))

      if (this.planList.length) {
        this.planIndex = 0
        this.getEqList()
      }
    },
    async getEqList() {
      if (this.planIndex === null) {
        return
      }

      const planItem = this.planList[this.planIndex]
      if (planItem.children && planItem.children.length) {
        return
      }

      const formData = new FormData()
      formData.append('page', 1)
      formData.append('rows', 999)
      formData.append('planId', planItem.id)

      const toastLoading = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest
        .post('/rest/checkPlanController.do?datagridPlanDetail', formData)
        .finally(() => {
          toastLoading.close()
        })

      planItem.children = res.rows.map(item => ({
        id: item.id,
        text: `${item.name}${item.equipmentSn ? `(${item.equipmentSn})` : ''}`,
        data: item,
      }))
    },
    onCancel() {
      this.visible = false
      this.planList = []
      this.planIndex = null
      this.eqChecked = []
    },
    onOk() {
      if (!this.eqChecked.length) {
        showDialog({
          title: '提示',
          message: '请勾选设备',
        })
        return
      }

      const eqList = this.planList[this.planIndex].children
      const result = eqList
        .filter(i => this.eqChecked.includes(i.id))
        .map(i => ({
          ...i.data,
          id: i.data.equipmentId,
        }))
      $emit(this, 'select', result)
      this.onCancel()
    },
  },
}
</script>

<style lang="less" scoped>
.van-sidebar-item--select::before {
  background-color: #154bd0;
}
.van-tree-select__item--active {
  color: #154bd0;
}
.select-item {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.select-item-btns {
  width: 100%;
  display: flex;
  .van-button {
    flex: 1;
    height: 46px;
    line-height: 46px;
  }
}
.select-item-list {
  flex: 1;
  overflow-y: auto;
}
</style>
