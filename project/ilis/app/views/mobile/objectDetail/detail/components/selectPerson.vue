<template>
  <div>
    <a-drawer
      title="选择审核人员"
      placement="right"
      :closable="false"
      :visible="visible"
      width="90%"
      wrap-class-name="sampleManageApp-selectPerson"
      @close="onClose"
    >
      <div class="sampleManageApp-selectPerson-list">
        <a-tree :tree-data="treeData" default-expand-all @select="onSelect">
          <template #smile>
            <SmileOutlined />
          </template>
          <template #meh>
            <SmileOutlined />
          </template>
          <template #custom="{ selected }">
            <FrownOutlined v-if="selected" />
            <FrownOutlined v-else />
          </template>
        </a-tree>
      </div>
      <div class="sampleManageApp-selectPerson-btn text-right">
        <a-button @click="onClose">
          取消
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { FrownOutlined, SmileOutlined } from '@ant-design/icons-vue'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'

export default {
  components: {
    FrownOutlined,
    SmileOutlined,
  },
  props: ['callback'],
  data() {
    return {
      treeData: [],
      visible: false,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      mAjax({
        url: mApi.sampleManageApp.person,
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.rows) {
          this.treeData = this.formatData(res.rows)
        }
        else {
          message.warn(res.msg)
        }
      })
    },
    formatData(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length != 0) {
          children = this.formatData(data[i].children)
        }
        arr.push({
          ...data[i],
          value: data[i].id,
          title: data[i].name,
          key: data[i].id,
          disabled: data[i].type == 'DEPART',
          children,
        })
      }
      return arr
    },
    showDrawer() {
      this.visible = true
    },
    onClose() {
      this.visible = false
    },
    onSelect(value, item) {
      const data = item.node.dataRef
      this.callback({
        id: data.id,
        name: data.name,
      })
      this.onClose()
    },
  },
}
</script>

<style lang="less" scoped>
.sampleManageApp-selectPerson {
  .ant-drawer-wrapper-body {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;

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
      padding: 10px 0 0 15px;
    }

    .ant-tree {
      font-size: 14px;
    }
  }

  .sampleManageApp-selectPerson-list {
    flex: 1;
    overflow-y: auto;
  }

  .sampleManageApp-selectPerson-btn {
    height: 40px;
    text-align: right;
    padding-right: 15px;
  }
}
</style>
