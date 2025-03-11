# 高级查询组件

## 如何使用

- 基础使用，参考 app\views\common\humiture\timer\components\List.vue，文件下的引用，主要逻辑是配置表单项，最终通过配置项中的onQuery方法来接收高级组件表单中操作的值，来处理搜索；

## 自定义组件使用

- 参考下方代码，配置项中设置了QueryConfigType.自定义之后，使用插槽名与配置的name一致即可


    { type: QueryConfigType.自定义, label: "测试", name: "test" },

    <AdvancedQuery :entity="ilisAdvancedQuery">
        <template #test="{ record }">
            <a-form-item label="测试">
              <a-input v-model:value="record.value" placeholder="asdasdasd" />
            </a-form-item>
        </template>
    </AdvancedQuery>
