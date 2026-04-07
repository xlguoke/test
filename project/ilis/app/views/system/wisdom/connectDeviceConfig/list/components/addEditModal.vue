<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="title"
      :confirm-loading="loading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form
        ref="ruleForm"
        :model="formData"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="智能装置ID" name="id">
          <a-input
            v-model:value="formData.id"
            placeholder="请输入智能装置ID"
            allow-clear
            :disabled="disabledEditInput"
          />
        </a-form-item>
        <a-form-item label="智能装置名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入智能装置名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="MAC地址" name="mac">
          <a-input v-model:value="formData.mac" placeholder="请输入MAC地址" />
        </a-form-item>
        <a-form-item label="设备类型" name="type">
          <a-select
            v-model:value="formData.type"
            placeholder="请选择设备类型"
            allow-clear
          >
            <a-select-option value="EXHIBIT">
              墨水屏
            </a-select-option>
            <a-select-option value="CONTROLLER">
              智能空开
            </a-select-option>
            <a-select-option value="MEASURE">
              量具设备
            </a-select-option>
            <a-select-option value="COLLECT_MAIN">
              主设备
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="formData.type === 'MEASURE'" label="设备配置" name="measureEqType">
          <a-select
            v-model:value="formData.measureEqType"
            placeholder="请选择设备配置"
            allow-clear
            :options="measureEqTypeOptions"
          >
          </a-select>
        </a-form-item>
        <a-form-item v-if="formData.type === 'MEASURE'" label="连接类型" name="connectionType">
          <a-select
            v-model:value="formData.connectionType"
            placeholder="请选择设备连接类型"
            allow-clear
          >
            <a-select-option value="DIRECT">
              直连
            </a-select-option>
            <a-select-option value="BLUETOOTH">
              蓝牙
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" name="descr">
          <a-input
            v-model:value="formData.descr"
            placeholder="请输入备注"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="关联设备编号" name="name1">
          <a-select
            v-model:value="formData.name1"
            placeholder="请选择关联设备编号"
            allow-clear
            :filter-option="filterOption"
            show-search
            @change="handleChange"
          >
            <a-select-option
              v-for="item in namesData"
              :key="item.id"
              :value="item.id"
              :title="item.equipmentSn || item.name"
            >
              {{ item.equipmentSn || item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关联设备名称">
          <a-input v-model:value="findData.name" disabled />
        </a-form-item>
        <a-form-item label="所属功能室">
          <a-input v-model:value="findData.laboratoryName" disabled />
        </a-form-item>
      </a-form>
    </ht-modal>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { add, getByIdData, getDevice, putData } from '../../api/index'

export default {
  emits: ['update'],
  data() {
    return {
      title: '新增',
      visible: false,
      labelCol: { span: 6 },
      wrapperCol: { span: 17 },
      other: '',
      formData: {
        id: undefined,
        name1: undefined,
        descr: undefined,
        type: undefined,
        name: undefined,
        mac: undefined,
        measureEqType: undefined,
        connectionType: undefined,
      },
      rules: {
        id: [{ required: true, message: '请输入智能装置ID', trigger: 'blur' }],
        name1: [
          { required: true, message: '请选择关联设备编号', trigger: 'change' },
        ],
        type: [
          {
            required: true,
            message: '请选择设备类型',
            trigger: 'change',
          },
        ],
        name: [
          { required: true, message: '请输入智能装置名称', trigger: 'blur' },
        ],
      },
      id: undefined,
      findData: {},
      namesData: [],
      loading: false,
      measureEqTypeOptions: [],
    }
  },
  computed: {
    disabledEditInput() {
      return !!this.id
    },
  },
  created() {
    this.getMeasureEqTypeOptions()
  },
  methods: {
    async getMeasureEqTypeOptions() {
      const res = await window.$oAjax({
        url: 'rest/type/getTypesByGroupCode?groupCode=MEASURE_EQ_TYPE',
      })

      if (res.code !== 20010) {
        this.measureEqTypeOptions = res.data.map(item => ({
          label: item.typeName,
          value: item.typeName,
        }))
      }
    },
    showModel(row) {
      this.id = undefined
      this.visible = true
      if (row && row.id) {
        this.id = row.id
        // 编辑
        this.title = '编辑'
        this.getDetail(row)
      }
      else {
        this.title = '新增'
        this.formData = {
          id: undefined,
          name1: undefined,
          descr: undefined,
          type: undefined,
          name: undefined,
          mac: undefined,
          measureEqType: undefined,
          connectionType: undefined,
        }
        this.other = ''
        this.findData = {}
        this.getName()
      }
    },
    async getName() {
      const result = await getDevice()
      if (result.status === 200) {
        this.namesData = result.data.rows || []
      }
      window.$oNextTick(() => {
        if (this.formData.name) {
          const find = this.namesData.find(
            item => item.equipmentSn === this.other,
          )
          if (find) {
            this.formData.name1 = find.id
            this.findData = find
          }
        }
      })
    },
    handleChange() {
      const find = this.namesData.find(item => item.id === this.formData.name1)
      if (find) {
        this.findData = find
      }
    },
    async getDetail(row) {
      const result = await getByIdData(row.id)
      if (result.status === 200) {
        this.formData.id = result.data.id
        this.formData.name = result.data.name
        this.formData.descr = result.data.descr
        this.formData.type = result.data.type
        this.formData.mac = result.data.mac
        this.formData.measureEqType = result.data.measureEqType
        this.formData.connectionType = result.data.connectionType
        this.other = result.data.eqsn
      }
      this.getName()
    },
    filterOption(input, option) {
      const find = this.namesData.find(item => item.id === option.value)
      const sn = find?.equipmentSn || find?.name || ''
      return sn.toLowerCase().includes(input.toLowerCase())
    },
    // 新增
    async handleOk() {
      try {
        this.loading = true
        await this.$refs.ruleForm.validateFields()
        // 编辑
        let result
        const find = this.namesData.find(
          item => item.id === this.formData.name1,
        )
        const body = {
          ...this.formData,
          equipment: {
            name: find.name,
            id: find.id,
          },
        }
        delete body.name1
        try {
          if (this.id) {
            result = await putData({ ...body })
          }
          else {
          // 新增
            result = await add({
              ...body,
            })
          }
          if (result.status === 201 || result.status === 200) {
            this.$refs.ruleForm.resetFields()
            this.visible = false
            window.$oAntdMessage.success('操作成功')
            $emit(this, 'update')
          }
          else {
            window.$oAntdMessage.error(result.message)
          }
        }
        catch (err) {
          window.$oAntdMessage.error(err?.response?.data?.message || err?.message || '保存失败')
        }
        this.loading = false
      }
      catch (err) {
        this.loading = false
        console.warn(err)
      }
    },
    // 取消
    handleCancel() {
      this.visible = false
      this.$refs.ruleForm.resetFields()
      // 重置数据
    },
  },
}
</script>
