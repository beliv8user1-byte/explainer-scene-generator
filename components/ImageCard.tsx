type Props = { src: string; alt?: string; caption?: string };

export default function ImageCard({ src, alt, caption }: Props) {
  return (
    <figure className="border rounded overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt || caption || "frame"} className="w-full h-auto" />
      {(caption || alt) && (
        <figcaption className="p-2 text-xs text-gray-600">{caption || alt}</figcaption>
      )}
    </figure>
  );
}

