export function chunkItems<T>(items: T[], chunkSize: number) {
  const numOfChunks = Math.ceil(items.length / chunkSize);
  const chunks = new Array(numOfChunks).fill(0);
  return chunks.map((_, index) => {
    const start = index * chunkSize;
    const end = (index + 1) * chunkSize;
    return items.slice(start, end);
  });
}
