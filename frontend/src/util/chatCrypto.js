const E2EE_PREFIX = "e2ee:v1:";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecret() {
  return import.meta.env.VITE_CHAT_E2EE_SECRET || "PetNexusChatE2EEChangeMe";
}

function getSalt(chat) {
  const ownerId = chat?.ownerId ?? "owner";
  const providerId = chat?.providerId ?? "provider";
  return encoder.encode(`petnexus-chat:${ownerId}:${providerId}`);
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(chat) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: getSalt(chat),
      iterations: 120000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptChatMessage(chat, plainText) {
  const key = await deriveKey(chat);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plainText)
  );

  return `${E2EE_PREFIX}${bytesToBase64(iv)}:${bytesToBase64(
    new Uint8Array(ciphertext)
  )}`;
}

export async function decryptChatMessage(chat, content) {
  if (!content?.startsWith(E2EE_PREFIX)) {
    return "[Encrypted message unavailable]";
  }

  const parts = content.split(":");
  if (parts.length !== 4) {
    return "[Encrypted message unavailable]";
  }

  try {
    const key = await deriveKey(chat);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(parts[2]) },
      key,
      base64ToBytes(parts[3])
    );

    return decoder.decode(plaintext);
  } catch {
    return "[Unable to decrypt this message]";
  }
}
