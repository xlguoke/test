<template>
  <div>
    <div>
      <a-card title="中心数据脚本信息" style="width: 260px">
        <a-spin :spinning="loading">
          <div class="spin-content">
            <p class="card-line">
              当前数据脚本版本
              <a-tag color="#108ee9">
                v.{{ databaseVersion }}
              </a-tag>
            </p>
            <p class="card-line">
              中心数据脚本版本
              <a-tag color="#87d068">
                v.{{ scriptVersion }}
              </a-tag>
            </p>
            <p class="card-line">
              升级至：
              <a-input-number
                id="inputNumber"
                v-model:value="selectVersion"
                :min="databaseVersion"
                :max="scriptVersion"
                @change="onChange"
              />
            </p>
            <p class="card-line">
              <a-button
                type="primary"
                :disabled="!canExecute"
                @click="handleUpdate"
              >
                开始升级
              </a-button>
            </p>
          </div>
        </a-spin>
      </a-card>
    </div>
    <a-divider>Process Log</a-divider>
    <a-list item-layout="horizontal" :data-source="data" :loading="loading">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta :description="item.script">
            <template #title>
              <span style="font-weight: bold">
                {{ item.remark }}
                <span
                  style="color: #7fa6e0; font-size: 12px; font-weight: lighter"
                >{{ item.createName }}</span>
              </span>
            </template>
          </a-list-item-meta>
          <div>
            <div style="margin-right: 10px">
              <CheckOutlined
                v-if="item.executed === 1"
                :style="{ color: '#42b307' }"
              />
              <CloseOutlined
                v-else-if="item.executed === 2"
                :style="{ color: '#e80b3e' }"
              />
              <ClockCircleOutlined v-else />
            </div>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script>
import { CheckOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons-vue'

export default {
  components: {
    CheckOutlined,
    ClockCircleOutlined,
    CloseOutlined,
  },
  data() {
    return {
      data: [],
      databaseVersion: 0,
      scriptVersion: 0,
      selectVersion: 0,
      loading: false,
    }
  },
  computed: {
    canExecute() {
      return this.databaseVersion < this.selectVersion
    },
  },
  async mounted() {
    await this.versionGetter()
  },
  methods: {
    handleUpdate() {
      this.loading = true
      window.$oAjax
        .post(`/rest/data-script/actions/update/${this.selectVersion}`)
        .then((res) => {
          this.loading = false
          this.data = res
        })
        .catch(() => {
          window.$oAntdModal.warning(window.$oMsgTips.info('升级数据库失败'))
          this.loading = false
        })
    },
    async versionGetter() {
      const res = await window.$oAjax.get('/rest/data-script/version')
      const { databaseVersion, scriptVersion } = res
      this.databaseVersion = databaseVersion
      this.scriptVersion = scriptVersion
      this.selectVersion = scriptVersion
    },
    onChange(val) {
      if (val > this.scriptVersion) {
        window.$oAntdModal.warning(window.$oMsgTips.info('怎么可能？！不要乱搞'))
        this.selectVersion = this.scriptVersion
      }
    },
  },
}
</script>

<style>
.spin-content .card-line {
  margin-top: 10px;
}
</style>
