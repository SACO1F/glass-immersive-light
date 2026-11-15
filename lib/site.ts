import type { Metadata } from "next";

const fallbackUrl = "https://immersivelight.dev";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl,
);

export const siteName = "ImmersiveLight";

export const siteDescription =
  "以物理光学为灵感、复制即用、按设备自动降级的 React 光感动效组件库。";

export const siteOgAlt =
  "ImmersiveLight — physics-inspired optical UI components";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
};

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: PageMetadataInput): Metadata {
  const socialTitle = `${title} · ${siteName}`;
  const images = [
    { url: "/opengraph-image", width: 1200, height: 630, alt: siteOgAlt },
  ];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName,
      title: socialTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: ["/opengraph-image"],
    },
  };
}
