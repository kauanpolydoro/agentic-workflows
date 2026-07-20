import { defineConfig } from "vitepress";
import {
  documentationBase,
  documentationPageUrl,
  documentationSiteUrl,
} from "../../scripts/docs-site.js";

const base = documentationBase();
const siteUrl = documentationSiteUrl();
const origin = siteUrl.href;
const asset = (name: string) => `${base}${name}`;
const socialPreview = `${origin}social-preview.png`;

export default defineConfig({
  title: "Agentic Workflows",
  description:
    "A catalog of step-by-step workflows for coding agents, with a small CLI that installs them into your project.",
  base,
  cleanUrls: true,
  sitemap: { hostname: origin },
  transformHead: ({ page, title, description }) => {
    const pageUrl = documentationPageUrl(page, siteUrl);
    return [
      ["link", { rel: "canonical", href: pageUrl }],
      ["meta", { property: "og:url", content: pageUrl }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:image", content: socialPreview }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }],
      ["meta", { name: "twitter:image", content: socialPreview }],
    ];
  },
  head: [
    ["link", { rel: "icon", href: asset("favicon.svg") }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:image:type", content: "image/png" }],
    ["meta", { property: "og:image:alt", content: "Agentic Workflows" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "theme-color", content: "#101b18" }],
  ],
  themeConfig: {
    logo: asset("logo.svg"),
    siteTitle: "Agentic Workflows",
    nav: [
      { text: "Catalog", link: "/catalog/" },
      { text: "Guide", link: "/guide/introduction" },
      { text: "Compatibility", link: "/compatibility" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/guide/introduction" },
          { text: "Installation", link: "/guide/installation" },
          { text: "CLI reference", link: "/guide/cli-reference" },
          { text: "Recipe anatomy", link: "/guide/recipe-anatomy" },
          { text: "Verification", link: "/guide/verification" },
          { text: "Authoring", link: "/guide/authoring" },
          { text: "Recipe schema v2", link: "/guide/recipe-schema-v2" },
          { text: "Contributing", link: "/guide/contributing" },
          { text: "Security", link: "/guide/security" },
          { text: "FAQ", link: "/guide/faq" },
          { text: "Roadmap", link: "/guide/roadmap" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Workflow catalog", link: "/catalog/" },
          { text: "Compatibility", link: "/compatibility" },
          { text: "Reference evaluations", link: "/launch/reference-evaluations" },
          { text: "Recipe quality standard", link: "/quality/recipe-quality-standard" },
          { text: "Recipe self-assessment", link: "/quality/recipe-audit" },
          { text: "Content similarity", link: "/quality/content-similarity" },
          { text: "Adversarial remediation", link: "/quality/adversarial-remediation" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/kauanpolydoro/agentic-workflows" }],
    search: { provider: "local" },
    footer: {
      message: "No analytics. No cookies. No telemetry.",
      copyright: "Released under the MIT License.",
    },
  },
  markdown: { theme: { light: "github-light", dark: "github-dark" } },
});
