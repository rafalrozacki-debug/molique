# Molique CLI - Scaffolding Engine (DevTools)

> **This document is an EARLY DRAFT from the planning stage**, predating the
> build of the actual scaffolding - it describes the shape of `make:page` +
> `make:component`-with-sub-modes, which was ABANDONED in favor of one
> separate command per component family (`make:table`, `make:modal`,
> `make:layout`, `make:nav`, `make:chart`, `make:form`, `make:popover`,
> `make:widget` - today `make:component` serves ONLY to PRINT the list of
> available generators, see `src/cli/list.ts`). **The current, authoritative
> documentation for the `make:*` commands (flags, `-n/--count`,
> `--answers`/`--answers-file`) lives in `cli-spec.md`, section 6** -
> expanded incrementally, one command at a time, as each `src/cli/make-*.ts`
> file is reworked into the collect/render shape (the CLI development plan).
> Section 1 below (stub architecture) is still accurate; sections 2-3
> describe this abandoned shape and remain here as a historical record of
> the design process, not as current fact.

This document describes the architecture of the component generation system (Scaffolding) for the Molique CSS command line.

The goal of Scaffolding is to significantly speed up developer workflow through interactive terminal prompts (wizards) that spit out ready-made, optimized HTML blocks (with full A11y support, ARIA, and the native CSS solutions Molique is built on).

## 1. Generation Architecture (Stubs System)

Instead of gluing together massive strings of code in TypeScript files (which is unreadable and error-prone), the CLI uses a **Stubs** (Templates) architecture.

- **Stubs (Templates):** Plain HTML files with "placeholder tags" (e.g. `{{ ID }}`, `{{ CLASSES }}`, `{{ SLOT }}`).
- **Location:** Always kept inside the CLI tool at `src/stubs/`.
- **Rendering engine:** A lightweight regex-replacer (e.g. replacing `{{ VARIABLE }}` with content). We don't use heavyweight engines like Handlebars or Twig.

## 2. Main Action Flow

Every command in the `make:*` family (e.g. `molique make:component`) runs through the following process:

1. **Prompting (Interactive selection):** The CLI uses the `@inquirer/prompts` or `enquirer` package to display an arrow-key selection menu in the terminal.
2. **Data collection:** The questions change dynamically (so-called Conditional Questions). E.g. if the user picked `Modal`, the program asks a follow-up: "Is this a Confirm Modal or a Context Modal?"
3. **Compilation (Render):** The system loads a `.stub` file from disk and replaces the tags with the user's answers.
4. **Output:** The program writes the finished code.
   *UX innovation:* The tool lets the developer decide - save the component to a new file (e.g. `components/my-modal.html`), or just dump the clean, copyable code straight to the console screen for a mouse-click selection!

---

## 3. Scaffolding Commands

### `molique make:page` (Make:Page)
Generates the skeleton of an entire page (HTML5 Boilerplate) with a wired-up, prepared layout.

**Parameters collected from the developer:**
- **File name:** (e.g. `dashboard.html`)
- **Layout type:**
  1. *Classic (Header -> Content -> Footer)*
  2. *Admin Layout (Floating, with a mobile-optimized Sidebar)*
- **Navbar variant (if Classic):** Transparent / Sticky / Pill
- **Theme Switcher:** Add a native Dark Mode toggle? (Yes/No)

### `molique make:component` (Make:Component)
The CLI's main workhorse. Creates reusable composite structures.

**Supported structures (Interaction examples):**

#### A. Table (B2B Table)
- "Table size?" (Small / Medium / Large)
- "Apply mobile-first table-cards?" (Auto / Always / Never)
- "Header variant?" (Light / Dark / Primary)
- *Result:* Generates `<div class="table-wrapper"><table class="...">`, correctly filling in `data-label` on each `<td>`.

#### B. Modal (Native `<dialog>`)
- "Modal type?" (Standard / Confirmation Dialog / Side Context)
- *Result:* Generates a properly hidden, tab-inaccessible modal based on native HTML:
  ```html
  <dialog class="modal-dialog modal-confirm" id="myModal">
    <div class="card">
       <form method="dialog"><button class="modal-close-btn">&times;</button></form>
       <div class="card-body">...</div>
    </div>
  </dialog>
  ```
  </dialog>
