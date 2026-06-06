/**
 * 方案详情文件上传辅助工具
 *
 * 修复 P1-2：合并 3 处重复的 handleFileUpload 实现
 * - TechSolutionCreateModal.vue L231-250（无参版本）
 * - TechSolutionEditModal.vue L259-278（无参版本）
 * - TechSolutionBatchEditModal.vue L344-360（带 code 参数）
 *
 * 行为 1:1 保留：使用 FileReader.readAsText 读取文件内容到 form.content，
 * 文件名写入 form.planDetailFileName。
 */

export interface PickAndReadFileOptions {
  accept?: string
  onLoad: (payload: { fileName: string; content: string }) => void
}

/**
 * 触发隐藏 input 选择文件并读取文本内容
 */
export function pickAndReadFile({ accept = '.txt,.md,.docx', onLoad }: PickAndReadFileOptions): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      onLoad({
        fileName: file.name,
        content: (event.target?.result as string) || '',
      })
    }
    reader.readAsText(file)
  }
  input.click()
}
