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
          <!-- 修复 P0-010：删除 V2.0 自创的"审核人/审批状态/状态"3 字段（V1.1 无此字段） -->
          <div v-if="currentTech" class="grid grid-cols-4 gap-3">
            <!-- 方案编号 - 不可编辑（V1.1 L120-123）-->
            <div class="bg-gray-100 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">方案编号</div>
              <div class="text-sm font-medium text-gray-900">{{ currentTech.code }}</div>
            </div>
            <!-- 版本 - 可编辑（V1.1 L126-133）-->
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">版本</div>
              <input
                :value="editedTechs[selectedTechCode]?.version ?? currentTech.version"
                @input="(e) => updateField(selectedTechCode, 'version', (e.target as HTMLInputElement).value)"
                :class="inputClass + ' h-7 py-0 text-xs'"
              />
            </div>
            <!-- 方案标题 - 可编辑（V1.1 L136-143）-->
            <div class="bg-gray-50 rounded-lg p-2 col-span-2">
              <div class="text-xs text-gray-500 mb-1">方案标题</div>
              <input
                :value="editedTechs[selectedTechCode]?.title ?? currentTech.title"
                @input="(e) => updateField(selectedTechCode, 'title', (e.target as HTMLInputElement).value)"
                :class="inputClass + ' h-7 py-0 text-xs'"
              />
            </div>
            <!-- 作物品种 - 可编辑（V1.1 L146-163）-->
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">作物品种</div>
              <el-select
                :model-value="editedTechs[selectedTechCode]?.crop ?? currentTech.crop"
                @update:model-value="(v: any) => updateField(selectedTechCode, 'crop', v)"
                class="w-full"
              >
                <el-option v-for="crop in cropOptions" :key="crop" :label="crop" :value="crop" />
              </el-select>
            </div>
            <!-- 种植模式 - 可编辑（V1.1 L166-174）-->
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">种植模式</div>
              <!-- 修复 P0-006：种植模式从字典动态加载 -->
              <el-select
                :model-value="editedTechs[selectedTechCode]?.plantingMode ?? currentTech.plantingMode"
                @update:model-value="(v: any) => updateField(selectedTechCode, 'plantingMode', v)"
                class="w-full"
                placeholder="选择种植模式"
              >
                <el-option v-for="mode in plantingModes" :key="mode" :label="mode" :value="mode" />
              </el-select>
            </div>
            <!-- 适用范围 - 可编辑（V1.1 L177-184）-->
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">适用范围</div>
              <input
                :value="editedTechs[selectedTechCode]?.stage ?? currentTech.stage"
                @input="(e) => updateField(selectedTechCode, 'stage', (e.target as HTMLInputElement).value)"
                :class="inputClass + ' h-7 py-0 text-xs'"
              />
            </div>
            <!-- 编制人 - 不可编辑（V1.1 L187-190）-->
            <div class="bg-gray-100 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">编制人</div>
              <div class="text-sm text-gray-700">{{ currentTech.author }}</div>
            </div>
            <!-- 创建日期 - 不可编辑（V1.1 L193-196）-->
            <div class="bg-gray-100 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">创建日期</div>
              <div class="text-sm text-gray-700">{{ currentTech.createDate }}</div>
            </div>
            <!-- 方案详情文件 - 可编辑（V1.1 L199-220）-->
            <div class="bg-gray-50 rounded-lg p-2 col-span-4">
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
import { PLANTING_MODE_FALLBACK } from '../constants/techSolutionScopes'
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
