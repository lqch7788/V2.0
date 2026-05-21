
import { createRouter, createWebHistory } from 'vue-router'

const laborRoutes = [
  {
    path: '/labor',
    redirect: '/labor/attendance'
  },
  {
    path: '/labor/attendance',
    name: 'LaborAttendance',
    component: () => import('@/views/labor/AttendancePage.vue'),
    meta: { title: '考勤管理' }
  },
  {
    path: '/labor/personnel',
    name: 'Personnel',
    component: () => import('@/views/labor/PersonnelPage.vue'),
    meta: { title: '人员管理' }
  },
  {
    path: '/labor/salary',
    name: 'Salary',
    component: () => import('@/views/labor/SalaryPage.vue'),
    meta: { title: '工资管理' }
  },
  {
    path: '/labor/compensation',
    name: 'Compensation',
    component: () => import('@/views/labor/Compensation.vue'),
    meta: { title: '薪酬管理' }
  },
  {
    path: '/labor/salary-budget',
    name: 'SalaryBudget',
    component: () => import('@/views/labor/SalaryBudget.vue'),
    meta: { title: '工资预算' }
  },
  {
    path: '/labor/analytics',
    name: 'LaborAnalytics',
    component: () => import('@/views/labor/Analytics.vue'),
    meta: { title: '运营分析' }
  }
]

export default laborRoutes
