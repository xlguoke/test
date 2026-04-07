import { z } from 'zod'

const identity = z.object({ id: z.string() })

const named = z.object({
  name: z.string(),
  isDeleted: z.coerce.number(),
}).and(identity)

const categorized = z.object({
  displayName: z.string(),
  systemId: z.string().nullable().optional(),
  bigCategoryId: z.string(),
}).and(named)

const sample = z.object({
  pid: z.string().nullable(),
  sampleRequirement: z.string().nullable().optional(),
}).and(categorized)

const param = z.object({
  name: z.string().nullable(),
  displayName: z.string(),
  systemId: z.string().nullable().optional(),
  bigCategoryId: z.string(),
  testItemId: z.string(),
  testItemName: z.string(),
  isTempParam: z.coerce.number(),
  isLocaleItem: z.string().transform<number>(it => it === 'true' ? 1 : 0),
  isDeleted: z.coerce.number(),
}).and(identity)

const sampleParamAndTestItem = z.object({
  testParamId: z.string(),
  testSampleId: z.string(),
  testItemId: z.string(),
})

const standard = z.object({
  standardId: z.string(),
  standardName: z.string(),
  uniqueKey: z.string(),
  publishCode: z.string().nullable().optional(),
  publishDate: z.string().nullable().optional(),
  expireDate: z.string().nullable().optional(),
  clauseCode: z.string().nullable().optional(),
})
/**
 * 综合项目 = t_consign_project.is_synthesis_project = 'synthesis'
 */
const project = z.object({
  createDate: z.string().nullable(),
  projectCode: z.string().nullable(),
  constructionUnitName: z.string().nullable(),
  buildUnitName: z.string().nullable(),
  buildProjectName: z.string().nullable(),
  witnessUnitName: z.string().nullable(),
  description: z.string().nullable(),
  isCompleted: z.coerce.number().nullable(),
  departNames: z.string(),
}).and(named)

const recordset = z.object({
  name: z.string(),
  xml: z.string(),
})

const contractPart = z.object({
  id: z.string(),
  contractPartName: z.string(),
  projectId: z.string(),
  isDelete: z.coerce.number(),
})

const section = z.object({
  id: z.string(),
  belongsId: z.string(),
  unitProjectName: z.string(),
  unitProjectType: z.string().nullable(),
  levelCode: z.string(),
  levelCodeLength: z.number(),
  isDelete: z.coerce.number(),
})

const templateFile = z.object({
  fileName: z.string(),
  filePath: z.string(),
  lastUpdateTime: z.string(),
  createTime: z.string(),
})

const appTemplate = z.object({
  id: z.string(),
  // 1-html;2-android;3-ios;
  type: z.union([z.literal('1'), z.literal('2'), z.literal('3')]),
  name: z.string(),
  filePath: z.string(),
  udrItemId: z.string(),
  lastUpdateTime: z.string(),
  appTemplateFiles: z.array(templateFile),
})

const template = z.object({
  // 模板类型 1-录入模板 2-记录模板 3-报告模板
  templateType: z.union([z.literal('1'), z.literal('2'), z.literal('3')]),
  testItemId: z.string(),
  testItemName: z.string(),
  recordSets: z.array(recordset).optional(),
  appTemplates: z.array(appTemplate),
})

const data = z.discriminatedUnion('type', [
  z.object({ type: z.literal('testSample'), data: z.array(sample), version: z.string(), paramVersionId: z.string() }),
  z.object({ type: z.literal('testParam'), data: z.array(param), version: z.string(), paramVersionId: z.string() }),
  z.object({ type: z.literal('testSampleParam'), data: z.array(sampleParamAndTestItem), version: z.string(), paramVersionId: z.string() }),
  z.object({ type: z.literal('standard'), data: z.array(standard), version: z.string(), paramVersionId: z.string() }),
  z.object({ type: z.literal('project'), data: z.array(project), version: z.string(), paramVersionId: z.string() }),
  z.object({ type: z.literal('synthesisContract'), data: z.array(contractPart), version: z.string(), paramVersionId: z.string() }),
  z.object({ type: z.literal('synthesisUnitProject'), data: z.array(section), version: z.string(), paramVersionId: z.string() }),
  z.object({ type: z.literal('recordSet'), data: z.array(recordset), version: z.string(), paramVersionId: z.string() }),
  z.object({ type: z.literal('template'), data: z.array(template), version: z.string(), paramVersionId: z.string(), hitekServer: z.string() }),
])

export type Sample = z.infer<typeof sample>
export type Param = z.infer<typeof param>
export type Standard = z.infer<typeof standard>
export type Project = z.infer<typeof project>
export type Recordset = z.infer<typeof recordset>
export type SampleParamAndTestItem = z.infer<typeof sampleParamAndTestItem>
export type ContractPart = z.infer<typeof contractPart>
export type Section = z.infer<typeof section>
export type Template = z.infer<typeof template>
export type TemplateFile = z.infer<typeof templateFile>
export type Data = z.infer<typeof data>
export type DataVersion = Omit<z.infer<typeof data>, 'data'>

export const Validator = {
  sample,
  param,
  standard,
  project,
  recordset,
  sampleParamAndTestItem,
  contractPart,
  section,
  template,
  appTemplate,
  templateFile,
  data,
}
