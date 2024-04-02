import { setupMigrator } from 'migration'
import type { Sample } from 'custodian'
import {
  CriterionQuery,
  ProjectQuery,
  countProjects,
  executeSql,
  findCriteria,
  findParams,
  findProjects,
  findSamples,
  findSections,
  getDataVersion,
  getHitekCenterUrl,
  getRecordset,
  queryForObject,
  saveContractParts,
  saveCriteria,
  saveDataVersion,
  saveHitekCenterUrl,
  saveProjects,
  saveRecordset,
  saveSampleParamAndTestItems,
  saveSections,
  truncateParams,
  truncateSamples,
} from 'custodian'
import { faker } from '@faker-js/faker'
import { saveParams, saveSamples } from '../src'
import ref from '../testdata/sampleParam.json'
import {
  countTable,
  expectLooselyEq,
  gen,
  genContractPart,
  genCriterion,
  genDataVersion,
  genParam,
  genProject,
  genRecordset,
  genSample,
  genSampleParamAndTestItem,
  genSection,
  getRandomItem,
} from './fixture'

beforeAll(async () => {
  await import('../../../migrations')
  localStorage.setItem('uhb.user', JSON.stringify({ database: 'uhb.db' }))
  const migrator = await setupMigrator().migrate()
  migrator.reset()
})

afterAll(() => {
  sqlitePlugin.deleteDatabase({
    name: 'uhb.db',
    location: 'default',
  })
})

describe('ilis sample basic usage', () => {
  afterEach(async () => {
    await truncateSamples()
  })
  it('should save samples', async () => {
    const samples = [
      {
        id: '1',
        pid: null,
        name: 'sample1',
        displayName: 'sample1',
        systemId: '1',
        bigCategoryId: '1',
        sampleRequirement: 'sample1',
        isDeleted: 0,
      },
      {
        id: '2',
        pid: null,
        name: 'sample2',
        displayName: 'sample2',
        systemId: '2',
        bigCategoryId: '2',
        sampleRequirement: 'sample2',
        isDeleted: 0,
      },
    ]
    await saveSamples(samples)
    const rs = await executeSql('select * from sample')
    expect(rs.rows.length).toBe(2)
    // for (let i = 0; i < rs.rows.length; i++)
    //   expect(samples).toContain(rs.rows.item(i))
  })

  it('should rollback when insertion encountered error', async () => {
    const samples = [
      {
        id: '1',
        name: 'sample1',
        displayName: 'sample1',
        systemId: '1',
        bigCategoryId: '1',
        sampleRequirement: 'sample1',
        isDeleted: false,
      },
      {
        id: '2',
        // invalid data
        name: null,
        displayName: 'sample2',
        systemId: '2',
        bigCategoryId: '2',
        sampleRequirement: 'sample2',
        isDeleted: false,
      },
    ]
    // @ts-expect-error expected to be fail
    await expectAsync(saveSamples(samples)).toBeRejectedWithError(/NOT NULL constraint failed: sample.name/)
    const rs = await executeSql('select * from sample')
    expect(rs.rows.length).toBe(0)
  })

  it('finds specific sample', async () => {
    const samples = gen(genSample)
    await saveSamples(samples)
    expect(await countTable('sample')).toBe(samples.filter(it => !it.isDeleted).length)
    const peaked = getRandomItem(samples, it => !it.isDeleted)
    if (!peaked) {
      console.log('all generated sample are deleted')
      return
    }
    const ref = genSampleParamAndTestItem(peaked.id)
    await saveSampleParamAndTestItems([ref])
    const find = await findSamples(ref.testItemId)
    expect(find.length).toBe(1)
    expect(find[0].name).toBe(peaked.name)
    expect(find[0].displayName).toBe(peaked.displayName)
    expect(find[0].systemId).toBe(peaked.systemId)
    expect(find[0].bigCategoryId).toBe(peaked.bigCategoryId)
    expect(find[0].sampleRequirement).toBe(peaked.sampleRequirement)
  })

  it('inserts 10000 samples', async () => {
    const samples = gen(genSample, 10_000)
    const s = Date.now()
    console.log('starting insert 10000 samples')
    await saveSamples(samples)
    console.log(`finished insert 10000 samples, elapse: ${Date.now() - s}ms`)
    expect(await countTable('sample')).toBe(samples.filter(it => !it.isDeleted).length)
  }, 10_000)

  it('updates persistent sample', async () => {
    await saveSamples([{
      id: '1',
      pid: '',
      name: 'updated',
      displayName: 'updated',
      bigCategoryId: '1',
      isDeleted: 0,
    }])
    const sample = await queryForObject<Sample>('select * from sample where id = ?', ['1'])
    expect(sample.name).toBe('updated')
    expect(sample.displayName).toBe('updated')
    expect(sample.bigCategoryId).toBe('1')
  })

  it('compose sample leaves', async () => {
    const samples = []
    const testItemId = faker.string.uuid()
    for (let i = 0; i < 6; i++) {
      const s = genSample(null, false)
      samples.push(s)
      samples.push(...gen(() => genSample(s.id, false)))
    }
    const ref = []
    for (const sample of samples)
      ref.push(genSampleParamAndTestItem(sample.id, undefined, testItemId))
    await saveSampleParamAndTestItems(ref)
    await saveSamples(samples)
    const leaves = await findSamples(testItemId)
    expect(leaves.length).toBe(6)
    expect(leaves.every(it => it.leaves?.length === 5)).toBe(true)
  })
})

describe('ilis test param basic usage', () => {
  afterEach(async () => {
    await truncateParams()
  })
  it('should save the given test params', async () => {
    const params = gen(genParam)
    await saveParams(params)
    const count = await countTable('param')
    expect(count).toBe(params.filter(it => !it.isDeleted).length)
  })

  it('finds specific param', async () => {
    const params = gen(genParam)
    await saveParams(params)
    const peaked = getRandomItem(params, it => !it.isDeleted)
    if (!peaked) {
      console.log('all generated param are deleted')
      return
    }
    const ref = genSampleParamAndTestItem(undefined, peaked.id, peaked.testItemId)
    await saveSampleParamAndTestItems([ref])
    const find = await findParams(ref.testItemId, ref.testSampleId)
    expect(find.length).toBe(1)
    expect(find[0].isLocaleItem).toBe(peaked.isLocaleItem)
    expect(find[0].name).toBe(peaked.name)
    expect(find[0].displayName).toBe(peaked.displayName)
    expect(find[0].systemId).toBe(peaked.systemId)
    expect(find[0].bigCategoryId).toBe(peaked.bigCategoryId)
  })
})

describe('composite primary key', () => {
  it('do nothing when primary key conflict', async () => {
    await saveSampleParamAndTestItems(ref as any)
    const count = await countTable('sample_param_and_test_item')
    expect(count).toBe(17)
  })
})

describe('ilis criteria basic usage', () => {
  afterEach(async () => {
    await executeSql('delete from standard where 1')
  })

  it('should save the given criteria', async () => {
    const criteria = gen(genCriterion)
    await saveCriteria(criteria)
    expect(await countTable('standard')).toBe(criteria.length)
  })

  it('finds correct criterion', async () => {
    const criteria = gen(genCriterion)
    await saveCriteria(criteria)
    const criterion = criteria[0]
    const query = new CriterionQuery()
    query.fuzzy = criterion.standardName
    let find = await findCriteria(query)
    expect(find.length).toBe(1)
    expect(find[0]).toEqual(criterion)
    query.fuzzy = criterion.publishCode!
    find = await findCriteria(query)
    expect(find.length).toBe(1)
    expect(find[0]).toEqual(criterion)
  })
})

describe('ilis project basic usage', () => {
  afterEach(async () => {
    await executeSql('delete from project where 1')
  })

  it('should save the given projects', async () => {
    const projects = gen(genProject)
    await saveProjects(projects)
    expect((await findProjects()).length).toBe(projects.filter(it => !it.isDeleted).length)
  })

  it('finds correct project', async () => {
    const projects = gen(genProject)
    await saveProjects(projects)
    const project = getRandomItem(projects, it => !it.isDeleted)
    if (!project) {
      console.log('all generated projects are deleted')
      return
    }
    let find = await findProjects(new ProjectQuery(project.name))
    expect(find.length).toBe(1)
    expectLooselyEq(project, find[0])
    find = await findProjects(new ProjectQuery(project.projectCode!))
    expect(find.length).toBe(1)
    expectLooselyEq(project, find[0])
  })

  it('counts correct project', async () => {
    const projects = gen(genProject)
    await saveProjects(projects)
    expect(await countProjects()).toBe(projects.filter(it => !it.isDeleted).length)

    const project = getRandomItem(projects, it => !it.isDeleted)
    if (!project) {
      console.log('all generated projects are deleted')
      return
    }
    expect(await countProjects(new ProjectQuery(project.name))).toBe(1)
  })
})

describe('ilis contract-part and section basic usage', () => {
  afterEach(async () => {
    await executeSql('delete from contract_part where 1')
    await executeSql('delete from section where 1')
  })

  it('should save the given contract-parts', async () => {
    const contractParts = gen(genContractPart)
    await saveContractParts(contractParts)
    expect(await countTable('contract_part')).toBe(contractParts.filter(it => !it.isDelete).length)
  })

  it('should save the given sections', async () => {
    const sections = gen(genSection)
    await saveSections(sections)
    expect(await countTable('section')).toBe(sections.filter(it => !it.isDelete).length)
  })

  it('finds correct section', async () => {
    const theOne = genSection('some awesome project')
    const sections = gen(genSection)
    sections.push(theOne)
    await saveSections(sections)
    const find = await findSections('some awesome project')
    expect(find.length).toBe(1)
    expectLooselyEq(theOne, find[0])
  })
})

describe('empty recordset', () => {
  afterEach(async () => {
    await executeSql('delete from recordset where 1')
  })

  it('should save the given recordset', async () => {
    const recordset = gen(genRecordset)
    await saveRecordset(recordset)
    expect((await getRecordset()).length).toBe(recordset.length)
    const r = getRandomItem(recordset)
    const find = await getRecordset(r!.name)
    expect(r?.xml).toBe(find.xml)
  })
})

describe('miscellaneous', () => {
  afterEach(async () => {
    await executeSql('delete from conf where 1')
    await executeSql('delete from data_version where 1')
  })

  it('should save and retrieve hitek-center url', async () => {
    await saveHitekCenterUrl('http://localhost:8099')
    const url = await getHitekCenterUrl()
    expect(url).toBe('http://localhost:8099')
  })

  it('can update hitek-center url accordingly', async () => {
    await saveHitekCenterUrl('http://localhost:8099')
    await saveHitekCenterUrl('http://localhost:8098')
    const url = await getHitekCenterUrl()
    expect(url).toBe('http://localhost:8098')
  })

  it('should save and retrieve data-version', async () => {
    const dv = genDataVersion()
    await saveDataVersion(dv)
    const find = await getDataVersion(dv.type)
    expect(find?.version).toBe(dv.version)
    expect(find?.paramVersionId).toBe(dv.paramVersionId)
  })
})
