import { getAllPosts, groupPostsByCategory, formatDate } from "@/lib/posts";

export default async function HomePage() {
    const posts = await getAllPosts();
    const grouped = groupPostsByCategory(posts);

    return (
        <>
            <h1 className="text-4xl font-bold tracking-tight">Craig</h1>

            <p>This is my portfolio, blog, and personal website.</p>

            <hr className="border-zinc-300 dark:border-zinc-700" />

            {Object.keys(grouped).length > 0 ? (
                Object.entries(grouped).map(([category, catPosts]) => (
                    <section key={category} className="space-y-3">
                        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {category}
                        </h2>
                        <ul className="space-y-2">
                            {catPosts.map((post) => (
                                <li key={post.href}>
                                    <a
                                        href={post.href}
                                        className="group flex items-baseline justify-between gap-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <span className="group-hover:underline">{post.title}</span>
                                        <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                                            {formatDate(post.date)}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))
            ) : (
                <p className="text-zinc-500 dark:text-zinc-400">暂无文章</p>
            )}
        </>
    );
}
