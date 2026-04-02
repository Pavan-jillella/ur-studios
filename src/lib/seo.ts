import { useEffect } from "react";

/**
 * Sets the document title and meta description for the current page.
 * Title is formatted as "{title} | UR pixelstudio".
 */
export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = `${title} | UR pixelstudio`;

    if (description) {
      let metaDescription = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]'
      );

      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
      }

      metaDescription.content = description;
    }
  }, [title, description]);
}
