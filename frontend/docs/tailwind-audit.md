# Tailwind Audit – Sprint 1 Baseline

## Purpose of This Audit

This document is the first practical audit of how Tailwind CSS is currently used across the Recipebook frontend.

The goal at this stage is not to redesign the UI, but to establish a clear baseline of the existing styling patterns so we can make the next refactoring steps deliberately and consistently.

More specifically, this audit is intended to support the following next steps:

- introducing a shared `cn()` helper
- defining a small, stable set of design tokens
- building reusable UI primitives
- aligning the visual logic of forms and page-level layouts

## Scope

For Sprint 1, the audit focuses on the following primary surfaces:

- `LoginPage`
- `RegisterPage`
- `RecipeForm`

These areas already expose most of the current form, layout, and interaction patterns, which makes them a useful baseline for broader UI standardization.

## Current Visual Patterns

### Color Usage

The following utilities appear repeatedly across the audited surfaces:

- `bg-white`
- `bg-slate-50/70`
- `bg-slate-900`
- `bg-slate-800`
- `bg-slate-100`
- `border-slate-200`
- `border-slate-300`
- `text-slate-500`
- `text-slate-700`
- `text-slate-900`
- `text-red-600`
- `text-red-700`
- `bg-red-50`
- `border-red-200`
- `text-amber-700`

**Observation**

The current palette is already fairly coherent and centered around slate neutrals, with red and amber used for validation and notice states. The main gap is not color inconsistency, but the lack of semantic naming and abstraction.

### Border Radius

The most common radius utilities are:

- `rounded-xl`
- `rounded-2xl`
- `rounded-3xl`

**Observation**

A loose pattern is already visible:

- smaller interactive elements and some fields tend to use `rounded-xl`
- fields, secondary actions, and medium-size panels often use `rounded-2xl`
- larger page-level containers often use `rounded-3xl`

This is a strong starting point for a radius scale, even though the rules are not yet formalized.

### Shadow Usage

The main shadow utility currently in use is:

- `shadow-sm`

**Observation**

Shadow usage is intentionally restrained, which is a good default for the current UI direction. However, there is no explicit rule yet for when shadows should or should not be used.

### Spacing

Common spacing utilities include:

- `space-y-1`
- `space-y-3`
- `space-y-4`
- `space-y-6`
- `p-4`
- `p-6`
- `sm:p-8`
- `px-4`
- `px-5`
- `py-2`
- `py-3`
- `gap-3`
- `gap-5`

**Observation**

The overall vertical rhythm is already reasonably solid. The issue is not visual disorder, but the lack of explicit standards for recurring layout decisions such as:

- panel padding
- spacing between fields
- button sizing
- card content spacing

## State and Interaction Patterns

### Hover States

Frequently used hover utilities:

- `hover:bg-slate-100`
- `hover:bg-slate-800`
- `hover:file:bg-slate-800`
- `hover:bg-red-100`

### Disabled States

Currently visible patterns:

- `disabled:cursor-not-allowed`
- `disabled:opacity-70`

### Error States

Currently visible patterns:

- `text-red-600`
- `text-red-700`
- `bg-red-50`
- `border-red-200`

### Warning / Notice States

Currently visible pattern:

- `text-amber-700`

**Observation**

Interactive and state-based styling already follows understandable conventions, but these conventions are still encoded directly in component-level class strings rather than being represented through shared abstractions.

## Key Issues Identified

### 1. Long Inline Class Chains

The image section of `RecipeForm`, along with several button implementations, contains long inline class strings that are difficult to scan, maintain, and reuse.

### 2. Button Styles Are Not Centralized

Primary submit actions, secondary actions, and danger-style actions are still defined locally in each component instead of being composed from a shared button system.

### 3. Field-Level Visual Logic Is Not Yet Standardized

Labels, hints, validation messages, and input state styling are not yet built from shared form primitives. This makes consistency harder to maintain as the UI grows.

### 4. Error and Notice Patterns Are Still Ad Hoc

There is already a clear direction for validation styling, but no shared abstraction layer exists yet for patterns such as `FormMessage`, `ErrorState`, `Notice`, or `Badge`.

## Initial Design Foundation Decisions

### Temporary Semantic Color Baseline

The following semantic token direction appears appropriate as an initial baseline:

- `background`
- `surface`
- `surface-muted`
- `border`
- `text-primary`
- `text-secondary`
- `text-muted`
- `primary`
- `danger`
- `warning`

This should provide enough structure for the first refactor without over-engineering the token system too early.

### Radius Baseline

A practical first-pass standard would be:

- `rounded-xl` for smaller fields and lightweight actions
- `rounded-2xl` for standard fields, panels, and secondary buttons
- `rounded-3xl` for larger page-level containers

### Shadow Baseline

For now:

- `shadow-sm` should remain the default shadow treatment
- no broader or more aggressive shadow system should be introduced yet

### Spacing Baseline

A practical initial spacing baseline would be:

- field stacks: `space-y-1` or `space-y-2`
- panel content sections: `space-y-4` or `space-y-6`
- panel padding: `p-4` or `p-6`
- desktop card padding for larger surfaces: `sm:p-8`

## Recommended Next Technical Steps

1. Create `src/lib/cn.ts` using `clsx` and `tailwind-merge`.
2. Define the first set of semantic tokens.
3. Build shared UI primitives such as `Button`, `Input`, `Textarea`, `Label`, `FormMessage`, and `Card`.
4. Refactor `LoginPage`, `RegisterPage`, and `RecipeForm` on top of those primitives.

## Summary

The current Tailwind usage is already moving in a good direction: the visual language is relatively consistent, spacing is mostly disciplined, and the UI does not feel stylistically fragmented.

The main problem is not inconsistency at the visual level, but the lack of shared abstraction. Repeated patterns still live in inline class strings instead of reusable primitives and semantic conventions.

That makes Sprint 1 a good moment not for redesign, but for consolidation: establishing naming, extracting shared structure, and creating a small foundation that future UI work can build on safely.
