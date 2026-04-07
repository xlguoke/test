<template>
  <div class="inspectDetail">
    <van-nav-bar
      title="新增要点"
      left-text="返回"
      left-arrow
      @click-left="$emit('closeCall')"
    >
    </van-nav-bar>

    <van-cell-group>
      <van-field
        v-model="formData.categoryName"
        label="所属大类"
        type="textarea"
        placeholder=""
        rows="1"
        autosize
        required
      />
      <van-field
        v-model="formData.orderNumber"
        label="序号"
        required
        type="number"
        placeholder="请输入序号"
        autosize
      />

      <van-field
        v-model="formData.keypoint"
        label="检查要点"
        required
        type="textarea"
        placeholder="请输入检查要点"
        rows="1"
        autosize
      />
    </van-cell-group>

    <div style="position: fixed; width: 100%; bottom: 0px">
      <van-button
        style="background: #154bd0; color: #ffff; border-color: #154bd0"
        size="large"
        @click="saveData"
      >
        确定
      </van-button>
    </div>
  </div>
</template>

<script>
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  props: ['selCategory'],
  emits: ['closeCall', 'saveEssentialsOk'],
  data() {
    return {
      formData: {
        categoryName: '',
        keypoint: '',
        description: '',
        orderNumber: '',
      },
    }
  },
  mounted() {
    this.formData.categoryName = this.selCategory
      .map((item) => {
        return item.name
      })
      .join('>')
  },
  methods: {
    saveData() {
      if (!this.formData.keypoint) {
        showToast('请输入检查要点')
        return
      }
      else if (!this.formData.orderNumber) {
        showToast('请输入序号')
        return
      }

      $emit(this, 'saveEssentialsOk', this.formData)
    },
  },
}
</script>

<style>
.van-collapse-item__content {
  padding: 0 !important;
}
</style>

<style lang="less" scoped></style>
