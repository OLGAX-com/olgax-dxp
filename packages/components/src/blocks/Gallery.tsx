import {
  registerComponent,
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  mediaField,
  resolveMediaAlt,
  safeMediaSrc,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax.com/sdk";
import "./Gallery.css";

export type GalleryImage = { src: string; alt: string; caption?: string };
export type GalleryColumns = "auto" | "2" | "3" | "4";
export type GalleryAspectRatio = "landscape" | "square" | "portrait";

export type GalleryProps = {
  images: GalleryImage[];
  columns?: GalleryColumns;
  aspectRatio?: GalleryAspectRatio;
} & ColorOverrideProps &
  VisibilityProps;

const Gallery = ({
  images,
  columns = "auto",
  aspectRatio = "landscape",
  ...props
}: GalleryProps) => {
  const validImages = images
    .map((image) => ({ ...image, safeSrc: safeMediaSrc(image.src) }))
    .filter((image): image is GalleryImage & { safeSrc: string } => Boolean(image.safeSrc));

  if (validImages.length === 0) {
    return (
      <div className="olgax-gallery olgax-gallery--empty" style={colorOverrideStyle(props)}>
        <p className="olgax-gallery__empty">No images added yet.</p>
      </div>
    );
  }

  return (
    <div
      className={`olgax-gallery olgax-gallery--cols-${columns} olgax-gallery--ratio-${aspectRatio}`}
      style={colorOverrideStyle(props)}
    >
      {validImages.map((image, i) => (
        <figure key={i} className="olgax-gallery__item">
          {/* eslint-disable-next-line @next/next/no-img-element -- framework-agnostic component, can't assume next/image */}
          <img className="olgax-gallery__image" src={image.safeSrc} alt={image.alt} />
          {image.caption && (
            <figcaption className="olgax-gallery__caption">{image.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
};

registerComponent<GalleryProps>("Gallery", {
  fields: {
    columns: {
      type: "select",
      options: [
        { label: "Auto-fill grid", value: "auto" },
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ],
    },
    aspectRatio: {
      type: "select",
      options: [
        { label: "Landscape (4:3)", value: "landscape" },
        { label: "Square (1:1)", value: "square" },
        { label: "Portrait (3:4)", value: "portrait" },
      ],
    },
    ...colorOverrideFields(),
    ...visibilityFields(),
    images: {
      type: "array",
      arrayFields: {
        src: mediaField("Image"),
        alt: { type: "text" },
        caption: { type: "text" },
      },
      getItemSummary: (item) => item.caption || item.alt || "Image",
      defaultItemProps: { src: "", alt: "", caption: "" },
    },
  },
  defaultProps: {
    images: [],
    columns: "auto",
    aspectRatio: "landscape",
  },
  resolveData: async ({ props }, { changed }) => {
    if (!changed.images || !Array.isArray(props.images)) {
      return { props };
    }
    let updated = false;
    const nextImages = await Promise.all(
      props.images.map(async (img) => {
        if (!img.src || img.alt.trim()) return img;
        const defaultAlt = await resolveMediaAlt(img.src);
        if (!defaultAlt) return img;
        updated = true;
        return { ...img, alt: defaultAlt };
      }),
    );
    return updated ? { props: { ...props, images: nextImages } } : { props };
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <Gallery {...props} /> : <></>,
});
