<template>
  <div>
    <a-drawer
      title="选择人员"
      placement="right"
      :closable="false"
      :visible="visible"
      width="90%"
      wrap-class-name="sampleManageApp-selectPerson"
      @close="onClose"
    >
      <div class="sampleManageApp-selectPerson-list">
        <a-input-search
          style="margin-bottom: 8px"
          placeholder="搜索..."
          @change="onChange"
        />
        <a-tree
          :tree-data="gData"
          default-expand-all
          :expanded-keys="expandedKeys"
          :auto-expand-parent="autoExpandParent"
          @select="onSelect"
          @expand="onExpand"
        >
          <template #title="{ title }">
            <span v-if="title.includes(searchValue)">
              {{ title.substr(0, title.indexOf(searchValue)) }}
              <span style="color: #f50">{{ searchValue }}</span>
              {{
                title.substr(title.indexOf(searchValue) + searchValue.length)
              }}
            </span>
            <span v-else>{{ title }}</span>
          </template>
        </a-tree>
      </div>
      <div class="sampleManageApp-selectPerson-btn">
        <a-button @click="onClose">
          取消
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'

let personData = []

export default {
  props: ['callback', 'getDataCb'],
  data() {
    return {
      gData: [],
      visible: false,
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    getData() {
      mAjax({
        url: mApi.sampleManageApp.person,
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.rows) {
          personData = []
          this.gData = this.formatData(res.rows)
          this.gData.map(item => this.expandedKeys.push(item.id))

          this.getDataCb && this.getDataCb(personData)
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

        personData.push({
          ...data[i],
          value: data[i].id,
          title: data[i].name,
          key: data[i].id,
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
    onChange(e) {
      const value = e.target.value
      const expandedKeys = this.gData
        .map((item) => {
          if (item.children.some(it => it.name.includes(value))) {
            return item.id
          }
          return null
        })
        .filter((item, i, self) => item && self.indexOf(item) === i)
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true,
      })
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
