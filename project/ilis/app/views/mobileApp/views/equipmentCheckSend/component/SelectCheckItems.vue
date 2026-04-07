<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '90%', height: '100%' }"
      :show="visible"
    >
      <div class="select-item">
        <MobileTitleBar title="选择检校参数" />
        <div class="select-item-list">
          <van-checkbox-group v-model="checked">
            <div v-for="item in list" :key="item.id" class="select-item-item">
              <van-checkbox :name="item.id" shape="square">
                {{ item.name }}
              </van-checkbox>
            </div>
          </van-checkbox-group>
          <van-empty v-if="list.length === 0" description="暂无数据" />
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
      list: [],
      checked: [],
      eqId: null,
      visible: false,
    }
  },
  methods: {
    open(objectId) {
      this.eqId = objectId
      this.getList(objectId)
      this.visible = true
    },
    async getList(objectId) {
      const formData = new FormData()
      formData.append('page', 1)
      formData.append('rows', 999)

      const toastLoading = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest
        .post('/rest/checkItemController.do?datagrid', formData, {
          params: {
            objId: objectId,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      this.list = res.rows
    },
    onCancel() {
      this.visible = false
      this.list = []
      this.eqId = null
    },
    onOk() {
      if (!this.checked.length) {
        showDialog({
          title: '提示',
          message: '请勾选检校参数',
        })
        return
      }

      $emit(
        this,
        'select',
        this.list.filter(i => this.checked.includes(i.id)),
        this.eqId,
      )
      this.onCancel()
    },
  },
}
</script>

<style lang="less" scoped>
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
  padding: 16px;
  .select-item-item {
    border-radius: 4px;
    border: solid 1px #e2e2e2;
    padding: 8px;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .select-item-row {
    margin: 4px 0;
    display: flex;
    justify-content: space-between;
  }

  .select-item-label {
    width: 100px;
  }

  .select-item-value {
    color: #666;
    flex: 1;
    text-align: right;
  }
}
</style>
