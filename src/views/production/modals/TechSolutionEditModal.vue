<template>
  <!-- 第二阶段 Y3 重构：复用 BaseModal 弹窗外壳 -->
  <BaseModal
    :visible="visible"
    @update:visible="(v) => emit('update:visible', v)"
    title="编辑方案"
    :width="700"
    @close="emit('close')"
  >
    <div v-if="tech" class="p-6">
      <div class="space-y-4">
          <!-- 方案编号 + 版本（V1.1 L94-104）-->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">方案编号</label>
              <input :value="tech.code" disabled :class="inputClass + ' bg-gray-50'" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">版本</label>
              <input v-model="form.version" :class="inputClass" />
            </div>
          </div>
          <!-- 方案标题（V1.1 L107-112）-->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">方案标题</label>
            <input v-model="form.title" :class="inputClass" />
          </div>
          <!-- 作物品种 + 种植模式（V1.1 L115-143）-->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">作物品种</label>
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
          <!-- 适用范围（多选）（V1.1 L146-181）-->
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
          <!-- 修复 P0-003：补回"关联生产批次号"字段（V1.1 L184-199 缺失） -->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">关联生产批次号</label>
            <el-select v-model="form.relatedBatchCode" class="w-full" placeholder="请选择">
              <el-option label="不关联生产批次" value="" />
              <el-option label="ZZB2026-001" value="ZZB2026-001" />
              <el-option label="ZZB2026-002" value="ZZB2026-002" />
              <el-option label="ZZB2026-003" value="ZZB2026-003" />
              <el-option label="YMB2026-001" value="YMB2026-001" />
              <el-option label="YMB2026-002" value="YMB2026-002" />
              <el-option label="JZB2026-001" value="JZB2026-001" />
              <el-option label="JZB2026-002" value="JZB2026-002" />
            </el-select>
          </div>
          <!-- 编制人 + 创建日期（V1.1 L204-216：编制人改为 Select 可编辑，与 CreateModal 一致） -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">编制人</label>
              <el-select v-model="form.author" class="w-full">
                <el-option v-for="op in operatorOptions" :key="op.value" :label="op.label" :value="op.value" />
              </el-select>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">创建日期</label>
              <input :value="tech.createDate" disabled :class="inputClass + ' bg-gray-50'" />
            </div>
          </div>
          <!-- 备注（V1.1 L212-218）-->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">备注</label>
            <textarea v-model="form.remarks" rows="2" :class="inputClass + ' resize-y'" placeholder="请输入备注信息"></textarea>
          </div>
          <!-- 方案是否有效（V1.1 L221-235）-->
          <!-- 修复 P0-015：删除 V2.0 自创的"最后提交时间"UI 字段（V1.1 表单 state 含 lastSubmitTime 但 UI 不渲染） -->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">方案是否有效</label>
            <el-select v-model="form.isValid" class="w-full">
              <el-option label="有效" value="有效" />
              <el-option label="作废" value="作废" />
            </el-select>
            <p v-if="form.isValid === '作废'" class="text-xs text-red-600 mt-1 font-medium">
              ⚠️ 选择"作废"后方案将无法使用，提交后将进入审核流程
            </p>
          </div>
          <!-- 方案内容（V1.1 L238-244）-->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">方案内容</label>
            <textarea v-model="form.content" rows="6" :class="inputClass + ' resize-y'"></textarea>
          </div>
          <!-- 方案详情文件（V1.1 L247-269）-->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">方案详情文件</label>
            <div class="flex items-center gap-3">
              <button :class="btnBlue" @click="handleFileUpload">
                <Upload class="w-3 h-3" />
                导入文件
              </button>
              <span class="text-xs text-gray-500">支持 .txt, .md, .docx 格式</span>
              <span v-if="form.planDetailFileName" class="text-xs text-emerald-600">{{ form.planDetailFileName }}</span>
              <button
                v-if="form.planDetailFileName"
                :class="btnGhost + ' text-red-500 hover:text-red-700 text-xs'"
                @click="form.planDetailFileName = ''; form.content = ''"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <button :class="btnSecondary" @click="emit('close')">取消</button>
      <button :class="btnDefault" @click="emit('submit')">保存</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BaseModal from '../components/BaseModal.vue'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'
import { Leaf, Upload } from 'lucide-vue-next'
// 修复 P0-005：从共享常量文件导入 28 个适用范围枚举
import { TECH_SOLUTION_SCOPES } from '../constants/techSolutionScopes'
// 第二阶段 Y1 重构：种植模式加载抽 composable
import { usePlantingModes } from '@/composables/production/usePlantingModes'
// 修复 P1-2：去重文件读取（共用 utils）
import { pickAndReadFile } from '@/utils/fileUpload'

// 样式常量
// 第二阶段 Y2 重构：按钮样式抽常量（EditModal 沿用紧凑版 inputClass）
import { btnDefault, btnSecondary, btnBlue, btnGhost, inputClass } from '../constants/buttonStyles'

// 修复 P0-006：种植模式从字典动态加载（第二阶段 Y1 重构：抽 composable）
const { plantingModes, loadPlantingModes } = usePlantingModes()

onMounted(() => {
  loadPlantingModes()
})

interface Props {
  visible: boolean
  tech: any
  form: any
  selectedCrop: any
  // 修复 P0-CY：与 V1.1 EditModal L41 一致，接收 operatorOptions 用于编制人 Select
  operatorOptions?: { value: string; label: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  operatorOptions: () => [],
})

const emit = defineEmits<{
  'close': []
  'submit': []
  'update:visible': [val: boolean]
  'update:form': [form: any]
  'update:selectedCrop': [crop: any]
}>()

// 修复 P0-003：监听 form 变化，如果外部未设置 relatedBatchCode 则用 tech 的值兜底
watch(
  () => props.visible,
  (val) => {
    if (val && props.tech && props.form) {
      // 进入弹窗时，如果 form.relatedBatchCode 缺失，用 tech 的原值兜底
      if (props.form.relatedBatchCode === undefined) {
        emit('update:form', { ...props.form, relatedBatchCode: props.tech.relatedBatchCode || '' })
      }
    }
  }
)

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
