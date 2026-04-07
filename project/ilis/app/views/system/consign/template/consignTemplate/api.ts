// 接口地址
const api = {
  // 获取资质类型
  getQualifications: '/rest/common-body/qualification/list',
  // 获取检测类别
  getCheckType: '/checkTypeController.do?getAll',
  // 查询种类编号
  getSnCategoryUser: '/tSnCategoryController.do?getSnCategoryUser',
  // 委托自定义属性
  getConsignCustom: 'rest/common/custom-properties?customizeType=consign-property',
  // 获取默认配置
  getConfig: '/systemController/getConsignInfoTemplate.do',
  // 保存委托信息默认值
  saveConfig: '/systemController/saveConsignInfoTemplate.do',
  // 获取样品来源
  getSampleSource: '/systemController.do?typeGrid',
  // 保存布局信息
  saveLayout: '/systemController/saveConsignInfoLayoutTemplate.do',
  // 获取布局信息
  getLayout: 'systemController/getConsignInfoLayoutTemplate.do',
}

export default api
