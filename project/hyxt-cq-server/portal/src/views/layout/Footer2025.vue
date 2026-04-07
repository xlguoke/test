<template>
  <div class="footer">
    <div class="drop-groups w1400 clearfix">
      <div class="drop-down">
        <a-dropdown :trigger="['click']" placement="topLeft">
          <p class="tag">国务院部门网站</p>
          <template #overlay>
            <ul class="drop-lists">
              <li><a href="https://www.mfa.gov.cn/" target="_blank">外交部</a></li>

              <li><a href="http://www.mod.gov.cn/" target="_blank">国防部</a></li>

              <li><a href="http://www.ndrc.gov.cn" target="_blank">国家发展和改革委员会</a></li>

              <li><a href="http://www.moe.gov.cn/" target="_blank">教育部</a></li>

              <li><a href="http://www.most.gov.cn" target="_blank">科学技术部</a></li>

              <li><a href="https://www.miit.gov.cn/" target="_blank">工业和信息化部</a></li>

              <li><a href="http://www.seac.gov.cn" target="_blank">国家民族事务委员会</a></li>

              <li><a href="https://www.mps.gov.cn/" target="_blank">公安部</a></li>

              <li><a href="http://www.mca.gov.cn/" target="_blank">民政部</a></li>

              <li><a href="http://www.moj.gov.cn/" target="_blank">司法部</a></li>

              <li><a href="http://www.mof.gov.cn/" target="_blank">财政部</a></li>

              <li><a href="http://www.mohrss.gov.cn/" target="_blank">人力资源和社会保障部</a></li>

              <li><a href="http://www.mnr.gov.cn/" target="_blank">自然资源部</a></li>

              <li><a href="http://www.mee.gov.cn/" target="_blank">生态环境部</a></li>

              <li><a href="http://www.mohurd.gov.cn/" target="_blank">住房和城乡建设部</a></li>

              <li><a href="http://www.mot.gov.cn/" target="_blank">交通运输部</a></li>

              <li><a href="http://www.mwr.gov.cn/" target="_blank">水利部</a></li>

              <li><a href="http://www.moa.gov.cn/" target="_blank">农业农村部</a></li>

              <li><a href="http://www.mofcom.gov.cn/" target="_blank">商务部</a></li>

              <li><a href="http://www.mct.gov.cn" target="_blank">文化和旅游部</a></li>

              <li><a href="http://www.nhc.gov.cn/" target="_blank">国家卫生健康委员会</a></li>

              <li><a href="http://www.mva.gov.cn" target="_blank">退役军人事务部</a></li>

              <li><a href="https://www.mem.gov.cn/" target="_blank">应急管理部</a></li>

              <li><a href="http://www.pbc.gov.cn/" target="_blank">人民银行</a></li>

              <li><a href="http://www.audit.gov.cn/" target="_blank">审计署</a></li>

              <li>
                <a href="http://www.moe.gov.cn/jyb_sy/China_Language/" target="_blank">
                  国家语言文字工作委员会
                </a>
              </li>

              <li><a href="http://www.caea.gov.cn" target="_blank">国家原子能机构</a></li>

              <li><a href="http://nnsa.mee.gov.cn/" target="_blank">国家核安全局</a></li>

              <li>
                <a href="http://www.sasac.gov.cn" target="_blank">国务院国有资产监督管理委员会</a>
              </li>

              <li><a href="http://www.customs.gov.cn/" target="_blank">海关总署</a></li>

              <li><a href="http://www.chinatax.gov.cn" target="_blank">国家税务总局</a></li>

              <li><a href="http://www.samr.gov.cn/" target="_blank">国家市场监督管理总局</a></li>

              <li><a href="http://www.nrta.gov.cn/" target="_blank">国家广播电视总局</a></li>

              <li><a href="http://www.sport.gov.cn" target="_blank">国家体育总局</a></li>

              <li><a href="http://www.stats.gov.cn" target="_blank">国家统计局</a></li>
            </ul>
          </template>
        </a-dropdown>
      </div>
      <div class="drop-down">
        <a-dropdown :trigger="['click']" placement="topLeft">
          <p class="tag">地方政府网站</p>
          <template #overlay>
            <ul class="drop-lists">
              <li><a href="http://www.beijing.gov.cn/" target="_blank">北京</a></li>

              <li><a href="http://www.tj.gov.cn/" target="_blank">天津</a></li>

              <li><a href="http://www.hebei.gov.cn/" target="_blank">河北</a></li>

              <li><a href="http://www.shanxi.gov.cn/" target="_blank">山西</a></li>

              <li><a href="http://www.ln.gov.cn/" target="_blank">辽宁</a></li>

              <li><a href="http://www.nmg.gov.cn/" target="_blank">内蒙古</a></li>

              <li><a href="http://www.jl.gov.cn/" target="_blank">吉林</a></li>

              <li><a href="http://www.hlj.gov.cn/" target="_blank">黑龙江</a></li>

              <li><a href="https://www.shanghai.gov.cn/" target="_blank">上海</a></li>

              <li><a href="http://www.jiangsu.gov.cn/" target="_blank">江苏</a></li>

              <li><a href="http://www.zj.gov.cn/" target="_blank">浙江</a></li>

              <li><a href="http://www.ah.gov.cn/" target="_blank">安徽</a></li>

              <li><a href="http://www.fujian.gov.cn/" target="_blank">福建</a></li>

              <li><a href="http://www.jiangxi.gov.cn/" target="_blank">江西</a></li>

              <li><a href="http://www.shandong.gov.cn/" target="_blank">山东</a></li>

              <li><a href="http://www.henan.gov.cn/" target="_blank">河南</a></li>

              <li><a href="http://www.hubei.gov.cn/" target="_blank">湖北</a></li>

              <li><a href="http://www.hunan.gov.cn/" target="_blank">湖南</a></li>

              <li><a href="http://www.gd.gov.cn/" target="_blank">广东</a></li>

              <li><a href="http://www.gxzf.gov.cn/" target="_blank">广西</a></li>

              <li><a href="https://www.hainan.gov.cn/" target="_blank">海南</a></li>

              <li><a href="http://www.cq.gov.cn" target="_blank">重庆</a></li>

              <li><a href="http://www.sc.gov.cn/" target="_blank">四川</a></li>

              <li><a href="http://www.guizhou.gov.cn/" target="_blank">贵州</a></li>

              <li><a href="http://www.yn.gov.cn/" target="_blank">云南</a></li>

              <li><a href="http://www.xizang.gov.cn/" target="_blank">西藏</a></li>

              <li><a href="http://www.shaanxi.gov.cn/" target="_blank">陕西</a></li>

              <li><a href="http://www.gansu.gov.cn/" target="_blank">甘肃</a></li>

              <li><a href="http://www.qinghai.gov.cn/" target="_blank">青海</a></li>

              <li><a href="http://www.nx.gov.cn/" target="_blank">宁夏</a></li>

              <li><a href="http://www.xinjiang.gov.cn/" target="_blank">新疆</a></li>

              <li><a href="http://www.gov.hk/sc/residents/" target="_blank">香港</a></li>

              <li>
                <a href="https://www.gov.mo/zh-hant/" target="_blank">澳门</a>
              </li>

              <li><a href="http://www.gwytb.gov.cn/" target="_blank">台湾</a></li>

              <li><a href="http://www.xjbt.gov.cn/" target="_blank">新疆生产建设兵团</a></li>
            </ul>
          </template>
        </a-dropdown>
      </div>
      <div class="drop-down">
        <a-dropdown :trigger="['click']" placement="topLeft">
          <p class="tag">部门政府网站</p>
          <template #overlay>
            <ul class="drop-lists">
              <li><a href="http://fzggw.cq.gov.cn/" target="_blank">市发展改革委</a></li>

              <li><a href="http://jw.cq.gov.cn/" target="_blank">市教委</a></li>

              <li><a href="http://kjj.cq.gov.cn/" target="_blank">市科技局</a></li>

              <li><a href="http://jjxxw.cq.gov.cn/" target="_blank">市经济信息委</a></li>

              <li><a href="http://mzzjw.cq.gov.cn" target="_blank">市民族宗教委</a></li>

              <li><a href="http://gaj.cq.gov.cn/" target="_blank">市公安局</a></li>

              <li><a href="http://mzj.cq.gov.cn" target="_blank">市民政局</a></li>

              <li><a href="http://sfj.cq.gov.cn" target="_blank">市司法局</a></li>

              <li><a href="http://czj.cq.gov.cn/" target="_blank">市财政局</a></li>

              <li><a href="http://rlsbj.cq.gov.cn/" target="_blank">市人力社保局</a></li>

              <li><a href="http://ghzrzyj.cq.gov.cn" target="_blank">市规划自然资源局</a></li>

              <li><a href="http://sthjj.cq.gov.cn" target="_blank">市生态环境局</a></li>

              <li><a href="http://zfcxjw.cq.gov.cn/" target="_blank">市住房城乡建委</a></li>

              <li><a href="http://cgj.cq.gov.cn/" target="_blank">市城市管理局</a></li>

              <li><a href="http://jtj.cq.gov.cn/" target="_blank">市交通运输委</a></li>

              <li><a href="http://slj.cq.gov.cn/" target="_blank">市水利局</a></li>

              <li><a href="http://nyncw.cq.gov.cn/" target="_blank">市农业农村委</a></li>

              <li><a href="http://sww.cq.gov.cn" target="_blank">市商务委</a></li>

              <li><a href="http://whlyw.cq.gov.cn/" target="_blank">市文化旅游委</a></li>

              <li><a href="http://wsjkw.cq.gov.cn/" target="_blank">市卫生健康委</a></li>

              <li>
                <a href="http://tyjrswj.cq.gov.cn/index.html" target="_blank">市退役军人事务局</a>
              </li>

              <li><a href="http://yjj.cq.gov.cn" target="_blank">市应急管理局</a></li>

              <li><a href="http://sjj.cq.gov.cn/" target="_blank">市审计局</a></li>

              <li><a href="http://zfwb.cq.gov.cn/" target="_blank">市政府外办</a></li>

              <li><a href="http://gzw.cq.gov.cn/" target="_blank">市国资委</a></li>

              <li><a href="http://scjgj.cq.gov.cn/" target="_blank">市市场监管局</a></li>

              <li><a href="http://tyj.cq.gov.cn" target="_blank">市体育局</a></li>

              <li><a href="http://tjj.cq.gov.cn/" target="_blank">市统计局</a></li>

              <li><a href="https://ylbzj.cq.gov.cn/index.html" target="_blank">市医保局</a></li>

              <li><a href="http://jgswj.cq.gov.cn" target="_blank">市机关事务局</a></li>

              <li><a href="http://xfb.cq.gov.cn/" target="_blank">市信访办</a></li>

              <li><a href="http://dsjj.cq.gov.cn/index.html" target="_blank">市大数据发展局</a></li>

              <li>
                <a href="http://zfkawlb.cq.gov.cn/index.html" target="_blank">市政府口岸物流办</a>
              </li>

              <li><a href="http://rmfkb.cq.gov.cn/" target="_blank">市国防动员办</a></li>

              <li><a href="https://gbdsj.cq.gov.cn/" target="_blank">市广电局</a></li>

              <li><a href="http://lyj.cq.gov.cn/" target="_blank">市林业局</a></li>

              <li><a href="http://yaojianju.cq.gov.cn" target="_blank">市药监局</a></li>

              <li><a href="http://zscqj.cq.gov.cn" target="_blank">市知识产权局</a></li>

              <!-- <li><a href="http://ljxq.cq.gov.cn/" target="_blank">两江新区管委会</a></li> -->

              <li>
                <a href="http://gxq.cq.gov.cn/" target="_blank">西部科学城重庆高新区管委会</a>
              </li>

              <li><a href="http://ws.cq.gov.cn" target="_blank">万盛经开区管委会</a></li>

              <li><a href="http://jkq.cq.gov.cn" target="_blank">重庆经开区管委会</a></li>

              <li><a href="http://gxhzs.cq.gov.cn/" target="_blank">市供销合作社</a></li>
            </ul>
          </template>
        </a-dropdown>
      </div>
      <div class="drop-down">
        <a-dropdown :trigger="['click']" placement="topLeft">
          <p class="tag">区（县）政府网站</p>
          <template #overlay>
            <ul class="drop-lists">
              <li><a href="https://www.ljxq.gov.cn/" target="_blank">两江新区</a></li>

              <li><a href="http://www.wz.gov.cn/" target="_blank">万州区</a></li>

              <li><a href="http://www.qianjiang.gov.cn" target="_blank">黔江区</a></li>

              <li><a href="http://www.fl.gov.cn/" target="_blank">涪陵区</a></li>

              <li><a href="http://www.cqyz.gov.cn/" target="_blank">渝中区</a></li>

              <li><a href="http://www.ddk.gov.cn/" target="_blank">大渡口区</a></li>

              <li><a href="http://cqspb.gov.cn/" target="_blank">沙坪坝区</a></li>

              <li><a href="http://www.cqjlp.gov.cn" target="_blank">九龙坡区</a></li>

              <li><a href="http://www.cqna.gov.cn/" target="_blank">南岸区</a></li>

              <li><a href="http://www.beibei.gov.cn/" target="_blank">北碚区</a></li>

              <li><a href="http://www.cqbn.gov.cn/" target="_blank">巴南区</a></li>

              <li><a href="http://www.cqcs.gov.cn/" target="_blank">长寿区</a></li>

              <li><a href="http://www.jiangjin.gov.cn/" target="_blank">江津区</a></li>

              <li><a href="http://www.hc.gov.cn/" target="_blank">合川区</a></li>

              <li><a href="http://www.cqyc.gov.cn" target="_blank">永川区</a></li>

              <li><a href="http://www.cqnc.gov.cn" target="_blank">南川区</a></li>

              <li><a href="http://www.cqqj.gov.cn/" target="_blank">綦江区</a></li>

              <li><a href="http://www.dazu.gov.cn/" target="_blank">大足区</a></li>

              <li><a href="https://www.cqstl.gov.cn" target="_blank">铜梁区</a></li>

              <li><a href="http://www.bishan.gov.cn" target="_blank">璧山区</a></li>

              <li><a href="http://www.cqtn.gov.cn/" target="_blank">潼南区</a></li>

              <li><a href="http://www.rongchang.gov.cn/" target="_blank">荣昌区</a></li>

              <li><a href="http://www.cqkz.gov.cn" target="_blank">开州区</a></li>

              <li><a href="http://www.cqlp.gov.cn/" target="_blank">梁平区</a></li>

              <li><a href="http://www.cqwl.gov.cn/" target="_blank">武隆区</a></li>

              <li><a href="http://www.cqck.gov.cn/" target="_blank">城口县</a></li>

              <li><a href="http://www.cqfd.gov.cn/" target="_blank">丰都县</a></li>

              <li><a href="http://www.zhongxian.gov.cn" target="_blank">忠县</a></li>

              <li><a href="http://www.cqsdj.gov.cn" target="_blank">垫江县</a></li>

              <li><a href="http://www.yunyang.gov.cn" target="_blank">云阳县</a></li>

              <li><a href="http://www.cqfj.gov.cn/" target="_blank">奉节县</a></li>

              <li><a href="http://www.cqws.gov.cn/" target="_blank">巫山县</a></li>

              <li><a href="http://www.cqwx.gov.cn/" target="_blank">巫溪县</a></li>

              <li><a href="http://www.cqszx.gov.cn" target="_blank">石柱县</a></li>

              <li><a href="http://www.cqxs.gov.cn/" target="_blank">秀山县</a></li>

              <li><a href="http://www.youyang.gov.cn" target="_blank">酉阳县</a></li>

              <li><a href="http://www.psx.gov.cn/" target="_blank">彭水县</a></li>
            </ul>
          </template>
        </a-dropdown>
      </div>
      <div class="drop-down">
        <a-dropdown :trigger="['click']" placement="topLeft">
          <p class="tag">其他网站</p>
          <template #overlay>
            <ul class="drop-lists">
              <li><a href="http://www.cqnews.net" target="_blank">华龙网</a></li>

              <li><a href="http://www.cq.chinanews.com" target="_blank">重庆新闻网</a></li>

              <li><a href="http://www.xinhuanet.com" target="_blank">新华网</a></li>

              <li><a href="http://www.people.com.cn" target="_blank">中国人民网</a></li>
            </ul>
          </template>
        </a-dropdown>
      </div>
    </div>

    <div class="f-con clearfix w1400">
      <div class="f-text lf">
        <a>相关链接:</a>
        <a href="http://www.mot.gov.cn/" target="_blank">交通运输部</a>
        <a href=" https://www.ttiis.cn/" target="_blank">公路水运工程质量检测管理信息系统</a>
        <!-- <a href="http://zizhan.mot.gov.cn/sj2019/anzhis/" target="_blank">
          交通运输部安全与质量监督管理司
        </a> -->
        <a href="https://cahwecticc.com" target="_blank">中国交通建设监理协会试验检测工作委员会</a>
        <a href="https://jtj.cq.gov.cn" target="_blank">重庆市交通运输委员会</a>
        <a href="https://xyjt.jtj.cq.gov.cn:18000/gl/" target="_blank">
          重庆市公路建设市场监督管理系统
        </a>
        <a href="https://xyjt.jtj.cq.gov.cn:18000/gl/sy" target="_blank">
          重庆市水运建设市场信用信息管理系统
        </a>
      </div>
      <div class="f-link">
        <a href="https://jtj.cq.gov.cn/ggbf_search/lxwm/" target="_blank">联系我们</a>
        <span>|</span>
        <a href="https://jtj.cq.gov.cn/ggbf_search/wzdt/" target="_blank">网站地图</a>
        <span>|</span>
        <a href="https://jtj.cq.gov.cn/ggbf_search/bqsm/" target="_blank">版权声明</a>
      </div>
      <div class="f-text lf">
        <p>
          <span>版权所有：重庆市交通运输委员会</span>
          <span>主办单位：重庆市交通运输委员会</span>
        </p>
        <p>
          <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">
            ICP备案：渝ICP备2021005620号-2
          </a>
          <span>网站标识码：5000000041</span>
          <a
            href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50011202501695"
            target="_blank"
          >
            渝公网安备50011202501695号
          </a>
        </p>
        <p>
          <span>重庆市交通运输委员会值班电话：023-89183000</span>
          <span>传真：023-89183222</span>
        </p>
        <p>
          <span>行政审批咨询电话：023-88754038</span>
          <span>服务监督电话：023-12328</span>
        </p>
        <p><span>公路、水运建设市场信用系统咨询电话：023-88754038</span></p>
      </div>
      <div class="f-img rt">
        <a
          href="http://bszs.conac.cn/sitename?method=show&id=2A36EF07B79F7931E053022819ACE4E3"
          target="_blank"
        >
          <img src="@/assets/images/m8-badge2.png" alt="" />
        </a>
        <a
          href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50011202501695"
          target="_blank"
        >
          <img src="@/assets/images/m8-badge3.png" alt="" />
        </a>
        <a @click="jcLink('5000000041')">
          <img src="https://zfwzgl.www.gov.cn/exposure/images/jiucuo.png?v=5000000041" />
        </a>
        <a target="_blank" href="http://wza.isc.org.cn/rzpt/bsgl/dt/20230311/1452.html">
          <img src="@/assets/images/2024f-wza.png" />
        </a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
function jcLink(code) {
  window.open(
    "https://zfwzgl.www.gov.cn/exposure/jiucuo.html?site_code=" +
      code +
      "&url=" +
      window.location.href
  )
}
</script>
<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  word-break: break-all;
}
.xcConfirm * {
  box-sizing: content-box;
}
ul,
li,
ol {
  list-style: none;
}
table tr td,
table {
  border-collapse: collapse;
}
body {
  font-size: 0;
  margin: 0 auto;
  min-width: 1400px;
  font-family: MicrosoftYaHei;
  color: #333333;
  /*min-height: 100vh;*/
  max-width: 1920px;
}
#ariaTipText {
  display: none;
}
.disNo {
  display: none;
}
.ml0 {
  margin-left: 0;
}
a {
  display: inline-block;
  cursor: pointer;
  text-decoration: none;
  color: #333333;
}
a img {
  border: none;
}
a.hover-blue:hover,
.hover-blue a:hover {
  color: #0f2869;
}
.clearfix {
  zoom: 1;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
  line-height: 0;
}

.clearfix:after {
  clear: both;
}
.lf {
  float: left;
}
.rt {
  float: right;
}
.flex {
  display: flex;
  flex-wrap: wrap;
}
.flex-1 {
  flex: 1;
}
.flex-center {
  display: flex;
  justify-content: center;
}
.flex-btw {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
.flex-col-center {
  display: flex;
  align-items: center;
}
.flex-col-bt {
  display: flex;
  align-items: flex-end;
}
input,
textarea {
  outline: none;
  background: 0 0;
}
input,
button,
text {
  vertical-align: top;
  outline: none;
  border: none;
  color: #333333;
}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  -webkit-text-fill-color: #333 !important;
}
input::placeholder {
  color: #666666;
}
input::-webkit-input-placeholder {
  /*WebKit browsers*/
  color: #666666;
}
input::-moz-input-placeholder {
  /*Mozilla Firefox*/
  color: #666666;
}
input::-ms-input-placeholder {
  /*Internet Explorer*/
  color: #666666;
}
input.place-999::placeholder {
  color: #999999;
}
input.place-999::-webkit-input-placeholder {
  /*WebKit browsers*/
  color: #999999;
}
input.place-999::-moz-input-placeholder {
  /*Mozilla Firefox*/
  color: #999999;
}
input.place-999::-ms-input-placeholder {
  /*Internet Explorer*/
  color: #999999;
}
.w1400 {
  width: 1400px;
  margin: 0 auto;
}
.pos-rel {
  position: relative;
}
/*鍗曡鐪佺暐*/
.e1 {
  overflow: hidden; /*瓒呭嚭鐨勯儴鍒嗛殣钘忚捣鏉ャ€�*/
  white-space: nowrap; /*涓嶆樉绀虹殑鍦版柟鐢ㄧ渷鐣ュ彿...浠ｆ浛*/
  text-overflow: ellipsis; /* 鏀寔 IE */
}
/*澶氳鐪佺暐*/
.e2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.e3 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.icon {
  vertical-align: middle;
  margin-top: -2px;
}
.dis-block {
  display: block;
}
.text-center {
  text-align: center;
}
.text-lf {
  text-align: left;
}
.text-rt {
  text-align: right;
}
/*澶撮儴鏍峰紡 start*/
.header {
  height: 170px;
  font-size: 0;
  background: url(2024topbg.png) bottom center no-repeat;
}
.header-top {
  padding: 16px 0;
}
.header-top a,
.header-top span {
  color: #000000;
  font-size: 14px;
}
.header-top .line {
  margin: 0 17px;
}
.header-top .rt a,
.header-top .rt span {
  margin-left: 12px;
}
/*.header-top .rt .ghb{
  margin-right: 30px;
}*/
.header-con {
  margin-top: 8px;
}
.header-search-box {
  width: 700px;
  margin-top: 12px;
}
.header-search {
  width: 100%;
  height: 53px;
  background-color: #ffffff;
  border-radius: 10px;
  border: solid 1px rgba(70, 122, 192, 0.98);
  margin: auto;
  display: flex;
}
.header-search-input {
  height: 51px;
  width: 580px;
  font-size: 18px;
  padding: 0 20px 0 0;
  margin-left: 20px;
}
.header-search-btn {
  width: 120px;
  height: 53px;
  line-height: 53px;
  background-color: #cb0000;
  border-radius: 0 10px 10px 0;
  position: relative;
  margin-top: -1px;
  margin-right: -1px;
  font-size: 24px;
  margin-bottom: -1px;
  color: #ffffff;
  text-align: center;
  cursor: pointer;
}
.header-hot-search {
  display: none;
  line-height: 34px;
  margin-top: 10px;
  padding-left: 21px;
  /*background-color: rgba(7, 7, 7, 0.51);*/
  background: url("./sy_search_hot_bg.png") left top no-repeat;
  /*background-color: rgba(255, 255, 255, 0.5);*/
}
.header-hot-search .label {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  margin-right: 20px;
}
.header-hot-search a {
  font-size: 16px;
  color: #ffffff;
}
.header-hot-search a:not(:last-of-type) {
  margin-right: 40px;
}
.header-navs {
  height: 72px;
  background: #2478cf;
}
.header-nav {
  color: #ffffff;
  font-size: 24px;
  width: 230px;
  text-align: center;
  border-radius: 10px 10px 0 0;
  line-height: 72px;
}
.header-nav.cur,
.header-nav:hover {
  font-size: 26px;
  font-weight: bold;
  position: relative;
  background: #2f4c87;
}
.header-nav.cur:after,
.header-nav:hover:after {
  content: "";
  width: 100%;
  height: 7px;
  background-color: #cb0000;
  position: absolute;
  left: 0;
  bottom: 0;
}
/*澶撮儴鏍峰紡 end*/
/*搴曢儴鏍峰紡 start*/
.footer {
  width: 100%;
  background-color: #0f2869;
  border-top: 3px solid #467ac0;
  padding-top: 25px;
  padding-bottom: 40px;
  font-size: 0;
}
.drop-groups {
  position: relative;
}
.drop-down {
  width: 178px;
  float: left;
  margin-right: 127px;
}
.drop-groups .drop-down:last-child {
  margin-right: 0;
}
.drop-down .tag {
  font-size: 16px;
  color: #666666;
  padding: 0 22px 0 12px;
  background: url("@/assets/images/2024f-ic1.png") 158px center no-repeat #f7f7f7;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #0f2869;
  line-height: 36px;
}
.drop-lists {
  width: 100vw;
  background: #fff;
  border: 1px solid #0662b1;
}
.drop-lists li {
  width: 14.28%;
  vertical-align: top;
  display: inline-block;
  text-align: center;
  line-height: 36px;
  height: 36px;
}
.drop-lists li a {
  display: inline-block;
  font-size: 14px;
  padding: 0 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
}
.drop-lists li a:hover {
  font-weight: bold;
}
.f-link {
  margin-top: 26px;
}
.f-link a,
.f-link span {
  display: inline-block;
  color: #ffffff;
  font-size: 16px;
  vertical-align: middle;
}
.f-link a {
  letter-spacing: 1px;
}
.f-link span {
  margin: 0 24px;
}
.f-text {
  line-height: 36px;
  margin-top: 8px;
}
.f-text span,
.f-text a {
  display: inline-block;
  margin-right: 28px;
  color: #fff;
  font-size: 16px;
}
.f-img {
  margin-top: 48px;
}
.f-img a {
  display: inline-block;
  margin-left: 12px;
  vertical-align: middle;
}
/*搴曢儴鏍峰紡 end*/
/*褰撳墠浣嶇疆*/
.local {
  background: #f5f5f5;
  padding: 18px 0;
  line-height: 26px;
  position: relative;
}
.local > div {
  padding: 0 8px;
}
.local img {
  vertical-align: middle;
  margin-right: 16px;
}
.local span,
.local a {
  display: inline;
  font-size: 16px;
  color: #333333;
  vertical-align: middle;
}
.local .arrow {
  margin: 0 4px;
}
#guidangCon {
  display: none;
  position: absolute;
  width: 148px;
  height: 148px;
  background: url(/images/guidang.png) no-repeat;
  background-size: 100% 100%;
  right: 10px;
  top: -14px;
  z-index: 999;
}
#guidangCon p {
  display: block;
  font-size: 16px;
  color: #da5857;
  margin-top: 100px;
  font-weight: bold;
  text-align: center;
}
/*褰撳墠浣嶇疆 end*/
/*缈婚〉*/
.pagination {
  text-align: center;
  margin-top: 40px;
}
.pagination a {
  display: inline-block;
  text-align: center;
  font-size: 14px;
  color: #4e4e4e;
  border: 1px solid #dfdfdf;
  line-height: 32px;
  min-width: 32px;
  padding: 0 12px;
  margin: 0 1px;
}
.pagination .active {
  background: #2478cf;
  border-color: #2478cf;
  color: #fff;
}
/*缈婚〉 end*/

.h5show {
  display: none;
}

@media screen and (max-width: 768px) {
  .pcshow {
    display: none;
  }
  .h5show {
    display: block;
  }
  .list-more {
    display: block;
    line-height: 0.6rem;
    font-size: 0.3rem;
    color: #00458b;
    text-align: center;
  }
  .list-more.mt-20 {
    margin-top: 0.2rem;
  }
  body {
    min-width: auto;
  }
  .w1400 {
    width: 100%;
  }
  .header {
    height: auto;
    padding-bottom: 0.4rem;
    background-size: auto 100%;
  }
  .header-top {
    padding: 0.1rem 0.2rem;
  }
  .header-top .lf {
    display: none;
  }
  .header-top .rt a,
  .header-top .rt span {
    margin-left: 0.1rem;
  }
  .header-top .rt .ghb {
    margin-right: 0.2rem;
  }
  .header-con {
    margin-top: 0.4rem;
  }
  .header-con .logo {
    display: block;
    margin: 0 auto;
    width: 80%;
  }
  .header-con .logo img {
    width: 100%;
  }
  .header-search-box {
    float: none;
    margin: 0.3rem auto 0;
    width: 80%;
  }
  .header-search {
    /* line-height: .8rem; */
    height: auto;
  }
  .header-search-input {
    height: 0.8rem;
    font-size: 0.32rem;
    padding: 0 0.2rem 0 0;
    margin-left: 0.2rem;
  }
  .header-search-btn {
    white-space: nowrap;
    font-size: 0.32rem;
    line-height: 0.8rem;
    height: auto;
  }
  .header-navs {
    height: auto;
  }
  .header-navs > div {
    flex-wrap: wrap;
  }
  .header-nav {
    width: 30%;
    font-size: 0.36rem;
    line-height: 0.8rem;
    border-radius: 0.1rem 0.1rem 0 0;
  }
  .header-nav.cur,
  .header-nav:hover {
    font-size: 0.36rem;
  }
  .header-nav.cur:after,
  .header-nav:hover:after {
    height: 0.04rem;
  }
  .local {
    padding: 0.2rem 0;
  }
  .local img {
    margin-right: 0.2rem;
    height: 0.3rem;
  }
  .local span,
  .local a {
    font-size: 0.32rem;
  }
  .pagination {
    margin-top: 0.3rem;
  }
  .pagination a {
    font-size: 0.3rem;
    padding: 0 0.1rem;
    line-height: 0.5rem;
    min-width: 0.5rem;
  }
  .footer {
    padding: 0.3rem 0;
  }
  .drop-groups {
    display: none;
  }
  .f-link {
    margin-top: 0;
    text-align: center;
  }
  .f-link a,
  .f-link span {
    font-size: 0.32rem;
  }
  .f-link span {
    margin: 0 0.2rem;
  }
  .f-text {
    width: 100%;
    text-align: center;
    line-height: 0.4rem;
  }
  .f-text a,
  .f-text span {
    font-size: 0.28rem;
    margin: 0 0.2rem;
  }
  .f-img {
    width: 100%;
    margin-top: 0.3rem;
    text-align: center;
  }
  .f-img img {
    height: 0.86rem;
  }
}
table tr td,
table {
  border-collapse: collapse;
}
.xl-main {
  padding-top: 30px;
  position: relative;
}
.zwxl-main {
  padding-bottom: 50px;
}
.zwxl-head {
  width: 1078px;
  margin: 0 auto;
  border: 1px solid #e5e5e5;
  padding-top: 30px;
  padding-left: 40px;
  padding-bottom: 16px;
}
.zwxl-head span {
  color: #333333;
  font-size: 16px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 18px;
  margin-bottom: 16px;
}
.zwxl-head .tit {
  width: 98px;
}
.zwxl-head .con {
  width: 230px;
  margin-right: 31px;
}
.zwxl-title {
  text-align: center;
  padding-top: 36px;
}
.zwxl-title p.tit {
  color: #333333;
  font-size: 30px;
  padding: 0 30px;
  margin-bottom: 20px;
}
.zwxl-bar {
  height: 32px;
  line-height: 32px;
  margin-bottom: 34px;
}
.zwxl-bar span {
  color: #666666;
  font-size: 16px;
  display: inline-block;
}
.zwxl-bar span.con {
  margin-right: 50px;
}
.zwxl-font {
  display: inline-block;
  padding: 2px;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  height: 32px;
}
.zwxl-font img {
  float: left;
}
.zwxl-font span {
  line-height: 26px;
  color: #6a6a6a;
  margin: 0 11px;
  cursor: pointer;
}
.zwxl-font span:hover {
  font-weight: bold;
}
.zwxl-font span.cur {
  color: #3354a2;
}
.zwxl-article {
  /*width: 1060px;
  margin: 0 auto;*/
  padding: 35px 30px 0;
  line-height: 30px;
  color: #333333;
  font-size: 16px;
  border-top: 1px solid #e5e5e5;
}
.zwxl-article-img {
  text-align: center;
  padding-top: 10px;
  padding-bottom: 32px;
}
.zwxl-article-img img {
  max-width: 100%;
}
.zwxl-article p {
  margin-bottom: 12px;
}
.zwxl-article p.title {
  text-align: center;
  font-size: 26px;
  font-weight: bold;
  line-height: 36px;
}
.zwxl-article p.author {
  text-align: right;
  margin-top: 40px;
}
.zwxl-article .fj a {
  display: inline-block;
  margin-left: 20px;
  line-height: 30px;
}
.zwxl-article .fj a img {
  margin-right: 12px;
}
.zwxl-article .fj a:hover {
  text-decoration: underline;
}
.zwxl-yzm {
  margin-top: 48px;
  text-align: center;
}
.zwxl-yzm p {
  color: #666666;
  font-size: 16px;
  margin-top: 12px;
}
.zwxl-share {
  text-align: right;
  padding: 0 24px;
  margin-top: 50px;
}
.zwxl-share span {
  color: #666666;
  font-size: 14px;
  line-height: 26px;
}
.zwxl-share a {
  display: inline-block;
  margin-left: 8px;
  vertical-align: middle;
}
.zwxl-share a:hover {
  opacity: 0.8;
  -moz-opacity: 0, 8;
  filter: alpha(opacity=80);
}
.zwxl-table {
  margin: 0 auto;
}
.zwxl-table .t1 {
  width: 140px;
  text-align: center;
  height: 36px;
  font-size: 16px;
  color: #333333;
}
.zwxl-table,
.zwxl-table tr,
.zwxl-table td {
  border: 1px solid #e5e5e5;
}
.zwxl-table .t2 {
  width: 430px;
  box-sizing: border-box;
  padding-left: 20px;
  padding-right: 10px;
  font-size: 16px;
  color: #333333;
}
.zwxl-article img,
.zwxl-article video {
  max-width: 100%;
}
.xl-link {
  width: 360px;
  display: none;
}
.xl-link-item .tit {
  color: #2760b7;
  font-weight: 600;
  font-size: 16px;
  line-height: 30px;
  margin-bottom: 10px;
}
.xl-link-item .con {
  font-size: 14px;
  line-height: 28px;
  margin-bottom: 20px;
}
.xl-link-item .con a {
  color: #333;
}
.xl-link-item .con a img {
  width: 200px;
}
.xl-link-item .con i {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 100%;
  background: #c2cdd7;
  margin-right: 12px;
  vertical-align: middle;
  margin-top: -2px;
}
.xl-article .xl-link-item {
  border-bottom: 1px solid #eeeeee;
  padding: 0 24px;
  margin-top: 100px;
}
.xl-article .xl-link-item .tit {
  color: #ff0000;
  font-size: 16px;
}
.xl-article .xl-link-item .con {
  color: #333333;
  font-size: 16px;
  line-height: 32px;
}
.xl-w1000 {
  width: 1000px;
  float: left;
  border-right: 1px solid #eee;
  padding-right: 40px;
}

@media screen and (max-width: 768px) {
  .xl-main {
    padding: 0.3rem 0.2rem;
  }
  .zwxl-main {
    padding: 0;
  }
  .zwxl-title {
    padding-top: 0.3rem;
  }
  .zwxl-title p.tit {
    padding: 0 0.3rem;
    font-size: 0.5rem;
  }
  .zwxl-bar {
    height: auto;
    padding: 0 0.3rem;
    margin-bottom: 0.3rem;
  }
  .zwxl-bar span {
    font-size: 0.32rem;
  }
  .zwxl-bar span.con {
    margin-right: 0.3rem;
  }
  .zwxl-font {
    margin-top: 0.2rem;
  }
  .zwxl-article {
    width: 100%;
    padding: 0.3rem;
    box-sizing: border-box;
  }
  #div_div {
    display: none;
  }
  .zwxl-table,
  .zwxl-table tr,
  .zwxl-table td {
    word-break: break-all;
  }
  .zwxl-table .t1 {
    font-size: 0.3rem;
    width: 25%;
  }
  .zwxl-table {
    display: none;
    margin: 0;
  }
  .zwxl-table.h5show {
    display: block;
  }
  .zwxl-table .t2 {
    padding: 0 0.15rem;
    font-size: 0.3rem;
    word-break: break-all;
  }
  .xl-w1000 {
    width: 100%;
    border: none;
  }
  .xl-link {
    width: 100%;
    margin-top: 0.4rem;
  }
  .xl-link-item .tit {
    font-size: 0.32rem;
    line-height: 0.5rem;
    margin-bottom: 0.1rem;
  }
  .xl-article .xl-link-item {
    margin-top: 0.4rem;
    padding: 0;
  }
  .xl-article .xl-link-item .con {
    font-size: 0.32rem;
    line-height: 0.5rem;
    margin-bottom: 0.3rem;
  }

  #mintoDigital {
    width: 2rem !important;
  }
}
</style>
