import { computed, ref } from 'vue'
import type { Column } from '../data-acquisition'

export const dfColumns = [
  {
    displayName: '样品编号',
    filedCode: 'yangpbh',
  },
  {
    displayName: '设备编号',
    filedCode: 'sbbianhao',
  },
  {
    displayName: '设备名称',
    filedCode: 'sbmingcheng',
  },
  {
    displayName: '工程部位',
    filedCode: 'gongcbw',
  },
  {
    displayName: '检测时间',
    filedCode: 'jcshijian',
  },
]
const selDfColumns = [
  {
    displayName: '设备编号',
    filedCode: 'sbbianhao',
  },
  {
    displayName: '设备名称',
    filedCode: 'sbmingcheng',
  },
  {
    displayName: '样品编号',
    filedCode: 'yangpbh',
  },
]

export function useDataAcquisition() {
  const search = ref({
    yangpbh: '',
    sbbianhao: '',
    sbmingcheng: '',
    jcshijianStart: '',
    jcshijianEnd: '',
  })
  const pages = ref({
    page: 1,
    size: 10,
  })
  const totalPage = ref(0)
  const columns = ref<any[]>([])
  const selColumns = ref<any[]>([])
  const active = ref('')
  /** 采集项目 */
  const typeDatas = ref<any[]>([])
  /** 采集数据 */
  const datas = ref<any[]>([])
  // 自定义属性 {testTypeCode: []}
  const customProperties: any = {}
  // 已选数据 {testTypeCode: []}
  const selectedDataObj: any = {}
  /** 采集数据用途 */
  const testPurposes: any = {}
  /** 当前采集项目已选数据 */
  const selectedDatas = computed(() => selectedDataObj[active.value] || [])
  /** 所有自定义字段对象 key */
  const fieldsAllObj: Record<string, any> = computed(() => {
    const fields = typeDatas.value[0]?.fieldsAll
    return getFieldsAllObj(fields || [])
  })

  /**
   * ## 格式化搜索条件
   */
  function formatSearch() {
    const selIds = selectedDatas.value.map((item: any) => item.id)
    const param: any = {
      ...search.value,
      ...pages.value,
      isReport: 0,
      selectIds: selIds.join(','),
      testTypeCode: active.value,
    }
    if (param.jcshijianStart)
      param.jcshijianStart = `${param.jcshijianStart} 00:00:00`
    if (param.jcshijianEnd)
      param.jcshijianEnd = `${param.jcshijianEnd} 23:59:59`
    return param
  }

  function initDataColumns(rows: any[]) {
    return rows.map((row) => {
      const lqi = row.lqi ? `龄期：${row.lqi}` : ''
      return {
        text: row.yangpbh + lqi,
        value: row.id,
      }
    })
  }

  /**
   * ## 水泥胶砂抗折与水泥胶砂抗压，水泥净浆抗折与水泥净浆抗压，这两个组合需要进行数据匹配
   */
  function checkDataListType(type1: string, type2: string) {
    const types = typeDatas.value.filter(
      d => d.testTypeCode === type1 || d.testTypeCode === type2,
    )
    if (types.length !== 2)
      return ''

    if (types[0].testTypeCode === active.value) {
      const datas = selectedDataObj[types[1].testTypeCode] || []
      return {
        displayName: types[1].testType,
        filedCode: types[1].testTypeCode,
        valueKey: 'value',
        linkOpts: initDataColumns(datas),
      }
    }
    else {
      const datas = selectedDataObj[types[0].testTypeCode] || []
      return {
        displayName: types[0].testType,
        filedCode: types[0].testTypeCode,
        valueKey: 'value',
        linkOpts: initDataColumns(datas),
      }
    }
  }

  /**
   * ## 初始化已选数据列
   */
  function initSelColumns() {
    const cols: Column[] = [...selDfColumns]
    const d = columns.value.find(d => d.filedName === '试件编号')
    if (d)
      cols.push(d)
    // 数据采集用途
    const purposes: any[] = testPurposes[active.value] || []
    if (purposes.length) {
      cols.push({
        displayName: '数据采集用途',
        filedCode: 'useType',
        valueKey: 'useType',
        isDefault: true,
        linkOpts: purposes.map(d => ({
          text: d.purpose,
          value: d.purpose,
        })),
      })
    }

    // 水泥胶砂抗折与水泥胶砂抗压，水泥净浆抗折与水泥净浆抗压，这两个组合需要进行数据匹配
    if (active.value === '-3' || active.value === '-2') {
      const col = checkDataListType('-3', '-2')
      if (col)
        cols.unshift(col)
    }
    else if (active.value === '-1' || active.value === '1') {
      const col = checkDataListType('-1', '1')
      if (col)
        cols.unshift(col)
    }

    // 自定义属性
    const properties: any[] = customProperties[active.value] || []
    if (properties.length) {
      properties.forEach((p) => {
        cols.push({
          ...p,
          displayName: p.columnName,
          filedCode: p.id,
        })
      })
    }

    selColumns.value = cols
  }

  /**
   * ## 初始化页面数据
   */
  function initPageData() {
    for (let i = 0; i < typeDatas.value.length; i++) {
      const item = typeDatas.value[i]

      // 处理数据采集用户
      testPurposes[item.testTypeCode] = item.useList || []

      // 处理已选择数据
      selectedDataObj[item.testTypeCode] = flatJsonData(item.reportList)
    }
  }

  /**
   * ## 列表数据jsonData平铺处理
   */
  function flatJsonData(rows?: any[]) {
    if (!rows)
      return []
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const jsonData = JSON.parse(row.jsonData || '{}')
      for (const key in jsonData) {
        if (key.toLocaleLowerCase() === 'id')
          continue
        row[key] = jsonData[key]
      }
    }
    return rows
  }

  /**
   * ## 获取fieldsAll，所有对象下都一样，默认取第一个即可
   */
  function getFieldsAllObj(fieldsAll: any[]) {
    const obj: any = {}
    for (let i = 0; i < fieldsAll.length; i++) {
      const item = fieldsAll[i]
      obj[item.filedCode] = item.filedName
    }
    return obj
  }

  /**
   * ## 根据采集项目中的字段中文名格式化对象或数组中的key
   */
  function formatKeyByFields(data: any) {
    if (!data)
      return ''
    if (Array.isArray(data)) {
      const result = []
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        const obj: any = {}
        const keys = Object.keys(item)
        for (let j = 0; j < keys.length; j++) {
          const key = keys[j]
          const value = item[key]
          if (value && typeof value === 'object')
            obj[fieldsAllObj.value[key]] = formatKeyByFields(value)
          else obj[fieldsAllObj.value[key]] = value
        }
        result.push(obj)
      }
      return JSON.stringify(result)
    }
    else {
      const obj: any = {}
      const keys = Object.keys(data)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const value = data[key]
        if (value && typeof value === 'object')
          obj[fieldsAllObj.value[key]] = formatKeyByFields(value)
        else obj[fieldsAllObj.value[key]] = value
      }
      return JSON.stringify(obj)
    }
  }

  /**
   * ## 处理表格显示内容，数据格式为对象、数组、对象数组时显示优化
   */
  function formatTableCellText(item: any, field: string) {
    const fieldType = item.filedType
    const data = item[field]
    if (
      fieldType === 'bean'
      || fieldType === 'list'
      || fieldType === 'beanList'
    ) {
      return formatKeyByFields(data)
    }
    else if (fieldType === 'file') {
      const list = data || []
      return list.map((d: any) => d.fileName)
    }
    else {
      return data || ''
    }
  }

  // 选择检测日期
  const showPicker = ref(false)
  const editKey = ref<'jcshijianStart' | 'jcshijianEnd'>('jcshijianStart')
  const selDateVal = ref('')
  function selStartDate(value: 'jcshijianStart' | 'jcshijianEnd') {
    editKey.value = value
    selDateVal.value = search.value[value]
    showPicker.value = true
  }
  function changeDatePicker(val: string) {
    const s = search.value.jcshijianStart
    const e = search.value.jcshijianEnd

    if (editKey.value === 'jcshijianEnd' && s && val < s) {
      search.value.jcshijianStart = val
      search.value.jcshijianEnd = s
    }
    else if (editKey.value === 'jcshijianStart' && e && val > e) {
      search.value.jcshijianStart = e
      search.value.jcshijianEnd = val
    }
    else if (!s && !e) {
      search.value.jcshijianStart = val
      search.value.jcshijianEnd = val
    }
    else {
      search.value[editKey.value] = val
    }
  }

  /**
   * ## 保存数据
   */
  function saveData() {
    const arr = []
    const listData = []
    const columnList = []

    for (const k in selectedDataObj) {
      const datas = selectedDataObj[k] || []
      const fields = customProperties[k] || []
      for (let i = 0; i < datas.length; i++) {
        const d = datas[i]

        // 采集数据使用类型
        listData.push({
          id: d.id,
          useType: d.useType,
        })

        // 自定义属性
        for (let j = 0; j < fields.length; j++) {
          const f = fields[j]
          columnList.push({
            objectId: d.id,
            columnId: f.id,
            columnValue: d[f.id],
          })
        }

        // 已选项、关联项
        if (d.value)
          arr.push(`${d.id}===${d.value}`)
        else arr.push(d.id)
      }
    }

    // 已选项、关联项 id去重
    const ids: string[] = []
    for (let i = 0; i < arr.length; i++) {
      const id = arr[i]
      if (id.includes('===')) {
        const [did, value] = id.split('===')
        if (!ids.includes(did))
          ids.push(did, value)
        continue
      }
      ids.push(id)
    }

    return { listData, columnList, selectedIds: ids }
  }

  return {
    columns,
    selColumns,
    typeDatas,
    datas,
    selectedDatas,
    search,
    pages,
    totalPage,
    active,
    showPicker,
    selDateVal,
    customProperties,
    initSelColumns,
    initPageData,
    flatJsonData,
    formatSearch,
    formatTableCellText,
    selStartDate,
    changeDatePicker,
    saveData,
  }
}
