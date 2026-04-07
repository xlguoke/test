<template>
  <div class="setting">
    <ul>
      <li>
        <a-row>
          <a-col span="18">
            <div class="setting-title">
              账户密码
            </div>
            <div class="setting-info">
              当前密码强度：<span class="setting-low">低</span>
            </div>
          </a-col>
          <a-col span="6" style="padding-top: 10px; text-align: right">
            <a-button type="link">
              <ChangePassword :catalog="{ text: '修改' }" />
            </a-button>
          </a-col>
        </a-row>
      </li>
    </ul>
  </div>
</template>

<script>
import ChangePassword from '~/components/changePassword/index.vue'

export default {
  components: {
    ChangePassword,
  },
  data() {
    return {
    }
  },
  methods: {
  },
}
</script>

<style lang="less" scoped>
.setting {
  .setting-title {
    color: #333;
    font-weight: bold;
  }

  .setting-info {
    color: #aaa;
  }

  .setting-low {
    color: red;
  }

  ul {
    padding-top: 15px;

    li {
      padding: 15px 0;
      border-bottom: solid 1px #e2e2e2;
    }
  }
}
</style>
