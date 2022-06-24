import fetch from "node-fetch";
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import cidrTools from "cidr-tools";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *
 * @param {string} cidr
 * @returns
 */
function processIPCidr(cidr) {
  return cidrTools.merge(cidr.split("\n").filter(Boolean));
}

async function main() {
  const ipv4List = await fetch(
    "https://github.com/Hackl0us/GeoIP2-CN/raw/release/CN-ip-cidr.txt"
  )
    .then((r) => r.text())
    .then(processIPCidr);

  const ipv6List = await fetch(
    "https://gaoyifan.github.io/china-operator-ip/china6.txt"
  )
    .then((r) => r.text())
    .then(processIPCidr);

  // internal IPs
  ipv4List.push(
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "100.64.0.0/10"
  );

  console.log(`ipv4 list count: ${ipv4List.length}`);
  console.log(`ipv6 list count: ${ipv6List.length}`);

  let script = "";
  script +=
    "/ip firewall address-list remove [/ip firewall address-list find list=China]\n";
  script += "/ip firewall address-list\n";
  [].concat(ipv4List, ipv6List).forEach((ip) => {
    script += `:do { add address=${ip} list=China } on-error={}\n`;
  });

  return fse.writeFile(
    path.join(__dirname, "../output/china-ip.rsc"),
    script,
    "utf8"
  );
}

main();
