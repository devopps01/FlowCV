with open('src/components/resume-builder/InlineEditor.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix applyElStyle calls
import re
c = re.sub(r"applyElStyle\('fontSize',\s*`\$\{next\}px`\)", "applyStyle({ fontSize: `${next}px` })", c)
c = c.replace("applyElStyle(", "applyStyle_REMOVED(")

with open('src/components/resume-builder/InlineEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('done')
