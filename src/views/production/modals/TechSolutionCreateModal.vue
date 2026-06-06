<template>
  <!-- 修复 P0-UI-MODAL：补齐 V1.1 Modal 缺失的拖动/最大化/调整大小/关闭按钮
       1:1 翻译 V1.1 CreatePlanModal.tsx 弹窗外壳 + V1.1 Modal.tsx 行为
       (size="xxxl" 默认 1080x650，showMaximize=true，enableDrag=true，enableResize=true，showCloseButton=true) -->
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      @click="handleClose"
    >
      <div
        id="tech-solution-add-dialog"
        class="bg-white rounded-xl w-full shadow-xl flex flex-col relative"
        :style="dialogStyle"
        @click.stop
      >
        <!-- 右下角缩放拖动条（V1.1 enableResize） -->
        <div
          v-if="!isMaximized"
          class="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-10"
          @mousedown="handleResizeStart"
        >
          <svg class="w-full h-full text-gray-300 hover:text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
          </svg>
        </div>

        <!-- 头部（V1.1 Modal 渐变 + 最大化 + 关闭） -->
        <div
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex items-center justify-between rounded-t-xl cursor-move flex-shrink-0"
          @mousedown="handleDragStart"
        >
          <h3 class="text-lg font-semibold text-white flex items-center gap-2 select-none">
            新增方案
          </h3>
          <div class="flex items-center gap-1">
            <el-button
              link
              @click="toggleMaximize"
              class="hover:bg-white/10"
              style="color: rgba(255,255,255,0.8);"
            >
              <el-icon v-if="isMaximized" style="color: white;"><ScaleToOriginal /></el-icon>
              <el-icon v-else style="color: white;"><FullScreen /></el-icon>
            </el-button>
            <el-button
              link
              class="hover:bg-white/10"
              style="color: rgba(255,255,255,0.8);"
              @click="handleClose"
            >
              <el-icon style="color: white;"><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 中间滚动内容区 -->
        <div class="p-6 overflow-y-auto flex-1" style="max-height: calc(85vh - 140px);">
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
                <el-select v-model="form.plantingMode" class="w-full" placeholder="选择种植模式">
                  <el-option v-for="mode in plantingModes" :key="mode" :label="mode" :value="mode" />
                </el-select>
              </div>
            </div>
            <!-- 第四行：适用范围（多选）+ 关联生产批次号（V1.1 L176-229）-->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">适用范围（可多选）</label>
                <div class="space-y-2">
                  <button
                    type="button"
                    :class="btnGhost + ' flex items-center gap-1 text-gray-600'"
                    @click="scopeExpanded = !scopeExpanded"
                  >
                    <component :is="scopeExpanded ? ChevronUp : ChevronDown" class="w-4 h-4" />
                    <span>{{ scopeExpanded ? '收起' : '展开' }}</span>
                  </button>
                  <div v-if="scopeExpanded" class="flex flex-wrap gap-2">
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
            <!-- 第六行：备注（V1.1 L243-250，rows=3）-->
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">备注</label>
              <textarea v-model="form.remarks" rows="3" :class="inputClass + ' resize-y'" placeholder="请输入备注信息"></textarea>
            </div>
            <!-- 第七行：方案内容（V1.1 L252-260）-->
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">方案内容</label>
              <textarea v-model="form.content" rows="6" :class="inputClass + ' resize-y'" placeholder="请输入方案内容（也可通过下方导入文件自动填充）"></textarea>
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

        <!-- 底部按钮（V1.1 Modal showFooter + footer） -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button :class="btnSecondary" @click="emit('submit', 'draft')">存为草稿</button>
          <button :class="btnDefault" @click="emit('submit', 'submit')">提交审批</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'
import { Leaf, Upload, ChevronDown, ChevronUp } from 'lucide-vue-next'
// 修复 P0-005：从共享常量文件导入 28 个适用范围枚举
import { TECH_SOLUTION_SCOPES } from '../constants/techSolutionScopes'
// 第二阶段 Y1 重构：种植模式加载抽 composable（移除 useDictionaryStore 直接引用）
import { usePlantingModes } from '@/composables/production/usePlantingModes'
// 修复 P1-2/P1-3：去重文件读取与方案编号生成（共用 utils）
import { pickAndReadFile } from '@/utils/fileUpload'
import { generateTechSolutionCode } from '@/utils/techSolutionHelpers'

// 样式常量
// 第二阶段 Y2 重构：按钮样式抽常量（CreateModal 用 inputClassStrong 强调版）
import { btnDefault, btnSecondary, btnBlue, btnGhost, inputClassStrong as inputClass } from '../constants/buttonStyles'

// 修复 P0-006：种植模式从字典动态加载（第二阶段 Y1 重构：抽 composable）
const { plantingModes, loadPlantingModes } = usePlantingModes()

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

// 修复 P0-1：适用范围折叠状态（V1.1 L177 scopeExpanded=true 才渲染 Checkbox 列表）
// 修复 R3：初值改为 true，让首屏直接看到 28 个适用范围复选框，无需点击"展开"
const scopeExpanded = ref(true)

// ========== 弹窗交互状态（V1.1 Modal 行为 1:1 对齐） ==========
// 默认 size="xxxl" = 1080x650（V1.1 Modal.tsx L51）
const isMaximized = ref(false)
const dialogPosition = ref({ x: 0, y: 0 })
const dialogSize = ref({ width: 1080, height: 650 })

// 拖动相关
let isDragging = false
let dragOffset = { x: 0, y: 0 }

// 缩放相关
let isResizing = false
let resizeStart = { x: 0, y: 0, width: 0, height: 0 }

const dialogStyle = computed(() => {
  if (isMaximized.value) {
    return {
      position: 'fixed' as const,
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      borderRadius: '0',
      zIndex: 100,
    }
  }
  return {
    position: 'fixed' as const,
    top: dialogPosition.value.y ? `${dialogPosition.value.y}px` : '50%',
    left: dialogPosition.value.x ? `${dialogPosition.value.x}px` : '50%',
    transform: dialogPosition.value.x || dialogPosition.value.y ? 'none' : 'translate(-50%, -50%)',
    width: `${dialogSize.value.width}px`,
    height: `${dialogSize.value.height}px`,
    maxWidth: '90vw',
    maxHeight: '90vh',
    minWidth: '40rem',
  }
})

// ========== 拖动处理（V1.1 Modal enableDrag） ==========
const handleDragStart = (e: MouseEvent) => {
  if (isMaximized.value) return
  isDragging = true
  // 兼容已定位与 transform 居中两种状态
  const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect()
  if (rect) {
    dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  } else {
    dragOffset = { x: 0, y: 0 }
  }
  e.preventDefault()
}

const onDragMove = (e: MouseEvent) => {
  if (!isDragging || isMaximized.value) return
  const newX = e.clientX - dragOffset.x
  const newY = e.clientY - dragOffset.y
  // 边界保护
  const maxX = window.innerWidth - 100
  const maxY = window.innerHeight - 50
  dialogPosition.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY)),
  }
}

const onDragEnd = () => {
  isDragging = false
}

// ========== 缩放处理（V1.1 Modal enableResize） ==========
const handleResizeStart = (e: MouseEvent) => {
  if (isMaximized.value) return
  e.preventDefault()
  isResizing = true
  resizeStart = {
    x: e.clientX,
    y: e.clientY,
    width: dialogSize.value.width,
    height: dialogSize.value.height,
  }
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

const onResizeMove = (e: MouseEvent) => {
  if (!isResizing) return
  const dx = e.clientX - resizeStart.x
  const dy = e.clientY - resizeStart.y
  dialogSize.value = {
    width: Math.max(640, resizeStart.width + dx),
    height: Math.max(400, resizeStart.height + dy),
  }
}

const onResizeEnd = () => {
  isResizing = false
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

// ========== 最大化（V1.1 Modal showMaximize） ==========
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
}

// ========== 关闭（点击遮罩 + 关闭按钮 + ESC） ==========
const handleClose = () => {
  emit('close')
}

// 拖动/缩放事件挂在 document 上
onMounted(() => {
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
})
onUnmounted(() => {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})

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

const generateCode = generateTechSolutionCode

const handleFileUpload = () => {
  pickAndReadFile({
    accept: '.txt,.md,.docx',
    onLoad: ({ fileName, content }) => {
      emit('update:form', {
        ...props.form,
        content,
        planDetailFileName: fileName,
      })
    },
  })
}
</script>
