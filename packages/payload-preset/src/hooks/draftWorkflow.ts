import { APIError, type CollectionConfig } from "payload";
import { getUserRole } from "../access/roles";

export type DraftWorkflowOptions = {
  labelPlural?: string;
};

/**
 * Reusable Payload collection hooks enforcing Author draft-only workflow:
 * Authors can create and update drafts (`draft: true`), while publishing,
 * modifying live documents directly, or unpublishing requires Editor or Admin.
 */
export function createDraftWorkflowHooks(
  options: DraftWorkflowOptions = {},
): NonNullable<CollectionConfig["hooks"]> {
  const label = options.labelPlural ?? "documents";

  return {
    beforeOperation: [
      ({ args, operation }) => {
        if ((operation === "create" || operation === "update") && args.req) {
          args.req.context.__olgaxDraftArg = "draft" in args ? Boolean(args.draft) : false;
          args.req.context.__olgaxUnpublishAll =
            "unpublishAllLocales" in args ? Boolean(args.unpublishAllLocales) : false;
        }
        return args;
      },
    ],
    beforeChange: [
      ({ data, operation, originalDoc, req }) => {
        if (req.user && getUserRole(req.user) === "author") {
          if (data?._status === "published") {
            throw new APIError(
              `Authors cannot publish ${label}. Save as a draft and ask an Editor or Admin to publish.`,
              403,
            );
          }
          if (
            operation === "update" &&
            !req.context.__olgaxDraftArg &&
            (originalDoc?._status === "published" ||
              data?._status === "draft" ||
              req.context.__olgaxUnpublishAll)
          ) {
            throw new APIError(
              `Authors cannot modify or unpublish live ${label} directly. Save changes as a draft (?draft=true).`,
              403,
            );
          }
        }
        return data;
      },
    ],
  };
}
