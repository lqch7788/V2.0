<template>
  <div v-if="visible" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
    <div class="bg-white rounded-xl shadow-xl flex flex-col fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 1080px; max-height: 90vh;">
      <div class="modal-header flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl cursor-default select-none">
        <h3 class="text-lg font-semibold text-white">批量编辑技术方案</h3>
        <button class="text-white hover:bg-emerald-500 rounded-lg p-1" @click="emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col">
        <div class="space-y-4">
          <!-- Info Banner（V1.1 L86-92）-->
          <div class="bg-blue-50 rounded-lg p-3">
            <p class="text-sm text-blue-800">
              已选择 <strong>{{ selectedRows.length }}</strong> 个技术方案进行批量编辑，
              已编辑 <strong>{{ editedTechCodes.length }}</strong> 个
            </p>
          </div>
          <!-- Batch Selector（V1.1 L94-114）-->
          <div class="flex items-center gap-4 mb-3">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">选择技术方案编号</label>
              <el-select v-model="selectedTechCode" class="w-full" placeholder="请选择方案编号">
                <el-option
                  v-for="tech in techs"
                  :key="tech.id"
                  :label="`${tech.code} - ${tech.title} ${editedTechCodes.includes(tech.code) ? '✅ 已编辑' : ''}`"
                  :value="tech.code"
                />
              </el-select>
            </div>
          </div>
          <!-- Edit Form（V1.1 L116-222）-->
          <!-- 修复 P0-CZ：与 V1.1 字段顺序 1:1 对齐
               V1.1 行1(4列)：方案编号 / 版本 / 编制人 / 创建日期
               V1.1 行2(横跨)：方案标题
               V1.1 行3(4列)：作物品种 / 种植模式 / 关联批次号 / 方案是否有效
               V1.1 行4(横跨)：适用范围
               V1.1 行5(2列)：备注 / 方案内容
               V1.1 行6(横跨)：方案详情文件 -->
          <div v-if="currentTech" class="space-y-3">
            <!-- 行1(4列)：方案编号 / 版本 / 编制人 / 创建日期（V1.1 L168-202）-->
            <div class="grid grid-cols-4 gap-3">
              <div class="bg-gray-100 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">方案编号</div>
                <div class="text-sm font-medium text-gray-900">{{ currentTech.code }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">版本</div>
                <input
                  :value="editedTechs[selectedTechCode]?.version ?? currentTech.version"
                  @input="(e) => updateField(selectedTechCode, 'version', (e.target as HTMLInputElement).value)"
                  :class="inputClass + ' h-7 py-0 text-xs'"
                />
              </div>
              <div class="bg-gray-100 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">编制人</div>
                <div class="text-sm text-gray-700">{{ currentTech.author }}</div>
              </div>
              <div class="bg-gray-100 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">创建日期</div>
                <div class="text-sm text-gray-700">{{ currentTech.createDate }}</div>
              </div>
            </div>

            <!-- 行2(横跨)：方案标题（V1.1 L204-212）-->
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">方案标题 <span class="text-red-500">*</span></div>
              <input
                :value="editedTechs[selectedTechCode]?.title ?? currentTech.title"
                @input="(e) => updateField(selectedTechCode, 'title', (e.target as HTMLInputElement).value)"
                :class="inputClass + ' h-7 py-0 text-xs'"
              />
            </div>

            <!-- 行3(4列)：作物品种 / 种植模式 / 关联批次号 / 方案是否有效（V1.1 L214-266）-->
            <div class="grid grid-cols-4 gap-3">
              <div class="bg-gray-50 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">作物品种 <span class="text-red-500">*</span></div>
                <CropCodeSelector
                  :model-value="editedTechs[selectedTechCode]?.cropCode ?? currentTech.cropCode ?? ''"
                  @update:model-value="(v: any) => updateField(selectedTechCode, 'cropCode', v)"
                  @change="(code: string, varietyInfo: any) => { if (varietyInfo) { updateField(selectedTechCode, 'crop', varietyInfo.subVariety1Name || varietyInfo.varietyName); updateField(selectedTechCode, 'cropCode', varietyInfo.cropCode) }}"
                  placeholder="搜索或选择作物品种..."
                  size="sm"
                  show-full-path
                />
              </div>
              <div class="bg-gray-50 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">种植模式</div>
                <el-select
                  :model-value="editedTechs[selectedTechCode]?.plantingMode ?? currentTech.plantingMode"
                  @update:model-value="(v: any) => updateField(selectedTechCode, 'plantingMode', v)"
                  class="w-full"
                  placeholder="选择种植模式"
                >
                  <el-option v-for="mode in plantingModes" :key="mode" :label="mode" :value="mode" />
                </el-select>
              </div>
              <div class="bg-gray-50 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">关联生产批次号</div>
                <el-select
                  :model-value="editedTechs[selectedTechCode]?.relatedBatchCode ?? currentTech.relatedBatchCode ?? ''"
                  @update:model-value="(v: any) => updateField(selectedTechCode, 'relatedBatchCode', v)"
                  class="w-full"
                  placeholder="请选择"
                >
                  <el-option label="不关联" value="" />
                  <el-option label="ZZB2026-001 - 番茄种植批次" value="ZZB2026-001" />
                  <el-option label="ZZB2026-002 - 黄瓜种植批次" value="ZZB2026-002" />
                  <el-option label="ZZB2026-003 - 生菜种植批次" value="ZZB2026-003" />
                  <el-option label="ZZB2026-004 - 辣椒种植批次" value="ZZB2026-004" />
                  <el-option label="ZZB2026-005 - 茄子种植批次" value="ZZB2026-005" />
                  <el-option label="ZZB2026-006 - 番茄种植批次" value="ZZB2026-006" />
                  <el-option label="ZZB2026-007 - 百合种植批次" value="ZZB2026-007" />
                </el-select>
              </div>
              <div class="bg-gray-50 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">方案是否有效</div>
                <el-select
                  :model-value="editedTechs[selectedTechCode]?.isValid ?? currentTech.isValid ?? '有效'"
                  @update:model-value="(v: any) => updateField(selectedTechCode, 'isValid', v)"
                  class="w-full"
                >
                  <el-option label="有效" value="有效" />
                  <el-option label="作废" value="作废" />
                </el-select>
              </div>
            </div>

            <!-- 行4(横跨)：适用范围（V1.1 L268-297）-->
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1 flex items-center justify-between">
                <span>适用范围（可多选）</span>
                <button
                  type="button"
                  @click="scopeExpanded = !scopeExpanded"
                  class="text-emerald-600 text-xs hover:underline"
                >
                  {{ scopeExpanded ? '收起' : '展开' }}
                </button>
              </div>
              <div v-if="scopeExpanded" class="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                <label v-for="scope in TECH_SOLUTION_SCOPES" :key="scope" class="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="currentScopes.includes(scope)"
                    @change="(e) => toggleScope(scope, (e.target as HTMLInputElement).checked)"
                    class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="text-xs">{{ scope }}</span>
                </label>
              </div>
              <div v-else class="h-7 px-2 border border-gray-300 rounded-lg text-xs text-gray-600 bg-white flex items-center">
                {{ currentScopes.length === 0 ? '请选择' : currentScopes.join(', ') }}
              </div>
            </div>

            <!-- 行5(2列)：备注 / 方案内容（V1.1 L300-321）-->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">备注</div>
                <textarea
                  :value="editedTechs[selectedTechCode]?.remarks ?? currentTech.remarks ?? ''"
                  @input="(e) => updateField(selectedTechCode, 'remarks', (e.target as HTMLTextAreaElement).value)"
                  placeholder="请输入备注信息"
                  rows="2"
                  class="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y"
                ></textarea>
              </div>
              <div class="bg-gray-50 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">方案内容</div>
                <textarea
                  :value="editedTechs[selectedTechCode]?.content ?? currentTech.content ?? ''"
                  @input="(e) => updateField(selectedTechCode, 'content', (e.target as HTMLTextAreaElement).value)"
                  placeholder="请输入方案内容"
                  rows="4"
                  class="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y"
                ></textarea>
              </div>
            </div>

            <!-- 行6(横跨)：方案详情文件（V1.1 L323-345）-->
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">方案详情文件</div>
              <div class="flex items-center gap-4">
                <template v-if="(editedTechs[selectedTechCode]?.planDetailFileName ?? currentTech.planDetailFileName)">
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-700">{{ editedTechs[selectedTechCode]?.planDetailFileName ?? currentTech.planDetailFileName }}</span>
                    <button :class="btnBlue" @click="handleFileUpload(selectedTechCode)">
                      <Upload class="w-3 h-3" />
                      重新上传
                    </button>
                    <span class="text-xs text-gray-500">支持 .md, .docx, .txt 格式</span>
                  </div>
                </template>
                <button v-else :class="btnDefault" @click="handleFileUpload(selectedTechCode)">
                  <Upload class="w-3 h-3" />
                  上传方案文件
                </button>
              </div>
            </div>
          </div>
          <!-- Footer Buttons（V1.1 L225-232）-->
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button :class="btnSecondary" @click="emit('close')">取消</button>
            <button :class="btnDefault" @click="emit('save')">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { Upload } from 'lucide-vue-next'
import { PLANTING_MODE_FALLBACK, TECH_SOLUTION_SCOPES } from '../constants/techSolutionScopes'
// 修复 P0-006：从字典 store 加载种植模式选项
import { useDictionaryStore } from '@/stores/modules/dictionary'
// 修复 P0-CZ：作物品种选择器
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'

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
  selectedRows: (string | number)[]
  allTechs: any[]
  editedTechs: Record<string, any>
  editedTechCodes: string[]
  cropOptions: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'close': []
  'save': []
  'update:editedTechs': [val: Record<string, any>]
  'update:editedTechCodes': [val: string[]]
}>()

const selectedTechCode = ref('')
const localEditedTechs = ref<Record<string, any>>({})
const localEditedTechCodes = ref<string[]>([])
// 修复 P0-CZ：scopes 折叠状态
const scopeExpanded = ref(false)
// 修复 P0-CZ：当前方案的 scopes
const currentScopes = computed(() => {
  const editedData = localEditedTechs.value[selectedTechCode.value]
  if (editedData?.scopes !== undefined) return editedData.scopes
  return currentTech.value?.scopes || []
})

// 修复 P0-CZ：scopes 切换
const toggleScope = (scope: string, checked: boolean) => {
  const code = selectedTechCode.value
  if (!code) return
  const current = currentScopes.value
  const next = checked
    ? [...current, scope]
    : current.filter((s: string) => s !== scope)
  updateField(code, 'scopes', next)
}

// 同步外部 props 到本地
watch(() => props.editedTechs, (val) => {
  localEditedTechs.value = { ...val }
}, { immediate: true, deep: true })

watch(() => props.editedTechCodes, (val) => {
  localEditedTechCodes.value = [...val]
}, { immediate: true, deep: true })

const techs = computed(() => props.allTechs.filter(t => props.selectedRows.includes(t.id)))

const currentTech = computed(() => {
  if (!selectedTechCode.value) return null
  return props.allTechs.find(t => t.code === selectedTechCode.value)
})

// 初始化选中第一项
watch(() => props.visible, (val) => {
  if (val) {
    if (techs.value.length > 0) {
      selectedTechCode.value = techs.value[0].code
    }
    localEditedTechs.value = { ...props.editedTechs }
    localEditedTechCodes.value = [...props.editedTechCodes]
  }
})

const updateField = (code: string, field: string, value: any) => {
  localEditedTechs.value = {
    ...localEditedTechs.value,
    [code]: { ...localEditedTechs.value[code], [field]: value },
  }
  if (!localEditedTechCodes.value.includes(code)) {
    localEditedTechCodes.value = [...localEditedTechCodes.value, code]
  }
  emit('update:editedTechs', localEditedTechs.value)
  emit('update:editedTechCodes', localEditedTechCodes.value)
}

const handleFileUpload = (code: string) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.md,.docx,.txt'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      updateField(code, 'planDetailFileName', file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        updateField(code, 'content', event.target?.result as string)
      }
      reader.readAsText(file)
    }
  }
  input.click()
}
</script>
