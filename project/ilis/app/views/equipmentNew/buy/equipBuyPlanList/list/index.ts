import dayjs from 'dayjs'

export const columns = [
  {
    title: '填写时间',
    dataIndex: 'createDate',
    width: '20%',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '申请人',
    dataIndex: 'applicant',
    width: '20%',
  },
  {
    title: '预算(总金额)',
    dataIndex: 'budget',
    width: '20%',
    customRender: ({ text }) => {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      return text ? `￥ ${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
    },
  },
  {
    title: '申请说明',
    dataIndex: 'applyExplain',
    width: '10%',
  },
  {
    title: '计划状态',
    dataIndex: 'status',
    width: '10%',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 125,
    scopedSlots: { customRender: 'operation' },
  },
]

export const detailColumns = [
  {
    title: '设备名称',
    dataIndex: 'name',
    width: '13%',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    width: '10%',
  },
  {
    title: '生产厂家',
    dataIndex: 'manufacturer',
    width: '11%',
  },
  {
    title: '申请处室',
    dataIndex: 'depart',
    width: '10%',
  },
  {
    title: '设备单价',
    dataIndex: 'price',
    width: '10%',
  },
  {
    title: '申购数量',
    dataIndex: 'amount',
    width: '10%',
  },
  {
    title: '总价',
    dataIndex: 'totalPrice',
    width: '10%',
  },
  {
    title: '购置原因及用途',
    dataIndex: 'reason',
    width: '13%',
  },
  {
    title: '设备使用规范',
    dataIndex: 'useRule',
    width: '13%',
  },
]
