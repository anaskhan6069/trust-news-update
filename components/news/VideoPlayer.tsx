interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps): JSX.Element | null {
  if (!videoUrl) {
    return null;
  }

  const isDriveEmbed = videoUrl.includes("drive.google.com") && videoUrl.includes("/preview");

  if (isDriveEmbed) {
    return (
      <div className="aspect-video overflow-hidden rounded-lg border bg-black">
        <iframe src={videoUrl} title={`${title} video`} allow="autoplay; encrypted-media" allowFullScreen className="h-full w-full" />
      </div>
    );
  }

  return (
    <video controls className="w-full rounded-lg border bg-black" aria-label={`${title} video`}>
      <source src={videoUrl} />
      Your browser does not support the video tag.
    </video>
  );
}
