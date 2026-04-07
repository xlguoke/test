## 使用说明

```
<a-form>
  <a-form-item label="字典" name="dict">
    <DataDict v-model:value="dict" code="xxxx" />
  </a-form-item>
</a-form>
```

## API
| 参数 | 必需 |说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| value | 是 | 绑定值 | string、Array、number | - |
| code | 是 | 字典编码 | string | - |
| type | 否 | 组件类型 | select \| radio \| checkbox | `select` |
| mode | 否 | 设置 Select 的模式为多选或标签，仅type=select时生效 | multiple \| tags | - |
| labelKey | 否 | 选项label绑定属性 | string | `typeName` |
| valueKey | 否 | 选项value绑定属性 | string | `typeCode` |
| placeholder | 否 | 占位符 | string | '请选择' |
| disabled | 否 | 是否禁用 | boolean | false |

## 事件
| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 选中项变化时的回调 | function(val: string\|Array\|number, opt: options \| options[]){} |
