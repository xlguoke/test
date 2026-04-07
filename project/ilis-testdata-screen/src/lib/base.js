import { Vue } from "vue-property-decorator";
import util from "@/lib/util";
import { SuccessState } from "@/constant/index";

export default class Base extends Vue {
  // 删除
  $del(opts) {
    const title = opts.title || "提示";
    const content = opts.content || "确认删除吗？";
    
    const api = opts.api;
    const data = opts.data;
    const success = opts.success;

    this.$Modal.confirm({
      title,
      content,
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        this.$showloading("数据处理中...");
        const res = await this.$store.dispatch({
          type: api,
          data
        });

        if (res.state == SuccessState) {
          this.$Message.success("删除成功");
          success && success();
        }
        this.$hideloading();
      }
    });
  }
}
