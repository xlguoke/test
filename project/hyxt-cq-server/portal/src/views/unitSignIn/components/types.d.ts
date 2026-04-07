export interface signinParTYpe {
  orgId: string; //机构ID
  orgName?: string //机构名称
  isExternal: boolean; //是否市外机构
  applicant: string; //申请人
  projectName: string; //工程名称
  applicantPhone: string; //申请人电话
  laboratoryType: string | null; //实验室类型
  laboratoryName: string; //实验室名称
  captcha: string; //验证码
  attachments: { name: string; url: string }[]; //附件
  auditAdmId: string // 行管单位id
  employedBy?:string   
}