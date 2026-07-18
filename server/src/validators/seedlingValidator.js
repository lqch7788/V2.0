/**
 * 育苗创建请求 Zod 校验 schema（V1.1 seedlingValidator.ts 1:1 移植）
 * 2026-07-18 P0-MISS-011 修复：V2.0 此前缺失此 validator
 *
 * - source_id: 种源 ID 必填（V1.1 现状允许为空，V2 强校验）
 * - 其他字段保持 V1.1 现状
 */
import { z } from 'zod'

/**
 * 育苗创建请求 Zod schema
 */
export const CreateSeedlingSchema = z.object({
  source_id: z.string().min(1, { message: '种源 ID 必填，请先选择种源' }),
  crop_name: z.string().min(1, { message: '作物名称必填' }),
  crop_variety: z.string().optional(),
  greenhouse_id: z.string().optional(),
  greenhouse_name: z.string().optional(),
  seedling_date: z.string().optional(),
  expected_finish_date: z.string().optional(),
  quantity: z.number().int().nonnegative().optional(),
  unit: z.string().optional(),
  status: z.string().optional(),
  remarks: z.string().optional()
})

/**
 * 校验并解析育苗创建请求
 * @throws {import('zod').ZodError} 校验失败
 * @param {unknown} input
 * @returns {z.infer<typeof CreateSeedlingSchema>}
 */
export function validateCreateSeedling(input) {
  return CreateSeedlingSchema.parse(input)
}
