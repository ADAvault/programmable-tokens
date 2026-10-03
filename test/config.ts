/**
 * CIP-113 Programmable Tokens — Test Configuration
 *
 * Providers (any preview node with Ogmios and Kupo):
 *   - Ogmios (tx evaluation + submission): OGMIOS_URL, default http://localhost:1337
 *   - Kupo (UTxO fetcher): KUPO_URL, default http://localhost:1442
 *
 * If the node is on another machine, set the two URLs or forward the ports:
 *   ssh -N -L 1337:localhost:1337 -L 1442:localhost:1442 <user>@<your-node>
 *
 * Wallet:
 *   A funded preview testnet payment key.
 *   Copy payment.skey to test/keys/ (gitignored), or set PAYMENT_SKEY_PATH.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  network: "preview" as const,
  networkId: 0,

  ogmiosUrl: process.env.OGMIOS_URL || "http://localhost:1337",
  kupoUrl: process.env.KUPO_URL || "http://localhost:1442",

  paymentSkeyPath:
    process.env.PAYMENT_SKEY_PATH || join(__dirname, "keys", "payment.skey"),

  blueprintPath: join(__dirname, "..", "plutus.json"),
};

/**
 * Load the payment signing key from the key file.
 */
export function loadSigningKey(): string {
  const raw = readFileSync(config.paymentSkeyPath, "utf-8");
  try {
    const envelope = JSON.parse(raw);
    const cborHex: string = envelope.cborHex;
    if (cborHex.startsWith("5820")) {
      return cborHex.slice(4);
    }
    return cborHex;
  } catch {
    return raw.trim();
  }
}

/**
 * Load a validator's compiled code from the blueprint by title.
 * Titles follow: "module.validator_name.handler"
 */
export function loadValidatorCompiledCode(title: string): string {
  const blueprint = JSON.parse(
    readFileSync(config.blueprintPath, "utf-8")
  );
  const validator = blueprint.validators.find(
    (v: { title: string }) => v.title === title
  );
  if (!validator) {
    const available = blueprint.validators.map((v: { title: string }) => v.title).join(", ");
    throw new Error(`${title} not found in blueprint. Available: ${available}`);
  }
  return validator.compiledCode;
}
