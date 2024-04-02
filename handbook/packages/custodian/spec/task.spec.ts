import {
  TaskQuery,
  countTask,
  deleteTask,
  executeSql,
  findByTestTaskIds,
  findTaskParams,
  findTaskRecordSets,
  findTaskTemplates,
  findTasks,
  genSequence,
  getTask,
  saveOnsiteTask,
  saveRecordset,
  saveTask,
  task,
  updateTaskUploadStatus,
} from 'custodian'
import * as response from '../testdata/task.json'
import { formatDate, setupTestSuite } from './helper'
import { gen, genRecordset, genSaveTask, getRandomItem } from './fixture'

describe('task management', () => {
  beforeAll(async () => {
    await setupTestSuite()
  })

  afterEach(async () => {
    await executeSql('delete from template where 1')
    await executeSql('delete from template_file where 1')
    await executeSql('delete from template_recordset where 1')
    await executeSql('delete from task_param where 1')
    await executeSql('delete from task_template where 1')
    await executeSql('delete from task_recordset where 1')
    await executeSql('delete from task where 1')
    await executeSql('delete from recordset where 1')
    await executeSql('delete from task_sequence where 1')
  })

  it('should save the given task', async () => {
    const data = task.Validator.task.parse(response.data)
    const taskId = await saveTask(data)
    const appTask = await getTask(taskId)
    expect(appTask.onsite).toBe(0)
    expect(appTask.status).toBe('pending')
    expect(appTask.testTaskCode).toBe('RW-DSYJYJCZYZ-0092')
    expect(appTask.testObjectCode).toBe('YP-DSY-148')
    expect(appTask.qualification).toBe('第三页检验检测专用章')
    expect(appTask.projectName).toBe('测试工程项目_1106')
    expect(appTask.taskCreateTime).toBe('2024-02-02 14:30:44')
    const params = await findTaskParams(taskId)
    expect(params.length).toBe(3)
    expect(appTask.params).withContext('task param redundant match').toBe(params.map(p => p.testParamDisplayName).join('；'))
    expect(params).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        testTaskParamId: '4028b20d8d687356018d68832ef700b8',
        testObjectParamId: '4028b20d8d687356018d68821d9b0069',
        testParamId: '2c9284d077b3a2eb0177b43494b63e5a',
        testParamDisplayName: '不溶物',
        testTaskId: '4028b20d8d687356018d68832e0f00b2',
      }),
      jasmine.objectContaining({
        testTaskParamId: '4028b20d8d687356018d68832ef700b9',
        testObjectParamId: '4028b20d8d687356018d68821d9b006a',
        testParamId: '2c9284d077b3a2eb0177b43494b63e5d',
        testParamDisplayName: '安定性',
        testTaskId: '4028b20d8d687356018d68832e0f00b2',
        standards: [
          {
            baseStandardUseType: '1',
            baseStandardId: '0d613969-db76-4d85-b995-b6772b9276b1',
            baseStandardName: '《水泥标准稠度用水量、凝结时间、安定性检验方法》',
            publishCode: 'GB/T 1346-2011',
          },
          {
            baseStandardUseType: '2',
            baseStandardId: 'ce0f0f28-0188-4baf-bbc4-7cb824309d0f',
            baseStandardName: '《通用硅酸盐水泥》',
            publishCode: 'GB 175-2007/XG1-2009',
          },
        ],
      }),
    ]))
    const recordset = await findTaskRecordSets(taskId)
    expect(recordset.length).toBe(39)
    expect(recordset).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        name: 'UDR_参数公用指标',
        xml: jasmine.any(String),
      }),
    ]))
    const template = await findTaskTemplates(taskId)
    expect(template).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        name: '水泥试验',
        main: jasmine.stringMatching(/abb0e455-c79f-4422-afdc-9ed00edda66f\/main.json/),
        version: '2024-01-31 16:32:14',
        testItemId: '5faa4917-40fa-497c-a277-4ef5b3a2f92b',
      }),
    ]))
  })

  it('should throw when save the identical task', async () => {
    const data = task.Validator.task.parse(response.data)
    await saveTask(data)
    await expectAsync(saveTask(data)).toBeRejectedWithError('task already exists')
  })

  it('should find tasks by test-task-ids', async () => {
    const data = task.Validator.task.parse(response.data)
    await saveTask(data)
    const tasks = await findByTestTaskIds(['4028b20d8d687356018d68832e0f00b2'])
    expect(tasks.length).toBe(1)
  })

  it('should save the given onsite-task', async () => {
    const recordSets = gen(genRecordset)
    await saveRecordset(recordSets)
    const saveTask = genSaveTask()
    const taskId = await saveOnsiteTask(saveTask)
    const appTask = await getTask(taskId)
    expect(appTask.onsite).toBe(1)
    expect(appTask.status).toBe('pending')
    expect(appTask.taskCreateTime).toEqual(jasmine.any(String))
    expect(appTask.projectId).toBe(saveTask.projectId)
    expect(appTask.projectName).toBe(saveTask.projectName)
    expect(appTask.unitProjectId).toBe(saveTask.unitProjectId)
    expect(appTask.unitProjectName).toBe(saveTask.unitProjectName)
    expect(appTask.sampleId).toBe(saveTask.sampleId)
    expect(appTask.sampleName).toBe(saveTask.sampleName)
    const recordset = await findTaskRecordSets(taskId)
    expect(recordset.length).toBe(recordSets.length)
    const params = await findTaskParams(taskId)
    expect(params.length).toBe(5)
    expect(params[0].standards?.length).toBe(1)
    expect(appTask.params).withContext('task param redundant match').toEqual(
      jasmine.stringContaining(getRandomItem(params)!.testParamDisplayName),
    )
  })

  it('resets task records when template has changed', async () => {
    const recordSets = gen(genRecordset)
    await saveRecordset(recordSets)
    const saveTask = genSaveTask()
    const taskId = await saveOnsiteTask(saveTask)
    await updateTaskUploadStatus(taskId)
    const update = genSaveTask()
    update.id = taskId
    await saveOnsiteTask(update)
    const appTask = await getTask(taskId)
    expect(appTask.status).toBe('pending')
    const params = await findTaskParams(taskId)
    expect(params.length).toBe(5)
  })

  it('should delete the specified task', async () => {
    const taskId = await saveOnsiteTask(genSaveTask())
    await deleteTask(taskId)
    await expectAsync(getTask(taskId)).toBeRejectedWithError()
  })

  it('generates task sequence', async () => {
    await genSequence()
    const second = await genSequence()
    expect(second.sequence).toBe(2)
  })

  it('should scroll tasks', async () => {
    const tasks = gen(genSaveTask, 20)
    for (const it of tasks)
      await saveOnsiteTask(it)

    const query = new TaskQuery()
    const count = await countTask(query)
    expect(count).toBe(20)
    query.addOrder({
      property: 'testTaskCode',
      direction: 'asc',
    })
    const paginated = await findTasks(query)
    expect(paginated.length).toBe(10)

    const random = getRandomItem(tasks)
    query.projectName = random?.projectName
    let findings = await findTasks(query)
    expect(findings.length).toBeGreaterThanOrEqual(1)
    query.fuzzy = findings[0].testTaskCode
    findings = await findTasks(query)
    if (findings.length !== 1)
      console.error(findings)
    expect(findings.length).withContext('finding with testTaskCode in fuzzy').toBe(1)
    query.createdFrom = formatDate(findings[0].taskCreateTime)
    query.createdTo = formatDate(findings[0].taskCreateTime)
    findings = await findTasks(query)
    expect(findings.length).withContext('finding with time range').toBe(1)
    query.status = ['pending', 'edited']
    findings = await findTasks(query)
    expect(findings.length).withContext('finding with status').toBe(1)
  }, 10000)

  it('should update the task status', async () => {
    const task = genSaveTask()
    const id = await saveOnsiteTask(task)
    await updateTaskUploadStatus(id)
    const onsite = await getTask(id)
    expect(onsite.status).toBe('uploaded')
  })
})
