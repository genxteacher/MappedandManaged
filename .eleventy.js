module.exports = function (eleventyConfig) {
  // Copy static assets straight through to the build output.
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy("src/js");

  // Human-friendly post dates, e.g. "July 2, 2026".
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  // Machine date for <time datetime> and sitemap.
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return d.toISOString().split("T")[0];
  });

  // Build an absolute URL from a site-root path (for canonical + OG tags).
  eleventyConfig.addFilter("absoluteUrl", (path, base) => {
    try {
      return new URL(path, base).toString();
    } catch (e) {
      return path;
    }
  });

  // "Pairs well with": a product's curated `pairs` list (product numbers) if it
  // has one; otherwise same-lane products with the lane bundle first, then the
  // paid tools, then the freebie. Falls back to other lanes when a lane is small.
  const isBundle = (x) => /bundle/i.test(`${x.name} ${x.eyebrow || ""}`);
  eleventyConfig.addFilter("isBundle", (x) => !!x && isBundle(x));
  eleventyConfig.addFilter("pairsFor", (products, p, limit = 3) => {
    if (!Array.isArray(products) || !p) return [];
    const others = products.filter((x) => x.slug !== p.slug);
    if (Array.isArray(p.pairs) && p.pairs.length) {
      const picked = p.pairs.map((n) => others.find((x) => x.number === n)).filter(Boolean);
      if (picked.length) return picked.slice(0, limit);
    }
    const rank = (x) => (isBundle(x) ? 0 : x.free ? 2 : 1);
    const sameLane = others.filter((x) => x.lane === p.lane).sort((a, b) => rank(a) - rank(b));
    const rest = others.filter((x) => x.lane !== p.lane && !x.free);
    return sameLane.concat(rest).slice(0, limit);
  });

  // Lane colours are light fills. For small text they fail WCAG AA, so text
  // uses a darker "ink" of the same hue (all 5.5:1 or better on cream and white).
  const INK = {
    "#8FA890": "#4F6B51", // sage  -> sage-ink
    "#D8A24A": "#8A5A12", // gold  -> gold-ink
    "#DD8569": "#A4472C", // coral -> coral-ink
    "#B85C42": "#9A4A33", // ELA terracotta -> darker for small text
  };
  eleventyConfig.addFilter("ink", (hex) => INK[String(hex || "").toUpperCase()] || hex);

  // Text colour to put on a solid lane-colour button.
  eleventyConfig.addFilter("onColor", (hex) =>
    ["#46537A", "#1E2A45", "#B85C42"].includes(String(hex || "").toUpperCase()) ? "#fff" : "#2a1a10"
  );

  // Newest blog posts first.
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi.getFilteredByTag("post").reverse();
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
