import { SignPostionConfigEntity } from './SignPostionConfigEntity'

export const mockData = SignPostionConfigEntity.fromJsonArray([
  {
    pageNo: 1,
    tag: '试验',
    signX: 10,
    signY: 30,
    signWidth: 23,
    signHeight: 25,
    index: 1,
    attachmentId: '111',
  },
  {
    pageNo: 2,
    tag: '试验',
    signX: 10,
    signY: 30,
    signWidth: 23,
    signHeight: 25,
    index: 1,
    attachmentId: '111',
  },
  {
    pageNo: 1,
    tag: '编写',
    signX: 60,
    signY: 30,
    signWidth: 23,
    signHeight: 25,
    index: 1,
    attachmentId: '111',
  },
])
