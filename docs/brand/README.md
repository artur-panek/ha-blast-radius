# Radius mark

The mark uses two concentric bands around a source point and an exposed radius
ending at the outer boundary. The 32-unit geometry remains legible at sidebar size.

`frontend/src/brand.json` is the source for every variant. The panel renders it as
inline SVG using Home Assistant's text and accent colors. The sidebar uses a
monochrome path; integration tiles use transparent light/dark PNGs.

After installing the frontend development dependencies and Playwright Chromium,
regenerate the assets from the repository root:

```bash
node scripts/generate_brand.mjs
cd frontend
npm run build
```

This writes the SVGs and preview here, the sidebar module in `frontend/public/`,
and 256/512 px images in `custom_components/blast_radius/brand/`.

The integration packages brand images through Home Assistant's
[local brand support](https://developers.home-assistant.io/blog/2026/02/24/brands-proxy-api/).
The sidebar module uses the documented
[custom icon set API](https://developers.home-assistant.io/blog/2020/05/09/custom-iconsets/).
All artwork is original to this project and distributed under its MIT license.

## GitHub social preview

`social-preview.png` is the 1280×640 upload asset for repository Settings → General
→ Social preview. It uses the existing radius mark, a dark engineering grid and
the project's read-only description. It is a static promotional image, not a
screenshot or a dependency diagram. Generated with the built-in image tool, with
the existing dark icon as a reference; only its export size was normalized.
The source prompt is in `social-preview-prompt.txt`.
