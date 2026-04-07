import request from "@/utils/request.js"

export default {
    /**
     * 查询样品室全部统计数据
     * @param labId 功能室ID
     */
    getStatistics(labId) {
        return request({
            url: `/rest/sampleRoom/statistics/${labId}`,
            method: "get",
        })
    },

    /**
     * 查询出入库信息
     *
     * params 参数
     */
    getInventoryDetail(params) {
        return request({
            url: `/rest/sampleRoom/inventoryDetail`,
            method: "get",
            params
        })
    }
}


