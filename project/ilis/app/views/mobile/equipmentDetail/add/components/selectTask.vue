<!-- eslint-disable vue/eqeqeq -->
<template>
  <a-drawer
    title="选择关联任务"
    placement="right"
    :closable="false"
    :visible="visible"
    width="90%"
    class="equipmentDetail-selectTask equipmentOutgo"
    @close="onClose"
  >
    <div class="equipmentDetail-selectTask-list">
      <div
        class="equipmentOutgo-wrap"
        :style="`height:${windowHeight - 48 - 43}px`"
      >
        <a-flex class="p-2">
          <a-input v-model:value="quickQryParam" class="flex-1 mr-2" placeholder="请输入关键字" />
          <a-button type="primary" @click="getData()">
            搜索
          </a-button>
        </a-flex>
        <div class="equipmentOutgo-body equipmentDetail-selectTask-list">
          <ul>
            <li v-for="item in data" :key="item.id" @click="selectRow(item)">
              <div class="equipmentDetail-selectTask-list-left">
                <div>{{ item.testTaskCode }}</div>
                <div>{{ item.projectName }}</div>
                <div>{{ item.testPersons }}</div>
              </div>
              <div class="equipmentDetail-selectTask-list-right">
                <CheckCircleOutlined
                  type="check-circle"
                  :style="`font-size:18px;color:${
                    selectedRows.find((data) => data.id == item.id)
                      ? '#1890ff'
                      : ''
                  }`"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="equipmentDetail-selectTask-btn">
      <a-button
        style="margin-right: 10px"
        @click="
          () => {
            callback(selectedRows)
            onClose()
          }
        "
      >
        确定
      </a-button>
      <a-button @click="onClose">
        取消
      </a-button>
    </div>
  </a-drawer>
</template>

<script>
/* eslint-disable eqeqeq */
import { CheckCircleOutlined } from '@ant-design/icons-vue'
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'

export default {
  components: {
    CheckCircleOutlined,
  },
  props: ['callback'],
  data() {
    return {
      data: [],
      visible: false,
      windowHeight: window.screen.height,
      selectedRows: [],
      quickQryParam: '',
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      mAjax({
        url: mApi.eqEgressList.taskList,
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          page: 1,
          rows: 999,
          sort: 'experience',
          order: 'desc',
          quickQryParam: this.quickQryParam,
        }),
      }).then((res) => {
        if (res && res.rows) {
          this.data = res.rows
        }
        else {
          message.warn(res.msg)
        }
      })
    },
    selectRow(data) {
      let rowIndex = false
      // eslint-disable-next-line array-callback-return
      this.selectedRows.find((item, index) => {
        if (item.id == data.id) {
          rowIndex = index
        }
      })
      if (rowIndex === false) {
        this.selectedRows.push(data)
      }
      else {
        this.selectedRows.splice(rowIndex, 1)
      }
    },
    showDrawer() {
      this.visible = true
    },
    onClose() {
      this.visible = false
      this.quickQryParam = ''
    },
  },
}
</script>

<style lang="less">
.equipmentDetail-selectTask {
  .ant-drawer-header {
    padding: 10px 15px;

    .ant-drawer-title {
      font-size: 14px;
    }
  }

  .ant-drawer-body {
    display: flex;
    flex-direction: column;
    float: 1;
    padding: 0;
  }

  .equipmentDetail-selectTask-btn {
    height: 40px;
    line-height: 40px;
    text-align: right;
    position: fixed;
    bottom: 0;
    left: 40px;
    right: 0;
    background: #eee;
    padding-right: 16px;
  }

  .equipmentDetail-selectTask-list {
    overflow-y: auto;
    ul {
      width: 100%;
    }
    li {
      padding: 10px;
      border-bottom: solid 1px #e2e2e2;
      display: flex;
      align-items: center;
      font-size: 12px;
      .equipmentDetail-selectTask-list-left {
        flex: 1;
        padding-right: 10px;
        width: calc(100% - 40px);
      }

      .equipmentDetail-selectTask-list-right {
        width: 40px;
        text-align: center;

        i {
          font-size: 24px;
        }
      }
    }
  }
}
</style>
