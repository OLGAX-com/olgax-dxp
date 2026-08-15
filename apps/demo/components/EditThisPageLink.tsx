export function EditThisPageLink({ slug }: { slug: string }) {
  return (
    <a
      href={`/${slug}/edit`}
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 50,
        padding: "0.625rem 1rem",
        borderRadius: "999px",
        background: "#18181b",
        color: "#fff",
        fontSize: "0.875rem",
        fontWeight: 600,
        textDecoration: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      Edit this page
    </a>
  );
}
