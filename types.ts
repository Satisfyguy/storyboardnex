

export interface ListingItem {
  id: string;
  title: string;
  price: string;
  hash: string;
  image: string;
  category: string;
  status?: OrderState;
  // Business Logic Fields
  stock: number;
  vendorRating: number;
  isVerified: boolean;
  views: number;
}

export interface BagItem extends ListingItem {
  quantity: number;
}

export interface NetworkStatus {
  nodes: number;
  latency: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  encryption: string;
}

export enum ViewMode {
  GRID = 'GRID',
  LIST = 'LIST'
}

export enum AppView {
  HOME = 'HOME',
  PROFILE = 'PROFILE',
  CHECKOUT = 'CHECKOUT'
}

export enum OrderState {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  ESCROW_LOCKED = 'ESCROW_LOCKED',
  SIGNING_INITIATED = 'SIGNING_INITIATED', // Buyer has signed PartialTx
  SHIPPED = 'SHIPPED',
  FINALIZED = 'FINALIZED',
  DISPUTE = 'DISPUTE'
}

export enum EscrowStep {
  AWAITING_DEPOSIT = 0,
  FUNDS_LOCKED = 1,      // 2-of-3 Address Funded
  SHIPPING_PENDING = 2,  // Vendor working
  SHIPPED = 3,           // Vendor sent goods
  SIGNATURE_PARTIAL = 4, // Buyer Signed (Round-Robin Step 1)
  COMPLETED = 5,         // Vendor Signed (Round-Robin Step 2)
  DISPUTE = 6
}

export interface EscrowContract {
  id: string;
  orderId: string;
  listingTitle: string;
  listingImage: string;
  role: 'BUYER' | 'SELLER';
  counterparty: string; // Username
  amount: string;       // XMR
  multisigAddress: string;
  currentStep: EscrowStep;
  
  // Timestamps
  createdAt: string;
  lockedAt?: string;
  autoReleaseAt?: string; // Timeout safety
  
  // Cryptographic Proofs
  depositTxHash?: string;
  finalTxHash?: string;
}

export interface User {
  username: string;
  mnemonic?: string; // Only visible on creation
  isVendor: boolean;
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  date: string;
  author: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}