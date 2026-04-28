export default function AboutPage(): JSX.Element {
  return (
    <section className="container py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">About Trust News</h1>
        <p className="mt-5 text-lg leading-8 text-gray-700 dark:text-gray-300">
          Trust News is a reviewed community news platform. Readers can submit stories, editors can approve drafts, and approved
          stories are published from a simple Google Sheets-backed workflow.
        </p>
        <p className="mt-4 leading-7 text-gray-700 dark:text-gray-300">
          The platform is designed for small newsrooms and local teams that want familiar tools, fast moderation, media uploads,
          dark mode, and a clean reading experience without a heavy CMS.
        </p>
      </div>
    </section>
  );
}
