export type Role = 
  | 'super_admin' 
  | 'admin' 
  | 'product_manager' 
  | 'order_manager' 
  | 'finance_manager'
  | 'support_agent' 
  | 'content_manager' 
  | 'marketing_manager'
  | 'read_only'
  | 'customer';

export type ProductType = 'digital' | 'physical_projector';
export type ProductSource = 'internal' | 'g2g_authorized' | 'g2g_marketplace' | 'supplier' | 'manual';
export type ProductStatus = 'published' | 'draft' | 'archived' | 'pending_approval';

export interface NavItem {
  id: string;
  label: string;
  target: string; // 'limited-time', 'flash-deals', 'trending-week', 'best-sellers', 'projectors', or category ID / URL
  type: 'section' | 'category' | 'filter' | 'custom' | 'external';
  badgeText?: string;
  badgeColor?: 'yellow' | 'red' | 'blue' | 'green';
  icon?: string;
  isActive: boolean;
  order: number;
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  country?: string;
  countryCode?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  profileCompleted?: boolean;
  primaryAuthProvider?: 'email' | 'google' | 'facebook' | 'x' | 'tiktok';
  authProviders?: Array<'email' | 'google' | 'facebook' | 'x' | 'tiktok'>;
  authProviderId?: string;
  twoFactorEnabled: boolean;
  addresses: UserAddress[];
  totalSpent: number;
  ordersCount: number;
  wishlist: string[]; // product IDs
  status: 'active' | 'suspended' | 'pending_verification' | 'blocked' | 'deleted';
  createdAt: string;
  lastLogin?: string;
  passwordHash?: string; // bcrypt hash — never expose to client, never log
  resetToken?: string; // temporary token for password reset — never expose to client
  resetTokenExpires?: number; // epoch ms when reset token expires
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  isFeatured: boolean;
  productCount: number;
  bannerImage?: string;
  displayOrder: number;
}

export interface ProductVariation {
  id: string;
  type: string; // e.g. "Duration", "Edition", "Region", "Resolution / RAM"
  value: string; // e.g. "1 Month", "1 Year", "Global", "Ultimate Edition", "4K / 32GB"
  price: number;
  costPrice?: number;
  stock: number;
  sku?: string;
  isAvailable?: boolean;
  normalizedKey?: string; // product_id + variation_type + variation_value
}

export interface ProjectorSpecs {
  brand?: string;
  model?: string;
  nativeResolution: string; // "3840x2160 (4K UHD)" or "1920x1080 (FHD)"
  maxResolutionSupported?: string;
  brightness: string; // "2400 ANSI Lumens"
  throwRatio: string; // "1.2:1"
  screenSize?: string; // "40'' - 200''"
  androidTvVersion?: string; // "Android TV 11.0 / Google TV"
  ram?: string; // "2GB" or "4GB DDR4"
  storage?: string; // "32GB" or "64GB eMMC"
  wifi?: string; // "Wi-Fi 6 (Dual Band 2.4G/5G)"
  bluetooth?: string; // "Bluetooth 5.2 (Bidirectional)"
  hdmiPorts?: string; // "2x HDMI 2.1 (eARC support)"
  usbPorts?: string; // "2x USB 3.0"
  speaker?: string; // "Dual 10W Harman Kardon / Dolby Audio"
  speakerSpecs?: string;
  keystone?: string; // "Real-time Omni-directional Auto Keystone ±45°"
  keystoneCorrection?: string;
  autoFocus?: string; // "Laser ToF Instant Auto-Focus (0.8s)"
  operatingSystem?: string;
  warranty?: string; // "2 Years Official Global Warranty"
  shippingInfo?: string;
  connectivity?: string[];
  weight?: string; // "1.85 kg"
  dimensions?: string; // "210 x 205 x 140 mm"
  includedAccessories?: string[];
  shippingCarrier?: string;
  estimatedTransitDays?: string;
}

export interface Review {
  id: string;
  author: string;
  authorEmail: string;
  rating: number; // 1 - 5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  date: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  productType: ProductType;
  productSource?: ProductSource;
  
  price: number;
  compareAtPrice: number;
  costPrice?: number;
  discountPercent: number;
  taxRate?: number; // 0.0 to 0.20
  
  images: string[];
  videoUrl?: string;
  
  variations: ProductVariation[];
  
  // Digital specific
  instantDeliveryFormat?: 'license_key' | 'account_credentials' | 'download_link' | 'activation_token';
  deliveryInstructions?: string;
  digitalStockKeys?: string[]; // keys waiting to be dispatched
  
  // Physical Projector specific
  projectorSpecs?: ProjectorSpecs;
  
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isTrendingWeek?: boolean;
  isBestSeller?: boolean;
  isFlashDeal?: boolean;
  isLimitedTime?: boolean;
  totalSold?: number;
  offerBadgeText?: string;
  offerBadgeColor?: 'yellow' | 'red' | 'blue' | 'green';
  flashDealEnd?: string;
  status: ProductStatus;
  
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  
  stock: number;
  lowStockThreshold: number;
  sku: string;
  supplierName?: string;
  
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  
  faqs?: { question: string; answer: string }[];
  frequentlyBoughtTogetherIds?: string[];
  
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productType: ProductType;
  productImage?: string;
  variationId?: string;
  variationTitle?: string;
  variation?: ProductVariation;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  totalPrice?: number;
  licenseKeys?: string[];
  trackingNumber?: string;
  
  // Fulfilled payload
  digitalDelivery?: {
    type: 'license_key' | 'account_credentials' | 'download_link' | 'activation_token';
    content: string;
    credentials?: { username?: string; password?: string; token?: string };
    downloadUrl?: string;
    instructions: string;
    claimed: boolean;
  };
  
  shipment?: {
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string;
  };
}

export type PaymentMethod = 
  | 'stripe' 
  | 'lemonsqueezy' 
  | 'paypal' 
  | 'jazzcash' 
  | 'easypaisa' 
  | 'bank_transfer' 
  | 'crypto';

export type PaymentGateway = PaymentMethod;
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type FulfillmentStatus = 'delivered_digital' | 'shipped_physical' | 'partially_fulfilled' | 'pending' | 'cancelled';
export type DeliveryStatus = 'instant_ready' | 'dispatched' | 'in_transit' | 'out_for_delivery' | 'delivered';
export type OrderStatus = 'completed' | 'shipped' | 'processing' | 'refunded';

export interface Order {
  id: string;
  orderNumber?: string;
  userId?: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: UserAddress;
  
  items: OrderItem[];
  
  subtotal?: number;
  discount?: number;
  tax?: number;
  shippingFee?: number;
  total: number;
  currency?: string;
  
  paymentMethod?: PaymentMethod;
  paymentGateway?: string;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  
  fulfillmentStatus?: FulfillmentStatus;
  deliveryStatus?: DeliveryStatus;
  orderStatus?: OrderStatus;
  
  couponCode?: string;
  customerNotes?: string;
  digitalDeliveredAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface DigitalDeliveryRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  customerEmail: string;
  deliveryType: 'license_key' | 'account_credentials' | 'download_link' | 'activation_token';
  dataPayload: {
    key?: string;
    username?: string;
    password?: string;
    downloadUrl?: string;
    guide?: string;
  };
  isClaimed: boolean;
  claimedAt?: string;
  createdAt: string;
}

export interface ShipmentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerAddress: UserAddress;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  status: 'processing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed';
  estimatedDelivery: string;
  timeline: {
    date: string;
    status: string;
    location: string;
    notes: string;
  }[];
  createdAt: string;
}

export interface G2GSupplierConnector {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'testing';
  apiKey?: string;
  apiKeyMasked: string;
  endpoint: string;
  environment?: 'production' | 'sandbox';
  marginMarkupPercent: number;
  markupType: 'percentage' | 'fixed';
  markupValue: number; // e.g. 15 for +15%
  autoSync?: boolean;
  autoSyncStock: boolean;
  autoSyncPrice: boolean;
  lastSync: string;
  lastSyncedAt: string;
  currency: string;
  exchangeRateToUSD: number;
  categoryMappings?: {
    externalCategory: string;
    localCategoryId: string;
    autoApprove: boolean;
  }[];
}

export interface ImportJob {
  id: string;
  source: 'g2g_api' | 'csv_upload' | 'supplier_feed' | 'manual_batch';
  status: 'completed' | 'processing' | 'pending_approval' | 'failed';
  totalCount: number;
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  items: Partial<Product>[];
  logs: string[];
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetType: 'product' | 'order' | 'inventory' | 'import' | 'content' | 'settings';
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  maxUsage?: number;
  usageCount: number;
  expiryDate?: string;
  expiresAt?: string;
  isActive?: boolean;
  status?: 'active' | 'expired' | 'disabled';
}

export type PromoCoupon = Coupon;

export interface ContentSection {
  announcementBar: {
    enabled: boolean;
    text: string;
    linkUrl?: string;
    badgeText?: string;
  };
  heroBanner: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    highlightBadge: string;
    featuredProductIds: string[];
  };
  flashSale: {
    enabled: boolean;
    title: string;
    endTime: string;
    discountHighlight: string;
  };
  promotionalPopup: {
    enabled: boolean;
    title: string;
    body: string;
    couponCode?: string;
    buttonText: string;
  };
  faqs: {
    question: string;
    answer: string;
    category?: string;
  }[];
  socialLinks: {
    whatsapp: string;
    telegram: string;
    discord: string;
    email: string;
  };
}

// ============================================
// IPTV M3U SERVERS
// ============================================

export type IptvServerStatus = 'online' | 'offline' | 'degraded';

export interface IptvServer {
  id: string;
  name: string;
  endpointUrl: string;
  playlistUrl: string;
  status: IptvServerStatus;
  channels: number;
  activeConnections: number;
  maxConnections: number;
  uptime: number; // percentage 0–100
  bufferRate: number; // percentage 0–1
  location: string;
  provider: string;
  lastCheckedAt: string;
  isActive: boolean;
}

export type IptvCredentialStatus = 'active' | 'expired' | 'revoked';

export interface IptvCredential {
  id: string;
  username: string;
  passwordMasked: string; // never expose the real password
  assignedTo: string; // customer email or name
  serverId: string;
  serverName: string;
  expiresAt: string;
  status: IptvCredentialStatus;
  createdAt: string;
  lastUsedAt?: string;
}

// ============================================
// WOOCOMMERCE BRIDGE
// ============================================

export type WooCommerceConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export interface WooCommerceConnection {
  id: string;
  storeName: string;
  storeUrl: string;
  status: WooCommerceConnectionStatus;
  consumerKeyMasked: string; // never expose real key
  environment: 'production' | 'staging';
  lastSyncAt: string;
  productsSynced: number;
  ordersSynced: number;
  pendingConflicts: number;
  autoSync: boolean;
  syncIntervalMinutes: number;
}

export type SyncConflictField = 'price' | 'stock' | 'title' | 'sku';
export type SyncConflictStatus = 'pending' | 'resolved_local' | 'resolved_remote';

export interface SyncConflict {
  id: string;
  connectionId: string;
  storeName: string;
  productTitle: string;
  productSku: string;
  field: SyncConflictField;
  localValue: string;
  remoteValue: string;
  status: SyncConflictStatus;
  detectedAt: string;
}

// ============================================
// SUBSCRIPTIONS
// ============================================

export type BillingCycle = 'weekly' | 'monthly' | 'yearly';
export type SubscriptionPlanStatus = 'active' | 'archived';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  billingCycle: BillingCycle;
  price: number;
  trialDays: number;
  isActive: boolean;
  status: SubscriptionPlanStatus;
  subscribers: number;
  mrr: number; // monthly recurring revenue contribution
}

export type CustomerSubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';

export interface CustomerSubscription {
  id: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  billingCycle: BillingCycle;
  status: CustomerSubscriptionStatus;
  startedAt: string;
  renewsAt: string;
  amount: number;
  failedAttempts: number;
}

// ============================================
// WEBSITE BUILDER CMS
// ============================================

export type PageStatus = 'published' | 'draft' | 'scheduled';

export interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  sections: string[]; // block IDs
  lastEditedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
}

export interface BlockLibraryItem {
  id: string;
  name: string;
  category: 'hero' | 'grid' | 'cta' | 'faq' | 'testimonial' | 'footer' | 'form';
  preview: string;
  usageCount: number;
}

// ============================================
// ANALYTICS & TRAFFIC
// ============================================

export interface AnalyticsMetric {
  label: string;
  value: number;
  change: number; // percentage change vs previous period
  trend: 'up' | 'down' | 'flat';
}

export interface FunnelStep {
  step: string;
  visitors: number;
  conversionRate: number; // percentage 0–100
}

// ============================================
// DISCOUNTS & COUPONS — uses existing Coupon type
// ============================================

// ============================================
// SUPPORT TICKETS
// ============================================

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed';
export type TicketChannel = 'email' | 'whatsapp' | 'in_app' | 'social';

export interface SupportTicket {
  id: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  priority: TicketPriority;
  status: TicketStatus;
  channel: TicketChannel;
  assignedTo: string;
  slaMinutesRemaining: number; // negative if breached
  createdAt: string;
  lastReplyAt: string;
  messageCount: number;
  latestMessage?: string;
}

// ============================================
// SOCIAL AUTOMATION
// ============================================

export type SocialPlatform = 'tiktok' | 'instagram' | 'x' | 'facebook' | 'linkedin';
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface ScheduledPost {
  id: string;
  content: string;
  platforms: SocialPlatform[];
  status: PostStatus;
  scheduledAt: string;
  publishedAt?: string;
  engagement?: { likes: number; comments: number; shares: number };
  mediaUrl?: string;
  hashtags: string[];
  createdBy: string;
}

// ============================================
// TIKTOK LEADS ENGINE
// ============================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface TikTokLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  campaign: string;
  adGroup: string;
  creative: string;
  audience: string;
  status: LeadStatus;
  costPerLead: number;
  capturedAt: string;
  followedUpAt?: string;
  convertedToCustomerId?: string;
}

// ============================================
// EMAIL & SMS CAMPAIGNS
// ============================================

export type CampaignChannel = 'email' | 'sms' | 'both';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
export type CampaignTrigger = 'manual' | 'abandoned_cart' | 'post_purchase' | 'win_back' | 'welcome';

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  trigger: CampaignTrigger;
  audienceSize: number;
  sentCount: number;
  openRate: number; // percentage 0–100
  clickRate: number; // percentage 0–100
  bounceRate: number; // percentage 0–100
  scheduledAt?: string;
  sentAt?: string;
  subject: string;
  preview: string;
}

// ============================================
// FINANCIAL BALANCE
// ============================================

export interface GatewayBalance {
  id: string;
  gateway: string;
  available: number;
  pending: number;
  currency: string;
  nextSettlementAt: string;
  settlementFrequency: string;
  icon: string;
}

// ============================================
// JAZZCASH & MERCHANT
// ============================================

export type JazzCashTxStatus = 'success' | 'failed' | 'pending' | 'refunded';

export interface JazzCashTransaction {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: JazzCashTxStatus;
  method: 'wallet' | 'card' | 'iban' | 'qr';
  merchantId: string;
  timestamp: string;
}

// ============================================
// PAYMENT PROOFS
// ============================================

export type ProofStatus = 'pending_review' | 'approved' | 'rejected' | 'linked';

export interface PaymentProof {
  id: string;
  orderId?: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  fileName: string;
  fileSizeKb: number;
  ocrExtractedAmount?: number;
  ocrExtractedReference?: string;
  status: ProofStatus;
  uploadedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// ============================================
// SECURITY & AUDIT LOGS — extends existing AdminLog
// ============================================

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  geo: string;
  success: boolean;
  timestamp: string;
  userAgent: string;
}

export interface SecretRotation {
  id: string;
  secretName: string;
  lastRotatedAt: string;
  rotationIntervalDays: number;
  isOverdue: boolean;
}
