"use client";

import { useFormFields } from "@payloadcms/ui";

// Payload's own UI Field docs literally list this exact use case: "Add a
// 'view page' button into a Pages List View to give editors a shortcut to
// view a page on the frontend of the site." Reads the in-progress `slug`
// field value directly from form state so the links work even before the
// document has been saved.
export function PageQuickLinks() {
  const slug = useFormFields(([fields]) => fields?.slug?.value as string | undefined);

  const linkStyle = {
    display: "block",
    fontSize: 13,
    marginBottom: 6,
  };

  if (!slug) {
    return <p style={{ fontSize: 13, opacity: 0.7 }}>Save with a slug to get quick links.</p>;
  }

  return (
    <div>
      <a href={`/${slug}`} target="_blank" rel="noreferrer" style={linkStyle}>
        View live page ↗
      </a>
      <a href={`/${slug}/edit`} target="_blank" rel="noreferrer" style={linkStyle}>
        Open in Puck editor ↗
      </a>
    </div>
  );
}
