/** @type {import('next').NextConfig} */
const nextConfig = {
  // Chống Cloudflare Tunnel buffer response — cho phép Suspense streaming hoạt động
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Accel-Buffering",
            value: "no",
          },
        ],
      },
    ];
  },
}

export default nextConfig
