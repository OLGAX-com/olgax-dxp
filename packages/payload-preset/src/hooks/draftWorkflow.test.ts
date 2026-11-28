import { describe, it, expect } from "vitest";
import { createDraftWorkflowHooks } from "./draftWorkflow";
import { createPagesCollection } from "../collections/Pages";
import { createWebhooksCollection } from "../collections/Webhooks";

describe("createDraftWorkflowHooks", () => {
  it("blocks authors from publishing or unpublishing live docs while allowing drafts and editors", () => {
    const hooks = createDraftWorkflowHooks({ labelPlural: "posts" });
    const beforeOperation = hooks.beforeOperation![0]!;
    const beforeChange = hooks.beforeChange![0]!;

    const authorReq = { user: { id: 1, role: "author" }, context: {} as Record<string, unknown> };
    beforeOperation({ args: { req: authorReq, draft: false }, operation: "update" } as never);

    expect(() =>
      beforeChange({
        data: { _status: "published" },
        operation: "update",
        originalDoc: { _status: "draft" },
        req: authorReq,
      } as never),
    ).toThrow(/Authors cannot publish posts/);

    beforeOperation({ args: { req: authorReq, draft: true }, operation: "update" } as never);
    const savedDraft = beforeChange({
      data: { title: "Draft edit" },
      operation: "update",
      originalDoc: { _status: "published" },
      req: authorReq,
    } as never);
    expect(savedDraft).toEqual({ title: "Draft edit" });

    const editorReq = { user: { id: 2, role: "editor" }, context: {} as Record<string, unknown> };
    const published = beforeChange({
      data: { _status: "published" },
      operation: "update",
      originalDoc: { _status: "draft" },
      req: editorReq,
    } as never);
    expect(published).toEqual({ _status: "published" });
  });
});

describe("collection factories", () => {
  it("extends Pages reservedSlugs without losing defaults", () => {
    const customPages = createPagesCollection({ reservedSlugs: ["blog", "menu"] });
    const slugField = customPages.fields.find((f) => "name" in f && f.name === "slug") as {
      validate: (v?: string | null) => true | string;
    };
    expect(slugField.validate("blog")).toMatch(/reserved/);
    expect(slugField.validate("admin")).toMatch(/reserved/);
    expect(slugField.validate("about-us")).toBe(true);
  });

  it("extends Webhooks events while deduplicating defaults", () => {
    const customWebhooks = createWebhooksCollection({
      events: [
        { label: "Post published", value: "post.published" },
        { label: "Duplicate page", value: "page.published" },
      ],
    });
    const eventsField = customWebhooks.fields.find((f) => "name" in f && f.name === "events") as {
      options: { value: string }[];
    };
    expect(eventsField.options.map((o) => o.value)).toEqual([
      "page.published",
      "page.deleted",
      "post.published",
    ]);
  });
});
