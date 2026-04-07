import { z } from 'zod'

/** 功能室 */
const Laboratory = z.object({
  maxTemperature: z.number().nullable(),
  minConHum: z.number().nullable(),
  showReallyTH: z.boolean(),
  accessControlEquipmentSn: z.string().nullable(),
  orderNum: z.number().nullable(),
  biddingPersonIds: z.array(z.any()),
  remark: z.string().nullable(),
  type: z.string().nullable(),
  isLaboratory: z.string().nullable(),
  minHumidity: z.number().nullable(),
  iotEqId: z.string().nullable(),
  minTemperature: z.number().nullable(),
  id: z.string(),
  basicFuncDesc: z.string().nullable(),
  otherLiabilityPersons: z.string().nullable(),
  overview: z.string().nullable(),
  maxConHum: z.number().nullable(),
  departIds: z.string().nullable(),
  labDutyPersonId: z.string().nullable(),
  labDutyPerson: z.string().nullable(),
  departNames: z.string().nullable(),
  name: z.string(),
  maxHumidity: z.number().nullable(),
  applicableParam: z.string().nullable(),
  maxConTem: z.string().nullable(),
  displayScreenNum: z.string().nullable(),
  minConTem: z.number().nullable(),
  equAmount: z.number().nullable(),
  biddingPersonNames: z.array(z.any()),
})

export const LaboratoryRes = z.object({
  obj: z.object({
    count: z.number(),
    rows: z.array(Laboratory),
  }),
})

export type LaboratoryEntity = z.infer<typeof Laboratory>
