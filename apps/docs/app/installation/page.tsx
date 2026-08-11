export default function Page() {
  return (
    <>
      <h1>Installation</h1>
      <p>Scaffold a new Olgax DXP site:</p>
      <pre>{`npx create-olgax-site my-site
cd my-site
cp .env.example .env   # set PAYLOAD_SECRET
pnpm seed               # creates an admin user + a demo page
pnpm dev`}</pre>
      <p>
        Then open <code>http://localhost:3000/admin</code> to log in, and{" "}
        <code>http://localhost:3000/home/edit</code> to try the Puck editor.
      </p>
      <h2>Requirements</h2>
      <ul>
        <li>Node.js 20.9+</li>
        <li>pnpm (this project only supports pnpm, not npm/yarn)</li>
      </ul>
    </>
  );
}
