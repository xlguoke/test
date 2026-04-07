/// <reference types="jasmine"/>
import type { SaveTask, TaskParam, basic } from 'custodian'
import { executeSql } from 'custodian'
import { faker } from '@faker-js/faker'

export async function countTable(name: string) {
  const rs = await executeSql(`select count(*) as count from ${name}`)
  return rs.rows.item(0).count
}

export function gen<R>(generator: () => R, amount: number = 5) {
  const result: R[] = []
  for (let i = 0; i < amount; i++)
    result.push(generator())
  return result
}

export function getRandomItem<A>(arr: A[], predicate?: (a: A) => boolean): A | undefined {
  if (predicate)
    arr = arr.filter(predicate)
  return arr[Math.floor(Math.random() * arr.length)]
}

export function expectLooselyEq(a: any, b: any) {
  for (const key of Object.keys(b))
    expect(a[key]).toEqual(b[key])
}

export function genSample(pid: string | null = null, randomDeleted: boolean = true): basic.Sample {
  return {
    id: faker.string.uuid(),
    pid,
    name: faker.string.sample(),
    displayName: faker.string.alpha(),
    systemId: faker.string.uuid(),
    bigCategoryId: faker.string.uuid(),
    sampleRequirement: faker.string.alpha(),
    isDeleted: randomDeleted ? faker.number.int({ min: 0, max: 1 }) : 0,
  }
}

export function genParam(): basic.Param {
  return {
    id: faker.string.uuid(),
    name: faker.string.sample(),
    displayName: faker.string.alpha(),
    bigCategoryId: faker.string.uuid(),
    testItemId: faker.string.uuid(),
    systemId: faker.string.uuid(),
    testItemName: faker.string.alpha(),
    isTempParam: faker.number.int({ min: 0, max: 1 }),
    isLocaleItem: faker.number.int({ min: 0, max: 1 }),
    isDeleted: faker.number.int({ min: 0, max: 1 }),
  }
}

export function genCriterion(): basic.Standard {
  return {
    standardId: faker.string.uuid(),
    standardName: faker.string.alpha(10),
    uniqueKey: faker.string.alpha(10),
    publishCode: faker.string.alpha(10),
    publishDate: faker.date.past().toISOString(),
    expireDate: faker.date.future().toISOString(),
    clauseCode: faker.string.alpha(),
  }
}

export function genSampleParamAndTestItem(s?: string, p?: string, t?: string): basic.SampleParamAndTestItem {
  return {
    testSampleId: s || faker.string.uuid(),
    testParamId: p || faker.string.uuid(),
    testItemId: t || faker.string.uuid(),
  }
}

export function genProject(): basic.Project {
  return {
    id: faker.string.uuid(),
    createDate: faker.date.past().toISOString(),
    name: faker.string.alpha(10),
    projectCode: faker.string.alpha(4),
    isDeleted: faker.number.int({ min: 0, max: 1 }),
    isCompleted: faker.number.int({ min: 0, max: 1 }),
    buildProjectName: faker.string.alpha(10),
    buildUnitName: faker.string.alpha(10),
    constructionUnitName: faker.string.alpha(10),
    description: faker.string.alpha(100),
    witnessUnitName: faker.string.alpha(10),
    departNames: faker.word.words(),
  }
}

export function genContractPart(projectId?: string): basic.ContractPart {
  return {
    id: faker.string.uuid(),
    contractPartName: faker.string.sample(),
    projectId: projectId || faker.string.uuid(),
    isDelete: faker.number.int({ min: 0, max: 1 }),
  }
}

export function genSection(belongsId?: string): basic.Section {
  return {
    id: faker.string.uuid(),
    belongsId: belongsId || faker.string.sample(),
    unitProjectName: faker.string.alpha(10),
    unitProjectType: faker.string.uuid(),
    levelCode: faker.string.alpha(10),
    levelCodeLength: faker.number.int({ min: 0, max: 10 }),
    isDelete: belongsId ? 0 : faker.number.int({ min: 0, max: 1 }),
  }
}

export function genRecordset(): basic.Recordset {
  return {
    name: faker.word.words(),
    xml: `
    <xml>
    <book>
      <title> ${faker.word.words(15)} </title>
      <author> ${faker.word.words(10)} </author>
    </book>
    `,
  }
}

export function genData(): basic.Data {
  return {
    type: 'testSample',
    data: gen(genSample),
    version: faker.date.past().toISOString(),
    paramVersionId: faker.string.uuid(),
  }
}

export function genDataVersion(): basic.DataVersion {
  return {
    type: faker.helpers.arrayElement([
      'testSample',
      'testParam',
      'testSampleParam',
      'standard',
      'project',
      'synthesisContract',
      'synthesisUnitProject',
      'recordSet',
      'template',
    ]),
    version: faker.date.past().toISOString(),
    paramVersionId: faker.string.uuid(),
  }
}

export function genSaveTask(): SaveTask {
  return {
    username: faker.person.firstName(),
    projectId: faker.string.uuid(),
    projectName: faker.word.words(),
    sampleId: faker.string.uuid(),
    sampleName: faker.word.words(),
    unitProjectId: faker.string.uuid(),
    unitProjectName: faker.word.words(),
    template: {
      id: faker.string.uuid(),
      name: faker.word.words(),
      udrItemId: faker.string.uuid(),
      main: faker.internet.url(),
      version: faker.date.past().toISOString(),
      testItemId: faker.string.uuid(),
      testItemName: faker.word.words(),
      templateType: '1',
    },
    taskParams: gen(genTaskParam),
  }
}

export function genTaskParam(): TaskParam {
  return {
    testParamId: faker.string.uuid(),
    testParamName: faker.word.words(),
    testParamDisplayName: faker.word.words(),
    testItemId: faker.string.uuid(),
    testItemName: faker.word.words(),
    standards: [
      {
        baseStandardId: faker.string.uuid(),
        baseStandardName: faker.word.words(),
        baseStandardUseType: faker.helpers.arrayElement(['1', '2', '3']),
        publishCode: faker.word.words(),
      },
    ],
  }
}
