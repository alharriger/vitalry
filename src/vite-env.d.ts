/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Build stamp injected by Vite `define` (see vite.config.ts) — shown in the
// in-app diagnostics panel so we can confirm which deploy a device is running.
declare const __BUILD_SHA__: string;
declare const __BUILD_TIME__: string;

// Phosphor ships weight subsets as side-effect CSS via package exports
// (e.g. "@phosphor-icons/web/bold" -> src/bold/style.css). Declare them so
// verbatimModuleSyntax accepts the side-effect imports.
declare module '@phosphor-icons/web/bold';
declare module '@phosphor-icons/web/fill';
