/**
 * Migration definitions
 * @module migration definitions
 */
import { defineMigration } from 'migration'

defineMigration(1, {
  up: (migration) => {
    migration.execute(`
      create table template
      (
        id           text primary key,
        name         text not null,
        udrItemId    text not null,
        testItemId   text not null,
        testItemName text not null,
        templateType text not null,
        main         text not null,
        version      text not null
      );
    `)
    migration.execute(`
      create table template_file
      (
        templateId text not null,
        name       text not null,
        path       text not null,
        url        text not null,
        version    text not null,
        primary key (templateId, name)
      );
    `)
    // 由数据中心维护的模板专用数据集
    migration.execute(`
      create table template_recordset
      (
        templateId text not null,
        name       text not null,
        xml        blob not null,
        primary key (templateId, name)
      );
    `)
    migration.execute(`
      create table sample
      (
        id                text primary key,
        pid               text,
        name              text not null,
        displayName       text not null,
        systemId          text,
        bigCategoryId     text not null,
        sampleRequirement text
      );
    `)
    migration.execute(`
      create table param
      (
        id            text primary key,
        name          text    null,
        displayName   text    not null,
        systemId      text,
        bigCategoryId text    not null,
        testItemId    text    not null,
        testItemName  text    not null,
        isTempParam   integer not null,
        isLocaleItem  integer not null
      );
    `)
    migration.execute(`
      create table sample_param_and_test_item
      (
        testParamId  text not null,
        testSampleId text not null,
        testItemId   text not null,
        primary key (testSampleId, testParamId, testItemId)
      );
    `)
    migration.execute(`
      create table standard
      (
        standardId   text not null,
        standardName text not null,
        uniqueKey    text not null,
        publishCode  text,
        publishDate  text,
        expireDate   text,
        clauseCode   text,
        primary key (standardId, uniqueKey)
      );
    `)
    migration.execute(`
      create table project
      (
        id                   text primary key,
        name                 text not null,
        createDate           text,
        projectCode          text,
        constructionUnitName text,
        buildUnitName        text,
        buildProjectName     text,
        witnessUnitName      text,
        description          text,
        departNames          text,
        isCompleted          integer
      );
    `)
    // ilis生成的空数据集
    migration.execute(`
      create table recordset
      (
        name text primary key,
        xml  blob not null
      );
    `)
    migration.execute(`
      create table contract_part
      (
        id               text primary key,
        contractPartName text    not null,
        projectId        text    not null
      );
    `)
    migration.execute(`
      create table section
      (
        id              text primary key,
        belongsId       text    not null,
        unitProjectName text    not null,
        unitProjectType text    not null,
        levelCode       text,
        levelCodeLength integer
      );
    `)
    migration.execute(`
      create table data_version
      (
        type           text primary key,
        version        text not null,
        paramVersionId text not null
      );
    `)
    migration.execute(`
      create table conf
      (
        hitekCenter text primary key
      );
    `)
  },
})

defineMigration(2, {
  up: (migration) => {
    migration.execute(`
      create table task
      (
        id              text primary key,
        onsite          integer not null default 0,
        status          text    not null default 'pending',
        testTaskId      text,
        taskCreateTime  text,
        testTaskCode    text,
        recordCode      text,
        reportDate      text,
        testObjectCode  text,
        qualification   text,
        sampleId        text,
        sampleName      text,
        projectId       text,
        projectName     text,
        unitProjectId   text,
        unitProjectName text
      );
    `)
    migration.execute(`
      create table task_param
      (
        taskId               text not null references task,
        testTaskId           text,
        testItemId           text,
        testItemName         text,
        testParamId          text not null,
        testParamName        text not null,
        testParamDisplayName text not null,
        testTaskParamId      text,
        testObjectParamId    text,
        standards            blob,
        primary key (taskId, testParamId)
      );
    `)
    migration.execute(`
      create table task_template
      (
        taskId       text not null references task,
        name         text not null,
        udrId        text,
        templateId   text not null,
        testItemId   text not null,
        templateType text not null,
        main         text not null,
        version      text not null,
        primary key (taskId, templateId)
      );
    `)
    migration.execute(`
      create table task_recordset
      (
        taskId       text not null references task,
        testObjectId text,
        name         text not null,
        xml          blob,
        primary key (taskId, name)
      );
    `)
    migration.execute(`
      create table task_sequence
      (
        date       text not null primary key,
        sequence integer not null default 1
      )
    `)
  },
})

defineMigration(3, {
  up: (migration) => {
    migration.execute(`
      alter table task
        add column params_tmp text
    `)
    migration.execute(`
      update task
      set params_tmp = params.names
      from (select group_concat(testParamDisplayName, '；') names, taskId from task_param) as params
      where id = params.taskId
    `)
    migration.execute(`
      alter table task
        add column params not null default params_tmp
    `)
    migration.execute(`
      alter table task drop column params_tmp
    `)
  },
})
