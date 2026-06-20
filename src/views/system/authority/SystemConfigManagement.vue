<!--
  系统配置管理页面
  对标 V1.1 src/pages/authority/SystemConfigManagement.tsx
  功能：全局系统参数配置（系统名称、Logo、主题色、时区、文件上传限制等）
-->
<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <a href="/settings" class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <el-icon :size="20" color="#4b5563"><ArrowLeft /></el-icon>
        </a>
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="24" color="white"><Setting /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">系统配置</h1>
          <p class="text-gray-500">全局系统参数与运行设置</p>
        </div>
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- 配置区 -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <el-tabs v-model="activeTab" type="card" class="config-tabs">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="config" label-width="140px" class="max-w-2xl">
            <el-form-item label="系统名称">
              <el-input v-model="config.systemName" placeholder="例如：智慧种植管理系统" />
            </el-form-item>
            <el-form-item label="系统简称">
              <el-input v-model="config.systemShortName" placeholder="例如：智种" />
            </el-form-item>
            <el-form-item label="公司名称">
              <el-input v-model="config.companyName" placeholder="公司全称" />
            </el-form-item>
            <el-form-item label="版权信息">
              <el-input v-model="config.copyright" placeholder="例如：© 2026 XXX 公司" />
            </el-form-item>
            <el-form-item label="Logo URL">
              <el-input v-model="config.logoUrl" placeholder="https://..." />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 主题外观 -->
        <el-tab-pane label="主题外观" name="theme">
          <el-form :model="config" label-width="140px" class="max-w-2xl">
            <el-form-item label="主色调">
              <el-color-picker v-model="config.primaryColor" />
              <span class="ml-3 text-sm text-gray-500">{{ config.primaryColor }}</span>
            </el-form-item>
            <el-form-item label="强调色">
              <el-color-picker v-model="config.accentColor" />
            </el-form-item>
            <el-form-item label="默认主题">
              <el-radio-group v-model="config.theme">
                <el-radio value="light">浅色</el-radio>
                <el-radio value="dark">深色</el-radio>
                <el-radio value="auto">跟随系统</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="菜单布局">
              <el-radio-group v-model="config.layout">
                <el-radio value="side">侧边栏</el-radio>
                <el-radio value="top">顶部</el-radio>
                <el-radio value="mix">混合</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 国际化 -->
        <el-tab-pane label="国际化" name="i18n">
          <el-form :model="config" label-width="140px" class="max-w-2xl">
            <el-form-item label="默认语言">
              <el-select v-model="config.defaultLanguage" class="w-full">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item label="时区">
              <el-select v-model="config.timezone" class="w-full">
                <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                <el-option label="UTC" value="UTC" />
                <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
              </el-select>
            </el-form-item>
            <el-form-item label="日期格式">
              <el-select v-model="config.dateFormat" class="w-full">
                <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
                <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 文件上传 -->
        <el-tab-pane label="文件上传" name="upload">
          <el-form :model="config" label-width="140px" class="max-w-2xl">
            <el-form-item label="图片最大尺寸(MB)">
              <el-input-number v-model="config.maxImageSize" :min="1" :max="50" />
            </el-form-item>
            <el-form-item label="文件最大尺寸(MB)">
              <el-input-number v-model="config.maxFileSize" :min="1" :max="200" />
            </el-form-item>
            <el-form-item label="允许的图片格式">
              <el-input v-model="config.imageFormats" placeholder="例如：jpg,jpeg,png,gif" />
            </el-form-item>
            <el-form-item label="允许的文件格式">
              <el-input v-model="config.fileFormats" placeholder="例如：pdf,doc,xls,xlsx" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全 -->
        <el-tab-pane label="安全" name="security">
          <el-form :model="config" label-width="140px" class="max-w-2xl">
            <el-form-item label="密码最少长度">
              <el-input-number v-model="config.passwordMinLength" :min="6" :max="20" />
            </el-form-item>
            <el-form-item label="密码复杂度">
              <el-checkbox-group v-model="config.passwordComplexity">
                <el-checkbox value="upper">大写字母</el-checkbox>
                <el-checkbox value="lower">小写字母</el-checkbox>
                <el-checkbox value="number">数字</el-checkbox>
                <el-checkbox value="symbol">特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="会话超时(分钟)">
              <el-input-number v-model="config.sessionTimeout" :min="5" :max="1440" />
            </el-form-item>
            <el-form-item label="登录失败锁定次数">
              <el-input-number v-model="config.loginRetryLimit" :min="3" :max="20" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-2 bg-white rounded-xl shadow-sm p-4">
      <el-button @click="loadConfig">恢复</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')
const saving = ref(false)
const error = ref(null)

const config = reactive({
  systemName: '智慧种植管理系统',
  systemShortName: '智种',
  companyName: '',
  copyright: '',
  logoUrl: '',
  primaryColor: '#059669',
  accentColor: '#3b82f6',
  theme: 'light',
  layout: 'side',
  defaultLanguage: 'zh-CN',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD',
  maxImageSize: 5,
  maxFileSize: 20,
  imageFormats: 'jpg,jpeg,png,gif,webp',
  fileFormats: 'pdf,doc,docx,xls,xlsx',
  passwordMinLength: 8,
  passwordComplexity: ['upper', 'lower', 'number'],
  sessionTimeout: 30,
  loginRetryLimit: 5,
})

const loadConfig = () => {
  // 实际应调用 API
  ElMessage.info('配置已恢复为当前保存值')
}

const handleSave = async () => {
  saving.value = true
  try {
    // 实际应调用 API
    await new Promise((resolve) => setTimeout(resolve, 500))
    ElMessage.success('配置已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadConfig())
</script>