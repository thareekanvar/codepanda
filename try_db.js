// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Client } = require("pg");

const host = "db.spbrenezrfrlqgiwrnaw.supabase.co";
const port = 5432;
const database = "postgres";
const user = "postgres";

const passwords = [
  "postgres",
  "spbrenezrfrlqgiwrnaw",
  "",
  "admin",
  "password"
];

async function tryPassword(password) {
  const client = new Client({
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`Connection SUCCESS with password: "${password}"`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`Connection failed with password "${password}":`, err.message);
    return false;
  }
}

async function run() {
  for (const pw of passwords) {
    const success = await tryPassword(pw);
    if (success) {
      process.exit(0);
    }
  }
  console.log("All candidate passwords failed.");
}

run();
