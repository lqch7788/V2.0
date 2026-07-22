<!--
  2026-07-03 v4：留种记录表单字段（支持种子保存/营养体保存双模式）1:1 迁移自 V1.1 SeedSavingFields.tsx
  - 顶部保存模式切换 banner
  - 模式自适应字段布局
  - 共享字段（日期/株号/批次号/部位/数量/单位/用途/处理/存储/操作人）
  - 模式特有指标（发芽率/千粒重/纯度/含水率 vs 规格/芽眼数/检疫/休眠）
  - 派生指标（发芽率颜色阈值）
-->
<template>
  <!-- 保存模式切换 banner -->
  <div class="mb-4 p-3 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 rounded-lg">
    <Label class="text-gray-700 mb-2 block">保存模式 <span class="text-red-500">*</span></Label>
    <div class="flex items-center gap-6">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="radio" name="preservationMode" value="seed" :checked="mode === 'seed'"
          @change="switchMode('seed')" class="w-4 h-4 text-amber-600" />
        <span class="text-sm font-bold text-gray-900">种子保存</span>
        <span class="text-xs text-gray-500">（种子/果实 — 干燥贮藏，适用于粮食/蔬菜/花卉种子）</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="radio" name="preservationMode" value="vegetative" :checked="mode === 'vegetative'"
          @change="switchMode('vegetative')" class="w-4 h-4 text-emerald-600" />
        <span class="text-sm font-bold text-gray-900">营养体保存</span>
        <span class="text-xs text-gray-500">（块茎/鳞茎/插穗等 — 适用马铃薯/甘薯/大蒜/葡萄/草莓）</span>
      </label>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Row 1：记录日期 | 留种批次号 | 留种株号 | 操作人 -->
    <div>
      <Label class="text-gray-700">记录日期 <span class="text-red-500">*</span></Label>
      <DatePicker class="w-full"
        :selected="form.recordDate ? new Date(form.recordDate) : undefined"
        @change="(date) => onChange({ ...form, recordDate: todayLocal(date) })"
      />
    </div>
    <div>
      <Label class="text-gray-700" title="同一批采收/处理/存储的编号，便于批次追踪">留种批次号</Label>
      <Input :value="form.lotNumber ?? ''"
        @change="(e) => onChange({ ...form, lotNumber: e.target.value })"
        placeholder="如 LOT-2026-001" :class="deepInputClass"
        title="同一批采收/处理/存储的编号" />
    </div>
    <div>
      <Label class="text-gray-700">留种株号 <span class="text-red-500">*</span></Label>
      <Input :value="form.plantMarker"
        @change="(e) => onChange({ ...form, plantMarker: e.target.value })"
        placeholder="例: A区第3排 #001-#050" :class="deepInputClass" />
    </div>
    <div>
      <Label class="text-gray-700">操作人</Label>
      <Select :value="form.operator ?? ''" @update:value="(v) => onChange({ ...form, operator: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue placeholder="请选择操作人" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="op in OPERATORS" :key="op.value" :value="op.value">{{ op.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Row 2：采收部位 | 数量 | 单位 | 成熟度/规格 -->
    <div>
      <Label class="text-gray-700">采收部位</Label>
      <Select :value="form.harvestPart ?? 'seed'"
        @update:value="(v) => onChange({ ...form, harvestPart: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="(label, value) in HARVEST_PART_LABELS" :key="value" :value="value">{{ label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label class="text-gray-700">采收数量</Label>
      <Input type="number" :value="form.harvestQuantity ?? ''"
        @change="(e) => onChange({ ...form, harvestQuantity: e.target.value ? Number(e.target.value) : undefined })"
        placeholder="0" :class="deepInputClass" />
    </div>
    <div>
      <Label class="text-gray-700">单位</Label>
      <Select :value="form.unit ?? ''" @update:value="(v) => onChange({ ...form, unit: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue placeholder="请选择单位" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="o in unitOptions" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <!-- 模式特有：成熟度（seed）或规格（vegetative） -->
    <div v-if="mode === 'seed'">
      <Label class="text-gray-700">成熟度</Label>
      <Select :value="form.maturityStage ?? 'ripe'"
        @update:value="(v) => onChange({ ...form, maturityStage: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="o in MATURITY_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div v-else>
      <Label class="text-gray-700">规格等级</Label>
      <Select :value="form.sizeGrade ?? 'medium'"
        @update:value="(v) => onChange({ ...form, sizeGrade: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="o in SIZE_GRADE_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Row 3：用途 | 处理方式 | 种子处理（seed）| 容器 -->
    <div>
      <Label class="text-gray-700">用途/去向</Label>
      <Select :value="form.purpose ?? 'direct_planting'"
        @update:value="(v) => onChange({ ...form, purpose: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="o in PURPOSE_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label class="text-gray-700">处理方式</Label>
      <Select :value="form.processing ?? 'air_dry'"
        @update:value="(v) => onChange({ ...form, processing: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="o in PROCESSING_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div v-if="mode === 'seed'">
      <Label class="text-gray-700">种子处理</Label>
      <Select :value="form.seedTreatment ?? 'none'"
        @update:value="(v) => onChange({ ...form, seedTreatment: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="o in SEED_TREATMENT_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div v-else>
      <Label class="text-gray-700">检疫状态</Label>
      <Select :value="form.healthStatus ?? 'healthy'"
        @update:value="(v) => onChange({ ...form, healthStatus: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="o in HEALTH_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label class="text-gray-700">存储容器</Label>
      <Select :value="form.container ?? 'paper_bag'"
        @update:value="(v) => onChange({ ...form, container: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="o in CONTAINER_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- 模式特有指标区 -->
    <template v-if="mode === 'seed'">
      <div>
        <Label class="text-gray-700">发芽率（%）</Label>
        <Input type="number" min="0" max="100" :value="form.germinationRate ?? ''"
          @change="(e) => onChange({ ...form, germinationRate: e.target.value ? Number(e.target.value) : undefined })"
          placeholder="0-100" :class="deepInputClass" />
        <div v-if="(form.germinationRate ?? 0) > 0" class="mt-1 text-xs"
             :class="getSeedSavingRateColor(form.germinationRate)">
          {{ form.germinationRate }}%
        </div>
      </div>
      <div>
        <Label class="text-gray-700">千粒重（g）</Label>
        <Input type="number" :value="form.thousandSeedWeight ?? ''"
          @change="(e) => onChange({ ...form, thousandSeedWeight: e.target.value ? Number(e.target.value) : undefined })"
          placeholder="0" :class="deepInputClass" />
      </div>
      <div>
        <Label class="text-gray-700">纯度（%）</Label>
        <Input type="number" min="0" max="100" :value="form.purity ?? ''"
          @change="(e) => onChange({ ...form, purity: e.target.value ? Number(e.target.value) : undefined })"
          placeholder="0-100" :class="deepInputClass" />
      </div>
      <div>
        <Label class="text-gray-700">含水率（%）</Label>
        <Input type="number" min="0" max="100" :value="form.moistureContent ?? ''"
          @change="(e) => onChange({ ...form, moistureContent: e.target.value ? Number(e.target.value) : undefined })"
          placeholder="0-100" :class="deepInputClass" />
      </div>
    </template>
    <template v-else>
      <div>
        <Label class="text-gray-700">芽眼数（个）</Label>
        <Input type="number" :value="form.budNodeCount ?? ''"
          @change="(e) => onChange({ ...form, budNodeCount: e.target.value ? Number(e.target.value) : undefined })"
          placeholder="0" :class="deepInputClass" />
      </div>
      <div class="col-span-2">
        <Label class="text-gray-700">休眠状态</Label>
        <Select :value="form.dormancyState ?? 'dormant'"
          @update:value="(v) => onChange({ ...form, dormancyState: v })">
          <SelectTrigger :class="deepInputClass"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in DORMANCY_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </template>

    <!-- 备注 -->
    <div class="col-span-4">
      <Label class="text-gray-700">备注</Label>
      <TextArea :value="form.remarks ?? ''"
        @change="(e) => onChange({ ...form, remarks: e.target.value })"
        :rows="2" placeholder="采收情况、处理记录、存储条件等"
        :class="deepInputClass" />
    </div>
  </div>
</template>

<script setup>
/**
 * 2026-07-22 1:1 迁移自 V1.1 SeedSavingFields.tsx
 */
import { computed, onMounted } from 'vue'
import { Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, DatePicker, TextArea } from '@/components/ui'
import { OPERATORS } from '@/data/cropData'
import { useDictionaryStore, getDictItems } from '@/stores/useDictionaryStore'
import { todayLocal } from '@/lib/dateUtils'
import {
  HARVEST_PART_LABELS,
  PURPOSE_OPTIONS,
  PROCESSING_OPTIONS,
  SEED_TREATMENT_OPTIONS,
  MATURITY_OPTIONS,
  SIZE_GRADE_OPTIONS,
  HEALTH_STATUS_OPTIONS,
  DORMANCY_OPTIONS,
  CONTAINER_OPTIONS,
  getSeedSavingRateColor
} from './seedSavingConstants'

const props = defineProps({
  form: { type: Object, required: true },
  onChange: { type: Function, required: true },
  deepInputClass: { type: String, default: 'px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500' }
})

const dictionaries = useDictionaryStore((s) => s.dictionaries)
const loadDictionaries = useDictionaryStore((s) => s.loadDictionaries)
onMounted(() => { if (dictionaries.length === 0) loadDictionaries() })

const unitOptions = computed(
  () => getDictItems('unit').map((d) => ({ value: d.dictCode, label: d.dictLabel }))
)

const mode = computed(() => props.form.preservationMode || 'seed')
const switchMode = (newMode) => {
  if (newMode === mode.value) return
  props.onChange({
    ...props.form,
    preservationMode: newMode,
    harvestPart: newMode === 'vegetative' ? 'tuber' : 'seed',
    germinationRate: undefined, thousandSeedWeight: undefined, purity: undefined,
    moistureContent: undefined, seedTreatment: undefined, maturityStage: undefined,
    sizeGrade: undefined, budNodeCount: undefined, healthStatus: undefined, dormancyState: undefined
  })
}
</script>
