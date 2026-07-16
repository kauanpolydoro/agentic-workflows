# Brand guidelines

Agentic Workflows uses an industrial editorial direction: precise grids, angular paths, high contrast, and evidence-oriented typography.

The primary ink is `#101b18`, the verified-action green is `#63d6b4`, and the human-gate accent is `#e36f3d`.
Use green for progress and links, orange sparingly for decisions or caution, and never use color alone to communicate verification state.

The interlocking path mark represents a canonical workflow translated into agent-specific exports.
Keep clear space equal to one quarter of the mark width and do not place vendor logos inside it.

Prefer locally available IBM Plex families when installed, with Aptos, Segoe UI, Cascadia Code, and monospace fallbacks.
The website never depends on externally hosted fonts.

The source social preview is `docs/public/social-preview.svg` at 1200 by 630 pixels.
Convert it locally with a trusted SVG renderer when a PNG is required; the repository does not add a raster dependency solely for conversion.
For example, with Inkscape installed, run `inkscape docs/public/social-preview.svg --export-type=png --export-filename=docs/public/social-preview.png`.
