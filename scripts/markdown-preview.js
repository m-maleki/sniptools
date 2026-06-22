(function (App) {
    if (!App) return;

    App.initMarkdown = function () {
        const view = document.getElementById('view-markdown');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">Markdown Preview</h2>
            <p class="tool-desc">Write Markdown and see a live rendered preview side by side.</p>
        </div>
        <div class="row" style="gap:.5rem">
            <button id="md-copy-html-btn" class="btn btn-secondary btn-sm">Copy HTML</button>
            <button id="md-copy-md-btn"   class="btn btn-secondary btn-sm">Copy MD</button>
            <button id="md-clear-btn"     class="btn btn-ghost btn-sm">Clear</button>
        </div>
    </div>

    <!-- Toolbar -->
    <div class="card" style="padding:.5rem .875rem">
        <div class="row" style="flex-wrap:wrap;gap:.25rem" id="md-toolbar"></div>
    </div>

    <!-- Editor + Preview -->
    <div class="grid-2" style="align-items:stretch">
        <div class="card" style="display:flex;flex-direction:column">
            <div class="card-header"><span class="card-title">Markdown</span><span id="md-char-count" class="text-xs text-muted"></span></div>
            <div class="card-body" style="flex:1;padding-bottom:.75rem">
                <textarea id="md-editor" class="field-textarea dir-ltr"
                    style="min-height:480px;resize:vertical;font-size:.85rem;line-height:1.7"
                    placeholder="# Hello World&#10;&#10;Write your **markdown** here…"
                    aria-label="Markdown editor" spellcheck="false"></textarea>
            </div>
        </div>
        <div class="card" style="display:flex;flex-direction:column">
            <div class="card-header"><span class="card-title">Preview</span></div>
            <div class="card-body" style="flex:1;overflow-y:auto">
                <div id="md-preview" class="md-rendered"></div>
            </div>
        </div>
    </div>
</div>

<style>
/* Markdown rendered output */
.md-rendered { color:var(--text-primary);line-height:1.75;font-size:.92rem }
.md-rendered h1,.md-rendered h2,.md-rendered h3,.md-rendered h4,.md-rendered h5,.md-rendered h6 {
    font-weight:700;line-height:1.3;margin:.9em 0 .4em;color:var(--text-primary)
}
.md-rendered h1 { font-size:1.7rem;border-bottom:2px solid var(--border-default);padding-bottom:.3em }
.md-rendered h2 { font-size:1.3rem;border-bottom:1px solid var(--border-default);padding-bottom:.2em }
.md-rendered h3 { font-size:1.1rem }
.md-rendered p  { margin:.5em 0 }
.md-rendered a  { color:var(--accent-1);text-decoration:underline }
.md-rendered a:hover { color:var(--accent-2) }
.md-rendered code {
    font-family:'JetBrains Mono',monospace;font-size:.82em;
    background:var(--code-bg);color:var(--code-text);
    padding:.1em .35em;border-radius:4px;border:1px solid var(--border-default)
}
.md-rendered pre {
    background:var(--code-bg);border:1px solid var(--border-default);
    border-radius:var(--radius-md);padding:.875rem 1.1rem;overflow-x:auto;margin:.75em 0
}
.md-rendered pre code { background:none;border:none;padding:0;font-size:.85rem;color:var(--code-text) }
.md-rendered blockquote {
    border-left:3px solid var(--accent-1);margin:.5em 0;padding:.4em .875rem;
    background:rgba(99,102,241,.06);border-radius:0 var(--radius-sm) var(--radius-sm) 0;
    color:var(--text-secondary)
}
.md-rendered ul,.md-rendered ol { margin:.4em 0 .4em 1.5rem;padding:0 }
.md-rendered li { margin:.2em 0 }
.md-rendered table { border-collapse:collapse;width:100%;margin:.75em 0 }
.md-rendered th,.md-rendered td { border:1px solid var(--border-default);padding:.45em .75em;text-align:left }
.md-rendered th { background:var(--code-bg);font-weight:600;color:var(--text-primary) }
.md-rendered tr:nth-child(even) td { background:var(--sidebar-bg) }
.md-rendered hr { border:none;border-top:1px solid var(--border-default);margin:1em 0 }
.md-rendered img { max-width:100%;border-radius:var(--radius-md) }
.md-rendered input[type=checkbox] { margin-right:.4em }
.md-toolbar-btn { padding:.3rem .55rem;border:1px solid var(--border-default);border-radius:5px;background:var(--input-bg);color:var(--text-secondary);font-size:.78rem;cursor:pointer;font-family:'JetBrains Mono',monospace;transition:all var(--transition-fast) }
.md-toolbar-btn:hover { border-color:var(--accent-1);color:var(--text-primary) }
</style>`;

        const editor   = document.getElementById('md-editor');
        const preview  = document.getElementById('md-preview');
        const charCount= document.getElementById('md-char-count');
        const toolbar  = document.getElementById('md-toolbar');
        const copyHtml = document.getElementById('md-copy-html-btn');
        const copyMd   = document.getElementById('md-copy-md-btn');
        const clearBtn = document.getElementById('md-clear-btn');

        /* ── Minimal Markdown parser ── */
        function escHtml(s) {
            return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        }

        function parseInline(s) {
            return s
                .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/~~(.+?)~~/g, '<del>$1</del>')
                .replace(/`([^`]+)`/g, '<code>$1</code>');
        }

        function parseMarkdown(md) {
            const lines = md.split('\n');
            let html = '';
            let i = 0;
            while (i < lines.length) {
                const line = lines[i];

                /* Fenced code block */
                if (/^```/.test(line)) {
                    const lang = line.slice(3).trim();
                    let code = '';
                    i++;
                    while (i < lines.length && !/^```/.test(lines[i])) {
                        code += escHtml(lines[i]) + '\n';
                        i++;
                    }
                    html += `<pre><code class="language-${lang}">${code}</code></pre>`;
                    i++;
                    continue;
                }

                /* HR */
                if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
                    html += '<hr>';
                    i++;
                    continue;
                }

                /* Headings */
                const hm = line.match(/^(#{1,6})\s+(.*)/);
                if (hm) {
                    html += `<h${hm[1].length}>${parseInline(escHtml(hm[2]))}</h${hm[1].length}>`;
                    i++;
                    continue;
                }

                /* Blockquote */
                if (/^>\s?/.test(line)) {
                    let quote = '';
                    while (i < lines.length && /^>\s?/.test(lines[i])) {
                        quote += lines[i].replace(/^>\s?/, '') + '\n';
                        i++;
                    }
                    html += `<blockquote>${parseMarkdown(quote.trim())}</blockquote>`;
                    continue;
                }

                /* Unordered list */
                if (/^[-*+]\s/.test(line)) {
                    let items = '';
                    while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
                        const text = lines[i].replace(/^[-*+]\s/, '');
                        const checkbox = text.match(/^\[(x| )\]\s(.*)/i);
                        if (checkbox) {
                            items += `<li><input type="checkbox" ${checkbox[1]==='x'?'checked':''} disabled>${parseInline(escHtml(checkbox[2]))}</li>`;
                        } else {
                            items += `<li>${parseInline(escHtml(text))}</li>`;
                        }
                        i++;
                    }
                    html += `<ul>${items}</ul>`;
                    continue;
                }

                /* Ordered list */
                if (/^\d+\.\s/.test(line)) {
                    let items = '';
                    while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                        items += `<li>${parseInline(escHtml(lines[i].replace(/^\d+\.\s/, '')))}</li>`;
                        i++;
                    }
                    html += `<ol>${items}</ol>`;
                    continue;
                }

                /* Table */
                if (/\|/.test(line) && i+1 < lines.length && /^\|?\s*[-:]+[-| :]*\|?/.test(lines[i+1])) {
                    const headers = line.split('|').filter((_,idx,a)=>idx>0&&idx<a.length-1).map(c=>c.trim());
                    i += 2; // skip header + separator
                    let rows = '';
                    while (i < lines.length && /\|/.test(lines[i])) {
                        const cells = lines[i].split('|').filter((_,idx,a)=>idx>0&&idx<a.length-1).map(c=>c.trim());
                        rows += '<tr>' + cells.map(c => `<td>${parseInline(escHtml(c))}</td>`).join('') + '</tr>';
                        i++;
                    }
                    html += `<table><thead><tr>${headers.map(h=>`<th>${parseInline(escHtml(h))}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
                    continue;
                }

                /* Empty line → paragraph break */
                if (line.trim() === '') {
                    if (html && !html.endsWith('</p>')) html += '';
                    i++;
                    continue;
                }

                /* Paragraph */
                let para = line;
                i++;
                while (i < lines.length && lines[i].trim() !== '' && !/^[#>*+\-`|]/.test(lines[i]) && !/^\d+\./.test(lines[i])) {
                    para += ' ' + lines[i];
                    i++;
                }
                html += `<p>${parseInline(escHtml(para))}</p>`;
            }
            return html;
        }

        let renderTimer;
        function render() {
            clearTimeout(renderTimer);
            renderTimer = setTimeout(() => {
                const md = editor.value;
                preview.innerHTML = parseMarkdown(md);
                charCount.textContent = `${md.length} chars`;
            }, 120);
        }

        editor.addEventListener('input', render);

        /* Toolbar buttons */
        const TB = [
            { label: 'B',  title:'Bold',     wrap:['**','**'] },
            { label: 'I',  title:'Italic',   wrap:['*','*'] },
            { label: '~~', title:'Strike',   wrap:['~~','~~'] },
            { label: '`',  title:'Inline code', wrap:['`','`'] },
            { label: 'H1', title:'Heading 1', prefix:'# ' },
            { label: 'H2', title:'Heading 2', prefix:'## ' },
            { label: 'H3', title:'Heading 3', prefix:'### ' },
            { label: '>',  title:'Blockquote', prefix:'> ' },
            { label: 'UL', title:'Bullet list', prefix:'- ' },
            { label: 'OL', title:'Numbered list', prefix:'1. ' },
            { label: '```',title:'Code block', wrap:['```\n','\n```'] },
            { label: '---',title:'Horizontal rule', insert:'\n---\n' },
            { label: '[L]',title:'Link', wrap:['[','](url)'] },
        ];
        toolbar.innerHTML = TB.map(t =>
            `<button class="md-toolbar-btn" title="${t.title}">${t.label}</button>`
        ).join('');
        toolbar.querySelectorAll('.md-toolbar-btn').forEach((btn, i) => {
            btn.addEventListener('click', () => {
                const t = TB[i];
                const start = editor.selectionStart, end = editor.selectionEnd;
                const sel = editor.value.slice(start, end);
                let replacement, cursor;
                if (t.insert) {
                    replacement = t.insert;
                    cursor = start + replacement.length;
                } else if (t.prefix) {
                    replacement = t.prefix + sel;
                    cursor = start + t.prefix.length + sel.length;
                } else {
                    replacement = t.wrap[0] + sel + t.wrap[1];
                    cursor = start + t.wrap[0].length + sel.length + t.wrap[1].length;
                }
                editor.setRangeText(replacement, start, end, 'end');
                editor.focus();
                render();
            });
        });

        copyHtml.addEventListener('click', () => App.copyText(preview.innerHTML, 'HTML copied'));
        copyMd.addEventListener('click',   () => App.copyText(editor.value, 'Markdown copied'));
        clearBtn.addEventListener('click', () => { editor.value = ''; render(); });

        /* Tab key support */
        editor.addEventListener('keydown', e => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const s = editor.selectionStart;
                editor.setRangeText('  ', s, s, 'end');
                render();
            }
        });

        const SAMPLE = `# Welcome to Markdown Preview

Write **bold**, *italic*, ~~strikethrough~~ text.

## Code

Inline \`const x = 42\` or a block:

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Lists

- Item one
- Item two
  - Nested

1. First
2. Second

## Table

| Name    | Role    | Score |
|---------|---------|-------|
| Alice   | Dev     | 98    |
| Bob     | Design  | 91    |

> Blockquotes are great for callouts.

---

[SnipTools](https://sniptools.app) — dev tools for developers.`;

        editor.value = SAMPLE;
        render();
    };
})(window.App);
