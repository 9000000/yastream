import { existsSync, readFileSync, writeFileSync } from "fs";
import * as jose from "jose";

interface KeyPair {
  privateKey: {
    keyPath: string;
    key?: CryptoKey;
  };
  publicKey: {
    keyPath: string;
    rawKeyPath: string;
    key?: CryptoKey;
  };
}

export async function setupDatabaseSecurity() {
  // let publicKey;
  // let privateKey;
  // let supporterPrivateKey;
  // let supporterPublicKey;
  const keyPairs: KeyPair[] = [];
  keyPairs.push(
    {
      privateKey: {
        keyPath: "src/db/key/private-key.pem",
      },
      publicKey: {
        keyPath: "src/db/key/public-key.pem",
        rawKeyPath: "src/db/key/public-key-raw.txt",
      },
    },
    {
      privateKey: {
        keyPath: "src/db/key/supporter-private-key.pem",
      },
      publicKey: {
        keyPath: "src/db/key/supporter-public-key.pem",
        rawKeyPath: "src/db/key/supporter-public-key-raw.txt",
      },
    },
  );
  keyPairs.forEach(async (keyPair) => {
    // 1. Check if keys already exist to avoid overwriting them
    if (existsSync(keyPair.privateKey.keyPath)) {
      console.log("Keys found. Loading existing keys...");
      const privateKeyPem = readFileSync(keyPair.privateKey.keyPath, "utf-8");
      const publicKeyPem = readFileSync(keyPair.publicKey.keyPath, "utf-8");
      keyPair.privateKey.key = await jose.importPKCS8(privateKeyPem, "Ed25519");
      keyPair.publicKey.key = await jose.importSPKI(publicKeyPem, "Ed25519");
    } else {
      // 1. Create new keys if not found
      const keys = await jose.generateKeyPair("EdDSA", {
        extractable: true,
        crv: "Ed25519",
      });
      keyPair.privateKey.key = keys.privateKey;
      keyPair.publicKey.key = keys.publicKey;
      // Export and save Private Key (SECRET)
      const pkcs8Pem = await jose.exportPKCS8(keyPair.privateKey.key);
      writeFileSync(keyPair.privateKey.keyPath, pkcs8Pem);

      // Export and save Public Key (Share this with sqld)
      const spkiPem = await jose.exportSPKI(keyPair.publicKey.key);
      writeFileSync(keyPair.publicKey.keyPath, spkiPem);
      console.log("Keys saved: private-key.pem and public-key.pem");
    }

    // 2. Extract the raw 32-byte public key string (the 'x' parameter)
    const jwk = await jose.exportJWK(keyPair.publicKey.key);
    const publicKeyRawString = jwk.x; // e.g., "b3JeIl7GnNQ0jootBiP+7Pn0zxbtmz45hbfJJcuB2Os="
    if (publicKeyRawString) {
      // Clean the string to be URL-safe for sqld (swap + for - and / for _)
      const publicKeyRaw = publicKeyRawString
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      writeFileSync(keyPair.publicKey.rawKeyPath, publicKeyRaw);
      console.log(`Raw keys saved: public-key-raw.txt and public-key-sqld.txt`);
    }

    // 3. Helper to sign tokens
    // 4. Generate the tokens
    const roToken = await createToken("ro", keyPair.privateKey.key!);
    const rwToken = await createToken("rw", keyPair.privateKey.key!);
    console.log("\n--- TOKEN STRINGS ---");
    console.log(`READ_ONLY_TOKEN: ${roToken}`);
    console.log(`READ_WRITE_TOKEN: ${rwToken}`);
  });
}
async function createToken(access: "ro" | "rw", key: CryptoKey) {
  return await new jose.SignJWT({ a: access })
    .setProtectedHeader({ alg: "EdDSA" })
    .setIssuedAt()
    .setExpirationTime("1y") // Valid for 1 year
    .sign(key);
}

setupDatabaseSecurity().catch(console.error);
