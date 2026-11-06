# Design System: Saath Wedding Planner

## 1. Visual Theme & Atmosphere

Saath should feel like a calm, contemporary wedding journal shared by a couple and their families. Use an editorial, intimate tone with generous breathing room and clear, practical groupings. Keep the visual rhythm warm and composed; the ceremony is special, while the interface stays useful and easy to scan.

## 2. Color Palette & Roles

- **Ivory Canvas** (`#FCF8FB`) — Main page background.
- **White Paper** (`#FFFFFF`) — Content surfaces and raised panels.
- **Ink** (`#1B1B1D`) — Headlines and primary reading text; never use pure black.
- **Soft Plum** (`#522F46`) — Main brand color and primary actions.
- **Plum Tint** (`#F7EFF4`) — Gentle selected and supporting surfaces.
- **Garden Green** (`#426657`) — Positive status and progress information.
- **Muted Stone** (`#776E74`) — Supporting copy and metadata.
- **Fine Border** (`#E8E2E6`) — Quiet dividers and panel outlines.

Plum is the single brand accent. Green is reserved for functional status. Avoid neon, purple-blue gradients, and competing accent colors.

## 3. Typography Rules

- **Display:** Playfair Display — editorial headlines, couple names, and milestone titles; use controlled sizes and modest tracking.
- **Body:** Plus Jakarta Sans — navigation, descriptions, labels, and interface controls; keep body copy relaxed and readable.
- **Scale:** Use fluid headline sizing, clear weight contrast, and a comfortable body line height. Keep paragraphs near 65 characters per line.
- **Banned:** Inter, generic system typography as the main brand voice, decorative scripts, and oversized gradient text.

## 4. Component Stylings

- **Buttons:** Plum fill with white text for the primary action; quiet ivory or outlined styles for secondary actions. Provide a clear keyboard focus state and a restrained pressed response. No outer glow.
- **Cards:** White surfaces with a fine stone border and 12–16px corners. Use cards to separate useful planning groups, not to decorate every paragraph.
- **Inputs:** Label above the field, readable 16px text, and clear focus and error states.
- **Status:** Use muted green for confirmed or completed items and restrained warm tones for due items. Do not rely on color alone to convey state.
- **Preview data:** Mark illustrative workspace content as sample data so it cannot be mistaken for a signed-in account.

## 5. Layout Principles

- Use a centered content width up to 1440px with generous page gutters.
- Use an asymmetric split for the hero, then editorial sections with clear headings and intentional rhythm.
- Keep public landing content separate from the future signed-in dashboard. The current experience is the public home page only.
- Prefer grid layouts for feature and preview sections. Keep whitespace purposeful and avoid dense, spreadsheet-like presentation on marketing pages.

## 6. Responsive Rules

- At widths below 680px, stack multi-column sections into a single column.
- Keep navigation, links, and buttons easy to tap; prevent horizontal overflow.
- Scale display type fluidly and preserve readable body text.
- Keep the primary action visible and let image compositions stack naturally below the hero copy.

## 7. Motion & Interaction

- Use short, restrained transitions for hover and pressed states.
- Animate only transforms and opacity; respect `prefers-reduced-motion`.
- Links must navigate to a real section or page. Do not imply sign-in, dashboard access, wedding creation, encryption, family sync, or message delivery until those capabilities are implemented.

## 8. Anti-Patterns

- No emojis, neon glows, pure black, or oversaturated accents.
- No overlapping text and imagery or cramped mobile layouts.
- No generic placeholder company language or fabricated product guarantees.
- No misleading live counts, security claims, or operational promises presented as real data.
- No dead buttons or links that imply a backend action that does not exist.
