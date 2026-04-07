<!-- eslint-disable vue/no-unused-refs -->
<template>
  <a-form
    ref="ruleForm"
    :model="formData"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    class="from-box"
  >
    <a-form-item label="选择目标单位:" name="findid">
      <a-select
        v-model:value="formData.findid"
        placeholder="请选择单位"
        allow-clear
        show-search
        :filter-option="filterOption"
        @change="handleChange"
      >
        <a-select-option
          v-for="item in company"
          :key="item.id"
          :value="item.id"
        >
          {{ item.shortName }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="选择目标大类:" class="require">
      <a-tree
        v-if="targetData && targetData.length"
        v-model:checked-keys="formData.target"
        :tree-data="targetData"
        checkable
        class="tree"
        :field-names="{
          children: 'children',
          title: 'name',
          key: '_objectId_',
        }"
      />
      <div v-else class="empty">
        暂无数据
      </div>
    </a-form-item>
    <a-form-item label="选择引用到层级:" name="targetCategoryId">
      <a-tree-select
        v-model:value="formData.targetCategoryId"
        :tree-data="treeData"
        :dropdown-style="{ maxHeight: '200px', overflow: 'auto' }"
        placeholder="请选择大类"
        allow-clear
        :field-names="{
          children: 'children',
          label: 'name',
          value: 'id',
        }"
      />
    </a-form-item>
    <!-- <button @click="onSubmit">提交</button> -->
  </a-form>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import { allowedNnits, byunit, getLevel } from '../api'

export default {
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      formData: {
        findid: undefined,
        target: [],
        targetCategoryId: undefined,
      },
      rules: {
        findid: [
          { required: true, message: '请选择目标单位', trigger: 'change' },
        ],
        targetCategoryId: [
          { required: true, message: '请选择引用到层级', trigger: 'change' },
        ],
      },
      company: [],
      targetData: [],
      treeData: [],
      initData: [],
    }
  },
  created() {
    // const id = getQueryVariable('id') || ''
    // if (id) {
    //   this.formData.targetCategoryId = id
    // }
    const paramVersionId = getQueryVariable('paramVersionId') || ''
    this.getLevelData({
      paramVersionId,
    })
    this.allowedNnits()
  },
  mounted() {
    window.onSubmit = this.onSubmit
  },
  methods: {
    async getLevelData(data) {
      const result = await getLevel(data)
      if (result && Array.isArray(result) && result.length) {
        this.treeData = result[0].children || []
        const id = getQueryVariable('id') || ''
        if (id) {
          this.formData.targetCategoryId = id
        }
      }
    },
    async allowedNnits() {
      const result = await allowedNnits()
      if (result.code == 20000) {
        this.company = result.data || []
      }
    },
    // 递归循序处理扁平化
    platFn(list) {
      let res = []
      res = list.concat(
        ...list
          .map((item) => {
            if (Array.isArray(item.children) && item.children.length > 0) {
              return this.platFn(item.children)
            }
            return null
          })
          .filter(o => Array.isArray(o) && o.length > 0),
      )
      return res
    },
    // 设置唯一标识id
    setObjectId(data) {
      data.forEach((item) => {
        if (item.children && item.children.length) {
          this.setObjectId(item.children)
        }
        item._objectId_ = Math.random().toString(36).slice(7)
      })
    },
    // 提交回调的函数
    onSubmit() {
      const { findid, targetCategoryId, target } = this.formData
      let reset = []
      if (!findid) {
        window.$oAntdMessage.warning('请选择目标单位')
        return false
      }
      if (target && target.length) {
        let initData = []
        const initDataC = []
        let ids = []
        const arrs = this.initData
        const { target } = this.formData
        // 查找满足的
        initData = arrs.filter(
          item => target.includes(item._objectId_),
        )

        if (initData.length == 1) {
          reset = initData
        }
        if (initData && initData.length > 1) {
          // 收集有children的
          for (let i = 0; i < initData.length; i++) {
            if (!initData[i].children) {
              continue
            }
            initDataC.push(...initData[i].children)
          }
        }

        // 无children 直接赋值
        if (initDataC.length == 0) {
          reset = initData
        }
        else if (initDataC && initDataC.length >= 1) {
          function idsA(data) {
            if (!(data && data.length)) {
              return
            }
            data.forEach((element) => {
              if (element.children) {
                idsA(element.children)
              }

              ids.push(element._objectId_)
            })
          }
          idsA(initDataC)
        }
        if (ids && ids.length) {
          ids = [...new Set(ids)]
          reset = initData.filter(c => !ids.includes(c._objectId_))
        }
      }
      else {
        window.$oAntdMessage.warning('请选择目标大类')
        return false
      }
      if (!targetCategoryId) {
        window.$oAntdMessage.warning('请选择引用到层级')
        return false
      }
      const referenceAllowedUnit = this.company.find(
        item => item.id == findid,
      )
      return {
        categories: reset,
        targetCategoryId,
        referenceAllowedUnit,
        businessKey: Math.random().toString(36).slice(7),
      }
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .includes(input.toLowerCase())
      )
    },
    // 选择的目标id的回调
    async handleChange(value) {
      const findData = this.company.find(item => item.id == value)
      this.formData.target = []
      if (findData) {
        const { unitCode, serverUrl } = findData
        const result = await byunit({
          unitCode,
          serverUrl,
        })
        if (result.code === 20000) {
          if (!(result.data && result.data.length)) {
            return
          }
          // 过滤掉第一级
          if (result.data && result.data[0].id == '8888-8888-8888') {
            this.targetData = result.data[0].children || []
          }
          this.setObjectId(this.targetData)
          this.initData = this.platFn(this.targetData)
        }
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
