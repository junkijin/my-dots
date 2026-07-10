# UI Change Requirements

Use this reference when a requested change affects rendered UI, visual styling, content presentation, interaction, responsive behavior, motion, or accessibility.

## Goal

Define the observable target UI precisely enough for stakeholders to review the intended result without prescribing implementation structure.

Use design files, annotated screenshots, design-system documentation, existing screens, content specifications, and accessibility policies as evidence. Cite the exact screen, frame, component variant, state, or artifact section when available.

## Required UI context

Collect the applicable requirements for:

- affected screen, route, modal, panel, component, and user task;
- baseline presentation and the exact visual delta;
- hierarchy, ordering, alignment, sizing, spacing, density, and overflow behavior;
- color, typography, border, radius, elevation, iconography, imagery, and motion;
- labels, helper text, validation copy, formatting, localization, and truncation;
- default, hover, focus, pressed, selected, disabled, loading, empty, error, success, and confirmation states;
- triggers, available actions, focus movement, navigation result, and state transitions;
- viewport, responsive, adaptive, orientation, zoom, and content-length behavior;
- keyboard operation, focus order, accessible names, contrast, reduced motion, and other applicable accessibility requirements;
- surrounding UI and behavior that must remain unchanged.

Record exact values, design tokens, copy, asset references, motion parameters, and viewport rules only when a stakeholder or authoritative design source establishes them. Replace subjective directions such as “cleaner” or “more modern” with observable requirements before completing the spec.

Keep DOM structure, CSS technique, code component boundaries, file locations, frameworks, libraries, and rendering strategy outside the UI requirements.

## Material UI gaps

Request clarification when the answer could change:

- information hierarchy or element ordering;
- placement, dimensions, spacing, alignment, or visual emphasis;
- visible content, labels, formatting, or localization behavior;
- interaction states, available actions, feedback, or transitions;
- responsive layout, overflow, scrolling, or long-content behavior;
- accessibility behavior;
- the authoritative design source or the baseline being changed.

## UI change spec

Insert this section into the canonical requirements spec before its general acceptance criteria:

```markdown
## UI change spec

### Design sources
- <Design artifact, screen/frame/variant, or policy> — <what it establishes>

### Affected surfaces
| Surface | Actor and task | Context or viewport | Required change | Source |
| --- | --- | --- | --- | --- |
| <screen, modal, panel, or component> | <actor and goal> | <state and viewport> | <observable target> | <source> |

### Visual requirements
| Element | Current presentation | Required presentation | Preserved behavior | Source |
| --- | --- | --- | --- | --- |
| <element> | <evidence-backed baseline> | <exact visual delta> | <unchanged surrounding behavior> | <source> |

### State and interaction requirements
| State or trigger | Required presentation | Available actions | Result or transition | Source |
| --- | --- | --- | --- | --- |
| <state or user action> | <visible response> | <allowed actions> | <observable result> | <source> |

### Responsive and adaptive behavior
- **<viewport or context>:** <layout, visibility, ordering, overflow, and content behavior> — Source: <source>

### Content and localization
- <Exact copy, formatting, localization, and truncation requirement> — Source: <source>

### Accessibility
- <Keyboard, focus, semantics, contrast, zoom, or reduced-motion requirement> — Source: <source>

### UI acceptance criteria
- [ ] <Observable UI result tied to a surface, state, and viewport> — Traces to: <sourced UI requirement>
```

Keep only applicable subsections, but cover every affected surface, material state, and supported viewport before marking the requirements spec complete.
