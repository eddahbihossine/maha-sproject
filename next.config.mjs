/** @type {import('next').NextConfig} */
const supabaseHostname = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
})()

const supabaseFallbackHostname = 'seclzlldxpfpfrjvkzip.supabase.co'
const supabaseStorageFallbackHostname = 'seclzlldxpfpfrjvkzip.storage.supabase.co'

const supabaseStorageHostname = (() => {
  if (!supabaseHostname) return null
  if (supabaseHostname.endsWith('.storage.supabase.co')) return supabaseHostname
  if (supabaseHostname.endsWith('.supabase.co')) {
    return supabaseHostname.replace(/\.supabase\.co$/, '.storage.supabase.co')
  }
  return null
})()

const apiHostname = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
})()

const supabaseHostnames = Array.from(
  new Set(
    [supabaseHostname, supabaseStorageHostname, supabaseFallbackHostname, supabaseStorageFallbackHostname].filter(
      Boolean
    )
  )
)
const extraImageHostnames = Array.from(new Set([apiHostname].filter(Boolean)))

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [...supabaseHostnames, ...extraImageHostnames],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      ...[...supabaseHostnames, ...extraImageHostnames].map((hostname) => ({
        protocol: 'https',
        hostname,
      })),
    ],
  },
}

export default nextConfig
