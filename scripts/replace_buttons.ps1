# Batch replace el-button → Button component from UI library
# This script handles the common patterns

$ErrorActionPreference = "Stop"
$root = "D:\TMcrop\yuanxingtu\V2.0\src"
$files = Get-ChildItem -Path $root -Recurse -Filter "*.vue" | Where-Object { $_.FullName -notmatch "node_modules|dist|test-results" }
$processed = 0
$skipped = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    
    # Skip if no el-button
    if ($content -notmatch "<el-button") { $skipped++; continue }
    
    # Check if already imports Button from UI lib
    $hasImport = $content -match "from.*components/ui.*Button|import.*Button.*from"
    
    # Pattern replacements (ordered from most specific to general)
    
    # 1. el-button link size="small" with icon → Button variant="link" size="sm"
    $content = $content -replace '<el-button\s+link\s+size="small"\s+@click="([^"]+)"\s+title="([^"]+)"\s*>','<Button variant="link" size="sm" @click="$1" :title="''$2''">'
    
    # 2. el-button link size="small" with icon and no title
    $content = $content -replace '<el-button\s+link\s+size="small"\s+@click="([^"]+)"\s*>','<Button variant="link" size="sm" @click="$1">'
    
    # 3. el-button type="primary" → variant="default" (emerald)
    $content = $content -replace '<el-button\s+type="primary"','<Button variant="default"'
    
    # 4. el-button type="success" → variant="default"
    $content = $content -replace '<el-button\s+type="success"','<Button variant="default"'
    
    # 5. el-button type="warning" → variant="warning"
    $content = $content -replace '<el-button\s+type="warning"','<Button variant="warning"'
    
    # 6. el-button type="danger" → variant="destructive"
    $content = $content -replace '<el-button\s+type="danger"','<Button variant="destructive"'
    
    # 7. el-button type="info" → variant="secondary"
    $content = $content -replace '<el-button\s+type="info"','<Button variant="secondary"'
    
    # 8. el-button plain → variant="outline"  
    $content = $content -replace '<el-button\s+plain\b','<Button variant="outline"'
    
    # 9. el-button link (without size) → variant="link"
    $content = $content -replace '<el-button\s+link\b','<Button variant="link"'
    
    # 10. el-button text → variant="link"
    $content = $content -replace '<el-button\s+text\b','<Button variant="link"'
    
    # 11. size="small" → size="sm"
    $content = $content -replace '\bsize="small"','size="sm"'
    
    # 12. size="large" → size="lg"
    $content = $content -replace '\bsize="large"','size="lg"'
    
    # 13. Remaining bare el-button → Button
    $content = $content -replace '<el-button\b','<Button'
    $content = $content -replace '</el-button>','</Button>'
    
    # 14. Remove unused Element Plus button imports
    if ($content -notmatch "<el-button") {
        $content = $content -replace "import \{ ElButton \} from 'element-plus'\s*\n", ''
        $content = $content -replace "import \{.*ElButton.*\} from 'element-plus'", { param($m) 
            $m.Value -replace ',\s*ElButton\s*', '' -replace '\s*ElButton\s*,', '' -replace 'ElButton', '' 
        }
    }
    
    # 15. Add Button import if not present
    if ($content -match "<Button" -and $content -notmatch "from.*components/ui") {
        # Try to add after last import from element-plus
        if ($content -match "import \{.*\} from 'element-plus'") {
            $content = $content -replace "(import \{.*\} from 'element-plus'\s*\n)", "`$1import { Button } from '@/components/ui/Button/Button.vue'`n"
        }
        # Or try after <script setup>
        elseif ($content -match "<script setup>") {
            $content = $content -replace "(<script setup>\s*\n)", "`$1import { Button } from '@/components/ui/Button/Button.vue'`n"
        }
    }
    
    if ($content -ne $original) {
        $content | Out-File $file.FullName -Encoding utf8 -NoNewline
        $processed++
        Write-Output "Fixed: $($file.Name)"
    } else {
        $skipped++
    }
}

Write-Output "`nDone! Processed: $processed, Skipped: $skipped"
