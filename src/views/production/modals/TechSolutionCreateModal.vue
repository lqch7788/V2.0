<template>
  <div v-if="visible" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
    <div class="bg-white rounded-xl shadow-xl flex flex-col fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 1350px; max-height: 90vh;">
      <div class="modal-header flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl cursor-default select-none">
        <h3 class="text-lg font-semibold text-white">新增方案</h3>
        <button class="text-white hover:bg-emerald-500 rounded-lg p-1" @click="emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col">
        <div class="space-y-4">
          <!-- 第一行：方案编号 + 方案标题（V1.1 L102-129）-->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">方案编号</label>
              <div class="flex gap-2">
                <input v-model="form.code" :class="inputClass" placeholder="请输入方案编号" />
                <button :class="btnDefault + ' flex-shrink-0'" @click="form.code = generateCode()">生成</button>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">方案标题 <span class="text-red-500">*</span></label>
              <input v-model="form.title" :class="inputClass" placeholder="请输入方案标题" />
            </div>
          </div>
          <!-- 第二行：版本 + 创建日期（V1.1 L132-142）-->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">版本</label>
              <input v-model="form.version" :class="inputClass" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">创建日期</label>
              <input :value="new Date().toISOString().split('T')[0]" disabled :class="inputClass + ' bg-gray-50'" />
            </div>
          </div>
          <!-- 第三行：作物品种 + 种植模式（V1.1 L145-173）-->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">作物品种 <span class="text-red-500">*</span></label>
              <CropCodeSelector
                v-model="form.cropCode"
                @change="handleCropChange"
                placeholder="搜索或选择作物品种..."
                size="md"
                show-full-path
              />
              <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                <div class="text-emerald-700 flex items-center gap-1">
                  <Leaf class="w-3 h-3 flex-shrink-0" />
                  {{ selectedCrop.categoryName }} > {{ selectedCrop.typeName }} > {{ selectedCrop.varietyName }}
                  <span v-if="selectedCrop.subVariety1Name"> > {{ selectedCrop.subVariety1Name }}</span>
                </div>
                <div class="text-emerald-600 mt-0.5">
                  编码：{{ selectedCrop.cropCode }}
                </div>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">种植模式</label>
              <!-- 修复 P0-006：种植模式从字典动态加载（V1.1 用 DictSelect category=planting_mode） -->
              <el-select v-model="form.plantingMode" class="w-full" placeholder="选择种植模式">
                <el-option v-for="mode in plantingModes" :key="mode" :label="mode" :value="mode" />
              </el-select>
            </div>
          </div>
          <!-- 修复 P0-009：移除 V2.0 自创的"作物编码"只读字段（V1.1 不存在此字段，作物编码通过 selectedCrop 块显示） -->
          <!-- 第四行：适用范围（多选）+ 关联生产批次号（V1.1 L176-229）-->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">适用范围（可多选）</label>
              <div class="flex flex-wrap gap-2">
                <!-- 修复 P0-005：恢复 V1.1 28 个适用范围枚举（替换 V2.0 7 个"大棚/车间"硬编码） -->
                <label v-for="scope in TECH_SOLUTION_SCOPES" :key="scope" class="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="form.scopes.includes(scope)"
                    @change="(e) => toggleScope(scope, (e.target as HTMLInputElement).checked)"
                    class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="text-sm">{{ scope }}</span>
                </label>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">关联生产批次号</label>
              <el-select v-model="form.relatedBatchCode" class="w-full" placeholder="请选择">
                <el-option label="不关联生产批次" value="" />
                <el-option label="ZZB2026-001 - 番茄种植批次" value="ZZB2026-001" />
                <el-option label="ZZB2026-002 - 黄瓜种植批次" value="ZZB2026-002" />
                <el-option label="ZZB2026-003 - 草莓种植批次" value="ZZB2026-003" />
                <el-option label="YMB2026-001 - 番茄育苗批次" value="YMB2026-001" />
                <el-option label="YMB2026-002 - 黄瓜育苗批次" value="YMB2026-002" />
                <el-option label="JZB2026-001 - 番茄种源批次" value="JZB2026-001" />
                <el-option label="JZB2026-002 - 黄瓜种源批次" value="JZB2026-002" />
              </el-select>
            </div>
          </div>
          <!-- 第五行：编制人（V1.1 L232-240）-->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">编制人</label>
              <el-select v-model="form.author" class="w-full">
                <el-option v-for="op in operatorOptions" :key="op.value" :label="op.label" :value="op.value" />
              </el-select>
            </div>
          </div>
          <!-- 第六行：备注（V1.1 L243-250）-->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">备注</label>
            <textarea v-model="form.remarks" rows="2" :class="inputClass + ' resize-y'" placeholder="请输入备注信息"></textarea>
          </div>
          <!-- 第七行：方案内容（与 EditModal L238-244 + BatchEditModal L299-321 对齐）
               V1.1 CreateModal 原版无此字段，但 Edit/BatchEdit 都有，补全统一 -->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">方案内容</label>
            <textarea v-model="form.content" rows="6" :class="inputClass + ' resize-y'" placeholder="请输入方案内容"></textarea>
          </div>
          <!-- 第八行：方案详细（V1.1 L253-264）-->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">方案详细</label>
            <div class="flex items-center gap-2">
              <button :class="btnBlue" @click="handleFileUpload">
                <Upload class="w-3 h-3" />
                导入文件
              </button>
              <span class="text-xs text-gray-500">支持 .txt, .md, .docx 格式文件</span>
              <span v-if="form.planDetailFileName" class="text-xs text-emerald-600">{{ form.planDetailFileName }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
        <button :class="btnSecondary" @click="emit('submit', 'draft')">存为草稿</button>
        <button :class="btnDefault" @click="emit('submit', 'submit')">提交审批</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'
import { Leaf, Upload } from 'lucide-vue-next'
// 修复 P0-005：从共享常量文件导入 28 个适用范围枚举
import { TECH_SOLUTION_SCOPES, PLANTING_MODE_FALLBACK } from '../constants/techSolutionScopes'
// 修复 P0-006：从字典 store 加载种植模式选项
import { useDictionaryStore } from '@/stores/modules/dictionary'

// 样式常量
const btnBase = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
const btnDefault = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 h-8 rounded-md px-3 text-xs`
const btnSecondary = `${btnBase} bg-gray-100 text-gray-900 hover:bg-gray-200 h-8 rounded-md px-3 text-xs`
const btnBlue = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 h-8 rounded-md px-3 text-xs`
const inputClass = 'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50'

// 修复 P0-006：种植模式从字典动态加载
const dictionaryStore = useDictionaryStore()
const plantingModes = ref<string[]>([...PLANTING_MODE_FALLBACK])

async function loadPlantingModes() {
  try {
    if (dictionaryStore.dictionaries && dictionaryStore.dictionaries.length > 0) {
      const list = dictionaryStore.dictionaries
        .filter((d: any) => d.category === 'planting_mode' && d.status !== 'inactive')
        .map((d: any) => d.name)
      if (list.length > 0) {
        plantingModes.value = list
        return
      }
    }
  } catch {
    // 静默降级
  }
  try {
    await dictionaryStore.loadDictionaries()
    const list = dictionaryStore.dictionaries
      .filter((d: any) => d.category === 'planting_mode' && d.status !== 'inactive')
      .map((d: any) => d.name)
    plantingModes.value = list.length > 0 ? list : [...PLANTING_MODE_FALLBACK]
  } catch {
    plantingModes.value = [...PLANTING_MODE_FALLBACK]
  }
}

onMounted(() => {
  loadPlantingModes()
})

interface Props {
  visible: boolean
  form: any
  selectedCrop: any
  operatorOptions: { value: string; label: string }[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'close': []
  'submit': [mode: 'draft' | 'submit']
  'update:form': [form: any]
  'update:selectedCrop': [crop: any]
}>()

const handleCropChange = (code: string, varietyInfo: any) => {
  if (varietyInfo) {
    emit('update:selectedCrop', varietyInfo)
    emit('update:form', {
      ...props.form,
      crop: varietyInfo.subVariety1Name || varietyInfo.varietyName,
      cropCode: varietyInfo.cropCode,
    })
  } else {
    emit('update:selectedCrop', null)
    emit('update:form', { ...props.form, crop: '', cropCode: '' })
  }
}

const toggleScope = (scope: string, checked: boolean) => {
  const scopes = checked
    ? [...props.form.scopes, scope]
    : props.form.scopes.filter((s: string) => s !== scope)
  emit('update:form', { ...props.form, scopes })
}

const generateCode = () => {
  return `T${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
}

const handleFileUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt,.md,.docx'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        emit('update:form', {
          ...props.form,
          content: event.target?.result as string,
          planDetailFileName: file.name,
        })
      }
      reader.readAsText(file)
    }
  }
  input.click()
}
</script>
