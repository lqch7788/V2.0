<template>
  <!-- 新增技术方案弹窗 - 统一使用 ElModal（V1.1 width=1080 → 统一800） -->
  <ElModal
    :model-value="visible"
    title="新增方案"
    :width="1120"
    :height="900"
    :show-footer="false"
    @update:model-value="(v) => emit('update:visible', v)"
    @close="emit('close')"
  >
    <div class="p-2">
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
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button :class="btnSecondary" @click="emit('submit', 'draft')">存为草稿</button>
        <button :class="btnDefault" @click="emit('submit', 'submit')">提交审批</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElModal } from '@/components/ui'
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
  'update:visible': [val: boolean]
  'update:form': [form: any]
  'update:selectedCrop': [crop: any]
}>()

// 修复 P0-1：适用范围折叠状态（V1.1 L177 scopeExpanded=true 才渲染 Checkbox 列表）
// 修复 R3：初值改为 true，让首屏直接看到 28 个适用范围复选框，无需点击"展开"
const scopeExpanded = ref(true)

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
