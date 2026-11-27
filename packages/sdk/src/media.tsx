import { MediaPickerField } from "./MediaPickerField";

/**
 * Reusable Puck custom field allowing editors to paste an image URL, browse
 * Payload's Media collection, or upload a new image without leaving the editor.
 */
export function mediaField(label = "Image") {
  return {
    type: "custom" as const,
    render: ({
      name,
      value,
      onChange,
    }: {
      name: string;
      value?: string;
      onChange: (value: string) => void;
    }) => <MediaPickerField label={label} name={name} value={value} onChange={onChange} />,
  };
}
