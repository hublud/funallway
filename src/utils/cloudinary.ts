export function getOptimizedUrl(originalUrl: string): string {
  // If no URL is provided or it's a local static file (like /logo.png) or blob, return it as is
  if (!originalUrl || originalUrl.startsWith('/') || originalUrl.startsWith('blob:')) return originalUrl;

  // Uses environment variable, falling back to "demo"
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
  
  // f_auto = automatic format (WebP/AVIF)
  // q_auto = automatic quality compression (reduces size without visual loss)
  const transformations = "f_auto,q_auto"; 

  // Make sure it doesn't double-encode an already fetched cloudinary URL
  if (originalUrl.includes('res.cloudinary.com')) return originalUrl;

  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${originalUrl}`;
}
