import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment variable or generate a default one
 * In production, ENCRYPTION_KEY should be set in environment variables
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (!envKey) {
    // Fallback: use a default key (not secure for production)
    // This is only for development - production MUST set ENCRYPTION_KEY
    console.warn('WARNING: ENCRYPTION_KEY not set. Using default key (not secure for production).');
    return crypto.scryptSync('default-key-change-in-production', 'salt', KEY_LENGTH);
  }
  
  // If ENCRYPTION_KEY is provided, use it directly (should be 32 bytes/64 hex chars)
  // If it's shorter, derive a key from it
  if (envKey.length === 64) {
    // Assume it's a hex string
    return Buffer.from(envKey, 'hex');
  }
  
  // Derive key from environment variable
  return crypto.scryptSync(envKey, 'salt', KEY_LENGTH);
}

/**
 * Encrypts a string value using AES-256-GCM
 * Returns a hex-encoded string containing: salt + iv + encrypted data + auth tag
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Cannot encrypt empty string');
  }
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  // Derive a key from the master key and salt
  const derivedKey = crypto.scryptSync(key, salt, KEY_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Combine: salt + iv + tag + encrypted data
  return salt.toString('hex') + ':' + iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts a hex-encoded string encrypted with encrypt()
 * Expects format: salt:iv:tag:encrypted
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error('Cannot decrypt empty string');
  }
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted format');
    }
    
    const [saltHex, ivHex, tagHex, encrypted] = parts;
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const key = getEncryptionKey();
    const derivedKey = crypto.scryptSync(key, salt, KEY_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

