import { v4 as uuid } from 'uuid'
import { LoggerWrapper } from '@ilis/cordova-plugin-log4c'
import { Pageable } from './types'
import type { Override, basic, task } from './types'
import type { BatchTransaction } from './database'
import { executeSql, newBatchTransaction, queryForList, queryForObject } from './database'
import type { Template } from './template'
import { findTemplateRecordSets, saveTemplate } from './template'
import { getRecordset } from './recordset'
import { normalizeHitekCenterUrl } from './miscellaneous'

const log = new LoggerWrapper('custodian.task')

export type TaskParam = Omit<task.Param, 'testTaskId' | 'testObjectParamId' | 'testTaskParamId'>

export type TaskTemplate = Override<
  Omit<Template, 'id'>,
  {
    udrId?: string
    templateId: string
  }
>

export type TaskStandard = task.Standard

export type SaveTask = Required<
  Override<
    Omit<
      task.Task,
      'testTaskId' |
      'qualification' |
      'taskCreateTime' |
      'testTaskCode' |
      'testObjectCode' |
      'taskAppTemplates' |
      'taskRecordSets' |
      'testObjectId' |
      'hitekServer' |
      'reportDate'
>,
    { taskParams: TaskParam[], template: Template, username: string }
  >
> & { id?: string }

export type AppTask = Override<
  Omit<task.Task, 'taskParams' | 'taskAppTemplates' | 'taskRecordSets' | 'testObjectId' | 'hitekServer'>,
  {
    id: string
    onsite: number
    testTaskCode?: string
    recordCode?: string
    testTaskId?: string
    status: 'pending' | 'edited' | 'uploaded' | 'uploadFailed'
    /**
     * redundant param display names delimited by `；`
     * @example
     * '强度；凝结时间'
     */
    params: string
  }
>

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function validateDatePattern(dateStr: string | undefined) {
  if (!dateStr)
    return dateStr
  if (!DATE_PATTERN.test(dateStr))
    throw new Error('date value mismatch, expect YYYY-MM-DD format')
  return dateStr
}

export class TaskQuery extends Pageable<AppTask> {
  status: AppTask['status'][] | undefined
  fuzzy: string | undefined
  /**
   * 精确查询工程项目相关的检测任务
   */
  projectId: string | undefined
  projectName: string | undefined
  unitProjectName: string | undefined
  params: string | undefined
  /**
   * YYYY-MM-DD
   */
  private _createdFrom: string | undefined
  /**
   * YYYY-MM-DD
   */
  private _createdTo: string | undefined

  set createdFrom(value: string | undefined) {
    this._createdFrom = validateDatePattern(value)
  }

  set createdTo(value: string | undefined) {
    this._createdTo = validateDatePattern(value)
  }

  get createdFrom(): string | undefined {
    return this._createdFrom
  }

  get createdTo(): string | undefined {
    return this._createdTo
  }
}

interface TaskSequence {
  date: string
  sequence: number
}

/**
 * 保存在线任务，同一份在线任务不允许被多次设置为离线任务
 *
 * 以在线任务的主键作为不能重复设置的判断依据有一下隐患：
 * - 在线任务的主键可能随逻辑删除而变化
 * - 根据ILIS业务特性，不同编号类型可能产生相同任务编号
 * @param task
 */
export async function saveTask(task: task.Task) {
  if (await isTestTaskExists(task.testTaskId))
    throw new Error('task already exists')
  const tx = newBatchTransaction()
  const taskId = uuid()
  for (const taskTemplate of task.taskAppTemplates) {
    try {
      const hitekCenter = normalizeHitekCenterUrl(task.hitekServer)
      const templates = await saveTemplate({ ...taskTemplate, testItemName: task.taskParams[0].testItemName }, hitekCenter)
      for (const template of templates) {
        tx.execute(
          `insert into task_template(taskId, name, udrId, templateId, testItemId, templateType, main, version)
           values (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            taskId,
            template.name,
            taskTemplate.udrId,
            template.id,
            template.testItemId,
            template.templateType,
            template.main,
            template.version,
          ],
        )
      }
    }
    catch (e) {
      log.error('failed to save template {}, cause: {}', task.testTaskCode, e)
      throw new Error(`download template for task code: ${task.testTaskCode} was failed`)
    }
  }
  const params = task.taskParams.map(p => p.testParamDisplayName).join('；')
  for (const param of task.taskParams) {
    tx.execute(
      `insert into task_param(taskId, testTaskId, testItemId, testItemName, testParamId, testParamName, testParamDisplayName,
                              testTaskParamId, testObjectParamId, standards)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        param.testTaskId,
        param.testItemId,
        param.testItemName,
        param.testParamId,
        param.testParamName,
        param.testParamDisplayName,
        param.testTaskParamId,
        param.testObjectParamId,
        JSON.stringify(param.standards),
      ],
    )
  }
  for (const rs of task.taskRecordSets) {
    tx.execute(
      'insert into task_recordset(taskId, testObjectId, name, xml) values (?, ?, ?, ?)',
      [taskId, rs.testObjectId, rs.name, rs.xml],
    )
  }
  tx.execute(
    `insert into task(id, taskCreateTime, testTaskId, testTaskCode, testObjectCode, qualification, sampleId, sampleName,
                      params, reportDate, projectId, projectName, unitProjectId, unitProjectName)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      taskId,
      task.taskCreateTime,
      task.testTaskId,
      task.testTaskCode,
      task.testObjectCode,
      task.qualification,
      task.sampleId,
      task.sampleName,
      params,
      task.reportDate,
      task.projectId,
      task.projectName,
      task.unitProjectId,
      task.unitProjectName,
    ],
  )
  await tx.commit()
  return taskId
}

async function isTestTaskExists(testTaskId: string) {
  return !!(await findByTestTaskIds([testTaskId])).length
}

/**
 * 根据在线检测任务ID查询已下载的任务
 * @param ids basic.Task.testTaskId
 */
export async function findByTestTaskIds(ids: string[]) {
  return queryForList<AppTask>(`select * from task where testTaskId in (${ids.map(id => `'${id}'`).join(',')})`)
}

export async function saveOnsiteTask(task: SaveTask) {
  if (!task.taskParams)
    throw new Error('empty task param array is prohibited')
  const tx = newBatchTransaction()
  const taskId = task.id || uuid()
  let status: AppTask['status'] = 'pending'
  const template = task.template
  tx.execute('delete from task_template where taskId = ?', [taskId])
  tx.execute(
    `insert into task_template(taskId, name, templateId, udrId, testItemId, templateType, main, version)
     values (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      taskId,
      template.name,
      template.id,
      template.udrItemId,
      template.testItemId,
      template.templateType,
      template.main,
      template.version,
    ],
  )
  const params = task.taskParams.map(p => p.testParamDisplayName).join('；')
  for (const param of task.taskParams) {
    const params = await findTaskParams(taskId)
    for (const persist of params)
      tx.execute('delete from task_param where taskId = ? and testParamId = ?', [taskId, persist.testParamId])
    tx.execute(
      `insert into task_param(taskId, testParamId, testItemId, testItemName, testParamName, testParamDisplayName, standards)
       values (?, ?, ?, ?, ?, ?, ?)`,
      [taskId, param.testParamId, param.testItemId, param.testItemName, param.testParamName, param.testParamDisplayName, JSON.stringify(param.standards)],
    )
  }
  try {
    const appTask = await getTask(taskId)
    status = appTask.status
    const taskTemplates = await findTaskTemplates(taskId)
    if (!taskTemplates.find(tt => tt.templateId === template.id)) {
      log.warn(`detect template changes for onsite task ${appTask.testTaskCode} the task recordset will be rest to the default`, taskId)
      await populateTaskRecordSets(tx, taskId, template.id)
      // reset task status
      status = 'pending'
    }
  }
  catch (e) {
    await populateTaskRecordSets(tx, taskId, template.id)
  }
  const seq = await genSequence()
  tx.execute(
    `insert into task(id, onsite, status, taskCreateTime, testTaskCode, recordCode, sampleId, sampleName,
                      params, projectId, projectName, unitProjectId, unitProjectName)
     values (?, 1, 'pending', datetime('now', 'localtime'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
     on conflict do update set sampleId        = ?,
                               sampleName      = ?,
                               params          = ?,
                               projectId       = ?,
                               projectName     = ?,
                               unitProjectId   = ?,
                               unitProjectName = ?,
                               status          = ?`,
    [
      taskId,
      `${seq.date}-${seq.sequence}`,
      `${task.username}-${seq.date}-${seq.sequence}`,
      task.sampleId,
      task.sampleName,
      params,
      task.projectId,
      task.projectName,
      task.unitProjectId,
      task.unitProjectName,
      task.sampleId,
      task.sampleName,
      params,
      task.projectId,
      task.projectName,
      task.unitProjectId,
      task.unitProjectName,
      status,
    ],
  )
  await tx.commit()
  return taskId
}

async function populateTaskRecordSets(tx: BatchTransaction, taskId: string, templateId: string) {
  const recordset = await getRecordset()
  const templateSpecificRecordset = await findTemplateRecordSets(templateId)
  recordset.push(...templateSpecificRecordset)
  for (const rs of recordset) {
    tx.execute(
      `insert into task_recordset(taskId, name, xml)
       values (?, ?, ?)
       on conflict do update set xml = ?`,
      [taskId, rs.name, rs.xml, rs.xml],
    )
  }
}

export async function genSequence() {
  return queryForObject<TaskSequence>(
    `insert into task_sequence(date)
     values (strftime('%Y%m%d'))
     on conflict do update set sequence = sequence + 1
     returning *`,
  )
}

export async function deleteTask(id: string) {
  const tx = newBatchTransaction()
  tx.execute('delete from task_param where taskId = ?', [id])
  tx.execute('delete from task_recordset where taskId = ?', [id])
  tx.execute('delete from task_template where taskId = ?', [id])
  tx.execute('delete from task where id = ?', [id])
  return tx.commit()
}

export async function getTask(id: string) {
  return queryForObject<AppTask>('select * from task where id = ?', [id])
}

export async function updateTaskUploadStatus(id: string, status: Extract<AppTask['status'], 'uploaded' | 'uploadFailed'> = 'uploaded') {
  return executeSql(`update task set status = ? where id = ?`, [status, id])
}

export async function findTaskParams(taskId: string) {
  return queryForList<TaskParam>(
    'select * from task_param where taskId = ?',
    [taskId],
    (r) => {
      r.standards = JSON.parse(r.standards)
      return r
    },
  )
}

export async function findTaskRecordSets(taskId: string) {
  return queryForList<basic.Recordset>('select * from task_recordset where taskId = ?', [taskId])
}

export async function findTaskTemplates(taskId: string) {
  return queryForList<TaskTemplate>('select * from task_template where taskId = ?', [taskId])
}

export async function findTasks(query: TaskQuery) {
  const [conditions, params] = query2Tuple(query)
  params.push(query.limit, query.offset)
  return queryForList<AppTask>(
    `select *
     from task ${conditions.length ? `where ${conditions.join(' and ')}` : ''}
     ${query.orders ? `order by ${query.orders}` : ''}
     limit ? offset ?`,
    params,
  )
}

export async function countTask(query: TaskQuery) {
  const [conditions, params] = query2Tuple(query)
  const counted = await queryForObject<{ count: number }>(
    `select count(*) as count
     from task ${conditions.length ? `where ${conditions.join(' and ')}` : ''}`,
    params,
  )
  return counted.count
}

function query2Tuple(query: TaskQuery): [conditions: string[], params: any[]] {
  const conditions = []
  const params = []
  if (query.fuzzy) {
    conditions.push('(testTaskCode like ? or recordCode like ? or sampleName like ?)')
    const fuzzy = `%${query.fuzzy.trim()}%`
    params.push(fuzzy, fuzzy, fuzzy)
  }
  if (query.projectId) {
    conditions.push('projectId = ?')
    params.push(query.projectId)
  }
  if (query.projectName) {
    conditions.push('projectName like ?')
    params.push(`%${query.projectName.trim()}%`)
  }
  if (query.unitProjectName) {
    conditions.push('unitProjectName like ?')
    params.push(`%${query.unitProjectName.trim()}%`)
  }
  if (query.createdFrom && query.createdTo) {
    conditions.push('date(taskCreateTime) between ? and ?')
    params.push(query.createdFrom, query.createdTo)
  }
  if (query.status && query.status.length)
    conditions.push(`status in (${query.status.map(it => `'${it}'`).join(',')})`)
  if (query.params) {
    conditions.push('params like ?')
    params.push(`%${query.params.trim()}%`)
  }
  return [conditions, params]
}
