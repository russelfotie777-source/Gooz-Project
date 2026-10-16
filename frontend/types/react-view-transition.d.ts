// React's <ViewTransition> component (see next.config.ts's
// experimental.viewTransition) ships in the canary React build Next.js
// vendors internally for the App Router — real at runtime (Next's bundler
// resolves "react" to that build for app code), but the "react" package
// actually installed in node_modules/@types is a stable release that
// predates it, so plain `import { ViewTransition } from "react"` fails
// type-checking without this. Typed against the documented public API
// (https://react.dev/reference/react/ViewTransition), not the full
// internal shape — only what callers in this app actually pass.
import "react";

declare module "react" {
  type ViewTransitionAnimation = "auto" | "none" | string;
  type ViewTransitionAnimationByType = Record<string, ViewTransitionAnimation> & { default?: ViewTransitionAnimation };

  interface ViewTransitionProps {
    name?: string;
    share?: ViewTransitionAnimation;
    enter?: ViewTransitionAnimation | ViewTransitionAnimationByType;
    exit?: ViewTransitionAnimation | ViewTransitionAnimationByType;
    update?: ViewTransitionAnimation;
    default?: ViewTransitionAnimation;
    children?: ReactNode;
  }

  export const ViewTransition: (props: ViewTransitionProps) => ReactElement | null;
}
