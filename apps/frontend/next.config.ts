import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Alur email/password sudah dihapus. Pertahankan URL lama agar tidak 404.
      { source: "/register", destination: "/login", permanent: true },
      { source: "/forgot-password", destination: "/login", permanent: true },
      { source: "/reset-password", destination: "/login", permanent: true },
    ];
  },
};

export default nextConfig;
