
import { EscrowContract, EscrowStep } from '../types';

// Simulating the Rust Backend Logic (Crypto + Auth)

const WORDLIST = [
  'alpha', 'beacon', 'cable', 'delta', 'echo', 'falcon', 'ghost', 'hotel', 'india', 
  'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 
  'sierra', 'tango', 'uniform', 'vector', 'whiskey', 'xray', 'yankee', 'zulu',
  'orbit', 'nexus', 'pulse', 'grid', 'cyber', 'void', 'flux', 'core', 'node', 'shards'
];

export const generateMnemonic = (): string => {
  const phrase = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * WORDLIST.length);
    phrase.push(WORDLIST[randomIndex]);
  }
  return phrase.join(' ');
};

export const simulateArgon2Hash = async (password: string): Promise<string> => {
  // Mocking the time-cost of Argon2
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`$argon2id$v=19$m=65536,t=3,p=4$${btoa(password)}${Math.random().toString(36)}`);
    }, 800);
  });
};

export const validateSearchQuery = (query: string, item: any): boolean => {
  const q = query.toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    item.hash.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q)
  );
};

// --- ROUND ROBIN CRYPTO SIMULATION ---

export const initiateRoundRobinSign = async (orderId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[WASM] Order ${orderId}: Generating Alpha Nonce...`);
      console.log(`[WASM] Order ${orderId}: Computing Partial CLSAG signatures...`);
      console.log(`[WASM] Order ${orderId}: Encrypting Alpha with ECDH Shared Secret...`);
      resolve();
    }, 2500); // 2.5s simulated computation
  });
};

export const completeRoundRobinSign = async (orderId: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[WASM] Order ${orderId}: Decrypting Alpha Nonce...`);
      console.log(`[WASM] Order ${orderId}: Aggregating s_values...`);
      console.log(`[NET] Broadcasting Final TX...`);
      resolve(`tx_${Math.random().toString(36).substring(2, 15)}`);
    }, 3000); // 3s simulated computation
  });
};

// --- MOCK ESCROW DATA GENERATOR ---

export const generateMockContracts = (username: string, isVendor: boolean): EscrowContract[] => {
  const role = isVendor ? 'SELLER' : 'BUYER';
  
  return [
    {
      id: 'CTR-8821-X',
      orderId: 'ORD-9928-AX',
      listingTitle: 'QUANTUM_DATA_SHARD_V4',
      listingImage: `https://picsum.photos/seed/escrow1/200/200`,
      role: role,
      counterparty: isVendor ? 'BUYER_GHOST_01' : 'VENDOR_NEXUS_PRIME',
      amount: '4.2500',
      multisigAddress: '888tNkZrPN6JsEgekjMnQwT4wQ8J7K9Lz1y3pQ',
      currentStep: EscrowStep.SHIPPED,
      createdAt: '2023-11-28T10:00:00Z',
      lockedAt: '2023-11-28T10:30:00Z',
      autoReleaseAt: '2023-12-12T10:30:00Z'
    },
    {
      id: 'CTR-9942-B',
      orderId: 'ORD-5541-XY',
      listingTitle: 'NEURAL_INTERFACE_KIT',
      listingImage: `https://picsum.photos/seed/escrow2/200/200`,
      role: role,
      counterparty: isVendor ? 'BUYER_PHANTOM_99' : 'VENDOR_CYBER_DYNE',
      amount: '12.5000',
      multisigAddress: '888tNkZrPN6JsEgekjMnQwT4wQ8J7K9Lz1y3pQ',
      currentStep: EscrowStep.FUNDS_LOCKED,
      createdAt: '2023-11-29T08:15:00Z',
      lockedAt: '2023-11-29T08:45:00Z'
    },
    {
      id: 'CTR-3311-C',
      orderId: 'ORD-3321-CC',
      listingTitle: 'ENCRYPTED_SSD_BATCH_50',
      listingImage: `https://picsum.photos/seed/escrow3/200/200`,
      role: role,
      counterparty: isVendor ? 'BUYER_ZERO_COOL' : 'VENDOR_SYSTEM_SHOCK',
      amount: '0.8500',
      multisigAddress: '888tNkZrPN6JsEgekjMnQwT4wQ8J7K9Lz1y3pQ',
      currentStep: EscrowStep.SIGNATURE_PARTIAL, // Awaiting final signature
      createdAt: '2023-11-27T14:20:00Z',
      lockedAt: '2023-11-27T15:00:00Z'
    }
  ];
};