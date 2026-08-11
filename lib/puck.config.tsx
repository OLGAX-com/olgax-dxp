import type { Config } from "@puckeditor/core";

// Minimal component set for the Phase 0 spike - proves Data can round-trip
// through Payload and render via Next.js. Deliberately avoids client-only
// hooks so this single config works for both the <Puck> editor and <Render>.
type Props = {
  HeadingBlock: {
    title: string;
  };
  TextBlock: {
    text: string;
  };
};

export const config: Config<Props> = {
  components: {
    HeadingBlock: {
      fields: {
        title: {
          type: "text",
        },
      },
      defaultProps: {
        title: "Heading",
      },
      render: ({ title }) => <h1>{title}</h1>,
    },
    TextBlock: {
      fields: {
        text: {
          type: "textarea",
        },
      },
      defaultProps: {
        text: "Some text",
      },
      render: ({ text }) => <p>{text}</p>,
    },
  },
};
