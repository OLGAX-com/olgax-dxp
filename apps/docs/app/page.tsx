export default function Page() {
  return (
    <>
      <h1>Olgax DXP</h1>
      <p>
        An open-source, self-hostable page-building layer for Payload CMS + Next.js. Payload for
        content, <a href="https://puckeditor.com">Puck</a> for the drag-and-drop canvas, Olgax
        for the parts that make it feel like a product.
      </p>
      <p>
        This docs site is a Phase 1 starting point - see the{" "}
        <a href="https://github.com/OLGAX-com/olgax-dxp" rel="noreferrer">
          repository README
        </a>{" "}
        for the current project status.
      </p>
      <ul>
        <li>
          <a href="/installation">Installation</a> - scaffold a new site
        </li>
        <li>
          <a href="/custom-components">Custom components</a> - add your own blocks to the page
          builder
        </li>
        <li>
          <a href="/components">Adding a component</a> - the component contribution flow
        </li>
        <li>
          <a href="/sdk">SDK reference</a> - <code>registerComponent()</code> usage
        </li>
      </ul>
    </>
  );
}
