<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-gray-900">规格信息</label>
      <el-button type="outline" size="small" @click="handleAddSpec" :disabled="disabled">
        <el-icon><Plus /></el-icon>
        添加规格
      </el-button>
    </div>

    <div v-if="specs.length === 0" class="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-300 rounded-lg">
      暂无规格，点击"添加规格"新增
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(spec, index) in specs"
        :key="index"
        class="grid grid-cols-9 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 relative"
      >
        <el-button
          type="danger"
          size="small"
          circle
          @click="handleDeleteSpec(index)"
          :disabled="disabled"
          class="absolute -top-2 -right-2"
          title="删除此规格"
        >
          <el-icon><Delete /></el-icon>
        </el-button>

        <!-- 品牌名称 -->
        <div>
          <label class="text-xs text-gray-500 block mb-1">品牌名称</label>
          <el-input
            v-model="spec.brandName"
            size="small"
            placeholder="如 大生"
            :disabled="disabled"
          />
        </div>

        <!-- 含量 -->
        <div>
          <label class="text-xs text-gray-500 block mb-1">含量</label>
          <el-input
            v-model="spec.specContent"
            size="small"
            placeholder="如 50%"
            :disabled="disabled"
          />
        </div>

        <!-- 剂型 -->
        <div>
          <label class="text-xs text-gray-500 block mb-1">剂型</label>
          <el-select v-model="spec.formulation" size="small" placeholder="选择剂型" :disabled="disabled" class="w-full">
            <el-option v-for="opt in formulationOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>

        <!-- 生产厂家 -->
        <div>
          <label class="text-xs text-gray-500 block mb-1">生产厂家</label>
          <el-input
            v-model="spec.manufacturer"
            size="small"
            placeholder="生产厂家"
            :disabled="disabled"
          />
        </div>

        <!-- 建议用量 -->
        <div>
          <label class="text-xs text-gray-500 block mb-1">建议用量</label>
          <el-input
            v-model="spec.suggestedDosage"
            size="small"
            placeholder="如 1000"
            :disabled="disabled"
          />
        </div>

        <!-- 单位 -->
        <div>
          <label class="text-xs text-gray-500 block mb-1">单位</label>
          <el-select v-model="spec.dosageUnit" size="small" placeholder="单位" :disabled="disabled" class="w-full">
            <el-option label="g/L" value="g/L" />
            <el-option label="mg/L" value="mg/L" />
            <el-option label="mL/L" value="mL/L" />
            <el-option label="%" value="%" />
            <el-option label="倍" value="倍" />
          </el-select>
        </div>

        <!-- 稀释比例 -->
        <div>
          <label class="text-xs text-gray-500 block mb-1">稀释比例</label>
          <el-input
            v-model="spec.suggestedRatio"
            size="small"
            placeholder="如 1:1000"
            :disabled="disabled"
          />
        </div>

        <!-- 作用机制 -->
        <div>
          <label class="text-xs text-gray-500 block mb-1">作用机制</label>
          <el-input
            v-model="spec.mechanism"
            size="small"
            placeholder="如 触杀"
            :disabled="disabled"
          />
        </div>

        <!-- 备注 - 修复 P0-3: 恢复 V1.1 PesticideSpecEditor 的第 9 字段 -->
        <div>
          <label class="text-xs text-gray-500 block mb-1">备注</label>
          <el-input
            v-model="spec.remark"
            size="small"
            placeholder="备注信息"
            :disabled="disabled"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  specs: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:specs'])

// 农药剂型选项
const formulationOptions = [
  { value: '可湿性粉剂', label: '可湿性粉剂 (WP)' },
  { value: '水分散粒剂', label: '水分散粒剂 (WDG)' },
  { value: '悬浮剂', label: '悬浮剂 (SC)' },
  { value: '乳油', label: '乳油 (EC)' },
  { value: '水剂', label: '水剂 (AS)' },
  { value: '可溶性粉剂', label: '可溶性粉剂 (SP)' },
  { value: '颗粒剂', label: '颗粒剂 (GR)' },
  { value: '微胶囊悬浮剂', label: '微胶囊悬浮剂 (CS)' },
  { value: '油剂', label: '油剂 (OL)' },
  { value: '粉剂', label: '粉剂 (DP)' },
  { value: '片剂', label: '片剂 (WT)' },
  { value: '烟剂', label: '烟剂 (FU)' },
  { value: '气雾剂', label: '气雾剂 (AE)' },
  { value: '蚊香', label: '蚊香 (CO)' },
  { value: '饵剂', label: '饵剂 (RB)' },
  { value: '胶饵', label: '胶饵 (GL)' },
  { value: '悬浮种衣剂', label: '悬浮种衣剂 (FS)' },
  { value: '种子处理悬浮剂', label: '种子处理悬浮剂 (SS)' },
  { value: '泡腾片剂', label: '泡腾片剂 (EB)' },
  { value: '水乳剂', label: '水乳剂 (EW)' },
  { value: '微乳剂', label: '微乳剂 (ME)' },
  { value: '悬乳剂', label: '悬乳剂 (SE)' },
  { value: '可分散油悬浮剂', label: '可分散油悬浮剂 (OD)' },
  { value: '乳粒剂', label: '乳粒剂 (EG)' },
  { value: '缓释剂', label: '缓释剂 (BR)' },
  { value: '可分散液剂', label: '可分散液剂 (DC)' },
  { value: '可湿性粒剂', label: '可湿性粒剂 (WG)' },
  { value: '可溶液剂', label: '可溶液剂 (SL)' },
  { value: '膏剂', label: '膏剂 (PA)' },
  { value: '其他', label: '其他' }
]

// 添加规格行
const handleAddSpec = () => {
  const newSpec = {
    brandName: '',
    specContent: '',
    formulation: '',
    manufacturer: '',
    suggestedDosage: '',
    suggestedRatio: '',
    dosageUnit: 'g/L',
    mechanism: '',
    remark: ''  // 修复 P0-3: 补齐备注字段
  }
  emit('update:specs', [...props.specs, newSpec])
}

// 删除规格行
const handleDeleteSpec = (index) => {
  const newSpecs = props.specs.filter((_, i) => i !== index)
  emit('update:specs', newSpecs)
}
</script>
