// eslint-disable-next-line @typescript-eslint/no-require-imports
const dns = require("dns").promises;

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
  "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1",
  "sa-east-1", "ca-central-1"
];

async function run() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    try {
      const addresses = await dns.resolve4(host);
      console.log(`Region ${region} resolved:`, addresses);
    } catch {
      // Ignored
    }
  }
}

run();
