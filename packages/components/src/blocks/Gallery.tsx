import {
  registerComponent,
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax/sdk";
import "./Gallery.css";

export type GalleryImage = { src: string; alt: string };
export type GalleryProps = {
  images: GalleryImage[];
} & ColorOverrideProps &
  VisibilityProps;

const Gallery = ({ images, ...props }: GalleryProps) => (
  <div className="olgax-gallery" style={colorOverrideStyle(props)}>
    {images.map((image, i) => (
      // eslint-disable-next-line @next/next/no-img-element -- framework-agnostic component, can't assume next/image
      <img key={i} className="olgax-gallery__image" src={image.src} alt={image.alt} />
    ))}
  </div>
);

registerComponent<GalleryProps>("Gallery", {
  fields: {
    ...colorOverrideFields(),
    ...visibilityFields(),
    images: {
      type: "array",
      arrayFields: {
        src: { type: "text" },
        alt: { type: "text" },
      },
      getItemSummary: (item) => item.alt || "Image",
      defaultItemProps: { src: "", alt: "" },
    },
  },
  defaultProps: {
    images: [],
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <Gallery {...props} /> : <></>,
});
