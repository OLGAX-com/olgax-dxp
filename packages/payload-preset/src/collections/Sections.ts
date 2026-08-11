import type { CollectionConfig } from "payload";

// A named, reusable group of Puck blocks (a slice of `Data.content`) that a
// consuming app can use to start a new page from, instead of an empty canvas.
// Deliberately just a data model - inserting a section mid-edit via a custom
// Puck plugin/toolbar is real UX work left for a later pass (see PHASE.md).
export const Sections: CollectionConfig = {
  slug: "sections",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "content",
      type: "json",
      required: true,
      admin: {
        description: "An array of Puck ComponentData items (Data.content), not a full Data object.",
      },
    },
  ],
};
