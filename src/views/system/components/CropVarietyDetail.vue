<template>
  <div v-if="!variety" class="bg-white rounded-xl shadow-sm p-8 h-full flex items-center justify-center">
    <div class="text-center text-gray-500">
      <el-icon :size="48" class="mb-3 text-gray-300"><Sugar /></el-icon>
      <p>请从左侧列表选择一个品种</p>
      <p class="text-sm mt-1">查看品种详细信息</p>
    </div>
  </div>

  <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
    <!-- 头部 -->
    <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <el-icon :size="20" class="text-emerald-600"><Sugar /></el-icon>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">
              {{ variety.detailVarietyName || variety.subVariety1Name || variety.varietyName }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ variety.categoryName }} &gt; {{ variety.typeName }} &gt; {{ variety.varietyName }}
              <template v-if="variety.subVariety1Name"> &gt; {{ variety.subVariety1Name }}</template>
              <template v-if="variety.detailVarietyName"> &gt; {{ variety.detailVarietyName }}</template>
            </p>
          </div>
        </div>
        <el-button type="primary" size="small" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </div>
    </div>

    <!-- 内容 -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="space-y-6">
        <!-- 编码信息 - 绿色主题 -->
        <div>
          <h4 class="text-sm font-bold text-emerald-700 mb-3 border-b-2 border-emerald-200 pb-2 flex items-center gap-2">
            <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
            编码信息
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <label class="block text-xs text-emerald-600 mb-1">作物编码</label>
              <p class="font-mono text-emerald-700 font-bold text-lg">{{ variety.cropCode }}</p>
            </div>
            <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <label class="block text-xs text-emerald-600 mb-1">状态</label>
              <el-tag
                :type="variety.status === 'active' ? 'success' : 'info'"
                class="font-bold"
              >
                {{ variety.status === 'active' ? '启用' : '停用' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 分类信息 - 蓝色主题 -->
        <div>
          <h4 class="text-sm font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            分类信息
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <label class="block text-xs text-blue-600 mb-1">类别</label>
              <p class="text-blue-900 font-medium">
                <span class="font-mono text-blue-500 mr-2">{{ variety.categoryCode }}</span>
                {{ variety.categoryName }}
              </p>
            </div>
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <label class="block text-xs text-blue-600 mb-1">类型</label>
              <p class="text-blue-900 font-medium">
                <span class="font-mono text-blue-500 mr-2">{{ variety.typeCode }}</span>
                {{ variety.typeName }}
              </p>
            </div>
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <label class="block text-xs text-blue-600 mb-1">品种</label>
              <p class="text-blue-900 font-medium">
                <span class="font-mono text-blue-500 mr-2">{{ variety.varietyCode }}</span>
                {{ variety.varietyName }}
              </p>
            </div>
            <div v-if="variety.subVariety1Name" class="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <label class="block text-xs text-blue-600 mb-1">子品种</label>
              <p class="text-blue-900 font-medium">
                <span class="font-mono text-blue-500 mr-2">{{ variety.subVariety1Code }}</span>
                {{ variety.subVariety1Name }}
              </p>
            </div>
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <label class="block text-xs text-blue-600 mb-1">作物品种</label>
              <p class="text-blue-900 font-bold text-lg">
                {{ variety.detailVarietyName || variety.subVariety1Name || variety.varietyName }}
              </p>
            </div>
          </div>
        </div>

        <!-- 别名 - 紫色主题 -->
        <div>
          <h4 class="text-sm font-bold text-purple-700 mb-3 border-b-2 border-purple-200 pb-2 flex items-center gap-2">
            <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
            别名
          </h4>
          <div class="flex flex-wrap gap-2">
            <template v-if="variety.alias && variety.alias.length > 0">
              <span
                v-for="(alias, index) in variety.alias"
                :key="index"
                class="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
              >
                {{ alias }}
              </span>
            </template>
            <span v-else class="text-gray-400 text-sm bg-gray-100 px-3 py-1 rounded-full">暂无别名</span>
          </div>
        </div>

        <!-- 图片与特性描述 - 橙色主题 -->
        <div>
          <h4 class="text-sm font-bold text-orange-700 mb-3 border-b-2 border-orange-200 pb-2 flex items-center gap-2">
            <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
            图片与特性
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div v-if="variety.image" class="bg-white rounded-lg p-3 border-2 border-orange-300">
              <label class="block text-xs text-orange-600 mb-1">作物图片</label>
              <div class="w-full h-40 rounded-lg overflow-hidden bg-gray-50 border border-orange-200">
                <img :src="variety.image" alt="作物图片" class="w-full h-full object-contain" />
              </div>
            </div>
            <div :class="!variety.image ? 'col-span-2' : ''" class="bg-white rounded-lg p-3 border-2 border-orange-300">
              <label class="block text-xs text-orange-600 mb-1">特性描述</label>
              <p class="text-orange-900 whitespace-pre-wrap">
                {{ variety.description || '暂无特性描述' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 作物生长周期 - 绿色主题 -->
        <div>
          <h4 class="text-sm font-bold text-emerald-700 mb-3 border-b-2 border-emerald-200 pb-2 flex items-center gap-2">
            <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
            作物生长周期
          </h4>
          <div class="grid grid-cols-5 gap-3">
            <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200 text-center">
              <label class="block text-xs text-emerald-600 mb-1">发芽期</label>
              <p class="text-emerald-900 font-bold text-lg">
                {{ variety.germinationPeriod ? `${variety.germinationPeriod}天` : '-' }}
              </p>
            </div>
            <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200 text-center">
              <label class="block text-xs text-emerald-600 mb-1">育苗期</label>
              <p class="text-emerald-900 font-bold text-lg">
                {{ variety.seedlingPeriod ? `${variety.seedlingPeriod}天` : '-' }}
              </p>
            </div>
            <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200 text-center">
              <label class="block text-xs text-emerald-600 mb-1">开花期</label>
              <p class="text-emerald-900 font-bold text-lg">
                {{ variety.floweringPeriod ? `${variety.floweringPeriod}天` : '-' }}
              </p>
            </div>
            <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200 text-center">
              <label class="block text-xs text-emerald-600 mb-1">结果期</label>
              <p class="text-emerald-900 font-bold text-lg">
                {{ variety.fruitingPeriod ? `${variety.fruitingPeriod}天` : '-' }}
              </p>
            </div>
            <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200 text-center">
              <label class="block text-xs text-emerald-600 mb-1">摘收期</label>
              <p class="text-emerald-900 font-bold text-lg">
                {{ variety.harvestPeriod ? `${variety.harvestPeriod}天` : '-' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 备注 - 灰色主题 -->
        <div>
          <h4 class="text-sm font-bold text-gray-600 mb-3 border-b-2 border-gray-200 pb-2 flex items-center gap-2">
            <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
            备注
          </h4>
          <div class="bg-gray-100 rounded-lg p-4 border border-gray-200">
            <p class="text-gray-700 text-sm">
              {{ variety.remarks || '暂无备注' }}
            </p>
          </div>
        </div>

        <!-- 作物适宜环境参数 - 青色主题 -->
        <div>
          <h4 class="text-sm font-bold text-cyan-700 mb-3 border-b-2 border-cyan-200 pb-2 flex items-center gap-2">
            <span class="w-2 h-2 bg-cyan-500 rounded-full"></span>
            作物适宜环境参数
          </h4>
          <div class="grid grid-cols-4 gap-3">
            <div class="bg-cyan-50 rounded-lg p-3 border border-cyan-200 text-center">
              <label class="block text-xs text-cyan-600 mb-1">空气温度(℃)</label>
              <p class="text-cyan-900 font-bold text-lg">
                {{ variety.airTemperature != null ? variety.airTemperature : '-' }}
              </p>
            </div>
            <div class="bg-cyan-50 rounded-lg p-3 border border-cyan-200 text-center">
              <label class="block text-xs text-cyan-600 mb-1">空气湿度(%)</label>
              <p class="text-cyan-900 font-bold text-lg">
                {{ variety.airHumidity != null ? variety.airHumidity : '-' }}
              </p>
            </div>
            <div class="bg-cyan-50 rounded-lg p-3 border border-cyan-200 text-center">
              <label class="block text-xs text-cyan-600 mb-1">CO₂含量(ppm)</label>
              <p class="text-cyan-900 font-bold text-lg">
                {{ variety.co2Content != null ? variety.co2Content : '-' }}
              </p>
            </div>
            <div class="bg-cyan-50 rounded-lg p-3 border border-cyan-200 text-center">
              <label class="block text-xs text-cyan-600 mb-1">光照度(lx)</label>
              <p class="text-cyan-900 font-bold text-lg">
                {{ variety.lightIntensity != null ? variety.lightIntensity : '-' }}
              </p>
            </div>
            <div class="bg-cyan-50 rounded-lg p-3 border border-cyan-200 text-center">
              <label class="block text-xs text-cyan-600 mb-1">土壤温度(℃)</label>
              <p class="text-cyan-900 font-bold text-lg">
                {{ variety.soilTemperature != null ? variety.soilTemperature : '-' }}
              </p>
            </div>
            <div class="bg-cyan-50 rounded-lg p-3 border border-cyan-200 text-center">
              <label class="block text-xs text-cyan-600 mb-1">土壤湿度(%)</label>
              <p class="text-cyan-900 font-bold text-lg">
                {{ variety.soilHumidity != null ? variety.soilHumidity : '-' }}
              </p>
            </div>
            <div class="bg-cyan-50 rounded-lg p-3 border border-cyan-200 text-center">
              <label class="block text-xs text-cyan-600 mb-1">土壤PH值</label>
              <p class="text-cyan-900 font-bold text-lg">
                {{ variety.soilPh != null ? variety.soilPh : '-' }}
              </p>
            </div>
            <div class="bg-cyan-50 rounded-lg p-3 border border-cyan-200 text-center">
              <label class="block text-xs text-cyan-600 mb-1">土壤EC值</label>
              <p class="text-cyan-900 font-bold text-lg">
                {{ variety.soilEc != null ? variety.soilEc : '-' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 时间信息 - 蓝灰色主题 -->
        <div>
          <h4 class="text-sm font-bold text-slate-600 mb-3 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
            <span class="w-2 h-2 bg-slate-400 rounded-full"></span>
            时间信息
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-100 rounded-lg p-3 border border-slate-200">
              <label class="block text-xs text-slate-600 mb-1">创建时间</label>
              <p class="text-slate-700 font-medium">{{ variety.createTime || '-' }}</p>
            </div>
            <div class="bg-slate-100 rounded-lg p-3 border border-slate-200">
              <label class="block text-xs text-slate-600 mb-1">更新时间</label>
              <p class="text-slate-700 font-medium">{{ variety.updateTime || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Sugar, Edit } from '@element-plus/icons-vue'

const props = defineProps({
  variety: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['edit'])

function handleEdit() {
  emit('edit', props.variety)
}
</script>
