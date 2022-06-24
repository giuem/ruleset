import fetch from "node-fetch";
import fse from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cidrTools from "cidr-tools";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const ipv4List = await fetch(
    "https://github.com/Hackl0us/GeoIP2-CN/raw/release/CN-ip-cidr.txt"
  )
    .then((r) => r.text())
    .then((r) => r.split("\n"))
    .then(cidrTools.merge);

  const ipv6List = await fetch(
    "https://gaoyifan.github.io/china-operator-ip/china6.txt"
  )
    .then((r) => r.text())
    .then((r) => r.split("\n"))
    .then(cidrTools.merge);

  console.log(`ipv4 list count: ${ipv4List.length}`);
  console.log(`ipv6 list count: ${ipv6List.length}`);

  let script = "";
  script +=
    "/ip firewall address-list remove [/ip firewall address-list find list=China]\n";
  script += "/ip firewall address-list\n";
  ipv4List.forEach((ip) => {
    script += `:do { add address=${ip} list=China } on-error={}\n`;
  });
  ipv6List.forEach((ip) => {
    script += `:do { add address=${ip} list=China } on-error={}\n`;
  });

  return fse.writeFile(path.join(__dirname, "../output/ros/china.rsc"), script, 'utf8');
}

main();
