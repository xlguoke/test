<template>
  <!-- 设备基础信息 -->
  <div class="info-main">
    <div class="title">
      <div>{{ data.name }}（{{ data.equipmentSn }}）</div>
      <div class="status-box">
        设备状态
        <span class="status" :style="{ '--statusColor': getBgColor(data.status) }">
          {{ data.status }}
        </span>
      </div>
    </div>
    <div class="wrapper">
      <div class="line">
        <div class="label">资产编号</div>
        <div class="value">{{ data.assetSn }}</div>
      </div>
      <div class="line">
        <div class="label">检测管理编号</div>
        <div class="value">{{ data.testManageSn }}</div>
      </div>
      <div class="line">
        <div class="label">部门保管人</div>
        <div class="value">{{ data.keeperName }}</div>
      </div>
      <div class="line">
        <div class="label">存放位置</div>
        <div class="value">{{ data.storageSite }}</div>
      </div>
      <div class="line">
        <div class="label">规格型号</div>
        <div class="value">{{ data.standard }}</div>
      </div>
      <div class="line">
        <div class="label">量程</div>
        <div class="value">{{ data.eqRange }}</div>
      </div>
      <div class="line">
        <div class="label">精度</div>
        <div class="value">{{ data.accuracy }}</div>
      </div>
      <div class="line">
        <div class="label">外形尺寸</div>
        <div class="value">{{ data.size }}</div>
      </div>
      <div class="line">
        <div class="label">校检类型</div>
        <div class="value">{{ data.checkType }}</div>
      </div>
      <div class="line">
        <div class="label">校检周期</div>
        <div class="value">{{ `${data.checkPeriod || "--"}${data.checkPeriodUnit}` }}</div>
      </div>
      <div class="line">
        <div class="label">前次校检时间</div>
        <div class="value">
          {{ (data.preCheckDate && formatDate(data.preCheckDate)) || "--" }}
        </div>
      </div>
      <div class="line">
        <div class="label">下次校检时间</div>
        <div class="value">
          {{ (data.nextCheckDate && formatDate(data.nextCheckDate)) || "--" }}
        </div>
      </div>
      <div class="line">
        <div class="label">校检单位</div>
        <div class="value">{{ data.checkUnit }}</div>
      </div>
      <div class="line">
        <div class="label">纳入设备授权管理</div>
        <div class="value">{{ data.isIot === IsIot.YES ? "是" : "否" }}</div>
      </div>
      <div class="line">
        <div class="label">是否为公路水运系统相关设备</div>
        <div class="value">{{ data.isGlsy === IsGlsy.YES ? "是" : "否" }}</div>
      </div>
      <div class="line">
        <div class="label">所在位置</div>
        <div class="value">{{ data.serveLocation }}</div>
      </div>
    </div>
  </div>
  <!-- 其他信息 -->
  <div class="info-main">
    <div class="title">
      <span>其他信息</span>
    </div>
    <div class="wrapper">
      <div class="line">
        <div class="label">供应商</div>
        <div class="value">{{ data.supplierName }}</div>
      </div>
      <div class="line">
        <div class="label">供应商电话</div>
        <div class="value">{{ data.supplierTel }}</div>
      </div>
      <div class="line">
        <div class="label">购置日期</div>
        <div class="value">{{ data.buyDate ? formatDate(data.buyDate) : "--" }}</div>
      </div>
      <div class="line">
        <div class="label">投产日期</div>
        <div class="value">{{ data.operationDate ? formatDate(data.operationDate) : "--" }}</div>
      </div>
      <div class="line">
        <div class="label">出厂编号</div>
        <div class="value">{{ data.factorySn }}</div>
      </div>
      <div class="line">
        <div class="label">生产厂家</div>
        <div class="value">{{ data.factory }}</div>
      </div>
      <div class="line">
        <div class="label">厂家技术支持电话</div>
        <div class="value">{{ data.factorySupportTel }}</div>
      </div>
      <div class="line">
        <div class="label">出厂日期</div>
        <div class="value">{{ data.productionDate ? formatDate(data.productionDate) : "--" }}</div>
      </div>
      <div class="line">
        <div class="label">功率</div>
        <div class="value">{{ data.power }}</div>
      </div>
      <div class="line">
        <div class="label">出厂价</div>
        <div class="value">{{ data.factoryPrice }}</div>
      </div>
      <div class="line">
        <div class="label">净值</div>
        <div class="value">{{ data.netValue }}</div>
      </div>
      <div class="line">
        <div class="label">安装费</div>
        <div class="value">{{ data.installFee }}</div>
      </div>
      <div class="line">
        <div class="label">运杂费</div>
        <div class="value">{{ data.transportFee }}</div>
      </div>
      <div class="line">
        <div class="label">复杂系数(电)</div>
        <div class="value">{{ data.coefficientElectronic }}</div>
      </div>
      <div class="line">
        <div class="label">复杂系数(机)</div>
        <div class="value">{{ data.coefficientMachine }}</div>
      </div>
      <div class="line">
        <div class="label">复杂系数(热)</div>
        <div class="value">{{ data.coefficientHot }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { formatDate } from "@/utils/utils"
import { DeviceDetailEntity, IsGlsy, IsIot } from "../DeviceDetailEntity"

defineProps<{ data: DeviceDetailEntity }>()

function getBgColor(str: string) {
  switch (str) {
    case "正常":
      return "#24b276"
    case "已停用":
    case "维修":
      return "#ffa800"
    case "报废":
      return "#ff0000"
    default:
      return "#24b276"
  }
}
</script>
<style lang="less" scoped>
.info-main {
  font-size: 28px;
  color: #eef5ff;
  .title {
    font-size: 36px;
    font-weight: bold;
    text-align: center;
    padding: 60px 0;
    .status-box {
      font-size: 28px;
    }
    .status {
      position: relative;
      margin-left: 48px;
      &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: -20px;
        transform: translateY(-50%);
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--statusColor);
      }
    }
  }
  .wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    // row-gap: 20px;
    .line {
      margin-bottom: 20px;
    }
    column-gap: 20%;
    .line {
      width: 50%;
      flex: 1 0 40%;
      display: flex;
      align-items: flex-start;
      .label {
        width: 200px;
        color: #355ea5;
        margin-right: 90px;
      }
    }
  }
}
</style>
