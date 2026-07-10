// Screenshot 极简封装 — 给文档教程页配图用。
// 跟 templatesV3.tsx 的老 <img> 用法一致(border + rounded-lg + shadow),封一层加 caption。
export function Screenshot({
  src,
  alt,
  caption,
}: {
  src: string
  alt: string
  caption?: string
}) {
  return (
    <figure className='my-4'>
      <img src={src} alt={alt} className='w-full rounded-lg border shadow-sm' />
      {caption && (
        <figcaption className='mt-2 text-center text-xs text-muted-foreground'>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
