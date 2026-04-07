/* eslint-disable regexp/strict */
import type { IConsignSamples, IParseScriptPriceParam } from '../interface'
import { consignMapper, objectMapper } from './scriptFeeMapper'

/** ## 解析脚本 */
export function parseScript(rawScript: any, object: IConsignSamples, consignParam: IParseScriptPriceParam) {
  // eslint-disable-next-line regexp/no-escape-backspace
  const draw = rawScript.replace(/if\(|else|\){|[{}\b\n\r=<>*&|;]/g, ' ')
  const variableSet2 = draw.split(' ')
  const variableSet = variableSet2.filter((item: any, index: number, arr: any[]) => {
    const item1 = item && item.trim()
    return arr.indexOf(item1) === index
  })
  for (let v of variableSet) {
    let fieldValue = null
    if (v) {
      v = v.trim()
      if (!Number.isNaN(Number(v))) {
        continue
      }
      const ps = v.split('.')
      if (ps.length === 1 && v === '参数价格') {
        rawScript = replaceField(rawScript, v, 'scriptPrice')
      }
      else if (ps.length === 2) {
        if (ps[0] === '委托') {
          fieldValue = getPossibleFieldValueFromConsignInfo(ps[1], consignParam)
        }
        else {
          fieldValue = getPossibleFieldValueFromObjectInfo(ps[1], object)
        }
      }
      else {
        const value = getPossibleConditionValueFromMergedData(v, consignParam)
        if (v !== value) {
          rawScript = replaceField(rawScript, v, parseStringValue(value))
        }
        else {
          rawScript = replaceField(rawScript, `${value}(?!')`, parseStringValue(value))
        }
      }
    }
    if (fieldValue !== null) {
      if (!v.includes('(')) {
        rawScript = replaceField(rawScript, v, parseStringValue(fieldValue))
      }
      else {
        rawScript = rawScript.replace(v, parseStringValue(fieldValue))
      }
    }
  }
  return rawScript.replace(/[\n\r\t]/g, ' ')
}

function replaceField(rawStr: string, field: string, replaceFieldStr: string) {
  try {
    return rawStr.replace(new RegExp(field, 'g'), replaceFieldStr)
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (err) {
    return rawStr
  }
}

function parseStringValue(value: string) {
  // 空字符串会被Number给搞成0，这里要判断下
  if (value === '') {
    return '\'\''
  }

  const parseVal = Number(value)
  if (!Number.isNaN(parseVal)) {
    return `${parseVal}`
  }
  return `'${value}'`
}

function getPossibleFieldValueFromConsignInfo(fieldName: string, consignParam: IParseScriptPriceParam) {
  const key = determineCorrectKeyViaValue(fieldName, consignMapper)
  const consignFormArray = consignParam.consignInfoArr
  for (let i = 0; i < consignFormArray.length; i++) {
    const item = consignFormArray[i]
    if (key === item.name) {
      return item.value
    }
  }
  return fieldName
}

function determineCorrectKeyViaValue(field: string, object: any) {
  for (const key in Object.entries(object)) {
    const arr = Object.entries(object)[key]
    const k = arr[0]
    const v = arr[1]
    if (field === v) {
      return k
    }
  }
  return field
}

function getPossibleFieldValueFromObjectInfo(fieldName: string, object: any) {
  const key = determineCorrectKeyViaValue(fieldName, objectMapper)
  if (key !== fieldName && Object.prototype.hasOwnProperty.call(object, key)) {
    return object[key]
  }
  const otherInfos = object.otherInfos || []
  for (let i = 0; i < otherInfos.length; i++) {
    const info = otherInfos[i]
    if (fieldName === info.displayName) {
      return info.value
    }
  }
  return fieldName
}

function getPossibleConditionValueFromMergedData(variable: string, consignParam?: IParseScriptPriceParam) {
  const data = {}
  if (consignParam) {
    parseDataArray2Object(data, consignParam.consignFormOptions.qualifications || [])
    parseDataArray2Object(data, consignParam.consignFormOptions.consignUnitProjects || [])
    parseDataArray2Object(data, consignParam.consignFormOptions.snTypeList || [])
    parseDataArray2Object(data, consignParam.consignFormOptions.consignUnit || [])
    parseDataArray2Object(data, consignParam.consignFormOptions.checkType || [])
  }
  return determineCorrectKeyViaValue(variable, data)
}

function parseDataArray2Object(data: any, rows: any[]) {
  if (!rows) {
    return
  }
  for (let i = 0; i < rows.length; i++) {
    const item = rows[i]
    data[item.id] = item.name
  }
  return data
}
