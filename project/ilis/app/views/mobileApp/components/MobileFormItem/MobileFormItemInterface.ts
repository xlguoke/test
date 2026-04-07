export interface PersonDTO {
  id: string
  name: string
  account: string
  type: 'USER' | 'DEPART'
  taskCount: number
  children: PersonDTO[] | null
  checked: boolean
  pid: string | null
  departOrder: null
  testDepart: boolean
}
