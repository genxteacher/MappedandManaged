module.exports = function (eleventyConfig) {
  // Copy static assets straight through to the build output.
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });

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

  // Same-lane products (excluding the current one), capped.
  eleventyConfig.addFilter("related", (products, lane, slug, limit = 3) => {
    if (!Array.isArray(products)) return [];
    return products.filter((x) => x.lane === lane && x.slug !== slug).slice(0, limit);
  });

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
