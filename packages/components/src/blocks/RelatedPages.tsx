import type { ComponentConfig } from "@puckeditor/core";
import {
  registerComponent,
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax.com/sdk";
import { collectionQueryFields } from "@olgax.com/datasource";
import "./RelatedPages.css";

export type RelatedPagesItem = { id: string | number; title?: string; slug?: string };
export type RelatedPagesProps = {
  collection: string;
  filterField?: string;
  filterValue?: string;
  limit?: number;
  items?: RelatedPagesItem[];
} & ColorOverrideProps &
  VisibilityProps;

function buildHref(slug: string | undefined, localePrefix: string): string {
  const cleanPrefix = localePrefix.replace(/\/+$/, "");
  if (!slug || slug === "home") {
    return cleanPrefix || "/";
  }
  return `${cleanPrefix}/${slug}`;
}

const RelatedPages = ({
  items,
  localePrefix = "",
  ...props
}: RelatedPagesProps & { localePrefix?: string }) => {
  const list = items ?? [];
  return (
    <div className="olgax-related-pages-wrapper" style={colorOverrideStyle(props)}>
      {list.length === 0 ? (
        <p className="olgax-related-pages__empty">No related pages found.</p>
      ) : (
        <ul className="olgax-related-pages">
          {list.map((item) => (
            <li key={item.id} className="olgax-related-pages__item">
              <a href={buildHref(item.slug, localePrefix)}>{item.title ?? item.slug ?? item.id}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Unlike the other blocks in this package, RelatedPages needs a `resolveData`
// (Phase 2's data-source layer) - so it's registered via this factory instead of
// registering itself on import. Pass a resolver built with `@olgax.com/datasource`,
// e.g. `createCollectionResolverFetch` for a config shared with the client editor.
export function registerRelatedPages(
  resolveData: ComponentConfig<{ props: RelatedPagesProps }>["resolveData"],
) {
  registerComponent<RelatedPagesProps>("RelatedPages", {
    fields: {
      ...collectionQueryFields,
      ...colorOverrideFields(),
      ...visibilityFields(),
    },
    defaultProps: {
      collection: "pages",
      limit: 3,
    },
    resolveData,
    render: (props) =>
      isVisible(props.visibility, props.puck?.metadata?.visitor) ? (
        <RelatedPages
          {...props}
          localePrefix={
            typeof props.puck?.metadata?.localePrefix === "string"
              ? props.puck.metadata.localePrefix
              : ""
          }
        />
      ) : (
        <></>
      ),
  });
}
