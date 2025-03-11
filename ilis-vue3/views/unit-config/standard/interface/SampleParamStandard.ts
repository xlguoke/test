import type { StandardType } from '~/views/unit-config/standard/api.ts'

export interface BasicSampleParamStandardParam {
  sampleId: string
  paramIds: string[]
}

interface SaveSampleParamBasicItem {
  standardId: string
  selected: boolean
  clauseCode: string
}

interface SaveSampleParamStandardItem extends SaveSampleParamBasicItem {
  basis: SaveSampleParamBasicItem[]
}

export interface SaveSampleParamStandardEntity extends BasicSampleParamStandardParam {
  criteria: SaveSampleParamStandardItem[]
}

export interface SampleParamStandardItemData {
  clauseCode: string
  executeDate?: number
  expireDate?: number
  id: string
  publishCode: string
  repeated: boolean
  sourceType?: number
  standardId: string
  standardName: string
  type: StandardType
  uniqueKey: string
  whetherThisUnit?: string
}

export interface SampleParamStandardItem {
  id: string
  pid: string
  sampleParamId: string
  sampleId: string
  testParamId: string
  selected: boolean
  type: StandardType
  standard: SampleParamStandardItemData
}

export interface SampleParamStandardEntity {
  sampleParamIds: string[]
  criteria: Array<{
    basis: SampleParamStandardItem[]
    standard: SampleParamStandardItem
  }>
}
