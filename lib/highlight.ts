import { codeToHtml, BundledLanguage } from "shiki";

// 缓存已高亮的代码，避免重复处理
const highlightCache = new Map<string, string>();

/**
 * 使用 Shiki 高亮代码，支持深色模式
 * @param code 要高亮的代码字符串
 * @param lang 语言标识（如 'typescript', 'cpp', 'java'）
 * @returns 高亮后的 HTML 字符串（包含深色模式支持）
 */
export async function highlightCode(code: string, lang: string = "text"): Promise<string> {
    // 生成缓存键
    const cacheKey = `${lang}:dual-theme:${code}`;

    // 检查缓存
    if (highlightCache.has(cacheKey)) {
        return highlightCache.get(cacheKey)!;
    }

    try {
        // 标准化语言名称
        const normalizedLang = normalizeLangName(lang);

        // 使用双主题模式：浅色和深色
        const html = await codeToHtml(code, {
            lang: normalizedLang as BundledLanguage,
            themes: {
                light: "github-light",
                dark: "github-dark"
            },
            defaultColor: "light"
        });

        // console.log('codeToHtml', html)

        // 存入缓存
        highlightCache.set(cacheKey, html);

        return html;
    } catch (error) {
        console.warn(`Failed to highlight code with lang "${lang}":`, error);
        // 降级处理：返回带基础样式的 pre + code 结构
        return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
    }
}

/**
 * 同步版本的代码高亮（用于 MDX 组件）
 * 注意：这是一个同步包装器，内部使用异步但会在模块加载时预处理
 */
export function highlightCodeSync(code: string, lang: string = "text"): string {
    const cacheKey = `${lang}:dual-theme:${code}`;

    // 如果已缓存，直接返回
    if (highlightCache.has(cacheKey)) {
        return highlightCache.get(cacheKey)!;
    }

    // 如果未缓存，返回占位符并异步处理
    // 这种情况在生产环境应该很少发生，因为 Next.js 会在构建时处理
    highlightCode(code, lang).catch(console.error);

    // 返回未高亮的代码作为降级
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
}

/**
 * 标准化语言名称
 * 将常见的别名转换为 Shiki 支持的标准语言名称
 */
function normalizeLangName(lang: string): string {
    const langMap: Record<string, string> = {
        js: "javascript",
        ts: "typescript",
        jsx: "javascript",
        tsx: "typescript",
        "c++": "cpp",
        cxx: "cpp",
        py: "python",
        sh: "bash",
        shell: "bash",
        yml: "yaml",
        md: "markdown"
    };

    return langMap[lang.toLowerCase()] || lang.toLowerCase();
}

/**
 * HTML 转义，防止 XSS
 */
function escapeHtml(text: string): string {
    const htmlEscapes: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * 从 className 中提取语言
 * MDX 会为代码块添加 className="language-xxx"
 */
export function extractLangFromClassName(className?: string): string {
    if (!className) return "text";

    const match = className.match(/language-(\w+)/);
    return match ? match[1] : "text";
}

/**
 * 从 meta 字符串中提取标题
 * 支持格式：title="filename.ts" 或 title='filename.ts'
 */
export function extractTitleFromMeta(meta?: string): string | null {
    if (!meta) return null;

    const titleMatch = meta.match(/title=["']([^"']+)["']/);
    return titleMatch ? titleMatch[1] : null;
}

/**
 * 获取语言的显示名称
 */
export function getLanguageDisplayName(lang: string): string {
    const displayNames: Record<string, string> = {
        typescript: "TypeScript",
        javascript: "JavaScript",
        tsx: "TSX",
        jsx: "JSX",
        cpp: "C++",
        c: "C",
        java: "Java",
        python: "Python",
        go: "Go",
        rust: "Rust",
        bash: "Bash",
        shell: "Shell",
        json: "JSON",
        yaml: "YAML",
        markdown: "Markdown",
        html: "HTML",
        css: "CSS",
        sql: "SQL",
        text: "Text",
        makefile: "Makefile"
    };

    return displayNames[lang.toLowerCase()] || lang.toUpperCase();
}
