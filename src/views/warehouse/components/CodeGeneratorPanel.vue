<!--
  物料编码生成器面板 - 从 WarehouseInbound.vue 提取
  原文件 L16-121 (~106 行模板)
  V2.0-PM-004 拆分第 3/6 阶段
  注：state 与 method 仍在父组件，组件仅 UI 渲染
-->
<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- 折叠头部 -->
    <div class="px-6 py-3 flex items-center gap-3 border-b border-gray-100">
      <button class="text-sm text-blue-600 hover:text-blue-800" @click="$emit('navigate-code-rule')">编码规则 &gt;&gt;</button>
      <div class="h-6 w-px bg-gray-300"></div>
      <span class="text-base font-bold text-blue-600">物料编码生成</span>
      <button class="p-1 hover:bg-gray-100 rounded" @click="$emit('toggle-expand')">
        <ChevronDown v-if="expanded" class="w-5 h-5 text-gray-600" />
        <ChevronRight v-else class="w-5 h-5 text-gray-600" />
      </button>
    </div>

    <!-- 展开的生成面板 -->
    <div v-if="expanded" class="p-6">
      <!-- 编码生成器 - V1.1: grid-cols-6 + "生成编码"列 col-span-3 (50% 宽), Input+3个按钮全部同一行 -->
      <div class="grid grid-cols-6 gap-4 mb-4">
        <!-- 大类 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
          <select
            :value="codeGen.bigCategory"
            class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
            @change="$emit('big-category-change', $event.target.value)"
          >
            <option value="">请选择</option>
            <option v-for="cat in bigCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
          </select>
        </div>
        <!-- 中类 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
          <select
            :value="codeGen.midCategory"
            class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
            :disabled="!codeGen.bigCategory"
            @change="$emit('mid-category-change', $event.target.value)"
          >
            <option value="">请选择</option>
            <option v-for="cat in midCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
          </select>
        </div>
        <!-- 小类 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
          <select
            :value="codeGen.subCategory"
            class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
            :disabled="!codeGen.midCategory"
            @change="$emit('sub-category-change', $event.target.value)"
          >
            <option value="">请选择</option>
            <option v-for="cat in subCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
          </select>
        </div>
        <!-- 生成编码 - V1.1 真实代码: col-span-3 占 50% 宽度 -->
        <div class="col-span-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            生成编码
            <span v-if="success && !error" class="ml-2 text-sm text-green-600 font-normal">{{ success }}</span>
            <span v-if="error" class="ml-2 text-sm text-red-600 font-normal">{{ error }}</span>
          </label>
          <div class="flex gap-2 items-center">
            <input
              :value="codeGen.generatedCode"
              readonly
              placeholder="点击生成"
              class="w-40 h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 flex-shrink-0"
            />
            <button
              :disabled="!codeGen.subCategory"
              class="h-8 px-3 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              @click="$emit('generate-code')"
            >
              <Wand2 class="w-4 h-4" />生成
            </button>
            <button
              :disabled="!codeGen.generatedCode"
              class="h-8 px-3 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              @click="$emit('copy-code')"
            >
              <Copy class="w-4 h-4" />{{ copySuccess ? '已复制!' : '复制' }}
            </button>
            <button
              class="h-8 px-3 rounded text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center justify-center gap-1 whitespace-nowrap"
              @click="$emit('reset-code')"
            >
              <RotateCcw class="w-4 h-4" />重置
            </button>
          </div>
        </div>
      </div>

      <!-- 错误/成功提示 -->
      <div v-if="error" class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">{{ error }}</div>
      <div v-if="success && !error" class="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-600">{{ success }}</div>

      <!-- I/O 风险提示（与V1.1一致） -->
      <div class="mt-2 text-xs text-amber-600 flex items-start gap-1">
        <span class="font-bold">⚠️</span>
        <span>部分大类（如 OP/IT/OT）编码含字母 I/O，与数字 1/0 形近。生成后请人工核对，避免抄录/扫描时误读。</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronDown, ChevronRight, Wand2, Copy, RotateCcw } from 'lucide-vue-next'

defineProps({
  expanded: { type: Boolean, default: false },
  codeGen: { type: Object, required: true },       // { bigCategory, midCategory, subCategory, generatedCode }
  bigCategories: { type: Array, default: () => [] },
  midCategories: { type: Array, default: () => [] },
  subCategories: { type: Array, default: () => [] },
  success: { type: String, default: '' },
  error: { type: String, default: '' },
  copySuccess: { type: Boolean, default: false }
})

defineEmits([
  'navigate-code-rule',
  'toggle-expand',
  'big-category-change',
  'mid-category-change',
  'sub-category-change',
  'generate-code',
  'copy-code',
  'reset-code'
])
</script>
