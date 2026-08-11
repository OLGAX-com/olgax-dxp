import { registerComponent } from "@olgax/sdk";
import "./FAQ.css";

export type FAQItem = { question: string; answer: string };
export type FAQProps = {
  items: FAQItem[];
};

const FAQ = ({ items }: FAQProps) => (
  <section className="olgax-faq">
    {items.map((item, i) => (
      <details key={i} className="olgax-faq__item">
        <summary className="olgax-faq__question">{item.question}</summary>
        <p className="olgax-faq__answer">{item.answer}</p>
      </details>
    ))}
  </section>
);

registerComponent<FAQProps>("FAQ", {
  fields: {
    items: {
      type: "array",
      arrayFields: {
        question: { type: "text" },
        answer: { type: "textarea" },
      },
      getItemSummary: (item) => item.question || "Question",
      defaultItemProps: { question: "Question", answer: "Answer" },
    },
  },
  defaultProps: {
    items: [{ question: "What is Olgax DXP?", answer: "A page-building layer for Payload + Next.js." }],
  },
  render: (props) => <FAQ {...props} />,
});
