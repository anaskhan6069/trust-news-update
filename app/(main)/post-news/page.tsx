import { redirect } from "next/navigation";
import { PostNewsForm } from "@/components/forms/PostNewsForm";
import { auth } from "@/lib/auth";

export default async function PostNewsPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin?callbackUrl=/post-news");
  }

  return (
    <section className="container max-w-4xl py-8">
      <PostNewsForm userName={session.user.name ?? ""} userEmail={session.user.email ?? ""} />
    </section>
  );
}
