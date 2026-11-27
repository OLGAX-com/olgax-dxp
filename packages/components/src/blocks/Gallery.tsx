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

export type GalleryImage = { src: string; alt: string };
export type GalleryProps = {
  images: GalleryImage[];
} & ColorOverrideProps &
  VisibilityProps;

const Gallery = ({ images, ...props }: GalleryProps) => {
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
    <div className="olgax-gallery" style={colorOverrideStyle(props)}>
      {validImages.map((image, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- framework-agnostic component, can't assume next/image
        <img key={i} className="olgax-gallery__image" src={image.safeSrc} alt={image.alt} />
      ))}
    </div>
  );
};

registerComponent<GalleryProps>("Gallery", {
  fields: {
    ...colorOverrideFields(),
    ...visibilityFields(),
    images: {
      type: "array",
      arrayFields: {
        src: mediaField("Image"),
        alt: { type: "text" },
      },
      getItemSummary: (item) => item.alt || "Image",
      defaultItemProps: { src: "", alt: "" },
    },
  },
  defaultProps: {
    images: [],
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
