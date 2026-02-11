import { useEffect } from "react";

export default function useKeyboardShortcuts(actions) {
  useEffect(() => {

    const handler = (e) => {

      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const key = e.key.toLowerCase();

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // CTRL + N → new chat
      if (ctrl && key === "n") {
        e.preventDefault();
        actions.newChat?.();
      }

      // CTRL + F → search
      if (ctrl && key === "f") {
        e.preventDefault();
        actions.search?.();
      }

      // CTRL + H → dashboard
      if (ctrl && key === "h") {
        e.preventDefault();
        actions.dashboard?.();
      }

      // CTRL + T → templates
      if (ctrl && key === "t") {
        e.preventDefault();
        actions.templates?.();
      }

      // CTRL + P → prompt panel
      if (ctrl && key === "p") {
        e.preventDefault();
        actions.promptPanel?.();
      }

      // CTRL + R → theme
      if (ctrl && key === "r") {
        e.preventDefault();
        actions.theme?.();
      }

      // CTRL + SHIFT + B → AB testing
      if (ctrl && shift && key === "b") {
        e.preventDefault();
        actions.abTest?.();
      }

    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);

  }, [actions]);
}
