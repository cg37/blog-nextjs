import fs from "fs";
import path from "path";

export interface PostMetadata {
    title: string;
    date: string; // YYYY-MM-DD 格式
    description?: string;
    category?: string;
    tags?: string[];
    alternates: {
        canonical: string;
    };
}

export interface Post extends PostMetadata {
    href: string;
    slug: string;
}

export async function getAllPosts(): Promise<Post[]> {
    const postsDirectory = path.join(process.cwd(), "app/n");
    const posts: Post[] = [];

    try {
        // 直接扫描 app/n/ 下的所有子目录
        const articles = fs
            .readdirSync(postsDirectory, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        for (const article of articles) {
            try {
                // 先尝试 content.mdx (新结构)，失败则尝试 page.mdx (旧结构)
                let metadata;
                try {
                    metadata = (await import(`../app/n/${article}/content.mdx`)).metadata;
                } catch {
                    metadata = (await import(`../app/n/${article}/page.mdx`)).metadata;
                }

                if (metadata && metadata.title && metadata.date) {
                    posts.push({
                        ...metadata,
                        href: `/n/${article}`,
                        slug: article
                    });
                }
            } catch (error) {
                console.warn(`Failed to import metadata from ${article}:`, error);
            }
        }

        // 按日期降序排序（最新的在前）
        return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Failed to scan posts directory:", error);
        return [];
    }
}

export function groupPostsByCategory(posts: Post[]): Record<string, Post[]> {
    const grouped: Record<string, Post[]> = {};

    for (const post of posts) {
        const cat = post.category || "未分类";
        if (!grouped[cat]) {
            grouped[cat] = [];
        }
        grouped[cat].push(post);
    }

    // 每个分类内按日期降序
    for (const cat of Object.keys(grouped)) {
        grouped[cat].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return grouped;
}

export function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${month}-${day}`;
    } catch (error) {
        console.warn(`Invalid date format: ${dateString}`, error);
        return dateString;
    }
}

export function formatDateFull(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date
            .toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            })
            .replace(/\//g, "-");
    } catch (error) {
        console.warn(`Invalid date format: ${dateString}`, error);
        return dateString;
    }
}

export function formatDateReadable(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    } catch (error) {
        console.warn(`Invalid date format: ${dateString}`, error);
        return dateString;
    }
}

export async function getPostBySlug(year: string, slug: string): Promise<Post | null> {
    try {
        // 先尝试 content.mdx (新结构)，失败则尝试 page.mdx (旧结构)
        let metadata;
        try {
            metadata = (await import(`../app/n/${year}/${slug}/content.mdx`)).metadata;
        } catch {
            metadata = (await import(`../app/n/${year}/${slug}/page.mdx`)).metadata;
        }

        if (metadata && metadata.title && metadata.date) {
            return {
                ...metadata,
                href: `/n/${year}/${slug}`,
                year: parseInt(year),
                slug
            };
        }
        return null;
    } catch (error) {
        console.warn(`Failed to import metadata from /n/${year}/${slug}:`, error);
        return null;
    }
}
