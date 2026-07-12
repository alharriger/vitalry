/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Phosphor ships weight subsets as side-effect CSS via package exports
// (e.g. "@phosphor-icons/web/bold" -> src/bold/style.css). Declare them so
// verbatimModuleSyntax accepts the side-effect imports.
declare module '@phosphor-icons/web/bold';
declare module '@phosphor-icons/web/fill';
