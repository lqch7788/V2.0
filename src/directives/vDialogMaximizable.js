/**
 * el-dialog 最大化指令（1:1 对齐 V1.1 UnifiedModal showMaximize）
 *
 * 用法：<el-dialog v-dialog-maximizable> ... </el-dialog>
 *
 * 行为（V1.1 Modal.tsx L222-237 1:1）：
 * - header 区域右上角加 Maximize2/Minimize2 按钮
 * - 双击 header 切换最大化
 * - 最大化时：top:0/left:0/width:100vw/height:100vh + borderRadius:0
 * - 最小化时：恢复原始 marginLeft/marginTop（与 v-dialog-draggable 位置兼容）
 */

function createMaximizeButton() {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'v-dialog-maximize-btn'
  btn.setAttribute('aria-label', '最大化')
  // 1:1 对齐 V1.1：白底白字透明背景，hover 半透明白底
  btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:transparent;border:none;border-radius:4px;color:#ffffff;cursor:pointer;transition:background-color 0.15s;'
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>'
  btn.addEventListener('mouseenter', () => { btn.style.backgroundColor = 'rgba(255,255,255,0.15)' })
  btn.addEventListener('mouseleave', () => { btn.style.backgroundColor = 'transparent' })
  return btn
}

export const vDialogMaximizable = {
  mounted(el, binding) {
    const options = binding.value || {}
    const showButton = options.showButton !== false // 默认 true（V1.1 默认 showMaximize=true）

    requestAnimationFrame(() => {
      const body = el.querySelector('.el-dialog')
      if (!body) return
      const header = body.querySelector('.el-dialog__header')
      if (!header) return

      // 状态保存
      let isMaximized = false
      let originalStyle = {}

      const setMaximize = (val) => {
        isMaximized = val
        if (val) {
          // 保存原始样式（与 v-dialog-draggable 设置的 marginLeft/marginTop 兼容）
          originalStyle = {
            marginTop: body.style.marginTop || '',
            marginLeft: body.style.marginLeft || '',
            width: body.style.width || '',
            height: body.style.height || '',
            maxWidth: body.style.maxWidth || '',
            borderRadius: body.style.borderRadius || ''
          }
          body.style.marginTop = '0px'
          body.style.marginLeft = '0px'
          body.style.width = '100vw'
          body.style.height = '100vh'
          body.style.maxWidth = '100vw'
          body.style.borderRadius = '0'
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>'
          btn.setAttribute('aria-label', '最小化')
        } else {
          body.style.marginTop = originalStyle.marginTop
          body.style.marginLeft = originalStyle.marginLeft
          body.style.width = originalStyle.width
          body.style.height = originalStyle.height
          body.style.maxWidth = originalStyle.maxWidth
          body.style.borderRadius = originalStyle.borderRadius
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>'
          btn.setAttribute('aria-label', '最大化')
        }
      }

      const toggle = () => setMaximize(!isMaximized)

      // 创建按钮（如果需要）
      let btn = null
      if (showButton) {
        btn = createMaximizeButton()
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          toggle()
        })
        // 找到 header 的关闭按钮，插入到关闭按钮之前
        const closeBtn = header.querySelector('.el-dialog__close, .el-dialog__headerbtn')
        if (closeBtn && closeBtn.parentNode) {
          closeBtn.parentNode.insertBefore(btn, closeBtn)
        } else {
          header.appendChild(btn)
        }
      }

      // 双击 header 切换（V1.1 onDoubleClick={handleMaximize}）
      const onDblClick = (e) => {
        // 排除按钮和输入框
        if (e.target.closest('button, input, textarea, select, .el-dialog__close')) return
        toggle()
      }
      header.addEventListener('dblclick', onDblClick)

      // 清理函数
      el.__maximizeCleanup = () => {
        if (btn && btn.parentNode) btn.parentNode.removeChild(btn)
        header.removeEventListener('dblclick', onDblClick)
      }
    })
  },

  unmounted(el) {
    if (el.__maximizeCleanup) {
      el.__maximizeCleanup()
      delete el.__maximizeCleanup
    }
  },
}

export default vDialogMaximizable
