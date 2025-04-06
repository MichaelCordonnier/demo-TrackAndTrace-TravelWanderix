export function getImageUrl(url: string): string {
  // console.log('url', url)
  return url.startsWith('http')
    ? url
    : new URL(`${import.meta.env.BASE_URL}src/assets/${url}`, import.meta.url)
        .href
}
