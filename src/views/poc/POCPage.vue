<template>
  <div class="poc-page">
    <h1>Vue3 + Element Plus POC 验证</h1>

    <div class="poc-section">
      <h2>1. 基础组件验证</h2>

      <!-- Button -->
      <div class="demo-item">
        <h3>Button 按钮</h3>
        <el-space>
          <el-button type="primary">主要按钮</el-button>
          <el-button type="success">成功按钮</el-button>
          <el-button type="warning">警告按钮</el-button>
          <el-button type="danger">危险按钮</el-button>
          <el-button type="info">信息按钮</el-button>
          <el-button plain>朴素按钮</el-button>
          <el-button round>圆角按钮</el-button>
          <el-button :icon="Search">图标按钮</el-button>
          <el-button loading>加载中</el-button>
        </el-space>
      </div>

      <!-- Input -->
      <div class="demo-item">
        <h3>Input 输入框</h3>
        <el-space wrap>
          <el-input v-model="input1" placeholder="基础输入框" />
          <el-input v-model="input2" placeholder="禁用状态" disabled />
          <el-input v-model="input3" placeholder="可清除" clearable />
          <el-input v-model="input4" placeholder="带图标" :prefix-icon="Search" />
          <el-input v-model="input5" placeholder="密码输入" show-password />
        </el-space>
      </div>

      <!-- Select -->
      <div class="demo-item">
        <h3>Select 选择器</h3>
        <el-space wrap>
          <el-select v-model="select1" placeholder="基础选择">
            <el-option label="选项1" value="1" />
            <el-option label="选项2" value="2" />
            <el-option label="选项3" value="3" />
          </el-select>
          <el-select v-model="select2" placeholder="禁用状态" disabled>
            <el-option label="选项1" value="1" />
          </el-select>
          <el-select v-model="select3" placeholder="可搜索" filterable>
            <el-option label="北京市" value="beijing" />
            <el-option label="上海市" value="shanghai" />
            <el-option label="广州市" value="guangzhou" />
            <el-option label="深圳市" value="shenzhen" />
          </el-select>
          <el-select v-model="select4" placeholder="多选" multiple collapse-tags>
            <el-option label="选项1" value="1" />
            <el-option label="选项2" value="2" />
            <el-option label="选项3" value="3" />
          </el-select>
        </el-space>
      </div>
    </div>

    <div class="poc-section">
      <h2>2. 表格验证</h2>

      <div class="demo-item">
        <h3>El-Table 表格</h3>
        <el-table :data="tableData" border stripe style="width: 100%">
          <el-table-column type="index" width="60" label="序号" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="department" label="部门" width="150" />
          <el-table-column prop="position" label="岗位" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '在职' ? 'success' : 'info'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          style="margin-top: 16px"
        />
      </div>
    </div>

    <div class="poc-section">
      <h2>3. 表单验证</h2>

      <div class="demo-item">
        <h3>El-Form 表单</h3>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="部门" prop="department">
            <el-select v-model="form.department" placeholder="请选择部门">
              <el-option label="技术部" value="tech" />
              <el-option label="运营部" value="operation" />
              <el-option label="市场部" value="marketing" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm">提交</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="poc-section">
      <h2>4. 弹窗验证</h2>

      <div class="demo-item">
        <h3>El-Dialog 对话框</h3>
        <el-space>
          <el-button @click="dialogVisible = true">打开对话框</el-button>
          <el-button @click="dialogVisible2 = true">打开表单对话框</el-button>
        </el-space>

        <el-dialog v-model="dialogVisible" title="提示" width="30%">
          <span>这是一个 Element Plus 对话框</span>
          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="dialogVisible = false">确定</el-button>
          </template>
        </el-dialog>

        <el-dialog v-model="dialogVisible2" title="新建任务" width="50%">
          <el-form label-width="80px">
            <el-form-item label="任务名称">
              <el-input placeholder="请输入任务名称" />
            </el-form-item>
            <el-form-item label="执行人">
              <el-select placeholder="请选择执行人">
                <el-option label="张三" value="zhangsan" />
                <el-option label="李四" value="lisi" />
              </el-select>
            </el-form-item>
            <el-form-item label="日期时间">
              <el-date-picker type="datetime" placeholder="选择日期时间" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible2 = false">取消</el-button>
            <el-button type="primary" @click="dialogVisible2 = false">确定</el-button>
          </template>
        </el-dialog>
      </div>
    </div>

    <div class="poc-section">
      <h2>5. 标签页验证</h2>

      <div class="demo-item">
        <h3>El-Tabs 标签页</h3>
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="用户管理" name="user">
            用户管理内容区域
          </el-tab-pane>
          <el-tab-pane label="配置管理" name="config">
            配置管理内容区域
          </el-tab-pane>
          <el-tab-pane label="角色管理" name="role">
            角色管理内容区域
          </el-tab-pane>
          <el-tab-pane label="定时任务" name="task">
            定时任务内容区域
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div class="poc-section">
      <h2>6. 日期选择器验证</h2>

      <div class="demo-item">
        <h3>El-Date-Picker 日期选择</h3>
        <el-space wrap>
          <el-date-picker v-model="date1" type="date" placeholder="选择日期" />
          <el-date-picker v-model="date2" type="datetime" placeholder="选择日期时间" />
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
          <el-date-picker v-model="month" type="month" placeholder="选择月份" />
        </el-space>
      </div>
    </div>

    <div class="poc-section">
      <h2>7. 消息提示验证</h2>

      <div class="demo-item">
        <h3>El-Message 消息提示</h3>
        <el-space>
          <el-button @click="showMessage('success')">成功</el-button>
          <el-button @click="showMessage('warning')">警告</el-button>
          <el-button @click="showMessage('error')">错误</el-button>
          <el-button @click="showMessage('info')">信息</el-button>
        </el-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { } from 'element-plus'

// 输入框
const input1 = ref('')
const input2 = ref('禁用输入')
const input3 = ref('')
const input4 = ref('')
const input5 = ref('')

// 选择器
const select1 = ref('')
const select2 = ref('')
const select3 = ref('')
const select4 = ref([])

// 表格
const tableData = [
  { id, name: '张三', department: '技术部', position: '前端工程师', status: '在职' },
  { id, name: '李四', department: '技术部', position: '后端工程师', status: '在职' },
  { id, name: '王五', department: '运营部', position: '运营专员', status: '在职' },
  { id, name: '赵六', department: '市场部', position: '市场经理', status: '离职' },
]

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 表单
const formRef = ref()
const form = reactive({
  name: '',
  email: '',
  department: '',
  date: ''
})

const rules = {
  name: [{ required, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  department: [{ required, message: '请选择部门', trigger: 'change' }]
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('提交成功')
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
}

// 弹窗
const dialogVisible = ref(false)
const dialogVisible2 = ref(false)

// 标签页
const activeTab = ref('user')

// 日期
const date1 = ref('')
const date2 = ref('')
const dateRange = ref([])
const month = ref('')

// 方法
const handleEdit = (row) => {
  ElMessage.info(`编辑: ${row.name}`)
}

const handleDelete = (row) => {
  ElMessage.warning(`删除: ${row.name}`)
}

const showMessage = (type) => {
  const messages = {
    success: '这是一条成功消息',
    warning: '这是一条警告消息',
    error: '这是一条错误消息',
    info: '这是一条信息消息'
  }
  ElMessage[type](messages[type])
}
</script>

<style scoped>
.poc-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 32px;
  margin-bottom: 16px;
  color: var(--text-color);
}

h2 {
  font-size: 24px;
  margin: 24px 0 16px;
  color: var(--text-color);
  border-left: 4px solid var(--primary-color);
  padding-left: 12px;
}

h3 {
  font-size: 18px;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}

.poc-section {
  background: var(--sidebar-bg);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.demo-item {
  margin-bottom: 16px;
}

.demo-item:last-child {
  margin-bottom: 0;
}

.el-space {
  display: flex;
}
</style>
