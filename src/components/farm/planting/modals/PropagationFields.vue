<!--
  2026-07-03 v3：繁殖记录表单字段（育苗 phase 5）1:1 迁移自 V1.1
  8 个字段：日期/温度/湿度/母株数量/子苗产出/子苗状态/移栽位置/操作人/备注
-->
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div>
      <Label class="text-gray-700">记录日期 <span class="text-red-500">*</span></Label>
      <DatePicker
        class="w-full"
        :selected="form.recordDate ? new Date(form.recordDate) : undefined"
        @change="(date) => onChange({ ...form, recordDate: todayLocal(date) })"
      />
    </div>
    <div>
      <Label class="text-gray-700">温度（℃）</Label>
      <Input type="number" :value="form.temperature ?? ''"
        @change="(e) => onChange({ ...form, temperature: e.target.value ? Number(e.target.value) : undefined })"
        placeholder="环境温度" :class="deepInputClass" />
    </div>
    <div>
      <Label class="text-gray-700">湿度（%）</Label>
      <Input type="number" :value="form.humidity ?? ''"
        @change="(e) => onChange({ ...form, humidity: e.target.value ? Number(e.target.value) : undefined })"
        placeholder="环境湿度" :class="deepInputClass" />
    </div>
    <div>
      <Label class="text-gray-700">母株数量</Label>
      <NumberInput :value="String(form.motherPlantCount ?? '')"
        @change="(v) => onChange({ ...form, motherPlantCount: v ? parseInt(v, 10) : undefined })"
        placeholder="当前母株总数" :class="deepInputClass" />
    </div>
    <div>
      <Label class="text-gray-700">子苗产出</Label>
      <NumberInput :value="String(form.seedlingOutput ?? '')"
        @change="(v) => onChange({ ...form, seedlingOutput: v ? parseInt(v, 10) : undefined })"
        placeholder="当日新产子苗数" :class="deepInputClass" />
    </div>
    <div>
      <Label class="text-gray-700">子苗状态</Label>
      <Select :value="form.seedlingStatus ?? 'healthy'"
        @update:value="(v) => onChange({ ...form, seedlingStatus: v })">
        <SelectTrigger :class="deepInputClass"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="healthy">健康</SelectItem>
          <SelectItem value="weak">弱苗</SelectItem>
          <SelectItem value="diseased">病害</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="col-span-3">
      <Label class="text-gray-700">移栽位置</Label>
      <Input :value="form.transplantPosition ?? ''"
        @change="(e) => onChange({ ...form, transplantPosition: e.target.value })"
        placeholder="如温室B区 / 3号苗床" :class="deepInputClass" />
    </div>
    <div>
      <Label class="text-gray-700">操作人</Label>
      <Input :value="form.operator ?? ''"
        @change="(e) => onChange({ ...form, operator: e.target.value })"
        placeholder="操作员姓名" :class="deepInputClass" />
    </div>
    <div class="col-span-2">
      <Label class="text-gray-700">备注</Label>
      <TextArea :value="form.remarks ?? ''"
        @change="(e) => onChange({ ...form, remarks: e.target.value })"
        :rows="1" placeholder="异常情况、病虫害等" :class="deepInputClass" />
    </div>
  </div>
</template>

<script setup>
/**
 * 2026-07-22 1:1 迁移自 V1.1 PropagationFields.tsx
 */
import { Label, Input, NumberInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, DatePicker, TextArea } from '@/components/ui'
import { todayLocal } from '@/lib/dateUtils'

defineProps({
  form: { type: Object, required: true },
  onChange: { type: Function, required: true },
  deepInputClass: { type: String, default: '' }
})
</script>
