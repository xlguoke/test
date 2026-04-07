import {
  basic,
  executeSql,
  findTemplateFiles,
  findTemplateRecordSets,
  getTemplate,
  groupTemplateTestItem,
  pathExists,
  saveTemplates,
} from 'custodian'
import * as templateResponse from '../testdata/template.json'
import { HITEK_CENTER_URL, setupTestSuite } from './helper'
import { countTable, getRandomItem } from './fixture'

describe('the basics of Cordova file system', () => {
  it('should be defined', () => {
    expect(window.resolveLocalFileSystemURL).toBeDefined()
    expect(window.requestFileSystem).toBeDefined()
    expect(cordova.file).toBeDefined()
  })

  it('throws an error when get a non-exists file entry', (done) => {
    window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, (fs) => {
      fs.root.getFile('not-exists.txt', {}, () => {
        done.fail('non-exists file entry should throw an error')
      }, (err) => {
        expect(err).toBeDefined()
        done()
      })
    })
  })

  it('should create a file', (done) => {
    window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, (fs) => {
      fs.root.getFile('test.txt', { create: true }, (fileEntry) => {
        expect(fileEntry.toURL).toBeTruthy()
        expect(fileEntry.isFile).toBe(true)
        done()
      }, error => done.fail(`${error}`))
    })
  })
})

describe('template manager', () => {
  if (cordova.platformId !== 'browser') {
    xit('only run template manager tests in browser, because the MSW mock server worker couldn\'t registered', () => {
      expect(true).toBeTruthy()
    })
  }
  else {
    beforeAll(async () => {
      await setupTestSuite()
    })

    afterEach(async () => {
      await executeSql('delete from template where 1')
      await executeSql('delete from template_file where 1')
      await executeSql('delete from template_recordset where 1')
    })

    afterAll(async () => {
      await executeSql('delete from conf where 1')
    })

    it('should save the given templates', async () => {
      const data = basic.Validator.data.parse(templateResponse.data)
      if (data.type !== 'template')
        throw new Error('not a chance')
      const promises = await saveTemplates(data.data, HITEK_CENTER_URL)
      expect(promises.some(p => p.status === 'rejected')).toBe(false)
      expect(await countTable('template')).toBe(1)
      const template = await getTemplate('abb0e455-c79f-4422-afdc-9ed00edda66f')
      expect(template.name).toBe('水泥试验')
      expect(template.udrItemId).toBe('20802')
      expect(template.testItemId).toBe('5faa4917-40fa-497c-a277-4ef5b3a2f92b')
      expect(template.testItemName).toBe('(部颁)水泥试验记录表_i_0118')
      expect(template.templateType).toBe('1')
      expect(template.version).toBe('2024-01-31 16:32:14')
      expect(template.main).toMatch(/\/templates\/abb0e455-c79f-4422-afdc-9ed00edda66f\/main.json/)
      const templateRecordSets = await findTemplateRecordSets('abb0e455-c79f-4422-afdc-9ed00edda66f')
      expect(templateRecordSets.length).toBe(3)
      const templateFiles = await findTemplateFiles('abb0e455-c79f-4422-afdc-9ed00edda66f')
      expect(templateFiles.length).toBe(17)
      expect(templateFiles.every(it => pathExists(it.path))).toBeTruthy()
    })

    it('should perform updates properly according to the data changes', async () => {
      const data = basic.Validator.data.parse(templateResponse.data)
      if (data.type !== 'template')
        throw new Error('not a chance')
      await saveTemplates(data.data, HITEK_CENTER_URL)
      const appTemplate = data.data[0].appTemplates[0]
      appTemplate.lastUpdateTime = new Date().toISOString()
      getRandomItem(appTemplate.appTemplateFiles)!.lastUpdateTime = new Date().toISOString()
      appTemplate.appTemplateFiles.push({
        fileName: 'dummy.json',
        filePath: 'UDR\\android\\abb0e455-c79f-4422-afdc-9ed00edda66f\\dummy.json',
        lastUpdateTime: new Date().toISOString(),
        createTime: new Date().toISOString(),
      })
      // recordset
      const recordset = data.data[0].recordSets!
      getRandomItem(recordset)!.xml = '<xml>'
      recordset.push({
        name: 'dummy.xml',
        xml: '<xml>',
      })
      const promises = await saveTemplates(data.data, HITEK_CENTER_URL)
      expect(promises.some(p => p.status === 'rejected')).toBe(false)
      const template = await getTemplate('abb0e455-c79f-4422-afdc-9ed00edda66f')
      expect(template.version).toBe(appTemplate.lastUpdateTime)
      const templateFiles = await findTemplateFiles('abb0e455-c79f-4422-afdc-9ed00edda66f')
      expect(templateFiles.length).toBe(18)
      expect(templateFiles.every(it => pathExists(it.path))).toBeTruthy()
      const templateRecordSets = await findTemplateRecordSets('abb0e455-c79f-4422-afdc-9ed00edda66f')
      expect(templateRecordSets.length).toBe(4)
      for (const rs of templateRecordSets) {
        const find = recordset.find(it => it.name === rs.name)!
        expect(find.xml).toBe(rs.xml)
      }
    })
  }

  it('groups by test item', async () => {
    const data = basic.Validator.data.parse(templateResponse.data)
    if (data.type !== 'template')
      throw new Error('not a chance')
    await saveTemplates(data.data, HITEK_CENTER_URL)
    const groups = await groupTemplateTestItem()
    expect(groups.length).toBe(1)
    expect(groups[0].testItemName).toBe('(部颁)水泥试验记录表_i_0118')
    expect(groups[0].testItemId).toBe('5faa4917-40fa-497c-a277-4ef5b3a2f92b')
  })
})
