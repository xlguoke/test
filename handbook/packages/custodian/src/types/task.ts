import { z } from 'zod'
import { Validator as basic } from './basic'

const standard = z.object({
  baseStandardId: z.string(),
  baseStandardName: z.string(),
  baseStandardUseType: z.union([z.literal('1'), z.literal('2'), z.literal('3')]),
  publishCode: z.string().optional(),
})

const param = z.object({
  testTaskId: z.string(),
  testItemId: z.string(),
  testItemName: z.string(),
  testTaskParamId: z.string(),
  testObjectParamId: z.string(),
  testParamId: z.string(),
  testParamName: z.string(),
  testParamDisplayName: z.string(),
  standards: z.array(standard).nullable(),
})

const recordset = z.object({
  testTaskId: z.string(),
  testObjectId: z.string(),
  name: z.string(),
  xml: z.string(),
})

const template = z.object({
  udrId: z.string(),
  testItemId: z.string(),
  templateType: z.union([z.literal('1'), z.literal('2'), z.literal('3')]),
  appTemplates: z.array(basic.appTemplate),
})

const task = z.object({
  testTaskId: z.string(),
  testObjectId: z.string(),
  taskCreateTime: z.string(),
  testTaskCode: z.string(),
  hitekServer: z.string(),
  reportDate: z.string().nullable(),
  testObjectCode: z.string().nullable().optional(),
  qualification: z.string().nullable().optional(),
  sampleId: z.string().optional(),
  sampleName: z.string().optional(),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  unitProjectId: z.string().optional(),
  unitProjectName: z.string().optional(),
  taskRecordSets: z.array(recordset).min(1),
  taskAppTemplates: z.array(template).min(1),
  taskParams: z.array(param).min(1),
})

export type Task = z.infer<typeof task>
export type Param = z.infer<typeof param>
export type Standard = z.infer<typeof standard>
export type Recordset = z.infer<typeof recordset>
export type Template = z.infer<typeof template>
export const Validator = { task }
