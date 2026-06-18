/**
 * 物料设备 Composable（V2.0）
 * V1.1 1:1 接口对齐：useMaterialEquipment.ts
 */
import { ref, computed } from 'vue'

export function useMaterialEquipment() {
  const materials = ref([
    { id: 'M001', name: '氮肥', stock: 500, unit: 'kg', status: 'normal' },
    { id: 'M002', name: '磷肥', stock: 50, unit: 'kg', status: 'low' },
  ])

  const equipment = ref([
    { id: 'E001', name: '灌溉系统', status: 'running', location: '1号温室' },
    { id: 'E002', name: '通风设备', status: 'idle', location: '2号温室' },
  ])

  const lowStockAlerts = computed(() => materials.value.filter(m => m.status === 'low'))

  return {
    materials,
    equipment,
    lowStockAlerts,
  }
}
