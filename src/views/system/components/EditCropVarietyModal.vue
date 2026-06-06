<template>
  <el-dialog
    :model-value="visible"
    title="编辑作物品种"
    width="1000px"
    @close="handleClose"
  >
    <div class="space-y-6">
      <!-- 品种信息（只读）- 灰色背景 -->
      <div class="bg-gray-100 rounded-lg p-4">
        <h4 class="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
          <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
          品种信息（不可修改）
        </h4>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">作物编码</label>
            <p class="font-mono text-gray-600 font-medium bg-gray-200 px-2 py-1 rounded">{{ variety?.cropCode }}</p>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">类别</label>
            <p class="text-gray-600 bg-gray-200 px-2 py-1 rounded">{{ variety?.categoryName }}</p>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">类型</label>
            <p class="text-gray-600 bg-gray-200 px-2 py-1 rounded">{{ variety?.typeName }}</p>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">品种</label>
            <p class="text-gray-700 font-medium bg-gray-200 px-2 py-1 rounded">{{ variety?.varietyName }}</p>
          </div>
          <div v-if="variety?.subVariety1Name">
            <label class="block text-xs text-gray-500 mb-1">子品种</label>
            <p class="text-gray-700 font-medium bg-gray-200 px-2 py-1 rounded">{{ variety?.subVariety1Name }}</p>
          </div>
        </div>
      </div>

      <!-- 可编辑字段 -->
      <div class="grid grid-cols-2 gap-x-6 gap-y-4">
        <!-- 作物品种 - 蓝色标签必填 -->
        <div class="col-span-2">
          <label class="block text-sm font-bold text-blue-700">
            作物品种 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="formData.varietyName"
            placeholder="如：红颜草莓、红颜草莓-A"
            class="w-full"
          />
        </div>

        <!-- 别名 -->
        <div>
          <label class="block text-sm text-amber-700">
            别名 <span class="text-xs text-gray-400">(多个用逗号分隔)</span>
          </label>
          <el-input
            v-model="formData.alias"
            placeholder="如：西红柿、洋柿子"
          />
        </div>

        <!-- 图片 -->
        <div>
          <label class="block text-sm text-amber-700">图片</label>
          <div class="flex items-center gap-3">
            <div v-if="formData.image" class="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-200 flex-shrink-0">
              <img :src="formData.image" alt="预览" class="w-full h-full object-cover" />
            </div>
            <div class="flex flex-col gap-1">
              <el-button size="small" @click="triggerImageUpload">
                {{ formData.image ? '更换图片' : '上传图片' }}
              </el-button>
              <input
                ref="imageInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageUpload"
              />
              <el-button v-if="formData.image" size="small" type="danger" @click="formData.image = ''">
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 特性描述 -->
        <div class="col-span-2">
          <label class="block text-sm text-amber-700">特性描述</label>
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="简要描述该作物品种的主要特性..."
          />
        </div>

        <!-- 作物生长周期 -->
        <div class="col-span-2">
          <label class="block text-sm font-bold text-amber-700 mb-2">作物生长周期</label>
          <div class="grid grid-cols-5 gap-3">
            <div>
              <label class="block text-xs text-amber-600 mb-1">发芽期(天)</label>
              <el-input-number v-model="formData.germinationPeriod" :min="0" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-amber-600 mb-1">育苗期(天)</label>
              <el-input-number v-model="formData.seedlingPeriod" :min="0" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-amber-600 mb-1">开花期(天)</label>
              <el-input-number v-model="formData.floweringPeriod" :min="0" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-amber-600 mb-1">结果期(天)</label>
              <el-input-number v-model="formData.fruitingPeriod" :min="0" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-amber-600 mb-1">摘收期(天)</label>
              <el-input-number v-model="formData.harvestPeriod" :min="0" controls-position="right" class="w-full" />
            </div>
          </div>
        </div>

        <!-- 状态 -->
        <div>
          <label class="block text-sm font-bold text-emerald-700">状态</label>
          <el-select v-model="formData.status" class="w-full">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </div>

        <!-- 作物适宜环境参数 -->
        <div class="col-span-2">
          <label class="block text-sm font-bold text-cyan-700 mb-2">作物适宜环境参数</label>
          <div class="grid grid-cols-4 gap-3">
            <div>
              <label class="block text-xs text-cyan-600 mb-1">空气温度(℃)</label>
              <el-input-number v-model="formData.airTemperature" :precision="2" :step="0.1" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-cyan-600 mb-1">空气湿度(%)</label>
              <el-input-number v-model="formData.airHumidity" :precision="2" :step="0.1" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-cyan-600 mb-1">CO₂含量(ppm)</label>
              <el-input-number v-model="formData.co2Content" :precision="2" :step="0.1" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-cyan-600 mb-1">光照度(lx)</label>
              <el-input-number v-model="formData.lightIntensity" :precision="2" :step="0.1" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-cyan-600 mb-1">土壤温度(℃)</label>
              <el-input-number v-model="formData.soilTemperature" :precision="2" :step="0.1" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-cyan-600 mb-1">土壤湿度(%)</label>
              <el-input-number v-model="formData.soilHumidity" :precision="2" :step="0.1" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-cyan-600 mb-1">土壤PH值</label>
              <el-input-number v-model="formData.soilPh" :precision="2" :step="0.1" controls-position="right" class="w-full" />
            </div>
            <div>
              <label class="block text-xs text-cyan-600 mb-1">土壤EC值</label>
              <el-input-number v-model="formData.soilEc" :precision="2" :step="0.1" controls-position="right" class="w-full" />
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div class="col-span-2">
          <label class="block text-sm text-gray-500 mb-1">备注</label>
          <el-input
            v-model="formData.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息..."
          />
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useCropVarietyStore } from '@/stores'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  variety: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const store = useCropVarietyStore()
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 图片上传相关
const imageInputRef = ref<HTMLInputElement | null>(null)

const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 使用 FileReader 将图片转为 base64
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.image = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // 清空input以便重复选择同一文件
  target.value = ''
}

// 表单数据
const formData = reactive({
  varietyName: '',
  alias: '',
  image: '',
  description: '',
  germinationPeriod: undefined,
  seedlingPeriod: undefined,
  floweringPeriod: undefined,
  fruitingPeriod: undefined,
  harvestPeriod: undefined,
  airTemperature: undefined,
  airHumidity: undefined,
  co2Content: undefined,
  lightIntensity: undefined,
  soilTemperature: undefined,
  soilHumidity: undefined,
  soilPh: undefined,
  soilEc: undefined,
  status: 'active',
  remarks: ''
})

// 监听 variety 变化，初始化表单数据
watch(() => props.variety, (newVariety) => {
  if (newVariety) {
    // 获取初始品种名称
    const getInitialVarietyName = () => {
      if (newVariety.detailVarietyCode && newVariety.detailVarietyCode !== '00') {
        return newVariety.detailVarietyName || newVariety.subVariety1Name || newVariety.varietyName || ''
      }
      return newVariety.subVariety1Name || newVariety.varietyName || ''
    }

    Object.assign(formData, {
      varietyName: getInitialVarietyName(),
      alias: newVariety.alias?.join(', ') || '',
      image: newVariety.image || '',
      description: newVariety.description || '',
      germinationPeriod: newVariety.germinationPeriod,
      seedlingPeriod: newVariety.seedlingPeriod,
      floweringPeriod: newVariety.floweringPeriod,
      fruitingPeriod: newVariety.fruitingPeriod,
      harvestPeriod: newVariety.harvestPeriod,
      airTemperature: newVariety.airTemperature,
      airHumidity: newVariety.airHumidity,
      co2Content: newVariety.co2Content,
      lightIntensity: newVariety.lightIntensity,
      soilTemperature: newVariety.soilTemperature,
      soilHumidity: newVariety.soilHumidity,
      soilPh: newVariety.soilPh,
      soilEc: newVariety.soilEc,
      status: newVariety.status,
      remarks: newVariety.remarks || ''
    })
  }
}, { immediate: true })

// 解析别名
function parseAlias(aliasStr: string): string[] {
  if (!aliasStr.trim()) return []
  return aliasStr.split(/[,，;；]/).map((s: string) => s.trim()).filter((s: string) => s)
}

// 提交
async function handleSubmit() {
  try {
    if (!props.variety) return

    // 判断更新哪个字段
    const hasDetail = props.variety.detailVarietyCode && props.variety.detailVarietyCode !== '00'
    const updateData: Record<string, any> = {
      alias: parseAlias(formData.alias),
      image: formData.image || undefined,
      description: formData.description || undefined,
      germinationPeriod: formData.germinationPeriod,
      seedlingPeriod: formData.seedlingPeriod,
      floweringPeriod: formData.floweringPeriod,
      fruitingPeriod: formData.fruitingPeriod,
      harvestPeriod: formData.harvestPeriod,
      airTemperature: formData.airTemperature,
      airHumidity: formData.airHumidity,
      co2Content: formData.co2Content,
      lightIntensity: formData.lightIntensity,
      soilTemperature: formData.soilTemperature,
      soilHumidity: formData.soilHumidity,
      soilPh: formData.soilPh,
      soilEc: formData.soilEc,
      status: formData.status,
      remarks: formData.remarks
    }

    // 根据是否有 detail 级别决定更新哪个名称字段
    if (hasDetail) {
      updateData.detailVarietyName = formData.varietyName
    } else {
      updateData.varietyName = formData.varietyName
    }

    await store.updateItem(props.variety.id, updateData)
    emit('success')
    handleClose()
  } catch (error) {
    const msg = error instanceof Error ? error.message : '未知错误'
    ElMessage.error('保存失败: ' + msg)
  }
}

// 关闭弹窗
function handleClose() {
  visible.value = false
}
</script>
