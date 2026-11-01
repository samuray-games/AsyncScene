import cbor from 'cbor';
import { createHash, generateKeyPairSync, randomBytes, sign } from 'node:crypto';

export function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function clientData(type, challenge, origin) {
  return Buffer.from(JSON.stringify({ type, challenge, origin, crossOrigin: false }));
}

function authenticatorData(rpId, flags, counter, tail = Buffer.alloc(0)) {
  const rpHash = createHash('sha256').update(rpId).digest();
  const count = Buffer.alloc(4);
  count.writeUInt32BE(counter >>> 0);
  return Buffer.concat([rpHash, Buffer.from([flags]), count, tail]);
}

function credentialKey() {
  const pair = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jwk = pair.publicKey.export({ format: 'jwk' });
  const cose = new Map([
    [1, 2], [3, -7], [-1, 1], [-2, Buffer.from(jwk.x, 'base64url')], [-3, Buffer.from(jwk.y, 'base64url')],
  ]);
  return { privateKey: pair.privateKey, cosePublicKey: cbor.encode(cose), credentialId: randomBytes(32) };
}

export function virtualAuthenticator() {
  return credentialKey();
}

export function registrationResponse(options, credential, { origin = 'http://localhost:8787', rpId = 'localhost', flags = 0x45, challenge = options.challenge, corruptRpHash = false } = {}) {
  const client = clientData('webauthn.create', challenge, origin);
  const id = credential.credentialId;
  const tail = Buffer.concat([Buffer.alloc(16), Buffer.from([(id.length >> 8) & 255, id.length & 255]), id, credential.cosePublicKey]);
  const auth = authenticatorData(corruptRpHash ? 'wrong.example' : rpId, flags, 0, tail);
  const attestationObject = cbor.encode({ fmt: 'none', attStmt: {}, authData: auth });
  const encodedId = base64url(id);
  return {
    id: encodedId, rawId: encodedId, type: 'public-key',
    response: { clientDataJSON: base64url(client), attestationObject: base64url(attestationObject), transports: ['internal'] },
    clientExtensionResults: {}, authenticatorAttachment: 'platform',
  };
}

export function assertionResponse(options, credential, {
  origin = 'http://localhost:8787', rpId = 'localhost', flags = 0x05, counter = 1,
  challenge = options.challenge, userHandle, corruptSignature = false, corruptRpHash = false,
} = {}) {
  const client = clientData('webauthn.get', challenge, origin);
  const auth = authenticatorData(corruptRpHash ? 'wrong.example' : rpId, flags, counter);
  const clientHash = createHash('sha256').update(client).digest();
  const signature = sign('sha256', Buffer.concat([auth, clientHash]), credential.privateKey);
  if (corruptSignature) signature[signature.length - 1] ^= 0x01;
  const encodedId = base64url(credential.credentialId);
  return {
    id: encodedId, rawId: encodedId, type: 'public-key',
    response: {
      clientDataJSON: base64url(client), authenticatorData: base64url(auth),
      signature: base64url(signature), userHandle,
    },
    clientExtensionResults: {}, authenticatorAttachment: 'platform',
  };
}
