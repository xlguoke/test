import { getUrlParam } from "@/utils/utils"

export function getUnitCode() {
  return getUrlParam("unitCode") || localStorage.getItem("unitCode") || ""
}
