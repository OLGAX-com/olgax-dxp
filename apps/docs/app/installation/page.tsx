export default function Page() {
  return (
    <>
      <h1>Installation</h1>
      <p>Scaffold a new Olgax DXP site:</p>
      <pre>{`npx create-olgax-site my-site
cd my-site
pnpm dev`}</pre>
      <p>
        The scaffolder installs dependencies, creates <code>.env</code> with a generated{" "}
        <code>PAYLOAD_SECRET</code>, and seeds an admin user and a demo homepage. If the seed step
        fails or is skipped, run <code>pnpm seed</code> yourself before <code>pnpm dev</code>.
      </p>
      <p>
        Open <code>http://localhost:3000</code> for the site, <code>http://localhost:3000/admin</code>{" "}
        to log in (<code>admin@example.com</code> / <code>ChangeMe123!</code> - change it before you
        deploy), and <code>http://localhost:3000/home/edit</code> to try the page builder. Next, add
        your own blocks: <a href="/custom-components">Custom components</a>.
      </p>
      <h2>Requirements</h2>
      <ul>
        <li>Node.js 20.9+</li>
        <li>pnpm (this project only supports pnpm, not npm/yarn)</li>
      </ul>
    </>
  );
}
