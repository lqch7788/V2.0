import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有 store
export { useUserStore } from './modules/user'
export { useAppStore } from './modules/app'
export { useFarmTaskStore } from './modules/farmTask'
export { useLaborStore } from './modules/labor'
export { useIndicatorStore } from './modules/indicators'
export { useSummaryStore } from './modules/summary'
export { useSeedSourceStore } from './modules/seedSource'
export { useSeedlingStore } from './modules/seedling'
export { useOrderDataStore } from './modules/orderData'
export { useProductionPlanStore } from './modules/productionPlan'
export { useTechSolutionStore } from './modules/techSolution'
export { usePurchasePlanStore } from './modules/purchasePlan'
export { useGreenhouseStore } from './modules/greenhouse'
