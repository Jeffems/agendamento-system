import test from "node:test";
import assert from "node:assert/strict";

process.env.WHATSAPP_CONFIG_SECRET = "segredo-de-teste-com-tamanho-suficiente";

const { encrypt, decrypt } = await import("./crypto.js");

test("criptografa e descriptografa token com autenticação", () => {
  const original = "token-secreto-do-whatsapp";
  const criptografado = encrypt(original);

  assert.match(criptografado, /^v2:/);
  assert.equal(decrypt(criptografado), original);
});

test("detecta alteração no conteúdo criptografado", () => {
  const criptografado = encrypt("token-original");
  const adulterado = `${criptografado.slice(0, -1)}${
    criptografado.endsWith("0") ? "1" : "0"
  }`;

  assert.throws(() => decrypt(adulterado));
});
