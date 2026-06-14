import React from "react";
import { highlightCode, extractLangFromClassName, getLanguageDisplayName } from "@/lib/highlight";

interface CodeBlockProps {
    children: React.ReactNode;
    className?: string;
}

export default function CodeBlock({ children, className }: CodeBlockProps) {
    // 如果没有语言类名，说明不是代码块
    if (!className || !className.startsWith("language-")) {
        return null;
    }

    // 提取语言
    const lang = extractLangFromClassName(className);
    const codeString = String(children).replace(/\n$/, ""); // 移除末尾的换行符

    // 使用 use 钩子获取异步高亮结果（React 19+）
    const highlightedCode = React.use(highlightCode(codeString, lang));

    return (
        <div className="relative my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
            {/* 代码块头部：显示语言 */}
            <div className="bg-gray-100 dark:bg-zinc-800 px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
                <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400 tracking-wide">
                    {getLanguageDisplayName(lang)}
                </span>
            </div>
            {/* 代码内容 */}
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </div>
    );
}
