import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createHttpServer } from "node:http";
import { createServer } from "node:net";
import { Pool } from "pg";
import { startTestDatabase } from "./postgres";

// A local stand-in for Resend's POST /emails. It keeps every message and,
// like Resend before a domain is verified, rejects some recipients.
type SentEmail = { from: string; to: string[]; subject: string; text: string };
const outbox: SentEmail[] = [];
const authorizations: string[] = [];
const resend = createHttpServer((request, response) => {
  let body = "";
  request.on("data", (chunk) => (body += chunk));
  request.on("end", () => {
    if (request.method !== "POST" || request.url !== "/emails") {
      response.writeHead(404).end();
      return;
    }
    const email = JSON.parse(body) as SentEmail;
    authorizations.push(request.headers.authorization ?? "");
    if (email.to.some((to) => to.endsWith("@rechazado.test"))) {
      response.writeHead(403, { "content-type": "application/json" }).end(
        JSON.stringify({
          message: "You can only send testing emails to your own email address",
        }),
      );
      return;
    }
    outbox.push(email);
    response
      .writeHead(200, { "content-type": "application/json" })
      .end(JSON.stringify({ id: crypto.randomUUID() }));
  });
});
await new Promise<void>((resolve) => resend.listen(0, "127.0.0.1", resolve));
const resendAddress = resend.address();
assert(resendAddress && typeof resendAddress === "object");

const database = await startTestDatabase();
const db = new Pool({ connectionString: database.url });
const portProbe = createServer();
await new Promise<void>((resolve) => portProbe.listen(0, "127.0.0.1", resolve));
const address = portProbe.address();
assert(address && typeof address === "object");
const port = address.port;
await new Promise<void>((resolve) => portProbe.close(() => resolve()));
const origin = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      DATABASE_URL: database.url,
      LINKUP_SEED_DEMO: "false",
      BETTER_AUTH_URL: origin,
      BETTER_AUTH_SECRET: crypto.randomUUID() + crypto.randomUUID(),
      RESEND_API_KEY: "re_test_key",
      RESEND_BASE_URL: `http://127.0.0.1:${resendAddress.port}`,
      LINKUP_EMAIL_FROM: "LinkUp <pruebas@example.test>",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
server.stdout.on("data", (data) => {
  logs = (logs + data.toString()).slice(-8000);
});
server.stderr.on("data", (data) => {
  logs = (logs + data.toString()).slice(-8000);
});
let checks = 0;
const check = (label: string) => {
  checks++;
  console.log(`✓ ${label}`);
};
async function api(path: string, method = "GET", body?: unknown, cookie = "") {
  const response = await fetch(origin + path, {
    method,
    headers: {
      "content-type": "application/json",
      origin,
      ...(cookie ? { cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}
const sessionCookie = (response: Response) =>
  response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
function latestCode(email: string) {
  const message = outbox.findLast((item) => item.to.includes(email));
  assert(message, `No email reached ${email}`);
  const code = message.text.match(/^(\d{6})$/m)?.[1];
  assert(code, message.text);
  return code;
}

try {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(origin);
      if (response.ok) break;
    } catch {
      /* startup */
    }
    if (attempt > 100) throw new Error("Server did not become ready. " + logs);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const signInPage = await (await fetch(`${origin}/ingresar`)).text();
  assert.match(signInPage, />Continuar</);
  assert.match(signInPage, /Ingresar con contraseña/);
  assert.doesNotMatch(signInPage, /name="password"/);
  assert.doesNotMatch(signInPage, /Crear cuenta/);
  check("the sign-in page asks only for the email; the password is an option");

  const sentBeforeSignUp = outbox.length;
  const passwordSignUp = await api("/api/auth/sign-up/email", "POST", {
    email: "eva@example.test",
    password: "clave",
    name: "Eva",
  });
  assert.equal(passwordSignUp.response.status, 400);
  assert.equal(outbox.length, sentBeforeSignUp);
  check("accounts are not created with a password while codes are available");

  const ana = "ana@example.test";
  assert.equal(
    (
      await api("/api/auth/email-otp/send-verification-otp", "POST", {
        email: ana,
        type: "sign-in",
      })
    ).response.status,
    200,
  );
  const welcome = outbox.at(-1);
  assert(welcome);
  assert.deepEqual(welcome.to, [ana]);
  assert.equal(welcome.from, "LinkUp <pruebas@example.test>");
  assert.match(welcome.subject, /^\d{6} es tu código de LinkUp$/);
  assert.match(welcome.text, /ingresar a LinkUp/);
  assert.equal(authorizations.at(-1), "Bearer re_test_key");
  const code = latestCode(ana);
  const wrong = await api("/api/auth/sign-in/email-otp", "POST", {
    email: ana,
    otp: code === "000000" ? "111111" : "000000",
  });
  assert.equal(wrong.response.status, 400);
  const created = await api("/api/auth/sign-in/email-otp", "POST", {
    email: ana,
    otp: code,
  });
  assert.equal(created.response.status, 200, JSON.stringify(created.data));
  assert.equal(created.data.user.name, "");
  const createdCookie = sessionCookie(created.response);
  assert.equal(
    (await api("/api/profile", "GET", undefined, createdCookie)).response
      .status,
    200,
  );
  const displayName = async () =>
    (await db.query("SELECT display_name FROM users WHERE email=$1", [ana]))
      .rows[0]?.display_name;
  assert.equal(await displayName(), "ana");
  const named = await api(
    "/api/auth/update-user",
    "POST",
    { name: "Ana Pérez" },
    createdCookie,
  );
  assert.equal(named.response.status, 200, JSON.stringify(named.data));
  await api("/api/profile", "GET", undefined, createdCookie);
  assert.equal(await displayName(), "Ana Pérez");
  check("a code creates the account the first time; the name comes right after");

  await api("/api/auth/email-otp/request-password-reset", "POST", {
    email: ana,
  });
  assert.match(outbox.at(-1)?.text ?? "", /elegir una contraseña nueva/);
  const firstPassword = await api(
    "/api/auth/email-otp/reset-password",
    "POST",
    { email: ana, otp: latestCode(ana), password: "clave" },
  );
  assert.equal(
    firstPassword.response.status,
    200,
    JSON.stringify(firstPassword.data),
  );
  const { rows: providers } = await db.query<{ provider: string }>(
    "SELECT a.provider_id AS provider FROM auth_account a JOIN auth_user u ON u.id = a.user_id WHERE u.email = $1",
    [ana],
  );
  assert.deepEqual(
    providers.map((row) => row.provider),
    ["credential"],
  );
  const withPassword = await api("/api/auth/sign-in/email", "POST", {
    email: ana,
    password: "clave",
  });
  assert.equal(withPassword.response.status, 200);
  check("an account created with a code can add a password with another code");

  await api("/api/auth/email-otp/send-verification-otp", "POST", {
    email: ana,
    type: "sign-in",
  });
  const codeAgain = await api("/api/auth/sign-in/email-otp", "POST", {
    email: ana,
    otp: latestCode(ana),
  });
  assert.equal(codeAgain.response.status, 200, JSON.stringify(codeAgain.data));
  const passwordAgain = await api("/api/auth/sign-in/email", "POST", {
    email: ana,
    password: "clave",
  });
  assert.equal(passwordAgain.response.status, 200);
  check("signing in with a code keeps the password");

  const anaSession = sessionCookie(passwordAgain.response);
  await api("/api/auth/email-otp/request-password-reset", "POST", {
    email: ana,
  });
  const reset = await api("/api/auth/email-otp/reset-password", "POST", {
    email: ana,
    otp: latestCode(ana),
    password: "nueva",
  });
  assert.equal(reset.response.status, 200, JSON.stringify(reset.data));
  assert.equal(
    (await api("/api/profile", "GET", undefined, anaSession)).response.status,
    401,
  );
  const newPassword = await api("/api/auth/sign-in/email", "POST", {
    email: ana,
    password: "nueva",
  });
  assert.equal(newPassword.response.status, 200);
  check(
    "a forgotten password is replaced with an email code, closing open sessions",
  );

  const rejected = await api(
    "/api/auth/email-otp/send-verification-otp",
    "POST",
    { email: "nadie@rechazado.test", type: "sign-in" },
  );
  assert.equal(rejected.response.status, 200);
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.match(
    logs,
    /Resend rechazó el correo a nadie@rechazado\.test \(403\)/,
  );
  check("a message Resend refuses is logged with Resend's reason");

  console.log(
    `${checks} email scenarios passed against the production server.`,
  );
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  server.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    if (server.exitCode !== null) resolve();
    else server.once("exit", () => resolve());
  });
  await new Promise<void>((resolve) => resend.close(() => resolve()));
  await db.end();
  await database.stop();
}
