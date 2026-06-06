/**
 * 作物编码规则页面状态管理 Hook 包装
 * 镜像 V1.1 src/pages/components/ProduceCodeRule/hooks/useProduceCodeRule.ts
 * 实际逻辑委托给 @/composables/useProduceCodeRule
 *
 * 该文件是 V1.1 目录结构的镜像占位,确保 V2.0 模块组织方式与 V1.1 一致。
 */
import { useProduceCodeRule as useComposeProduceCodeRule } from '@/composables/useProduceCodeRule'

export function useProduceCodeRuleForm() {
  return useComposeProduceCodeRule()
}
