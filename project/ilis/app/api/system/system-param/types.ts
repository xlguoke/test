/** ## 系统参数 */
export interface ISystemParam {
  /** ## 【系统参数】一个委托是否允许添加多个样品 */
  'CONSIGN_WITH_MULTIPLE_OBJECT'?: boolean
  /** ##  【系统参数】按样品设置资质 */
  'SET_QUA_WITH_OBJECT'?: boolean
  /** ##  【系统参数】开启盲样 */
  'TEST_DETECTION_39'?: boolean
  /** ##  【系统参数】启用按工时、错误率、不及时率统计人员绩效模式——显示样品接收日期 */
  'TASK_PERFORMANCE_MODE'?: boolean
  /** ##  【系统参数】系统时间字段精度：年-accuracy_year  月-accuracy_month  日-accuracy_day  时-accuracy_hour  分-accuracy_minute  秒-accuracy_second   */
  'TIME_ACCURACY'?: 'accuracy_year' | 'accuracy_month' | 'accuracy_day' | 'accuracy_hour' | 'accuracy_minute' | 'accuracy_second'
  /** ##  【系统参数】系统编号自动更新编号掩码 */
  'SN_AUTO_MATCH_MASK'?: boolean
  /** ##  【系统参数】完成委托超资提示策略 none-不提示 remind-提示不阻断 block-提示且阻断 */
  'NOT_ALLOWED_EMPTY_QUALIFICATION'?: 'none' | 'remind' | 'block'
  /** ##  【系统参数】委托完成后，绑定RFID标签 */
  'SAMPLE_BINDING_RFID'?: boolean
  /** ##  【系统参数】是否启用来样编号 */
  'ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE'?: boolean
  /** ##  【系统参数】缴费单位从第三方系统选择 */
  'CONGIN_UNIT_1'?: boolean
  /** ##  【系统参数】报告设置资质章时，资质对应报告参数-全覆盖、部分覆盖、无需覆盖 */
  'REPORT_QUA_SEAL_QUERY'?: 'ALLCOVER' | 'PARTCOVER' | 'NONE'
  /** ##  【系统参数】委托计费支持使用不同收费标准 */
  'MULTIPLE_PRICE_STANDARD'?: boolean
  /** ##  【系统参数】根据工程项目关联计费合同 */
  'PROJECT_BIND_BILLING_WAY'?: boolean
  /** ##  【系统参数】展示条款号 */
  'OTHER_9'?: boolean
  /** ##  【系统参数】允许直接创建原材料试验 */
  'TEST_DETECTION_40'?: boolean
  /**
   * ##  【系统参数】允许跨检测项目收样
   * @description 特殊情况，实际key为99294034538790917，为方便业务使用，单独定义的key，调接口时要改为99294034538790917
   */
  'COMPOUND_ITEMS'?: boolean
  /** ##  【系统参数】创建委托时，是否选择工程划分 */
  'SHOW_UNIT_PROJECT'?: boolean
  /** ##  【系统参数】新增委托时默认上次填写的委托信息 */
  'USE_LAST_CONSIGN_DATA'?: boolean
  /** ##  【系统参数】委托收费自动挂载 */
  'TEST_CHARGE_3'?: boolean
  /** ##  【系统参数】手动生成样品编号时占用编号 */
  'OCCUPY_SERIAL_NUMBER'?: boolean
  /** ##  【系统参数】委托收样时，可选择关联的检测合同 */
  'APPOINTMENT_CONTRACT'?: boolean
  /** ##  【系统参数】完成委托是否自动打印委托单 */
  'FINISH_DELE_2'?: boolean
  /** ## 【系统参数】工程部位/用途不盲样 */
  'TEST_DETECTION_BUT_PARTANDUSE'?: boolean
  /** ## 【系统参数】生成样品编号时自动保存委托 */
  'AUTO_SAVE_CONSIGN_ON_CREATE_SAMPLE_SN'?: boolean
  /** ## 【系统参数】外来样品编号是否占用系统编号 */
  'EXTERNAL_OBJECT_OCCUPATION'?: boolean
  /** 【系统参数】 委托复制为指定检测类型 */
  'DETERMINE_INSPECTION'?: '2c94808577d97af70177dd1fb34506fc'

  'CONSIGN_DISCARDS'?: string
  'RE_CONVERT_AUTO_ELE_SIGN'?: boolean
  'DEFERRED_PAYMENT_DURATION'?: string
  'COMPUTE_PERIOD_TIME_OF_FINISHED_TEST'?: 'MAX_PARAM_TEST_DAY'
  'HITEK_IOT_PASSWORD'?: string
  'CZTJ_TIME_BASE_TYPE'?: 'taskCompleteTime'
  'USE_NEW_TASK_REVIEW_LIST_UI'?: boolean
  '99294034538790917'?: boolean
  'task_view_live'?: boolean
  'AUTO_PRINT_DISTRIBUTION_MERGE'?: boolean
  'REPORT_MANAGE_1'?: boolean
  'CONFIRM_DEPARTMENT_DISTRIBUTION'?: boolean
  'AUTH_EQUIPMENT_PROCESS'?: boolean
  'STANDARD_IS_THIS_UNIT'?: boolean
  'QDM_ATTACH_UPLOAD'?: boolean
  'REPORT_MANAGE_7'?: boolean
  'HUMITURE_MANAGE_UPDATE'?: boolean
  'TASK_DISCARDS'?: '0'
  'HUMITURE_RECORD_MODEL'?: '1'
  'EQUIPMENT_USE_RECORD_USER'?: boolean
  'REPORT_MANAGE_REVIEW_DATE_REQUIRED'?: boolean
  'CAPACITY_WARNING_AUDITOR_LIMIT'?: string
  'TASK_CONTRACTS'?: '0'
  'REPORT_NUMBER_CHANGES'?: '0'
  'REQUIRED_FINISHED_TIME_COLUMN'?: boolean
  'EQUIPMENT_USE_RECORD_SIGN'?: boolean
  'TASK_TRANSFERS'?: '0'
  'QUALIFICATION_ENABLE'?: 'current'
  'TASK_REASSIGNS'?: '0'
  'eq_show_main'?: boolean
  'HUMITURE_MANAGE_DEL'?: boolean
  'OTHER_USE_REDIS_CACHE'?: boolean
  'TASK_MODULE'?: string
  'REPORT_MANAGE_REVIEW_DATE'?: boolean
  'ASSET_ALLOT_APPLY'?: boolean
  'TEST_DETECTION_49'?: boolean
  'INJECT_RFID_INTO_SAMPLE_TAG'?: boolean
  'TEST_DETECTION_48'?: boolean
  'TEST_DETECTION_47'?: '请按照单位要求填写拆分报告的编号后缀'
  'ENABLE_HITEK_COMMON_CONVERT'?: boolean
  'TEST_DETECTION_46'?: boolean
  'ONLY_SHOW_LAB_HIVE_EQ'?: boolean
  'TEST_DETECTION_45'?: boolean
  'TEST_DETECTION_44'?: boolean
  'TEST_DETECTION_43'?: '3'
  'REPORT_MANAGE_12'?: boolean
  'TEST_DETECTION_42'?: '3'
  'TEST_DETECTION_41'?: boolean
  'REPORT_MANAGE_17'?: boolean
  'REPORT_MANAGE_19'?: boolean
  'USE_PERIODSN'?: boolean
  'EQUIPMENT_11'?: boolean
  'REPORT_EDITOR_COMMIT'?: boolean
  'EQUIPMENT_10'?: boolean
  'REPORT_MANAGE_PHONE_MESSAGE'?: boolean
  'FEE_CHARGES'?: '0'
  'REPORT_DELETION'?: '0'
  'EQ_CHECK_OVER_DUE_NOTICE_DAYS'?: '6'
  'REPORT_ARCHIVES'?: '0'
  'REQUIRE_PASSWORD_STRENGTH'?: boolean
  'REPORT_STAMP_AUDIT'?: boolean
  'TEST_DETECTION_38'?: '3'
  'TEST_DETECTION_37'?: '7'
  'TEST_DETECTION_36'?: '3'
  'TEST_DETECTION_35'?: '7'
  'HUMITURE_BOOK_TEM_MIN'?: string
  'HUMITURE_MANAGE_RES_COUNT'?: '5'
  'FEE_ADDITIONS'?: '0'
  'CONSIGN_RECOVERS'?: '0'
  'Third_Party_BIM'?: boolean
  'EQUIPMENT_02'?: '15'
  'EQUIPMENT_01'?: '30'
  'EQ_SOFTWARE_MANAGEMENT'?: '7'
  'UDR_INPUT'?: '103'
  'EQUIPMENT_06'?: boolean
  'EQUIPMENT_05'?: boolean
  'EQUIPMENT_04'?: boolean
  'PIC_STAMP_UNDER'?: boolean
  'EQUIPMENT_03'?: '10'
  'EQUIPMENT_09'?: boolean
  'REPORT_MANAGE_REVIEW_DATE_number'?: '1'
  'unqualified_returned_by_parameter_dimension'?: boolean
  'COMPUTE_START_TIME_OF_FINISHED_TEST'?: 'SAMPLE_FORMING_DATE'
  'MERGER_REVIEW_AUDIT_PROCESS'?: boolean
  'REPORT_AUDITS'?: '1'
  'MANAGER_LOG_LIMIT'?: boolean
  'AUTO_PRINT_DISTRIBUTION'?: boolean
  'AUTO_OBJECT_PERIOD_TO_TEST_TIME'?: boolean
  'USE_NEW_ASSIGNED_TASK_LIST_UI'?: boolean
  'REPORT_QR_CODE_INCLUDE_DATA_DIRECTLY'?: boolean
  'REPORT_REVIEWS'?: '1'
  'TEST_DATA_REQUIRED_WHEN_REPORT_SUBMIT_BATCH'?: boolean
  'HUMITURE_MANAGE_RES_DATE_SPACE'?: '1'
  'AUTH_EQUIPMENT_HISTORY'?: boolean
  'COMPUTE_FINISHED_TIME_IGNORE_WEEKDAY'?: boolean
  'REPORT_AUDIT_CONTROL'?: boolean
  'REPORT_APPROVES'?: '1'
  'UDR_REPORT'?: '305'
  'USE_EQUIPMENT_PRINT'?: boolean
  'AUTO_UPDATE_DEVICE'?: boolean
  'PROJECT_SYNCHRONIZER'?: 'org.jeecgframework.web.system.synchronizer.ctvic.ProjectSynchronizer'
  'PWD_OVERDUE_CHECK'?: boolean
  'REPORT_SIGN_TYPE'?: boolean
  'UDR_TESTING'?: '203'
  'SHOW_ALL_TASK_IN_LAB'?: boolean
  'SAMPLE_ACCEPTOR_ONLY_ILIS_USER'?: boolean
  'USING_RECOMMENDED_PARAMETER_STANDARD'?: boolean
  'HUMITURE_LAB_OVER_RATE'?: '10'
  'CHECK_SAMPLE_BATCH_NUMBER'?: boolean
  'DISPLAYS_TEST_QUANTITY'?: boolean
  'HUMITURE_BOOK_HUM_MIN'?: string
  'OTHER_7'?: boolean
  'OTHER_8'?: 'http://192.168.2.65:8188/ilis2/'
  'OTHER_30'?: 'dingxjj7qhoosqq6amlz'
  'OTHER_31'?: 'z9ru__sOSiE-gKnV0EiD5zuwCgHLHAZkeT8AcXGJkciuY-H5WolR6-wzhj0p6Leu'
  'GENERAL_ACTIVITY_TODO'?: boolean
  'OTHER_32'?: '/export/hitek/importTemplate/导入用户信息.xlsx'
  'HUMITURE_LAB_OVER_CAUTION'?: boolean
  'FEE_REFUNDS'?: '0'
  'OTHER_33'?: '/export/hitek/importTemplate/温湿度巡查记录.xlsx'
  'HUMITURE_MANAGE_AUTO_SPACE'?: '0.01'
  'REPORT_AUDIT_BLIND_SAMPLE'?: boolean
  'OTHER_6'?: boolean
  'CAPACITY_WARNING_TESTER_LIMIT'?: string
  'FEE_MODULE'?: string
  'ROLLBACK_CONTRACT'?: '0'
  'AUTO_STAMP_AFTER_AUDIT'?: boolean
  'Ledger_use_info'?: boolean
  'TASK_NONCONFORMITY_INFORM_STRATEGY'?: 'NONE'
  'EQUIPMENT_assetSn'?: boolean
  'REPORT'?: string
  'QUOTE_EQUIPMENT_IGNORE_DEPART'?: boolean
  'ROLLBACK_TASK'?: '0'
  'EUQ_QR_SCAN_PAGE'?: boolean
  'EQUIPMENT_USE_RECORD_NEED_SIGN'?: boolean
  'SAMPLE'?: string
  'GEN_SYSTEM_FILE'?: boolean
  'REPORT_MANAGE_SIGN_DATE_number'?: '1'
  'SHOW_MANUFACTURE'?: boolean
  'OUT_EQUIPMENT_LIMIT_SELECT'?: boolean
  'STARTING_DATE_OF_THE_SIGNATURE_LIST'?: '2025-03-06'
  'HUMITURE_BOOK_TEM_MAX'?: string
  'EQUIPMENT_CONTRAST'?: boolean
  'QUALIFICATION_STATEMENT_TYPE'?: 'NONE'
  'AUTO_PRINT_REPORT_GET_TABLE'?: boolean
  'DUPLICATE_CODE_SUFFIX'?: 'L'
  'DEFAULT_CREDIT'?: string
  'OTHER_14'?: 'wxceb3249d482b6746'
  'OTHER_15'?: '941ecdf4f78a17d25302ed7b79178ffe'
  'OTHER_16'?: '/export/hitek/importTemplate/设备导入模板_海特.xlsx'
  'OTHER_17'?: '/export/hitek/importTemplate/报告问题分类.xls'
  'OTHER_18'?: '/export/template/人员信息导入模板_海特.xlsx'
  'OTHER_19'?: '3'
  'FINISH_DELE_4'?: boolean
  'CAPACITY_WARNING_REVIEWER_LIMIT'?: string
  'REPORT_SIGN_STAMP'?: '1'
  'FINISH_DELE_3'?: '2'
  'INDUSTRY_EXTEND'?: boolean
  'FINISH_DELE_8'?: boolean
  'OTHER_10'?: 'a52ffbed-17f5-41ab-9bef-56b6b2ef6258'
  'TASK_REFER_ERROR_EQ_HANDLE'?: 'TASK_REFER_ERROR_EQ_HANDLE_1'
  'OTHER_11'?: 'mezPH5ZtVmtWuXvvM77ijpNxuVdVbua9k99OGiZaBRU'
  'FINISH_DELE_7'?: boolean
  'REPORT_FILE_WATERMARK_FONTSIZE'?: '60'
  'CONSIGN_MODULE'?: string
  'HANDBOOK_RECORD_MODIFY_LOG_TYPE'?: 'current'
  'DISABLED_ON_TOP'?: boolean
  'USE_NEW_SAMPLING_UI'?: boolean
  'consignRevocationControl'?: 'noControl'
  'HUMITURE_RECORD_OVER'?: '1'
  'REPORT_DISAGREES'?: '1'
  'REPORT_MANAGE_AUDIT_DATE'?: boolean
  'REVOKE_FROM_ISSUANCE'?: boolean
  'OTHER_23'?: '/export/hitek/importTemplate/设备检校记录导入示例.xlsx'
  'FINISH_DELE_9'?: '4'
  'OTHER_24'?: boolean
  'HUMITURE_BOOK'?: boolean
  'OTHER_27'?: '/export/hitek/importTemplate/eqCheckPlanTemp.xlsx'
  'QUALIFICATION_STATEMENT_ENABLE_TYPE'?: 'CONSIGN_DATE'
  'OTHER_28'?: '/export/hitek/importTemplate/eqCheckItemTemp.xlsx'
  'OTHER_29'?: '/export/hitek/importTemplate/导入参数配置.xlsx'
  'HITEK_IOT_ACCOUNT'?: string
  'REPORT_FILE_WATERMARK_TEXT'?: string
  'OTHER_20'?: boolean
  'CAPACITY_WARNING_EQ_LIMIT'?: string
  'FINISH_DELE_10'?: 'taskRecordReport'
  'OTHER_21'?: boolean
  'REVIEW_PERSON_REQUIRD'?: boolean
  'OTHER_22'?: boolean
  'NOT_USE_LAB_TESTINGRECORD'?: boolean
  'REPORT_DISCARDS'?: '0'
  'ACCOUNTS_SYNCHRONIZER'?: 'org.jeecgframework.web.system.synchronizer.ctvic.AccountSynchronizer'
  'REPORT_QR_CODE_INFO'?: 'critical'
  'REPORT_SUBMITS'?: '1'
  'TEST_DATETIME_FORMAT_SHOW'?: 'TIME_DATE_MIN_minute'
  'BIDDING_PERSON_UPDATE'?: '1'
  'SIGN_SMS_VERIFICATION'?: boolean
  'MERGE_SN'?: boolean
  'PROJECT_OUTPUT_STATISTICS_TYPE'?: 'naturalMonth'
  'CONSIGN_COMPLETES'?: '0'
  'STANDARD_CONTRAST'?: boolean
  'ALLOW_TESTER_PULL_TASK'?: boolean
  'FEE'?: string
  'ACCEPT_SAMPLE_23'?: boolean
  'TEST_SEE_STAMP_FILE'?: boolean
  'PASSWORD_MINIMUM_LENGTH'?: '8'
  'TESTER_HIDE_FEE'?: boolean
  'CAPACITY_WARNING_APPROVER_LIMIT'?: string
  'CAPACITY_WARNING_USER_STRATEGY'?: 'ALERT'
  'UDR_REFRESH'?: string
  'ENABLE_INTELLIGENT_SAMPLING'?: boolean
  'CONSIGN_DELETES'?: '0'
  'SN_UNIQUE'?: boolean
  'REPORT_MANAGE_31'?: boolean
  'TASK_ASSIGN_PARAMS'?: '0'
  'REPORT_MANAGE_30'?: '3'
  'REPORT_MANAGE_33'?: boolean
  'REPORT_MANAGE_32'?: '*.pdf|*.docx'
  'DISPLAYS_TEST_PERIOD'?: boolean
  'SIGN_DATE_FOLLOW_SYSTEM_SET'?: boolean
  'REPORT_SIGN_DATE_OVER_TODAY_REFUSE'?: boolean
  'CAPACITY_WARNING_EQ_STRATEGY'?: 'ALERT'
  'ACCEPT_SAMPLE_25'?: boolean
  'FEE_ADJUSTMENT'?: '0'
  'ACCEPT_SAMPLE_24'?: boolean
  'WORD_REPORT_EQUIPMENT_INFO_TEMPLATE'?: '[equipmentName] [equipmentCode] [standard]'
  'SIGN_LAST_FOUR_DIGITS_PHONE_VERIFICATION'?: boolean
  'EQUIPMENT_EGRESS_DATE'?: boolean
  'REPORT_MANAGE_35'?: string
  'REPORT_MANAGE_34'?: string
  'REPORT_MANAGE_37'?: 'none'
  'REPORT_MANAGE_36'?: boolean
  'EQUIPMENT_ALLOT_APPLY'?: boolean
  'REPORT_MANAGE_39'?: boolean
  'REPORT_MANAGE_38'?: boolean
  'CONSIGN'?: 'metaDatas|usingMetaData'
  'TASK'?: string
  'FEE_DEFERS'?: '0'
  'SAMPLE_MANAGE_5'?: '0'
  'REPORT_MANAGE_20'?: boolean
  'CONSIGN_WITH_COPY_OBJECT'?: boolean
  'TEST_TASK_AUTO_EQ_ALL'?: boolean
  'REPORT_MANAGE_22'?: 'picSign'
  'HUMITURE_MANAGE_AUTO'?: boolean
  'EQUIPMENT_SCHEDULE'?: boolean
  'TEST_TASK_AUTO_EQ'?: boolean
  'USE_NEW_CONSING_LIST_UI'?: boolean
  'TASK_ASSIGNMENT_PROMPT'?: string
  'REPORT_RECOVERS'?: '0'
  'SAMPLE_SHOW_30'?: boolean
  'VERIFY_SCHEME_AUDIT_STATUS'?: 'NOT_NOTICE'
  'ENABLE_PDF_BLINDING'?: boolean
  'TEST_DETECTION_18'?: boolean
  'HUMITURE_MANAGE_AUTO_START'?: '2024年11月19日 17:58:00'
  'REPORT_PRINTS'?: '1'
  'EQ_ENGINEERING_FIELD'?: boolean
  'REPORT_MANAGE_HYXT_PERSON_SET'?: boolean
  'TEST_CHARGE_2'?: boolean
  'REPORT_MANAGE_24'?: boolean
  'SAMPLE_MANAGE_1'?: boolean
  'SAMPLE_MANAGE_2'?: '5'
  'REPORT_MANAGE_23'?: 'origin'
  'SAMPLE_MANAGE_3'?: boolean
  'REPORT_MANAGE_26'?: boolean
  'HUMITURE_BOOK_CON'?: boolean
  'REPORT_MANAGE_25'?: boolean
  'REPORT_MANAGE_28'?: '3'
  'UNIT_NAME_EFFECT'?: 'cnsign_date'
  'REPORT_MANAGE_29'?: '3'
  'REPORT_MANAGE_51'?: boolean
  'REPORT_MANAGE_50'?: string
  'REPORT_APPROVE_BLIND_SAMPLE'?: boolean
  'ROLLBACK_SAMPLE'?: '0'
  'ROLLBACK_REPORT'?: '0'
  'R_M_C_DATE_TIP'?: boolean
  'REPORT_MODULE'?: string
  'REPORT_REVISE_SN_SUFFIX'?: 'GZ'
  'CONGIN_PARAM_DESIGN_REQUIREMENTS'?: boolean
  'AUTO_ADD_EXTRA_QUA'?: boolean
  'SAMPLE_DESCRIPTION_HISTORY_LOAD'?: boolean
  'REPORT_ISSUANCE'?: '1'
  'ROLLBACKS'?: string
  'SELECTED_SAMPLE_LAST_LAYER'?: boolean
  'HUMITURE_BOOK_HUM_MAX'?: string
  'REPORT_MANAGE_40'?: boolean
  'CONTRACT_MANAGE_4'?: boolean
  'REPORT_MANAGE_42'?: boolean
  'REPORT_MANAGE_41'?: boolean
  'REPORT_MANAGE_44'?: boolean
  'IMPORT_EQUIPMENT_INSERT_DICT_TYPE'?: boolean
  'REPORT_MANAGE_43'?: boolean
  'PRE_CONSIGN_PUSH_TYPE'?: boolean
  'S_T_DATE_TIP'?: boolean
  'EQ_UPKEEP_PLAN'?: '7'
  'EQUIPMENT_DATETIME_FORMAT_SHOW'?: 'TIME_DATE_MIN_minute'
  'project_user_required_config'?: 'project_user_required_config_01'
  'EQUIPMENT_TRANSFER_MANAGER'?: boolean
  'SAMPLE_LABEL_USE_SHORT_URL'?: boolean
  'REPORT_MANAGE_46'?: boolean
  'REPORT_MANAGE_45'?: boolean
  'REPORT_MANAGE_48'?: boolean
  'REPORT_MANAGE_47'?: boolean
  'AUTO_SUBMIT_STAMP_AUDIT'?: boolean
  'REPORT_MANAGE_49'?: '3'
}
