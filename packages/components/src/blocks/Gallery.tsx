import { registerComponent } from "@olgax/sdk";
import "./Gallery.css";

export type GalleryImage = { src: string; alt: string };
export type GalleryProps = {
  images: GalleryImage[];
};

const Gallery = ({ images }: GalleryProps) => (
  <div className="olgax-gallery">
    {images.map((image, i) => (
      // eslint-disable-next-line @next/next/no-img-element -- framework-agnostic component, can't assume next/image
      <img key={i} className="olgax-gallery__image" src={image.src} alt={image.alt} />
    ))}
  </div>
);

registerComponent<GalleryProps>("Gallery", {
  fields: {
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
  render: (props) => <Gallery {...props} />,
});
