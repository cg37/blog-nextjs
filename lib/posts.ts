import fs from "fs";
import path from "path";

export interface PostMetadata {
    title: string;
    date: string; // YYYY-MM-DD 格式
    description?: string;
    tags?: string[];
    alternates: {
        canonical: string;
    };
}

export interface Post extends PostMetadata {
    href: string;
    year: number;
    slug: string;
}

export async function getAllPosts(): Promise<Post[]> {
    const postsDirectory = path.join(process.cwd(), "app/n");
    const posts: Post[] = [];

    try {
        // 获取所有年份目录
        const years = fs
            .readdirSync(postsDirectory, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name)
            .filter((name) => /^\d{4}$/.test(name)); // 只匹配四位数字的年份

        for (const year of years) {
            const yearPath = path.join(postsDirectory, year);

            try {
                // 获取该年份下的所有文章目录
                const articles = fs
                    .readdirSync(yearPath, { withFileTypes: true })
                    .filter((dirent) => dirent.isDirectory())
                    .map((dirent) => dirent.name);

                for (const article of articles) {
                    let mod: { metadata?: Record<string, unknown> } | undefined;

                    try {
                        // 先尝试 content.mdx (新结构)
                        mod = await import(`../app/n/${year}/${article}/content.mdx`);
                    } catch {
                        try {
                            // 失败则尝试 page.mdx (旧结构)
                            mod = await import(`../app/n/${year}/${article}/page.mdx`);
                        } catch {
                            console.warn(
                                `Failed to import metadata from ${year}/${article} (tried content.mdx and page.mdx)`
                            );
                            continue;
                        }
                    }

                    const postMetadata = mod?.metadata;

                    if (postMetadata?.title && postMetadata?.date) {
                        posts.push({
                            ...(postMetadata as unknown as PostMetadata),
                            href: `/n/${year}/${article}`,
                            year: parseInt(year),
                            slug: article
                        });
                    }
                }
            } catch (error) {
                console.warn(`Failed to read directory ${yearPath}:`, error);
            }
        }

        // 按日期降序排序（最新的在前）
        return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Failed to scan posts directory:", error);
        return [];
    }
}

export function groupPostsByYear(posts: Post[]): Record<number, Post[]> {
    return posts.reduce(
        (acc, post) => {
            if (!acc[post.year]) {
                acc[post.year] = [];
            }
            acc[post.year].push(post);
            return acc;
        },
        {} as Record<number, Post[]>
    );
}

export function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${month}-${day}`;
    } catch (error) {
        console.warn(`Invalid date format: ${dateString}, ${error}`);
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
        console.warn(`Invalid date format: ${dateString}, ${error}`);
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
        console.warn(`Invalid date format: ${dateString}, ${error}`);
        return dateString;
    }
}

export async function getPostBySlug(year: string, slug: string): Promise<Post | null> {
    try {
        // 先尝试 content.mdx (新结构)，失败则尝试 page.mdx (旧结构)
        const metadata = (await import(`../app/n/${year}/${slug}/content.mdx`)).metadata;

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
