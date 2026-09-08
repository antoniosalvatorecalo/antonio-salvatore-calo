# Design system

Runtime tokens live in `src/index.css`: color, type, spacing, z-index, header dimensions, and breakpoints. TT Interphases Pro is loaded locally; production licensing must be verified before release.

The gallery uses a 16-column desktop and 10-column tablet/mobile grid. It has an internal scroll container, a stable FilterBar region, 8px desktop gaps, and 4px mobile gaps. Project details are horizontal on desktop and one vertical accordion column at `<=767px`.

Motion separates GSAP scene geometry from Motion component presence. `prefers-reduced-motion` must retain route, focus, and endpoint behavior while removing nonessential movement. All interactive controls require visible keyboard focus.
