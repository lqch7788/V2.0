<!--
  病虫害防治详情弹窗（对齐 V1.1 PestControlDetailModal.tsx L1-379）
  头部 emerald 卡片 + 基本信息 + 防治详情 + 肥料信息 + 系统信息 + 备注
-->
<template>
  <el-dialog :model-value="visible" title="病虫害防治详情" width="900px" @update:model-value="(v) => v ? null : emit('close')" @close="emit('close')">
    <div v-if="record" class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <!-- 头部卡片 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
        <div class="flex items-center justify-between mb-2">
          <div>
            <div class="text-xs opacity-80">记录编号</div>
            <div class="text-lg font-bold font-mono">{{ record.recordCode }}</div>
          </div>
          <div class="text-right">
            <div class="text-xs opacity-80">防治时间</div>
            <div class="text-sm font-medium">{{ record.sprayTime }}</div>
          </div>
        </div>
        <div class="flex flex-wrap gap-1">
          <span v-for="(t, i) in parseArray(record.pesticideType)" :key="i" class="px-2 py-0.5 bg-white/20 rounded text-xs">{{ t }}</span>
        </div>
        <div class="mt-2 text-xs">
          肥料联用：<span :class="record.useLeafFertilizer === 'yes' ? 'text-amber-200' : 'text-gray-200'">{{ record.useLeafFertilizer === 'yes' ? '是' : '否' }}</span>
        </div>
      </div>

      <!-- 作物与位置 -->
      <section class="bg-gray-50 rounded-lg p-3">
        <h4 class="text-sm font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">作物与位置</h4>
        <div class="grid grid-cols-3 gap-3 text-sm">
          <div><span class="text-gray-500">作物：</span><span class="font-medium">{{ record.cropName }}</span></div>
          <div><span class="text-gray-500">温室：</span><span class="font-medium">{{ record.greenhouseName || '-' }}</span></div>
          <div><span class="text-gray-500">操作员：</span><span class="font-medium">{{ record.operatorName || '-' }}</span></div>
        </div>
      </section>

      <!-- 防治详情 -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">防治详情</h4>
        <div class="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div><span class="text-gray-500">施用方法：</span><span class="font-medium">{{ dictLabel('application_method', record.applicationMethod) || '-' }}</span></div>
          <div>
            <span class="text-gray-500">目标病虫害：</span>
            <div class="inline-flex flex-wrap gap-1 mt-1">
              <span v-for="(t, i) in parseArray(record.targetPest)" :key="i" class="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">{{ t }}</span>
              <span v-if="parseArray(record.targetPest).length === 0" class="text-gray-400">-</span>
            </div>
          </div>
        </div>
        <!-- 药剂池表 -->
        <div v-if="unifiedItems.length > 0" class="border border-gray-200 rounded overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-red-100 text-red-900"><tr><th class="px-2 py-1 text-left">#</th><th class="px-2 py-1 text-left">名称</th><th class="px-2 py-1 text-left">药剂类型</th><th class="px-2 py-1 text-left">用量</th><th class="px-2 py-1 text-left">稀释</th></tr></thead>
            <tbody>
              <tr v-for="(p, i) in unifiedItems" :key="i" class="border-t border-gray-100">
                <td class="px-2 py-1">{{ i + 1 }}</td>
                <td class="px-2 py-1">{{ p.name }}</td>
                <td class="px-2 py-1">{{ p.type }}</td>
                <td class="px-2 py-1">{{ p.dosage }}</td>
                <td class="px-2 py-1">{{ p.dilution }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 肥料信息 -->
      <section v-if="parseArray(record.leafFertilizerList).length > 0 || record.leafFertilizerName">
        <h4 class="text-sm font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">叶面肥联用</h4>
        <table class="w-full text-sm border border-gray-200 rounded overflow-hidden">
          <thead class="bg-emerald-100 text-emerald-900"><tr><th class="px-2 py-1 text-left">#</th><th class="px-2 py-1 text-left">名称</th><th class="px-2 py-1 text-left">用量</th><th class="px-2 py-1 text-left">稀释</th></tr></thead>
          <tbody>
            <tr v-for="(f, i) in parseArray(record.leafFertilizerList)" :key="i" class="border-t border-gray-100">
              <td class="px-2 py-1">{{ i + 1 }}</td>
              <td class="px-2 py-1">{{ f.name || f.fertilizerName }}</td>
              <td class="px-2 py-1">{{ f.dosage }}{{ f.unit || '' }}</td>
              <td class="px-2 py-1">{{ f.dilutionRatio || '-' }}</td>
            </tr>
            <tr v-if="parseArray(record.leafFertilizerList).length === 0 && record.leafFertilizerName">
              <td class="px-2 py-1">1</td>
              <td class="px-2 py-1">{{ record.leafFertilizerName }}</td>
              <td class="px-2 py-1">{{ record.leafFertilizerDosage || 0 }}{{ record.leafFertilizerUnit || '' }}</td>
              <td class="px-2 py-1">-</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 系统信息 -->
      <section class="bg-gray-50 rounded-lg p-3">
        <h4 class="text-sm font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">系统信息</h4>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><span class="text-gray-500">创建时间：</span><span class="font-medium">{{ record.createTime || '-' }}</span></div>
          <div><span class="text-gray-500">更新时间：</span><span class="font-medium">{{ record.updateTime || '-' }}</span></div>
        </div>
      </section>

      <!-- 备注 -->
      <section v-if="record.description">
        <h4 class="text-sm font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">备注</h4>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ record.description }}</p>
      </section>
    </div>

    <template #footer>
      <el-button @click="emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ visible: Boolean, record: Object })
const emit = defineEmits(['close'])

const parseArray = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string' && raw.trim()) {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p.filter(Boolean) : [raw] } catch { return [raw] }
  }
  return []
}

// 合并药剂池+生物制剂池+设备池（统一展示）
const unifiedItems = computed(() => {
  const r = props.record || {}
  const items = []
  parseArray(r.pesticideList).forEach(p => items.push({
    name: p.name || p.pesticideName || '-',
    type: p.pesticideType || p.type || '-',
    dosage: `${p.dosage ?? '-'}${p.unit || p.dosageUnit || ''}`,
    dilution: p.dilutionRatio || '-'
  }))
  if (items.length === 0 && r.pesticideName) {
    items.push({
      name: r.pesticideName,
      type: parseArray(r.pesticideType)[0] || '-',
      dosage: `${r.dosage ?? 0}${r.dosageUnit || ''}`,
      dilution: r.dilutionRatio || '-'
    })
  }
  return items
})

const dictLabel = (category, code) => {
  if (!code) return ''
  const map = {
    application_method: { spray: '喷雾', dust: '喷粉', soil_drench: '灌根', fumigation: '熏蒸', seed_treatment: '拌种', irrigation: '滴灌', bait: '毒饵' }
  }
  return map[category]?.[code] || code
}
</script>