// 首页
import { getAllPosts, groupPostsByYear, formatDate } from "@/lib/posts";

export const metadata = {
    title: "Blog | Craig",
    alternates: {
        canonical: "/"
    }
};

const styles = {
    h1: "text-gray-900 dark:text-zinc-100 font-extrabold text-4xl mt-0 mb-4",
    h2: "text-gray-900 dark:text-zinc-100 font-bold text-2xl mt-8 mb-4",
    h3: "text-gray-900 dark:text-zinc-100 font-semibold text-xl mt-6 mb-2",
    p: "text-gray-700 dark:text-zinc-300 leading-relaxed",
    link: "text-blue-500 hover:text-blue-700 dark:text-blue-400 hover:dark:text-blue-300 underline underline-offset-2 decoration-blue-500/30 hover:decoration-blue-500/60 transition-colors",
    ul: "text-gray-800 dark:text-zinc-300 list-disc pl-5 space-y-1",
    li: "pl-1"
};

export default async function HomePage() {
    const posts = await getAllPosts();
    const postsByYear = groupPostsByYear(posts);

    return (
        <div>
            <h1 className={styles.h1}>Craig</h1>

            <br />

            <p className={styles.p}>This is my portfolio, blog, and personal website.</p>

            <h2 className={styles.h2}>Blog</h2>

            {Object.entries(postsByYear)
                .sort(([a], [b]) => parseInt(b) - parseInt(a)) // 年份降序
                .map(([year, yearPosts]) => (
                    <section key={year}>
                        <h3 className={styles.h3}>{year}</h3>
                        <ul className={styles.ul}>
                            {yearPosts.map((post) => (
                                <li key={post.href} className={styles.li}>
                                    <a href={post.href} className={styles.link}>
                                        {post.title}
                                    </a>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {" "}
                                        · {formatDate(post.date)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
        </div>
    );
}
