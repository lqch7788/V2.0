<!--
  合并预览组件（2026-07-18 v5，1:1 迁移自 V1.1 MergePreview.tsx）

  精确匹配 5 维度（crop_code + seed_form + unit + generation + propagation_method）
  两段式优先：同种植批次 → 全库兜底
  命中 → 提交时合并累加到已有种源；未命中 → 创建新种源

  v5：加 linkedPlantingId（同种植优先）+ forceNew checkbox（用户自主选择）
-->
<template>
  <!-- 加载中 -->
  <div v-if="state === 'idle' || state === 'loading'"
       class="h-12 flex items-center text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-4">
    <span class="animate-pulse">查询合并候选中...</span>
  </div>

  <!-- 错误态 -->
  <div v-else-if="state === 'error'"
       class="flex items-center justify-between gap-2 p-3 rounded-lg border border-red-200 bg-red-50">
    <div class="flex items-start gap-2 flex-1">
      <AlertCircle class="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
      <div class="text-sm">
        <div class="font-medium text-red-900">查询合并候选失败</div>
        <div v-if="errorMessage" class="text-xs mt-0.5 text-red-700 font-mono break-all">{{ errorMessage }}</div>
        <div class="text-xs mt-0.5 text-red-700">不影响提交，会创建新种源</div>
      </div>
    </div>
    <button @click="retry" class="ml-2 flex-shrink-0 text-xs text-red-700 hover:text-red-900 underline">
      重试
    </button>
  </div>

  <!-- 匹配态（含 forceNew 覆盖） -->
  <div v-else-if="state === 'matched' && matched"
       :class="['p-4 rounded-lg border', isEffective ? 'border-cyan-200 bg-cyan-50' : 'border-gray-200 bg-gray-50 line-through opacity-60']">
    <div class="flex gap-3">
      <Layers :class="['w-5 h-5 flex-shrink-0 mt-0.5', isEffective ? 'text-cyan-600' : 'text-gray-400']" />
      <div class="flex-1 space-y-1 text-sm">
        <div :class="['font-medium', isEffective ? 'text-cyan-900' : 'text-gray-600']">
          {{ isEffective ? '✅ 将合并到已有种源' : '⏸ 已找到匹配，但您选择单独存储' }}
        </div>
        <div :class="['break-all', isEffective ? 'text-cyan-700' : 'text-gray-500']">
          <code class="font-mono">{{ matched.sourceCode }}</code>
          · 当前 {{ matched.availableCount }} {{ matched.unit }}
          · 已回流 {{ matched.reflowCount ?? 0 }} 次
        </div>
        <div v-if="isEffective" class="text-cyan-900">
          本次新增 <strong>{{ newQuantity }} {{ unit }}</strong> 后 → 可用数量
          <strong class="text-lg">{{ (matched.availableCount || 0) + newQuantity }} {{ unit }}</strong>
        </div>
        <!-- 2026-07-18: 用户自主选择是否合并 -->
        <label class="flex items-center gap-1.5 text-xs cursor-pointer pt-1">
          <input
            type="checkbox"
            :checked="forceNew"
            @change="onForceNewChange($event.target.checked)"
            class="rounded border-gray-400"
          />
          <span :class="forceNew ? 'text-amber-700 font-medium' : 'text-gray-600'">
            单独存储（不合并）。适用于采收间隔久、需独立追溯的场景
          </span>
        </label>
      </div>
    </div>
  </div>

  <!-- 新建态 -->
  <div v-else class="p-4 rounded-lg border border-amber-200 bg-amber-50">
    <div class="flex gap-3">
      <Plus class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div class="flex-1 space-y-1 text-sm">
        <div class="font-medium text-amber-900">📝 将创建新的种源记录</div>
        <div class="text-amber-700">
          当前种源库中没有「{{ cropCode }} / {{ seedForm }}{{ generation ? ` / ${generation}` : '' }} / {{ unit }}」的可合并记录
        </div>
        <div class="text-xs text-amber-600">
          提交后系统会生成新种源批号（如 SRC-SS-xxxx）
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 合并预览组件（1:1 迁移自 V1.1 MergePreview.tsx）
 */
import { ref, watch, onUnmounted, computed } from 'vue'
import { Layers, Plus, AlertCircle } from 'lucide-vue-next'
import { enhancedApiClient } from '@/lib/apiClient'
import { derivePropagationMethod } from '@/lib/propagationMethod'

const props = defineProps({
  cropCode: { type: String, required: true },
  seedForm: { type: String, required: true },
  unit: { type: String, required: true },
  generation: { type: String, default: null },
  newQuantity: { type: Number, required: true },
  /** 当前种植批次 ID（用于同种植优先匹配） */
  linkedPlantingId: { type: String, default: undefined },
  /** 当找到匹配时通知父组件，自动填充单位字段 */
  onMatchFound: { type: Function, default: undefined },
  /** 2026-07-18: 用户选择强制新建（即使有匹配也不合并） */
  forceNew: { type: Boolean, required: true },
  /** 2026-07-18: 用户切换强制新建 checkbox */
  onForceNewChange: { type: Function, required: true }
})

const state = ref('idle') // 'idle' | 'loading' | 'matched' | 'new' | 'error'
const matched = ref(null)
const retryKey = ref(0)
const errorMessage = ref('')
let abortController = null

const isEffective = computed(() => !props.forceNew)

const retry = () => { retryKey.value++ }

const queryMatch = async (signal) => {
  try {
    const params = new URLSearchParams({
      cropCode: props.cropCode,
      seedForm: props.seedForm,
      unit: props.unit,
      propagationMethod: derivePropagationMethod(props.seedForm)
    })
    if (props.generation) params.set('generation', props.generation)
    if (props.linkedPlantingId) params.set('linkedPlantingId', props.linkedPlantingId)
    const result = await enhancedApiClient.get(`/seed-sources/matchable?${params}`)
    if (signal.aborted) return
    matched.value = result || null
    props.onMatchFound?.(result ? { id: result.id, sourceCode: result.sourceCode, unit: result.unit } : null)
    state.value = result ? 'matched' : 'new'
    errorMessage.value = ''
  } catch (e) {
    if (signal.aborted) return
    errorMessage.value = e?.message || String(e)
    state.value = 'error'
  }
}

watch(
  () => [props.cropCode, props.seedForm, props.unit, props.generation, retryKey.value],
  () => {
    if (abortController) abortController.abort()

    if (!props.cropCode || !props.seedForm || !props.unit) {
      state.value = 'idle'
      matched.value = null
      props.onMatchFound?.(null)
      return
    }

    state.value = 'loading'
    errorMessage.value = ''
    const controller = new AbortController()
    abortController = controller

    const timer = setTimeout(() => {
      queryMatch(controller.signal)
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (abortController) abortController.abort()
})
</script>
