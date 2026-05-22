<template>
  <div class="card-field animate-card-in" style="animation-delay: 0.3s">
    <div class="card-title">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
          <el-icon :size="12" class="text-white">
            <Grape />
          </el-icon>
        </div>
        <span>大田区域</span>
      </div>
      <el-button text @click="$emit('toggle')" class="btn-expand">
        <el-icon :size="16" :class="['text-white transition-transform duration-200', expanded ? 'rotate-90' : '']">
          <CaretRight />
        </el-icon>
      </el-button>
    </div>
    <div v-if="expanded" class="max-h-60 overflow-y-auto scrollbar-natural">
      <table class="w-full text-sm">
        <thead class="table-header text-white sticky top-0">
          <tr>
            <th class="px-3 py-2 text-left font-semibold">地块号</th>
            <th class="px-3 py-2 text-left font-semibold">作物</th>
            <th class="px-3 py-2 text-left font-semibold">面积(亩)</th>
            <th class="px-3 py-2 text-left font-semibold">田地类型</th>
            <th class="px-3 py-2 text-left font-semibold">种植状态</th>
            <th class="px-3 py-2 text-left font-semibold">种植时间</th>
            <th class="px-3 py-2 text-center font-semibold">详情</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-amber-200">
          <tr v-for="item in fieldData" :key="item.no">
            <td class="px-3 py-2 font-medium">{{ item.no }}</td>
            <td class="px-3 py-2">{{ item.crop }}</td>
            <td class="px-3 py-2">{{ item.area }}</td>
            <td class="px-3 py-2">{{ item.fieldType }}</td>
            <td class="px-3 py-2">
              <span :class="['px-1.5 py-0.5 rounded text-sm', getStatusClass(item.status)]">
                {{ item.status }}
              </span>
            </td>
            <td class="px-3 py-2">{{ item.plantedDate }}</td>
            <td class="px-3 py-2 text-center">
              <el-button size="small" text class="btn-detail" @click="$emit('detail-click', { type: 'field', data: item })">
                详情&gt;
              </el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { CaretRight, Grape } from '@element-plus/icons-vue'

defineProps({
  expanded: { type: Boolean, default: false },
  onToggle: { type: Function, default: () => {} },
  onDetailClick: { type: Function, default: () => {} }
})

defineEmits(['toggle', 'detail-click'])

// 大田数据
const fieldData = [
  { no: 'A1地块', crop: '水稻', area: '100', fieldType: '水田', status: '生长中', plantedDate: '2024-03-05', expectedHarvest: '2024-09-15', manager: '周志强' },
  { no: 'A2地块', crop: '水稻', area: '100', fieldType: '水田', status: '生长中', plantedDate: '2024-03-05', expectedHarvest: '2024-09-15', manager: '周志强' },
  { no: 'A3地块', crop: '水稻', area: '100', fieldType: '水田', status: '生长中', plantedDate: '2024-03-05', expectedHarvest: '2024-09-15', manager: '周志强' },
  { no: 'B1地块', crop: '小麦', area: '100', fieldType: '旱田', status: '生长中', plantedDate: '2023-11-20', expectedHarvest: '2024-05-30', manager: '郑十' },
  { no: 'B2地块', crop: '小麦', area: '100', fieldType: '旱田', status: '返青期', plantedDate: '2023-11-20', expectedHarvest: '2024-05-30', manager: '郑十' },
  { no: 'C1地块', crop: '油菜', area: '80', fieldType: '旱田', status: '生长中', plantedDate: '2023-10-15', expectedHarvest: '2024-04-20', manager: '吴十一' },
  { no: 'C2地块', crop: '油菜', area: '70', fieldType: '旱田', status: '生长中', plantedDate: '2023-10-15', expectedHarvest: '2024-04-20', manager: '吴十一' },
  { no: 'D1地块', crop: '蔬菜', area: '50', fieldType: '旱田', status: '采收中', plantedDate: '2024-02-01', expectedHarvest: '2024-03-18', manager: '郑十' },
]

const getStatusClass = (status) => {
  switch (status) {
    case '生长中': return 'status-growing'
    case '返青期': return 'status-seedling'
    case '采收中': return 'status-harvest'
    default: return ''
  }
}
</script>

<style scoped>
.card-field {
  background: linear-gradient(180deg, #f0fdf4 0%, #d1fae5 100%);
  border: 1px solid #6ee7b7;
  border-radius: 0.875rem;
  transition: all 0.25s ease;
  overflow: hidden;
}

.card-field:hover {
  border-color: #10b981;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
  transform: translateY(-1px);
}

.card-title {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.6rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-expand {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem;
  border-radius: 0.375rem;
}

/* 状态样式 */
.status-growing {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7a3 100%);
  color: #15803d;
  border: 1px solid #86efac;
}

.status-seedling {
  background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
  color: #a16207;
  border: 1px solid #fde047;
}

.status-harvest {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

/* 详情按钮 */
.btn-detail {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

/* 滚动条 */
.scrollbar-natural::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-natural::-webkit-scrollbar-track {
  background: #f0f5eb;
  border-radius: 4px;
}

.scrollbar-natural::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #84cc16, #65a30d);
  border-radius: 4px;
}

.animate-card-in {
  animation: cardFadeIn 0.4s ease-out forwards;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
