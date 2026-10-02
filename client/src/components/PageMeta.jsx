import { useEffect } from "react";

const DEFAULT_TITLE = "GenioCore — AI-Assisted Code Review";

const PageMeta = ({ title = DEFAULT_TITLE, description }) => {
  useEffect(() => {
    document.title = title;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", description);
    }
  }, [title, description]);

  return null;
};

export default PageMeta;
