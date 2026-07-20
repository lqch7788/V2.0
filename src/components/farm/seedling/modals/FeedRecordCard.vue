<!--
  施肥/用药记录行卡组件（V1.1 FeedRecordCard.tsx 1:1 迁移，简化版）
  2026-06-28：每日记录子表（施肥/用药）
  - 折叠态：只显示名称+类型摘要 + 删除
  - 展开态：完整 6 字段表单 + 药剂特有两个字段条件渲染
  - 行卡内联编辑，不嵌套弹窗
  - 受控组件：value + emit 由父组件管理（便于父组件序列化到 JSON）
  2026-07-18 P0-MISS-006 修复：V2.0 此前缺失此组件
-->
<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <!-- 折叠头部 -->
    <div
      class="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
      @click="toggleExpand"
    >
      <el-icon :size="14" class="text-gray-500">
        <ArrowRight v-if="!expanded" />
        <ArrowDown v-else />
      </el-icon>
      <span class="text-sm font-medium text-gray-900 flex-1 truncate">
        {{ value.name || '(未命名)' }}
      </span>
      <span :class="['px-1.5 py-0.5 rounded text-xs font-medium', modeBadgeClass]">
        {{ modeLabel }}
      </span>
      <span v-if="value.category" class="text-xs text-gray-500">{{ value.category }}</span>
      <el-button link type="danger" :icon="Close" @click.stop="handleRemove" />
    </div>

    <!-- 展开内容 -->
    <div v-if="expanded" class="p-3 bg-white space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <!-- 名称 -->
        <div>
          <label class="text-xs text-gray-700">名称 <span class="text-red-500">*</span></label>
          <el-input v-model="localValue.name" placeholder="请输入名称" size="small" />
        </div>

        <!-- 类别 -->
        <div>
          <label class="text-xs text-gray-700">类别</label>
          <el-select v-model="localValue.category" placeholder="请选择类别" size="small" class="!w-full">
            <el-option v-for="(label, key) in categoryMap" :key="key" :label="label" :value="key" />
          </el-select>
        </div>

        <!-- 用量 -->
        <div>
          <label class="text-xs text-gray-700">用量</label>
          <el-input v-model.number="localValue.amount" type="number" placeholder="0" size="small" />
        </div>

        <!-- 单位 -->
        <div>
          <label class="text-xs text-gray-700">单位</label>
          <el-select v-model="localValue.unit" placeholder="请选择单位" size="small" class="!w-full">
            <el-option v-for="(label, key) in FEED_UNIT_MAP" :key="key" :label="label" :value="key" />
          </el-select>
        </div>

        <!-- 稀释倍数 -->
        <div>
          <label class="text-xs text-gray-700">稀释倍数 {{ localValue.dilutionType === 'dry' ? '（干施不需要）' : '' }}</label>
          <el-input v-model.number="localValue.dilution" type="number" :disabled="localValue.dilutionType === 'dry'" placeholder="如：1000" size="small" />
        </div>

        <!-- 施用方式 -->
        <div>
          <label class="text-xs text-gray-700">施用方式</label>
          <el-select v-model="localValue.applicationMethod" placeholder="请选择施用方式" size="small" class="!w-full">
            <el-option v-for="(label, key) in methodMap" :key="key" :label="label" :value="key" />
          </el-select>
        </div>

        <!-- 安全间隔期（仅药剂） -->
        <div v-if="mode === 'pesticide'">
          <label class="text-xs text-gray-700">安全间隔期（天）</label>
          <el-input v-model.number="localValue.safetyInterval" type="number" placeholder="如：7" size="small" />
        </div>

        <!-- 防治对象（仅药剂） -->
        <div v-if="mode === 'pesticide'">
          <label class="text-xs text-gray-700">防治对象</label>
          <el-input v-model="localValue.targetPest" placeholder="如：蚜虫" size="small" />
        </div>
      </div>

      <!-- 2026-07-20：施肥模式品牌+单价+费用展示行（对齐 V1.1 L334-355） -->
      <div v-if="mode === 'fertilizer' && localValue.name" class="grid grid-cols-3 gap-2 bg-amber-50/50 border border-amber-100 rounded-lg px-3 py-2">
        <div class="text-xs">
          <span class="text-gray-500">品牌：</span>
          <span class="text-gray-800 font-medium">{{ localValue.brandName || '-' }}</span>
        </div>
        <div class="text-xs">
          <span class="text-gray-500">单价：</span>
          <span class="text-amber-700 font-medium">
            {{ localValue.unitPrice ? `¥${Number(localValue.unitPrice).toFixed(2)}` : '-' }}
          </span>
        </div>
        <div class="text-xs">
          <span class="text-gray-500">费用：</span>
          <span class="text-emerald-700 font-bold">
            {{ localValue.amount && localValue.unitPrice
              ? `¥${(localValue.amount * localValue.unitPrice).toFixed(2)}`
              : '-' }}
          </span>
        </div>
      </div>

      <!-- 备注 -->
      <div>
        <label class="text-xs text-gray-700">备注</label>
        <el-input v-model="localValue.notes" type="textarea" :rows="2" placeholder="可选" size="small" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 组件名称（供父组件具名导入）
defineOptions({ name: 'FeedRecordCard' })
import { ArrowRight, ArrowDown, Close } from '@element-plus/icons-vue'

// 用量单位映射（对齐 V1.1 cropConstants.ts L188-197）
const FEED_UNIT_MAP = { g: '克', kg: '公斤', L: '升', ml: '毫升', bottle: '瓶', bag: '袋', pack: '包', scoop: '勺' }

// 药剂类别映射（对齐 V1.1 cropConstants.ts L161-168）
const PESTICIDE_CATEGORY_MAP = { fungicide: '杀菌剂', insecticide: '杀虫剂', herbicide: '除草剂', acaricide: '杀螨剂', bio: '生物制剂', other: '其他' }

// 肥料类别映射（V1.1 FeedRecordCard.tsx L70-72 内联定义）
const FERTILIZER_TYPE_MAP = { NPK: '复合肥', urea: '尿素', phosphate: '磷肥', potassium: '钾肥', organic: '有机肥', other: '其他' }

/**
 * @typedef {Object} FeedRecordItem
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} [amount]
 * @property {string} unit
 * @property {number} [dilution]
 * @property {'dilute'|'dry'} [dilutionType]
 * @property {string} applicationMethod
 * @property {string} [notes]
 * @property {string} [brandName]
 * @property {number} [unitPrice]
 * @property {string} [fertilizerCode]
 * @property {string} [specContent]
 * @property {number} [stockQuantity]
 * @property {string} [stockUnit]
 * @property {number} [safetyInterval]
 * @property {string} [targetPest]
 */

const props = defineProps({
  mode: { type: String, default: 'fertilizer' },
  value: { type: Object, required: true },
  defaultExpanded: { type: Boolean, default: false }
})

const emit = defineEmits(['change', 'remove'])

const expanded = ref(props.defaultExpanded || !props.value.name)
const localValue = ref({ ...props.value })

watch(() => props.value, (val) => {
  localValue.value = { ...val }
}, { deep: true })

watch(localValue, (val) => {
  emit('change', { ...val })
}, { deep: true })

const modeLabel = computed(() => (props.mode === 'pesticide' ? '用药' : '施肥'))
const modeBadgeClass = computed(() =>
  props.mode === 'pesticide' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
)

// 类别字典（与 V1.1 L73-76 CATEGORY_MAP 1:1）
const CATEGORY_MAP = {
  fertilizer: FERTILIZER_TYPE_MAP,
  pesticide: PESTICIDE_CATEGORY_MAP
}
const categoryMap = computed(() => CATEGORY_MAP[props.mode] || {})

// 施用方式字典（V1.1 L30-31 METHOD_DICT_KEY_FERT / _PEST 1:1）
const METHOD_MAP_FERT = {
  drip_irrigation: '滴灌',
  spray: '喷施',
  root_dressing: '灌根',
  broadcast: '撒施',
  hole_dressing: '穴施',
  foliage_spray: '叶面喷施'
}
const METHOD_MAP_PEST = {
  spray: '喷雾',
  root_dressing: '灌根',
  dust: '喷粉',
  baite: '毒饵',
  fumigation: '熏蒸'
}
const methodMap = computed(() => (props.mode === 'pesticide' ? METHOD_MAP_PEST : METHOD_MAP_FERT))

const toggleExpand = () => { expanded.value = !expanded.value }
const handleRemove = () => emit('remove')
</script>
