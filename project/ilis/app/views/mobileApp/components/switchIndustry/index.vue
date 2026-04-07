<template>
  <div>
    <div v-if="industryList.length > 1" class="industry-switch" @click="open">
      <slot>
        {{ industryData.name }}
        <van-icon name="exchange" />
      </slot>
    </div>

    <van-popup
      v-model:show="visible"
      position="right"
      teleport="body"
      :style="{ height: '100%', width: '90%' }"
    >
      <div class="i-wrap">
        <div class="i-wrap-body">
          <div class="i-wrap-select">
            <span>领域：</span>
            <select v-model="useIndustryId" @change="onChangeIndustry">
              <option v-for="item in industryList" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
        </div>
        <ActionBar :fixed="false">
          <van-button square @click="cancel">
            取消
          </van-button>
          <van-button type="primary" square @click="ok">
            确定
          </van-button>
        </ActionBar>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { Popup, Toast } from 'vant'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppIndustryStore } from '~/views/mobileApp/store/useAppIndustryStore'

export default {
  components: {
    ActionBar,
    [Popup.name]: Popup,
  },
  emits: ['onOk'],
  data() {
    return {
      visible: false,
      treeData: [],
      filterOptions: [
        { label: '按样品查询', value: 'sample' },
        { label: '按参数查询', value: 'param' },
        { label: '按规程查询', value: 'standard' },
        { label: '按附注查询', value: 'note' },
      ],
      query: {
        queryType: 'sample',
        queryParam: '',
      },
      activeId: null,
      selected: null,
      useIndustryId: '',
    }
  },
  computed: {
    ...mapState(useAppIndustryStore, ['industryList', 'industryData', 'industryId']),
  },
  methods: {
    open() {
      this.visible = true
      this.useIndustryId = this.industryId
      this.getBigcategory()
    },
    onChangeIndustry() {
      this.query.queryParam = ''
      this.getBigcategory()
    },
    async getBigcategory() {
      return

      const toast = Toast.loading({
        duration: 0,
        forbidClick: true,
        message: '加载中...',
      })

      let api = 'bigCategoryController.do?comboTreeSync'
      if (this.query.queryParam) {
        api = 'bigCategoryController.do?comboTreeSyncByName'
      }

      const res = await mRequest(api, {
        params: {
          page: 1,
          size: 9999,
          queryType: this.query.queryType,
          queryParam: this.query.queryParam,
          name: this.query.queryParam,
        },
        headers: {
          industryid: this.useIndustryId,
        },
      }).finally(() => {
        toast.clear()
      })

      this.treeData = this.formatTreeNode(res)
    },
    formatTreeNode(data) {
      const arr = []

      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        const children = item.children || []
        item.expand = false

        if (children.length > 0) {
          item.children = this.formatTreeNode(children)
        }

        arr.push(item)
      }

      return arr
    },
    onSelect(item) {
      this.selected = item
      this.activeId = item ? item.id : null
    },
    onExpand(item) {
      item.expand = !item.expand
    },
    ok() {
      const { setIndustryId } = useAppIndustryStore()
      setIndustryId(this.useIndustryId)
      this.$emit('onOk', this.selected)
      this.cancel()
    },
    cancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.industry-switch {
  display: flex;
  align-items: center;
  gap: 4px;

  .van-icon {
    font-size: 16px;
  }
}

.i-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #666;

  select {
    border: solid 1px #e2e2e2;
    height: 32px;
    padding: 0 8px;
    outline: none;
  }

  .i-wrap-select {
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: solid 1px #e2e2e2;
    padding-bottom: 16px;
    margin-bottom: 16px;

    select {
      flex: 1;
    }
  }

  .i-wrap-filter {
    display: flex;
    align-items: center;
    gap: 8px;

    .van-search {
      padding: 0;
      border: solid 1px #e2e2e2;

      .van-cell {
        padding-top: 4px!important;
        padding-bottom: 4px!important;
      }

      .van-search__content {
        background: #fff;
      }
    }
  }

  .i-wrap-tree {
    flex: 1;
    overflow-y: auto;
    margin-top: 16px;
    height: 0;
  }

  .i-wrap-body {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: 0;
  }
}
</style>
