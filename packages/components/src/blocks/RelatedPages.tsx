import type { ComponentConfig } from "@puckeditor/core";
import { registerComponent } from "@olgax.com/sdk";
import { collectionQueryFields } from "@olgax.com/datasource";
import "./RelatedPages.css";

export type RelatedPagesItem = { id: string | number; title?: string; slug?: string };
export type RelatedPagesProps = {
  collection: string;
  filterField?: string;
  filterValue?: string;
  limit?: number;
  items?: RelatedPagesItem[];
};

const RelatedPages = ({ items }: RelatedPagesProps) => (
  <ul className="olgax-related-pages">
    {(items ?? []).map((item) => (
      <li key={item.id} className="olgax-related-pages__item">
        <a href={`/${item.slug ?? ""}`}>{item.title ?? item.slug ?? item.id}</a>
      </li>
    ))}
  </ul>
);

// Unlike the other blocks in this package, RelatedPages needs a `resolveData`
// (Phase 2's data-source layer) - so it's registered via this factory instead of
// registering itself on import. Pass a resolver built with `@olgax.com/datasource`,
// e.g. `createCollectionResolverFetch` for a config shared with the client editor.
export function registerRelatedPages(
  resolveData: ComponentConfig<RelatedPagesProps>["resolveData"],
) {
  registerComponent<RelatedPagesProps>("RelatedPages", {
    fields: {
      ...collectionQueryFields,
    },
    defaultProps: {
      collection: "pages",
      limit: 3,
    },
    resolveData,
    render: (props) => <RelatedPages {...props} />,
  });
}
