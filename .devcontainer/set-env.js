const globalNPM = "/usr/local/share/npm-global/lib/node_modules";
const fs = require("fs");
const localtunnel = require(`${globalNPM}/localtunnel`);
const dotenv = require(`${globalNPM}/dotenv`);
const updateDotenv = require(`${globalNPM}/update-dotenv`);

(async () => {
  const envConfig = dotenv.parse(fs.readFileSync('./.env'))
  if (envConfig.WEBHOOK_PROXY_URL) return;

  const tunnel = await localtunnel({ port: 3000 });

  await updateDotenv({
    WEBHOOK_PROXY_URL: tunnel.url
  })

  tunnel.on('close', () => {
    // tunnels are closed
  });
})();