<template>
  <!-- 批量编辑技术方案弹窗 - 统一使用 ElModal（V1.1 BatchEditModal.tsx Modal size="xxl" → 1080） -->
  <ElModal
    :model-value="visible"
    title="批量编辑技术方案"
    :width="1080"
    :height="650"
    @update:model-value="(v) => emit('update:visible', v)"
    @close="emit('close')"
  >
    <div class="p-2">
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
                  @input="(e) => updateField(selectedTechCode, 'version', e.target.value)"
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
                @input="(e) => updateField(selectedTechCode, 'title', e.target.value)"
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
                  <!-- 修复 P0-B4：动态从 batches prop 生成下拉项（V1.1 L231-243 RELATED_BATCH_OPTIONS 静态常量升级） -->
                  <el-option
                    v-for="opt in relatedBatchOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
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
                    @change="(e) => toggleScope(scope, e.target.checked)"
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
                  @input="(e) => updateField(selectedTechCode, 'remarks', e.target.value)"
                  placeholder="请输入备注信息"
                  rows="2"
                  class="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y"
                ></textarea>
              </div>
              <div class="bg-gray-50 rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">方案内容</div>
                <textarea
                  :value="editedTechs[selectedTechCode]?.content ?? currentTech.content ?? ''"
                  @input="(e) => updateField(selectedTechCode, 'content', e.target.value)"
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
                    <span class="text-xs text-gray-500">支持 .md, .txt 格式</span>
                  </div>
                </template>
                <button v-else :class="btnDefault" @click="handleFileUpload(selectedTechCode)">
                  <Upload class="w-3 h-3" />
                  上传方案文件
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-3">
        <button :class="btnSecondary" @click="emit('close')">取消</button>
        <button :class="btnDefault" @click="emit('save')">保存</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { ElModal } from '@/components/ui'
import { Upload } from 'lucide-vue-next'
import { TECH_SOLUTION_SCOPES } from '../constants/techSolutionScopes'
// 第二阶段 Y1 重构：种植模式加载抽 composable
import { usePlantingModes } from '@/composables/production/usePlantingModes'
// 修复 P0-CZ：作物品种选择器
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'
// 修复 P1-2：去重文件读取（共用 utils）
import { pickAndReadFile } from '@/utils/fileUpload'

// 样式常量
// 第二阶段 Y2 重构：按钮样式抽常量
import { btnDefault, btnSecondary, btnBlue, inputClass } from '../constants/buttonStyles'

// 修复 P0-006：种植模式从字典动态加载（第二阶段 Y1 重构：抽 composable）
const { plantingModes, loadPlantingModes } = usePlantingModes()

onMounted(() => {
  loadPlantingModes()
})

const props = defineProps({
  visible: Boolean,
  selectedRows: { type: Array, default: () => [] },
  allTechs: { type: Array, default: () => [] },
  editedTechs: { type: Object, default: () => ({}) },
  editedTechCodes: { type: Array, default: () => [] },
  cropOptions: { type: Array, default: () => [] },
  // 修复 P0-B4：接收父组件传入的 batches 列表（与 CreateModal/EditModal 协议一致）
  // 关联生产批次号下拉从生产计划列表动态生成
  batches: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'save', 'update:visible', 'update:editedTechs', 'update:editedTechCodes'])

const selectedTechCode = ref('')
const localEditedTechs = ref({})
const localEditedTechCodes = ref([])
// 修复 P0-CZ：scopes 折叠状态
const scopeExpanded = ref(false)
// 修复 P0-CZ：当前方案的 scopes
const currentScopes = computed(() => {
  const editedData = localEditedTechs.value[selectedTechCode.value]
  if (editedData?.scopes !== undefined) return editedData.scopes
  return currentTech.value?.scopes || []
})

// 修复 P0-CZ：scopes 切换
const toggleScope = (scope, checked) => {
  const code = selectedTechCode.value
  if (!code) return
  const current = currentScopes.value
  const next = checked
    ? [...current, scope]
    : current.filter((s) => s !== scope)
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

// 修复 P0-B4：关联生产批次号下拉项（与 CreateModal/EditModal 一致）
// 优先用 batches prop 动态生成；为空时 fallback 到相关批次选项
const relatedBatchOptions = computed(() => {
  const opts = [{ value: '', label: '不关联' }]
  for (const b of props.batches || []) {
    const code = b.batchCode || b.id
    if (code) {
      const labelCrop = b.cropName || b.variety || ''
      opts.push({ value: code, label: `${code} - ${labelCrop}` })
    }
  }
  return opts
})

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

const updateField = (code, field, value) => {
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

const handleFileUpload = (code) => {
  pickAndReadFile({
    // 修复 P0-B3：V1.1 L110 严格限制 .md/.txt（docx readAsText 乱码）
    accept: '.md,.txt',
    onLoad: ({ fileName, content }) => {
      // 1:1 保留 V2.0 原行为：先写 planDetailFileName，再异步写 content
      updateField(code, 'planDetailFileName', fileName)
      updateField(code, 'content', content)
    },
  })
}
</script>
