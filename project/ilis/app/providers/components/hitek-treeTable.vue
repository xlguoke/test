<template>
  <div class="hitek-treeTable">
    <div>
      <table ref="hitekTreeTable">
        <thead>
          <tr></tr>
        </thead>
        <tbody></tbody>
      </table>
      <div
        v-if="dataSource && dataSource.length == 0"
        class="hitek-treeTable-nodata"
      >
        无数据~
      </div>
    </div>
  </div>
</template>

<script>
// 引入万能jq
import '~/providers/libs/jQuery.3.6.0.min'

let hitekTreeTable = null

export default {
  props: [
    'columns',
    'defaultExpandAllRows',
    'dataSource',
    'defaultSelectData',
    'selectType',
    'isDefaultOpen',
  ],
  data() {
    return {
      selectData: [],
    }
  },
  watch: {
    columns() {
      this.buildHead()
      this.buildBody()
    },
    dataSource() {
      this.saveSelectData()
      this.buildBody()
    },
    defaultSelectData(newVal) {
      this.selectData = JSON.parse(JSON.stringify(newVal))
      this.buildBody()
    },
    selectType() {
      this.buildBody()
    },
  },
  mounted() {
    hitekTreeTable = $(this.$refs.hitekTreeTable)
    const eleId = `hitekTreeTable-${new Date().getTime()}`
    hitekTreeTable.attr('id', eleId)

    // 点击展开收起事件
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    $(document).on('click', `#${eleId} .hitek-treeTable-expend`, function () {
      self.controlTreeOpen($(this).data('id'), $(this).data('status'))
    })

    // 优化体验 点击行选中内容
    $(document).on('click', `#${eleId} .hitek-treeTable-person`, function (e) {
      if (e.target.tagName !== 'INPUT') {
        const checked = $(this).find('input').prop('checked')
        $(this).find('input').attr('checked', !checked)
      }

      self.selectData = self.selectData.filter(
        item => item.id !== $(this).find('input').data('id'),
      )
    })

    $(document).on(
      'change',
      `#${eleId} .hitek-treeTable-checkbox input`,
      function () {
        // if(e.target.tagName !== "INPUT") {
        //   let checked = $(this).find("input").prop("checked");
        //   $(this).find("input").attr("checked", !checked);
        // }

        self.selectData = self.selectData.filter(
          item => item.id !== $(this).data('id'),
        )
      },
    )

    this.buildHead()
    this.buildBody()
  },
  created() {
    this.selectData = JSON.parse(JSON.stringify(this.defaultSelectData))
  },
  methods: {
    // 控制展开收起
    controlTreeOpen(id, status) {
      if (status === 0) {
        hitekTreeTable.find(`tr[data-pid=${id}]`).show()
        hitekTreeTable
          .find(`.hitek-treeTable-expend[data-id=${id}]`)
          .data('status', 1)
          .text('-')
      }
      else if (status === 1) {
        hitekTreeTable.find(`tr[data-pid=${id}]`).hide()
        hitekTreeTable
          .find(`.hitek-treeTable-expend[data-id=${id}]`)
          .data('status', 0)
          .text('+')
      }
    },
    // 保存已选数据
    saveSelectData() {
      const elements = hitekTreeTable.find(
        '.hitek-treeTable-checkbox input:checked',
      )
      const data = []
      const obj = {}

      for (let i = 0; i < elements.length; i++) {
        if ($(elements[i]).data('meta')) {
          data.push($(elements[i]).data('meta'))
        }
      }

      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        obj[item.id] = item
      })

      let _selectObj = {}
      // eslint-disable-next-line array-callback-return
      this.selectData.map((item) => {
        _selectObj[item.id] = item
      })

      if (this.selectType === 'radio') {
        if (Object.keys(obj).length == 0) {
          _selectObj = {
            ..._selectObj,
          }
        }
        else {
          _selectObj = {
            ...obj,
          }
        }
      }
      else {
        _selectObj = {
          ...obj,
          ..._selectObj,
        }
      }

      this.selectData = Object.keys(_selectObj).map(item => _selectObj[item])
    },
    // 返回选择得数据
    getSelectData() {
      this.saveSelectData()
      const data = JSON.parse(JSON.stringify(this.selectData))
      this.selectData = []
      return data
    },
    // 渲染表头
    buildHead() {
      let headHtml = `<th class="hitek-treeTable-checkbox" width=60px><a-checkbox /></th>`
      // eslint-disable-next-line array-callback-return
      this.columns.map((column) => {
        headHtml += `<th width="${column.width}">${column.title}</th>`
      })
      hitekTreeTable.find('thead tr').html(headHtml)
    },
    // 去重

    // 渲染表格内容
    buildBody() {
      const ids = this.selectData.map(data => data.id)
      let bodyHtml = ''
      let selIdsArr = []
      // 默认给选中人员设置一个部门，解决一个人员在多个部门下的选择情况
      ids.forEach((item) => {
        this.dataSource.forEach((pItem) => {
          pItem.children.forEach((cItem) => {
            if (item === cItem.id) {
              selIdsArr.push({
                pid: pItem.id, // 部门id
                pname: pItem.name,
                cid: cItem.id, // 人员id
                cname: cItem.name,
              })
            }
          })
        })
      })

      // 去重
      ;(selIdsArr = ((arr) => {
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            if (arr[i].cid == arr[j].cid) {
              // 第一个等同于第二个，splice方法删除第二个
              arr.splice(j, 1)
              j--
            }
          }
        }
        return arr
      })(selIdsArr))

      // eslint-disable-next-line array-callback-return
      this.dataSource.map((item) => {
        bodyHtml += `<tr>`
        bodyHtml += `<td class="hitek-treeTable-checkbox">
          ${item.type === 'DEPART' ? '' : '<input type="checkbox" />'}
        </td>`
        for (let i = 0; i < this.columns.length; i++) {
          const column = this.columns[i]
          bodyHtml += `<td>`
          if (i == 0 && item.children && item.children.length > 0) {
            bodyHtml += `
              <span class="hitek-treeTable-expend" data-status="${
                this.isDefaultOpen === false ? 0 : 1
              }" data-id="${item.id}">${
                this.isDefaultOpen === false ? '+' : '-'
              }</span>
              ${item[column.dataIndex] || ''}
            `
          }
          else {
            bodyHtml += item[column.dataIndex] || ''
          }
          bodyHtml += `</td>`
        }
        bodyHtml += '</tr>'

        if (item.children && item.children.length > 0) {
          // eslint-disable-next-line array-callback-return
          item.children.map((child) => {
            bodyHtml += `<tr class="hitek-treeTable-person" data-pid="${item.id}" data-id="${child.id}">`
            bodyHtml += `
              <td class="hitek-treeTable-checkbox">
                <input  type="${
                  this.selectType === 'radio' ? 'radio' : 'checkbox'
                }" ${this.selectType === 'radio' ? 'name=radio' : ''}`
            // 设置回显选中
            selIdsArr.forEach((selitem) => {
              if (
                child.type !== 'DEPART'
                && selitem.pid == item.id
                && child.id == selitem.cid
              ) {
                bodyHtml += ` checked=true`
              }
            })
            bodyHtml += `${
              child.type === 'DEPART' ? 'disabled' : ''
            }  data-meta=${JSON.stringify(child)}  data-id="${
              child.id
            }"  /> </td>`

            for (let i = 0; i < this.columns.length; i++) {
              const column = this.columns[i]
              bodyHtml += `<td style="padding-left: ${
                i === 0 ? '32px' : ''
              };">`
              if (i == 0 && child.children && child.children.length > 0) {
                bodyHtml += `
                  <span>+</span>
                  ${child[column.dataIndex] || ''}
                `
              }
              else {
                bodyHtml += child[column.dataIndex] || ''
              }
              bodyHtml += `</td>`
            }
            bodyHtml += '</tr>'
          })
        }
      })
      hitekTreeTable.find('tbody').html(bodyHtml)

      if (this.isDefaultOpen === false) {
        this.openTree(ids)
      }
    },
    // 控制表格展开收起
    openTree(arr) {
      if (!Array.isArray(arr)) {
        arr = [arr]
      }

      hitekTreeTable.find('tbody').find(`tr.hitek-treeTable-person`).hide()
      // eslint-disable-next-line array-callback-return
      arr.map((id) => {
        const tr = hitekTreeTable.find(`tr[data-id=${id}]`)
        const pid = tr.data('pid')

        this.controlTreeOpen(pid, 0)
      })
    },
  },
}
</script>

<style lang="less">
.hitek-treeTable {
  .hitek-treeTable-nodata {
    text-align: center;
    font-size: 12px;
    padding-top: 20px;
    border: solid 1px #e2e2e2;
    border-top: 0;
    padding-bottom: 20px;
  }

  table {
    width: 100%;
    font-size: 12px;
    color: #333;
    border-top: solid 1px #e2e2e2;
    border-left: solid 1px #e2e2e2;

    thead th,
    tbody td {
      padding: 10px 8px;
      border-right: solid 1px #e2e2e2;
      border-bottom: solid 1px #e2e2e2;
    }

    input[type='radio'],
    input[type='checkbox'] {
      width: 16px;
      height: 16px;
    }

    .hitek-treeTable-checkbox {
      text-align: center;
    }

    .hitek-treeTable-expend {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: solid 1px #e2e2e2;
      text-align: center;
      line-height: 12px;
      margin-right: 5px;
      cursor: pointer;
    }
  }
}
</style>
