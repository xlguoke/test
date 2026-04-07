<template>
  <div>
    <van-popup
      duration="0.2" position="right" :style="{ width: '90%', height: '100%' }" :show="value"
      class="selectEquipment"
    >
      <div class="selectEquipment-wrap">
        <MobileTitleBar left-arrow left-text="关闭" :title="title || '选择设备'" @click-left="onCancel" />
        <van-row class="equipment-row">
          <van-col span="12" @click="openScreen(1)">
            <van-icon size="18" name="filter-o" />
            筛选
          </van-col>
          <van-col span="12" @click="openScreen(2)">
            <van-icon size="18" class-prefix="iconfont" name="sort" />排序
          </van-col>
        </van-row>

        <div class="selectEquipment-list">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <div v-for="item in list" :key="item.id" class="eq-box" @click="onSelect(item)">
              <div class="selectEquipment-row">
                <div class="selectEquipment-content">
                  <b
                    @click.stop="$router.push({
                      name: 'equipmentDetail',
                      params: {
                        id: item.id,
                      },
                    })"
                  >{{ item.name }}</b>
                  <p>设备编号：{{ item.equipmentSn }}</p>
                  <p>规格型号：{{ item.standard }}</p>
                </div>
                <div class="selectEquipment-radio">
                  <van-icon
                    name="checked" size="28" :color="selected.find((i) => i.id === item.id) ? '#1989fa' : '#999'
                    "
                  />
                </div>
              </div>
              <div v-if="subEqMap[item.id] && subEqMap[item.id].length" class="sub-eq" @click.stop>
                <div
                  v-for="subItem in subEqMap[item.id]" :key="`sub${subItem.id}`" class="selectEquipment-row"
                  @click="onSelectSub(subItem)"
                >
                  <div class="selectEquipment-content">
                    <b
                      @click.stop="$router.push({
                        name: 'equipmentDetail',
                        params: {
                          id: subItem.id,
                        },
                      })"
                    >{{ subItem.name }}</b>
                    <p>设备编号：{{ subItem.archiveSn }}</p>
                    <p>规格型号：{{ subItem.standard }}</p>
                  </div>
                  <div class="selectEquipment-radio">
                    <van-icon
                      name="checked" size="28" :color="selSubEq.find((i) => i.id === subItem.id) ? '#1989fa' : '#999'
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </div>
        <div style="height: 50px"></div>

        <div v-show="!buttonHide" class="selectEquipment-btns">
          <van-row>
            <van-col span="12">
              <van-button block type="primary" square @click="onOk">
                确定
              </van-button>
            </van-col>
            <van-col span="12">
              <van-button block square @click="onCancel">
                取消
              </van-button>
            </van-col>
          </van-row>
        </div>
      </div>
    </van-popup>
    <van-action-sheet v-model:show="screenVisible" title="排序" :actions="screenList" :round="false" @select="onSortSelect" />
    <EquipmentSearch v-model:value="searchVisible" :inital-data="moreCondition" :filter="filter" @callback="getMoreSearch" />
  </div>
</template>

<script>
import { showDialog } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import EquipmentSearch from '~/views/mobileApp/views/equipment/components/search.vue'

export default {
  components: {
    EquipmentSearch,
    MobileTitleBar,
  },
  props: ['value', 'title', 'isMultiple', 'field', 'equipmentIds', 'initSelected', 'payload', 'showSubEq', 'filter'],
  emits: ['selectedOk', 'update:value'],
  data() {
    return {
      buttonHide: false,
      list: [],
      loading: false,
      finished: false,
      searchVisible: false,
      screenVisible: false,
      paramIds: '',
      query: {
        quickQryParam: '',
        equipmentIds: '',
        page: 0,
        rows: 10,
      },
      selected: [],
      moreCondition: {},
      screenCondition: {},
      screenList: [
        { name: '默认排序', color: '#154bd0' },
        { name: '设备编号', field: 'equipmentSn' },
        { name: '设备名称', field: 'name' },
      ],
      // 设备子项 {[主设备id]:[子设备1，子设备2]}
      subEqMap: {},
      // 选中的子设备
      selSubEq: [],
    }
  },
  watch: {
    initSelected(val) {
      if (val) {
        this.selected = [...val]
        this.selSubEq = []
      }
    },
  },
  mounted() {
    // 获取原窗口的高度
    const originalHeight = document.documentElement.clientHeight || document.body.clientHeight
    window.οnresize = function () {
      // 键盘弹起与隐藏都会引发窗口的高度发生变化
      const resizeHeight = document.documentElement.clientHeight || document.body.clientHeight
      if (resizeHeight < originalHeight) {
        // 当键盘弹起，在此处操做
        this.popupFun()
      }
      else {
        // 当键盘收起，在此处操做
        this.packFun()
      }
    }
  },
  methods: {
    // 收起
    packFun() {
      this.buttonHide = false
    },
    // 弹出
    popupFun() {
      this.buttonHide = true
    },
    async onLoad() {
      this.query.page += 1

      this.loading = true

      this.query.equipmentIds = this.equipmentIds

      const res = await mRequest.get('equipmentNewController.do?datagrid', {
        params: {
          ...this.query,
          ...this.screenCondition,
          ...this.moreCondition,
          ...this.payload,
        },
      })

      if (res.rows && res.rows.length > 0) {
        this.list = [...this.list, ...res.rows]
        if (this.showSubEq) {
          await Promise.all(res.rows.map((i) => {
            return this.getSubEq(i.id)
          }))
        }
      }

      if (res.rows && res.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.totalCount) {
        this.finished = true
      }
      if (res.msg) {
        this.paramIds = res.msg
      }
    },
    async getSubEq(chiefEqId) {
      const { code, data } = await mRequest.get(`/rest/equipment/pack/suit/${chiefEqId}`)
      if (code === 20000) {
        this.subEqMap[chiefEqId] = data || []
      }
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    onOk() {
      if (this.selected.length === 0 && this.selSubEq.length === 0) {
        showDialog({ message: '请选择设备！' })
        return
      }
      // eslint-disable-next-line array-callback-return
      this.selected.map((s) => {
        s.paramIds = this.paramIds
      })
      let selArr = this.selected.concat(...this.selSubEq)
      // selArr去掉id相同的设备
      selArr = selArr.filter((item, index) => {
        return selArr.findIndex(i => i.id === item.id) === index
      })
      this.$emit('selectedOk', selArr)
      this.onCancel()
    },
    onCancel() {
      this.$emit('update:value', false)
    },
    onSelect(row) {
      if (this.isMultiple === true) {
        if (!this.selected.find(item => item.id === row.id)) {
          this.selected = [...this.selected, row]
        }
        else {
          this.selected = this.selected.filter(item => item.id !== row.id)
        }
      }
      else {
        this.selected = [row]
      }

      // 全选/反选子设备
      if (this.showSubEq) {
        if (this.selected.find(item => item.id === row.id)) {
          this.selSubEq.push(...this.subEqMap[row.id])
        }
        else {
          this.selSubEq = this.selSubEq.filter((item) => {
            const unSelArr = this.subEqMap[row.id].map(i => i.id)
            return !unSelArr.includes(item.id)
          })
        }
      }
    },
    onSelectSub(row) {
      if (!this.selSubEq.find(item => item.id === row.id)) {
        this.selSubEq = [...this.selSubEq, row]
      }
      else {
        this.selSubEq = this.selSubEq.filter(item => item.id !== row.id)
      }
    },
    openScreen(type) {
      if (type === 1) {
        this.searchVisible = !this.searchVisible
      }
      else if (type === 2) {
        this.screenVisible = true
      }
    },
    // 选择排序
    onSortSelect(row, index) {
      !row.field
        ? (this.screenCondition = {})
        : (this.screenCondition = {
            sort: row.field,
            order: 'asc',
          })

      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[index].color = '#154bd0'

      this.screenVisible = false
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
    },
  },
}
</script>

<style lang="less" scoped>
.selectEquipment {
  .selectEquipment-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .selectEquipment-btns {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 46px;

    .van-button {
      height: 46px;
      line-height: 46px;
    }
  }

  .selectEquipment-list {
    flex: 1;
    overflow-y: auto;

    .eq-box {
      border: solid 1px #e2e2e2;
      margin: 10px;
    }

    .sub-eq {
      padding: 10px 0 10px 40px;
      border-top: 1px solid #e2e2e2;

      .selectEquipment-row {
        border-radius: 8px;
        border: solid 1px #e2e2e2;
      }
    }

    .selectEquipment-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 15px;
      color: #666;

      .selectEquipment-content {
        padding-right: 10px;
      }

      .selectEquipment-radio {
        display: flex;
        align-items: center;
      }

      p {
        color: #888;
        word-break: break-all;
      }
    }
  }
}

.equipment-row {
  .van-col {
    padding: 10px 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    border-bottom: solid 1px #f5f5f5;
    color: #777;

    .iconfont {
      margin-right: 4px;
    }
  }
}
</style>
