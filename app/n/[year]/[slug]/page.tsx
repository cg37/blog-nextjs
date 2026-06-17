import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
    params: Promise<{ year: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { year, slug } = await params;

    try {
        const { metadata } = await import(`@/app/n/${year}/${slug}/content.mdx`);
        return {
            title: metadata.title,
            alternates: metadata.alternates
        };
    } catch {
        return { title: "Post not found" };
    }
}

export default async function PostPage({ params }: Props) {
    const { year, slug } = await params;

    try {
        const MDXContent = (await import(`@/app/n/${year}/${slug}/content.mdx`)).default;
        return <MDXContent />;
    } catch {
        notFound();
    }
}
