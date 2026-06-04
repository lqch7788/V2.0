<!--
  @file 生产计划筛选器 - 1:1 翻译自 V1.1 ProductionFilters.tsx
  @see V1.1: src/components/production/ProductionFilters.tsx
  @translation 叶子组件：props/emit 1:1 保留 V1.1 接口（onXxxChange → xxxChange）
-->
<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex flex-col lg:flex-row gap-4 items-end">
      <!-- 计划类型下拉选择 -->
      <div class="min-w-[120px]">
        <label class="text-gray-700 text-sm block mb-1">计划类型</label>
        <el-select
          v-model="localPlanType"
          placeholder="全部类型"
          class="w-full"
          @change="handlePlanTypeChange"
        >
          <el-option label="全部类型" value="all" />
          <el-option
            v-for="[key, label] in Object.entries(PlanTypeLabels)"
            :key="key"
            :label="label"
            :value="key"
          />
        </el-select>
      </div>
      <!-- 批次编号搜索 -->
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">批次编号</label>
        <el-input
          v-model="localBatchCode"
          placeholder="搜索批次编号"
          clearable
          @input="handleBatchCodeChange"
        />
      </div>
      <!-- 种植模式搜索 -->
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">种植模式</label>
        <el-input
          v-model="localPlantingMode"
          placeholder="搜索种植模式"
          clearable
          @input="handlePlantingModeChange"
        />
      </div>
      <!-- 作物名称搜索 -->
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">作物名称</label>
        <el-input
          v-model="localCropName"
          placeholder="搜索作物名称"
          clearable
          @input="handleCropNameChange"
        />
      </div>
      <!-- 作物品种搜索 -->
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">作物品种</label>
        <el-input
          v-model="localVariety"
          placeholder="搜索作物品种"
          clearable
          @input="handleVarietyChange"
        />
      </div>
      <!-- 种植区域搜索 -->
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">种植区域</label>
        <el-input
          v-model="localGreenhouse"
          placeholder="搜索种植区域"
          clearable
          @input="handleGreenhouseChange"
        />
      </div>
      <!-- 状态下拉选择 -->
      <div class="min-w-[120px]">
        <label class="text-gray-700 text-sm block mb-1">状态</label>
        <el-select
          v-model="localStatus"
          placeholder="全部状态"
          class="w-full"
          @change="handleStatusChange"
        >
          <el-option label="全部状态" value="all" />
          <el-option
            v-for="[key, label] in Object.entries(batchStatusLabels)"
            :key="key"
            :label="label"
            :value="key"
          />
        </el-select>
      </div>
      <!-- 操作按钮 - 1:1 对应 V1.1 line 126-132 shadcn Button：重置=secondary 灰底，搜索=primary 绿底 -->
      <div class="flex gap-2 ml-2">
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          @click="handleReset"
        >
          重置
        </button>
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          @click="handleSearch"
        >
          <Search class="w-4 h-4" />
          搜索
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Search } from 'lucide-vue-next'
import { batchStatusLabels, PlanTypeLabels } from './constants'

/**
 * 生产计划筛选器 - 1:1 翻译自 V1.1 ProductionFilters.tsx
 *
 * Props 1:1 对应 V1.1 字段
 * Emits 1:1 对应 V1.1 callback prop 名（去掉 on 前缀）
 *
 * @example V1.1: onBatchCodeChange: (value: string) => void
 *          V2.0: emit('batchCodeChange', value)
 */
export default {
  name: 'ProductionFilters',
  props: {
    /** @type {String} 批次编号搜索值 - 对应 V1.1 batchCodeSearch */
    batchCodeSearch: { type: String, default: '' },
    /** @type {String} 种植模式搜索值 - 对应 V1.1 plantingModeSearch */
    plantingModeSearch: { type: String, default: '' },
    /** @type {String} 作物名称搜索值 - 对应 V1.1 cropNameSearch */
    cropNameSearch: { type: String, default: '' },
    /** @type {String} 作物品种搜索值 - 对应 V1.1 varietySearch */
    varietySearch: { type: String, default: '' },
    /** @type {String} 种植区域搜索值 - 对应 V1.1 greenhouseSearch */
    greenhouseSearch: { type: String, default: '' },
    /** @type {String} 状态下拉值 - 对应 V1.1 statusFilter */
    statusFilter: { type: String, default: 'all' },
    /** @type {String} 计划类型下拉值 - 对应 V1.1 planTypeFilter */
    planTypeFilter: { type: String, default: 'all' },
  },
  emits: [
    // 1:1 翻译 V1.1 onXxxChange 回调名
    'batchCodeChange',
    'plantingModeChange',
    'cropNameChange',
    'varietyChange',
    'greenhouseChange',
    'statusChange',
    'planTypeChange',
    // 1:1 翻译 V1.1 onReset / onSearch
    'reset',
    'search',
  ],
  data() {
    return {
      // 1:1 翻译 V1.1 受控输入的本地镜像（对应 V1.1 useState）
      /** @type {String} 批次编号本地值 */
      localBatchCode: '',
      /** @type {String} 种植模式本地值 */
      localPlantingMode: '',
      /** @type {String} 作物名称本地值 */
      localCropName: '',
      /** @type {String} 作物品种本地值 */
      localVariety: '',
      /** @type {String} 种植区域本地值 */
      localGreenhouse: '',
      /** @type {String} 状态下拉本地值 */
      localStatus: 'all',
      /** @type {String} 计划类型下拉本地值 */
      localPlanType: 'all',
    }
  },
  watch: {
    // 1:1 同步 props 到本地镜像（对应 V1.1 受控组件 props 流向）
    batchCodeSearch: {
      immediate: true,
      handler(v) { this.localBatchCode = v },
    },
    plantingModeSearch: {
      immediate: true,
      handler(v) { this.localPlantingMode = v },
    },
    cropNameSearch: {
      immediate: true,
      handler(v) { this.localCropName = v },
    },
    varietySearch: {
      immediate: true,
      handler(v) { this.localVariety = v },
    },
    greenhouseSearch: {
      immediate: true,
      handler(v) { this.localGreenhouse = v },
    },
    statusFilter: {
      immediate: true,
      handler(v) { this.localStatus = v },
    },
    planTypeFilter: {
      immediate: true,
      handler(v) { this.localPlanType = v },
    },
  },
  methods: {
    // 1:1 翻译 V1.1 onChange={(e) => onBatchCodeChange(e.target.value)}
    /** @param {string} v 输入值 */
    handleBatchCodeChange(v) {
      this.$emit('batchCodeChange', v)
    },
    /** @param {string} v 输入值 */
    handlePlantingModeChange(v) {
      this.$emit('plantingModeChange', v)
    },
    /** @param {string} v 输入值 */
    handleCropNameChange(v) {
      this.$emit('cropNameChange', v)
    },
    /** @param {string} v 输入值 */
    handleVarietyChange(v) {
      this.$emit('varietyChange', v)
    },
    /** @param {string} v 输入值 */
    handleGreenhouseChange(v) {
      this.$emit('greenhouseChange', v)
    },
    // 1:1 翻译 V1.1 onValueChange={(v) => onStatusChange(v)}
    /** @param {string} v 下拉选中值 */
    handleStatusChange(v) {
      this.$emit('statusChange', v)
    },
    /** @param {string} v 下拉选中值 */
    handlePlanTypeChange(v) {
      this.$emit('planTypeChange', v)
    },
    // 1:1 翻译 V1.1 onClick={onReset} / onClick={onSearch}
    handleReset() {
      this.$emit('reset')
    },
    handleSearch() {
      this.$emit('search')
    },
  },
}
</script>
