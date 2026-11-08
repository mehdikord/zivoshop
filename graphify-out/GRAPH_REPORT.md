# Graph Report - zivoshop  (2026-11-08)

## Corpus Check
- 366 files · ~629,229 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: (none) 13, .css 2, .ico 1)

## Summary
- 5814 nodes · 9595 edges · 194 communities (108 shown, 86 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d4c0df5c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Product.ts
- prismaNamespace.ts
- Order.ts
- User.ts
- ProductVariant.ts
- Address.ts
- Category.ts
- Review.ts
- style-guide/page.tsx
- OrderStatusHistory.ts
- ProductColor.ts
- Badge
- City.ts
- OrderItem.ts
- ProductSize.ts
- Wishlist.ts
- commonInputTypes.ts
- Color.ts
- Size.ts
- prismaNamespaceBrowser.ts
- Province.ts
- storefront.ts
- addresses/page.tsx
- Admin.ts
- Media.ts
- Payment.ts
- ProductDetail.ts
- SearchLog.ts
- ProductImage.ts
- ProductVideo.ts
- ReviewImage.ts
- Coupon.ts
- Button
- Brand.ts
- MediaFolder.ts
- product-detail-page.tsx
- pnpm allowBuilds (prisma, esbuild, sharp, unrs-resolver)
- cart-drawer.tsx
- Banner.ts
- PersonalAccessToken.ts
- ActivityLog.ts
- PasswordResetToken.ts
- SiteSetting.ts
- ContactMessage.ts
- Feature.ts
- Newsletter.ts
- Page.ts
- verifyAdminToken
- logActivity
- PrismaClient
- lucide-react
- client.ts
- enums.ts
- next
- app/layout.tsx
- storage.ts
- utils.ts
- jalali-calendar.tsx
- (dashboard)/page.tsx
- sonner
- product-listing.tsx
- dependencies
- Editorial fashion photography
- compilerOptions
- toEnglishDigits
- settings/route.ts
- package.json
- media-picker-dialog.tsx
- admins/route.ts
- components.json
- Zivo_PRD.md
- (dashboard)/products/page.tsx
- ActivityLogDelegate
- AddressDelegate
- AdminDelegate
- BannerDelegate
- BrandDelegate
- CategoryDelegate
- CityDelegate
- ColorDelegate
- ContactMessageDelegate
- CouponDelegate
- FeatureDelegate
- MediaDelegate
- MediaFolderDelegate
- NewsletterDelegate
- OrderDelegate
- OrderItemDelegate
- OrderStatusHistoryDelegate
- PageDelegate
- PasswordResetTokenDelegate
- PaymentDelegate
- PersonalAccessTokenDelegate
- ProductDelegate
- ProductColorDelegate
- ProductDetailDelegate
- ProductImageDelegate
- ProductSizeDelegate
- ProductVariantDelegate
- ProductVideoDelegate
- ProvinceDelegate
- ReviewDelegate
- ReviewImageDelegate
- SearchLogDelegate
- SiteSettingDelegate
- SizeDelegate
- UserDelegate
- WishlistDelegate
- seed-locations.ts
- users/page.tsx
- auth.ts
- zarinpal/route.ts
- header.tsx
- Prisma__ProductClient
- db-config.ts
- devDependencies
- scripts
- categories/page.tsx
- activity-logger.ts
- getCatalogOptions
- search-dialog.tsx
- filter-store.ts
- @prisma/client
- cn
- settings/page.tsx
- banner-form-dialog.tsx
- Prisma__OrderClient
- Prisma__UserClient
- about-client.tsx
- sections/index.ts
- Prisma__AddressClient
- Prisma__CategoryClient
- Prisma__ProductVariantClient
- Prisma__ReviewClient
- Prisma__CityClient
- Prisma__ColorClient
- Prisma__OrderItemClient
- Prisma__OrderStatusHistoryClient
- Prisma__ProductColorClient
- Prisma__ProductSizeClient
- Prisma__ProvinceClient
- Prisma__SizeClient
- Prisma__WishlistClient
- Product photography
- Prisma__AdminClient
- Prisma__BrandClient
- Prisma__CouponClient
- Prisma__MediaClient
- Prisma__MediaFolderClient
- Prisma__PaymentClient
- Prisma__ProductDetailClient
- Prisma__ProductImageClient
- Prisma__ProductVideoClient
- Prisma__ReviewImageClient
- Prisma__SearchLogClient
- product-form.tsx
- Prisma__ActivityLogClient
- Prisma__BannerClient
- Prisma__ContactMessageClient
- Prisma__FeatureClient
- Prisma__NewsletterClient
- Prisma__PageClient
- Prisma__PasswordResetTokenClient
- Prisma__PersonalAccessTokenClient
- Prisma__SiteSettingClient
- PrismaClientBaseOptions
- download-images.sh
- [slug]/page.tsx
- postcss.config.mjs
- migrate-uploads-to-storage.sh
- activity-logs/page.tsx
- product-section.tsx
- hero-slider.tsx
- (dashboard)/orders/[id]/page.tsx
- 38. Footer
- 4. سیستم رنگ
- 63. اولویت‌بندی توسعه
- README.md
- getAllBanners
- 15. صفحه محصولات
- 17. سیستم سایزبندی
- 28. احراز هویت
- 6. اصول کلی UI/UX
- 7. Responsive Design
- 8. ساختار کلی سایت
- CLAUDE.md
- .claude/CLAUDE.md
- 19. صفحه جزئیات محصول
- 25. Order
- 2. اهداف اصلی پروژه
- 3. هویت بصری برند
- 9. Header
- سند نیازمندی‌های محصول (PRD)

## God Nodes (most connected - your core abstractions)
1. `cn()` - 206 edges
2. `next` - 146 edges
3. `verifyAdminToken()` - 130 edges
4. `lucide-react` - 121 edges
5. `Button()` - 119 edges
6. `react` - 119 edges
7. `logActivity()` - 86 edges
8. `extractIp()` - 82 edges
9. `extractUserAgent()` - 82 edges
10. `toEnglishDigits()` - 71 edges

## Surprising Connections (you probably didn't know these)
- `AdminLoginPage()` --calls--> `toEnglishDigits()`  [EXTRACTED]
  app/admin/(auth)/login/page.tsx → lib/utils.ts
- `GET()` --calls--> `verifyAdminToken()`  [EXTRACTED]
  app/api/admin/activity-logs/route.ts → lib/auth.ts
- `GET()` --calls--> `verifyAdminToken()`  [EXTRACTED]
  app/api/admin/admins/[id]/route.ts → lib/auth.ts
- `GET()` --calls--> `verifyAdminToken()`  [EXTRACTED]
  app/api/admin/admins/route.ts → lib/auth.ts
- `GET()` --calls--> `verifyAdminToken()`  [EXTRACTED]
  app/api/admin/banners/[id]/route.ts → lib/auth.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Outerwear / cold-weather looks** — public_images_editorial_c, public_images_editorial_coat2, public_images_editorial_d [INFERRED 0.75]
- **Apparel catalog product shots (beauty-* files)** — public_images_beauty_1, public_images_beauty_2, public_images_beauty_3 [INFERRED 0.85]
- **Editorial model shoots for storefront** — public_images_editorial_h, public_images_editorial_i, public_images_editorial_j, public_images_editorial_white, public_images_rack_clothes [INFERRED 0.85]
- **Head-and-shoulders model portraits** — public_images_editorial_a, public_images_editorial_b, public_images_editorial_coat, public_images_editorial_e, public_images_editorial_f [INFERRED 0.85]
- **Placeholder fallback assets** — public_images_placeholder_jpg, public_images_placeholder_svg, public_images_product_placeholder_image [INFERRED 0.95]

## Communities (194 total, 86 thin omitted)

### Community 0 - "Product.ts"
Cohesion: 0.01
Nodes (195): AggregateProduct, DecimalFieldUpdateOperationsInput, EnumProductStatusFieldUpdateOperationsInput, GetProductAggregateType, GetProductGroupByPayload, NullableIntFieldUpdateOperationsInput, Product$detailsArgs, Product$imagesArgs (+187 more)

### Community 1 - "prismaNamespace.ts"
Cohesion: 0.01
Nodes (190): ActivityLogOrderByRelevanceFieldEnum, ActivityLogScalarFieldEnum, AddressOrderByRelevanceFieldEnum, AddressScalarFieldEnum, AdminOrderByRelevanceFieldEnum, AdminScalarFieldEnum, AnyNull, Args (+182 more)

### Community 2 - "Order.ts"
Cohesion: 0.02
Nodes (128): AggregateOrder, EnumOrderStatusFieldUpdateOperationsInput, GetOrderAggregateType, GetOrderGroupByPayload, Order$couponArgs, Order$itemsArgs, Order$paymentsArgs, Order$statusHistoriesArgs (+120 more)

### Community 3 - "User.ts"
Cohesion: 0.02
Nodes (116): AggregateUser, GetUserAggregateType, GetUserGroupByPayload, User$addressesArgs, User$ordersArgs, User$reviewsArgs, User$searchLogsArgs, User$wishlistsArgs (+108 more)

### Community 4 - "ProductVariant.ts"
Cohesion: 0.02
Nodes (106): AggregateProductVariant, GetProductVariantAggregateType, GetProductVariantGroupByPayload, ProductVariant$colorArgs, ProductVariant$sizeArgs, ProductVariantAggregateArgs, ProductVariantAvgAggregateInputType, ProductVariantAvgAggregateOutputType (+98 more)

### Community 5 - "Address.ts"
Cohesion: 0.02
Nodes (104): AddressAggregateArgs, AddressAvgAggregateInputType, AddressAvgAggregateOutputType, AddressAvgOrderByAggregateInput, AddressCountAggregateInputType, AddressCountAggregateOutputType, AddressCountArgs, AddressCountOrderByAggregateInput (+96 more)

### Community 6 - "Category.ts"
Cohesion: 0.02
Nodes (104): AggregateCategory, Category$childrenArgs, Category$parentArgs, Category$productsArgs, CategoryAggregateArgs, CategoryAvgAggregateInputType, CategoryAvgAggregateOutputType, CategoryAvgOrderByAggregateInput (+96 more)

### Community 7 - "Review.ts"
Cohesion: 0.02
Nodes (104): AggregateReview, GetReviewAggregateType, GetReviewGroupByPayload, Review$imagesArgs, ReviewAggregateArgs, ReviewAvgAggregateInputType, ReviewAvgAggregateOutputType, ReviewAvgOrderByAggregateInput (+96 more)

### Community 8 - "style-guide/page.tsx"
Cohesion: 0.11
Nodes (38): metadata, RulesPage(), RULES_SECTIONS, RulesClient(), brandColors, ColorSwatch(), Section(), semanticColors (+30 more)

### Community 9 - "OrderStatusHistory.ts"
Cohesion: 0.02
Nodes (90): AggregateOrderStatusHistory, GetOrderStatusHistoryAggregateType, GetOrderStatusHistoryGroupByPayload, OrderStatusHistory$adminArgs, OrderStatusHistoryAggregateArgs, OrderStatusHistoryAvgAggregateInputType, OrderStatusHistoryAvgAggregateOutputType, OrderStatusHistoryAvgOrderByAggregateInput (+82 more)

### Community 10 - "ProductColor.ts"
Cohesion: 0.02
Nodes (90): AggregateProductColor, GetProductColorAggregateType, GetProductColorGroupByPayload, ProductColorAggregateArgs, ProductColorAvgAggregateInputType, ProductColorAvgAggregateOutputType, ProductColorAvgOrderByAggregateInput, ProductColorCountAggregateInputType (+82 more)

### Community 11 - "Badge"
Cohesion: 0.17
Nodes (44): ALIGN_LABELS, Banner, BannersPage(), POSITION_COLORS, POSITION_LABELS, ContactMessage, ContactMessagesPage(), Coupon (+36 more)

### Community 12 - "City.ts"
Cohesion: 0.02
Nodes (89): AggregateCity, City$addressesArgs, CityAggregateArgs, CityAvgAggregateInputType, CityAvgAggregateOutputType, CityAvgOrderByAggregateInput, CityCountAggregateInputType, CityCountAggregateOutputType (+81 more)

### Community 13 - "OrderItem.ts"
Cohesion: 0.02
Nodes (89): AggregateOrderItem, GetOrderItemAggregateType, GetOrderItemGroupByPayload, OrderItemAggregateArgs, OrderItemAvgAggregateInputType, OrderItemAvgAggregateOutputType, OrderItemAvgOrderByAggregateInput, OrderItemCountAggregateInputType (+81 more)

### Community 14 - "ProductSize.ts"
Cohesion: 0.02
Nodes (89): AggregateProductSize, GetProductSizeAggregateType, GetProductSizeGroupByPayload, ProductSizeAggregateArgs, ProductSizeAvgAggregateInputType, ProductSizeAvgAggregateOutputType, ProductSizeAvgOrderByAggregateInput, ProductSizeCountAggregateInputType (+81 more)

### Community 15 - "Wishlist.ts"
Cohesion: 0.02
Nodes (89): AggregateWishlist, GetWishlistAggregateType, GetWishlistGroupByPayload, WishlistAggregateArgs, WishlistAvgAggregateInputType, WishlistAvgAggregateOutputType, WishlistAvgOrderByAggregateInput, WishlistCountAggregateInputType (+81 more)

### Community 16 - "commonInputTypes.ts"
Cohesion: 0.02
Nodes (85): BigIntFilter, BigIntNullableFilter, BigIntNullableWithAggregatesFilter, BigIntWithAggregatesFilter, BoolFilter, BoolWithAggregatesFilter, DateTimeFilter, DateTimeNullableFilter (+77 more)

### Community 17 - "Color.ts"
Cohesion: 0.02
Nodes (83): AggregateColor, Color$productColorsArgs, Color$productVariantsArgs, ColorAggregateArgs, ColorAvgAggregateInputType, ColorAvgAggregateOutputType, ColorAvgOrderByAggregateInput, ColorCountAggregateInputType (+75 more)

### Community 18 - "Size.ts"
Cohesion: 0.02
Nodes (83): AggregateSize, GetSizeAggregateType, GetSizeGroupByPayload, Size$productSizesArgs, Size$productVariantsArgs, SizeAggregateArgs, SizeAvgAggregateInputType, SizeAvgAggregateOutputType (+75 more)

### Community 19 - "prismaNamespaceBrowser.ts"
Cohesion: 0.02
Nodes (82): ActivityLogOrderByRelevanceFieldEnum, ActivityLogScalarFieldEnum, AddressOrderByRelevanceFieldEnum, AddressScalarFieldEnum, AdminOrderByRelevanceFieldEnum, AdminScalarFieldEnum, AnyNull, BannerOrderByRelevanceFieldEnum (+74 more)

### Community 20 - "Province.ts"
Cohesion: 0.02
Nodes (82): AggregateProvince, GetProvinceAggregateType, GetProvinceGroupByPayload, Province$addressesArgs, Province$citiesArgs, ProvinceAggregateArgs, ProvinceAvgAggregateInputType, ProvinceAvgAggregateOutputType (+74 more)

### Community 21 - "storefront.ts"
Cohesion: 0.12
Nodes (22): GET(), GET(), GET(), POST(), GET(), GET(), findBrandBySlugOrId(), findCategoryBySlugOrId() (+14 more)

### Community 22 - "addresses/page.tsx"
Cohesion: 0.14
Nodes (32): AccountAddresses(), fetchAddresses(), handleDelete(), handleSave(), handleSetDefault(), refreshAddresses(), ApiAddress, mapApiAddress() (+24 more)

### Community 23 - "Admin.ts"
Cohesion: 0.03
Nodes (76): Admin$orderStatusHistoriesArgs, AdminAggregateArgs, AdminAvgAggregateInputType, AdminAvgAggregateOutputType, AdminAvgOrderByAggregateInput, AdminCountAggregateInputType, AdminCountAggregateOutputType, AdminCountArgs (+68 more)

### Community 24 - "Media.ts"
Cohesion: 0.03
Nodes (75): AggregateMedia, GetMediaAggregateType, GetMediaGroupByPayload, Media$folderArgs, MediaAggregateArgs, MediaAvgAggregateInputType, MediaAvgAggregateOutputType, MediaAvgOrderByAggregateInput (+67 more)

### Community 25 - "Payment.ts"
Cohesion: 0.03
Nodes (75): AggregatePayment, EnumPaymentStatusFieldUpdateOperationsInput, GetPaymentAggregateType, GetPaymentGroupByPayload, PaymentAggregateArgs, PaymentAvgAggregateInputType, PaymentAvgAggregateOutputType, PaymentAvgOrderByAggregateInput (+67 more)

### Community 26 - "ProductDetail.ts"
Cohesion: 0.03
Nodes (75): AggregateProductDetail, EnumProductDetailTypeFieldUpdateOperationsInput, GetProductDetailAggregateType, GetProductDetailGroupByPayload, ProductDetailAggregateArgs, ProductDetailAvgAggregateInputType, ProductDetailAvgAggregateOutputType, ProductDetailAvgOrderByAggregateInput (+67 more)

### Community 27 - "SearchLog.ts"
Cohesion: 0.03
Nodes (75): AggregateSearchLog, GetSearchLogAggregateType, GetSearchLogGroupByPayload, SearchLog$userArgs, SearchLogAggregateArgs, SearchLogAvgAggregateInputType, SearchLogAvgAggregateOutputType, SearchLogAvgOrderByAggregateInput (+67 more)

### Community 28 - "ProductImage.ts"
Cohesion: 0.03
Nodes (74): AggregateProductImage, GetProductImageAggregateType, GetProductImageGroupByPayload, ProductImageAggregateArgs, ProductImageAvgAggregateInputType, ProductImageAvgAggregateOutputType, ProductImageAvgOrderByAggregateInput, ProductImageCountAggregateInputType (+66 more)

### Community 29 - "ProductVideo.ts"
Cohesion: 0.03
Nodes (74): AggregateProductVideo, GetProductVideoAggregateType, GetProductVideoGroupByPayload, ProductVideoAggregateArgs, ProductVideoAvgAggregateInputType, ProductVideoAvgAggregateOutputType, ProductVideoAvgOrderByAggregateInput, ProductVideoCountAggregateInputType (+66 more)

### Community 30 - "ReviewImage.ts"
Cohesion: 0.03
Nodes (74): AggregateReviewImage, GetReviewImageAggregateType, GetReviewImageGroupByPayload, ReviewImageAggregateArgs, ReviewImageAvgAggregateInputType, ReviewImageAvgAggregateOutputType, ReviewImageAvgOrderByAggregateInput, ReviewImageCountAggregateInputType (+66 more)

### Community 31 - "Coupon.ts"
Cohesion: 0.03
Nodes (72): AggregateCoupon, Coupon$ordersArgs, CouponAggregateArgs, CouponAvgAggregateInputType, CouponAvgAggregateOutputType, CouponAvgOrderByAggregateInput, CouponCountAggregateInputType, CouponCountAggregateOutputType (+64 more)

### Community 32 - "Button"
Cohesion: 0.10
Nodes (34): AccountProfile(), ShippingConfig, ShippingProvinceRow, ShippingSettingsPage(), ContactClient(), handleSubmit(), validate(), digitsOnly() (+26 more)

### Community 33 - "Brand.ts"
Cohesion: 0.03
Nodes (71): AggregateBrand, Brand$productsArgs, BrandAggregateArgs, BrandAvgAggregateInputType, BrandAvgAggregateOutputType, BrandAvgOrderByAggregateInput, BrandCountAggregateInputType, BrandCountAggregateOutputType (+63 more)

### Community 34 - "MediaFolder.ts"
Cohesion: 0.03
Nodes (71): AggregateMediaFolder, GetMediaFolderAggregateType, GetMediaFolderGroupByPayload, MediaFolder$mediaArgs, MediaFolderAggregateArgs, MediaFolderAvgAggregateInputType, MediaFolderAvgAggregateOutputType, MediaFolderAvgOrderByAggregateInput (+63 more)

### Community 35 - "product-detail-page.tsx"
Cohesion: 0.08
Nodes (42): ApiProduct, ColorSelector(), isLightColor(), DiscountBadge(), Price(), ProductCard(), Collapsible(), DetailSection() (+34 more)

### Community 36 - "pnpm allowBuilds (prisma, esbuild, sharp, unrs-resolver)"
Cohesion: 0.67
Nodes (3): pnpm allowBuilds (prisma, esbuild, sharp, unrs-resolver), Prisma, sharp

### Community 37 - "cart-drawer.tsx"
Cohesion: 0.10
Nodes (42): CartPage(), metadata, CartDrawer(), CartItem(), CartPageClient(), crumbItems, CartSummary(), EmptyCart() (+34 more)

### Community 38 - "Banner.ts"
Cohesion: 0.03
Nodes (57): AggregateBanner, BannerAggregateArgs, BannerAvgAggregateInputType, BannerAvgAggregateOutputType, BannerAvgOrderByAggregateInput, BannerCountAggregateInputType, BannerCountAggregateOutputType, BannerCountArgs (+49 more)

### Community 39 - "PersonalAccessToken.ts"
Cohesion: 0.04
Nodes (55): AggregatePersonalAccessToken, GetPersonalAccessTokenAggregateType, GetPersonalAccessTokenGroupByPayload, PersonalAccessTokenAggregateArgs, PersonalAccessTokenAvgAggregateInputType, PersonalAccessTokenAvgAggregateOutputType, PersonalAccessTokenAvgOrderByAggregateInput, PersonalAccessTokenCountAggregateInputType (+47 more)

### Community 40 - "ActivityLog.ts"
Cohesion: 0.04
Nodes (56): ActivityLogAggregateArgs, ActivityLogAvgAggregateInputType, ActivityLogAvgAggregateOutputType, ActivityLogAvgOrderByAggregateInput, ActivityLogCountAggregateInputType, ActivityLogCountAggregateOutputType, ActivityLogCountArgs, ActivityLogCountOrderByAggregateInput (+48 more)

### Community 41 - "PasswordResetToken.ts"
Cohesion: 0.04
Nodes (56): AggregatePasswordResetToken, DateTimeFieldUpdateOperationsInput, GetPasswordResetTokenAggregateType, GetPasswordResetTokenGroupByPayload, PasswordResetTokenAggregateArgs, PasswordResetTokenAvgAggregateInputType, PasswordResetTokenAvgAggregateOutputType, PasswordResetTokenAvgOrderByAggregateInput (+48 more)

### Community 42 - "SiteSetting.ts"
Cohesion: 0.04
Nodes (56): AggregateSiteSetting, EnumSettingTypeFieldUpdateOperationsInput, GetSiteSettingAggregateType, GetSiteSettingGroupByPayload, SiteSettingAggregateArgs, SiteSettingAvgAggregateInputType, SiteSettingAvgAggregateOutputType, SiteSettingAvgOrderByAggregateInput (+48 more)

### Community 43 - "ContactMessage.ts"
Cohesion: 0.04
Nodes (55): AggregateContactMessage, ContactMessageAggregateArgs, ContactMessageAvgAggregateInputType, ContactMessageAvgAggregateOutputType, ContactMessageAvgOrderByAggregateInput, ContactMessageCountAggregateInputType, ContactMessageCountAggregateOutputType, ContactMessageCountArgs (+47 more)

### Community 44 - "Feature.ts"
Cohesion: 0.04
Nodes (55): AggregateFeature, FeatureAggregateArgs, FeatureAvgAggregateInputType, FeatureAvgAggregateOutputType, FeatureAvgOrderByAggregateInput, FeatureCountAggregateInputType, FeatureCountAggregateOutputType, FeatureCountArgs (+47 more)

### Community 45 - "Newsletter.ts"
Cohesion: 0.04
Nodes (55): AggregateNewsletter, GetNewsletterAggregateType, GetNewsletterGroupByPayload, NewsletterAggregateArgs, NewsletterAvgAggregateInputType, NewsletterAvgAggregateOutputType, NewsletterAvgOrderByAggregateInput, NewsletterCountAggregateInputType (+47 more)

### Community 46 - "Page.ts"
Cohesion: 0.04
Nodes (55): AggregatePage, GetPageAggregateType, GetPageGroupByPayload, PageAggregateArgs, PageAvgAggregateInputType, PageAvgAggregateOutputType, PageAvgOrderByAggregateInput, PageCountAggregateInputType (+47 more)

### Community 47 - "verifyAdminToken"
Cohesion: 0.07
Nodes (34): GET(), DELETE(), GET(), PATCH(), GET(), POST(), GET(), DELETE() (+26 more)

### Community 48 - "logActivity"
Cohesion: 0.11
Nodes (39): DELETE(), GET(), PATCH(), DELETE(), GET(), PATCH(), GET(), POST() (+31 more)

### Community 50 - "lucide-react"
Cohesion: 0.09
Nodes (32): OrderDetailClient(), AccountOrders(), ApiOrder, TABS, AccountDashboard(), ApiOrder, AdminLoginPage(), OrderCard() (+24 more)

### Community 51 - "client.ts"
Cohesion: 0.05
Nodes (37): ActivityLog, Address, Admin, Banner, Brand, Category, City, Color (+29 more)

### Community 52 - "enums.ts"
Cohesion: 0.04
Nodes (46): ActivityLog, Address, Admin, Banner, Brand, Category, City, Color (+38 more)

### Community 53 - "next"
Cohesion: 0.09
Nodes (21): fetchOrder(), generateMetadata(), OrderDetailPage(), Props, metadata, DELETE(), GET(), PATCH() (+13 more)

### Community 54 - "app/layout.tsx"
Cohesion: 0.06
Nodes (45): DashboardLayout(), DEFAULT_SHIPPING_THRESHOLD, GET(), ContactPage(), dynamic, metadata, cormorant, metadata (+37 more)

### Community 55 - "storage.ts"
Cohesion: 0.11
Nodes (24): DELETE(), PATCH(), ALLOWED_IMAGE_MIME, ALLOWED_VIDEO_MIME, GET(), getImageSize(), POST(), POST() (+16 more)

### Community 56 - "utils.ts"
Cohesion: 0.14
Nodes (23): Chip, FilterActiveBar(), FilterBrands(), FilterCategories(), FilterColors(), isLightColor(), emptyOptions, FilterContext (+15 more)

### Community 57 - "jalali-calendar.tsx"
Cohesion: 0.14
Nodes (25): JalaliCalendar(), JalaliCalendarProps, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger() (+17 more)

### Community 58 - "(dashboard)/page.tsx"
Cohesion: 0.12
Nodes (21): AdminDashboardPage(), DashboardStats, formatCurrency(), OrdersChart(), statusConfig, StatusData, actions, QuickActions() (+13 more)

### Community 59 - "sonner"
Cohesion: 0.14
Nodes (27): AdminRow, AdminsPage(), formatDate(), statusOptions, BrandRow, ColorRow, ColorsPage(), FeatureRow (+19 more)

### Community 60 - "product-listing.tsx"
Cohesion: 0.09
Nodes (33): CheckoutFallback(), CheckoutPage(), metadata, metadata, OrderSuccessPage(), CatalogFallback(), generateMetadata(), ProductsPage() (+25 more)

### Community 61 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, bcryptjs, class-variance-authority, clsx, dotenv, @hookform/resolvers, jalaali-js, jose (+16 more)

### Community 62 - "Editorial fashion photography"
Cohesion: 0.12
Nodes (24): Apparel product photography (hanger/cropped catalog shots), Product shot: chambray heart-print shirt on hanger, Product shot: black 705 logo t-shirt on wooden hanger, Product shot: blush satin jogger pants on model, Clothing rack / retail display imagery, Editorial: auburn-haired model against turquoise window frame, Editorial: studio portrait in blue/violet light, black sweater, Editorial: floral wrap maxi dress with straw bag by the sea (+16 more)

### Community 63 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+14 more)

### Community 64 - "toEnglishDigits"
Cohesion: 0.11
Nodes (22): GET(), POST(), GET(), POST(), GET(), POST(), GET(), POST() (+14 more)

### Community 65 - "settings/route.ts"
Cohesion: 0.60
Nodes (5): GET(), PUT(), readStructuredSettings(), validateSettings(), buildSiteSettings()

### Community 66 - "package.json"
Cohesion: 0.08
Nodes (24): eslintConfig, name, private, version, clsx, dotenv, eslint, eslint-config-next (+16 more)

### Community 67 - "media-picker-dialog.tsx"
Cohesion: 0.16
Nodes (23): BrandsPage(), MediaPage(), MediaThumb(), LogoField(), BrandFormDialog(), BrandFormDialogProps, toSlug(), CategoryFormProps (+15 more)

### Community 68 - "admins/route.ts"
Cohesion: 0.29
Nodes (9): GET(), POST(), POST(), POST(), POST(), comparePassword(), hashPassword(), setUserAuthCookie() (+1 more)

### Community 69 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 70 - "Zivo_PRD.md"
Cohesion: 0.04
Nodes (51): 10. صفحه اصلی, 11. Hero Slider, 12. بخش مزایای خرید, 13. دسته‌بندی‌ها, 14. Product Card, 16. مدل محصول, 18. سیستم رنگ محصول, 1. معرفی محصول (+43 more)

### Community 71 - "(dashboard)/products/page.tsx"
Cohesion: 0.33
Nodes (6): Brand, Category, formatPrice(), ProductRow, ProductsPage(), statusConfig

### Community 108 - "seed-locations.ts"
Cohesion: 0.19
Nodes (14): adapter, candidates, CityRow, cleanName(), FA_TO_EN, main(), makeUniqueSlug(), parseCities() (+6 more)

### Community 109 - "users/page.tsx"
Cohesion: 0.20
Nodes (12): formatDate(), statusOptions, UserDetail, UserRow, UsersPage(), formatCurrency(), formatDate(), statusConfig (+4 more)

### Community 110 - "auth.ts"
Cohesion: 0.17
Nodes (12): POST(), POST(), GET(), apiError(), ApiResponse, apiSuccess(), AdminPayload, JWT_SECRET (+4 more)

### Community 111 - "zarinpal/route.ts"
Cohesion: 0.24
Nodes (10): GET(), POST(), getBaseUrl(), getMerchantId(), requestPayment(), verifyPayment(), ZARINPAL_ERRORS, ZarinpalRequestPayload (+2 more)

### Community 112 - "header.tsx"
Cohesion: 0.10
Nodes (26): CountBadge(), Header(), HeaderProps, SiteShell(), AnnouncementBar(), AnnouncementConfig, DEFAULT_CONFIG, digitsOnly() (+18 more)

### Community 114 - "db-config.ts"
Cohesion: 0.21
Nodes (10): DbConfig, DEV_FALLBACK, getDbConfig(), parseDatabaseUrl(), positiveInt(), createPrismaClient(), PrismaClient, adapter (+2 more)

### Community 115 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, shadcn, tailwindcss, @tailwindcss/postcss, tsx, tw-animate-css (+4 more)

### Community 116 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:generate, db:migrate, db:migrate:dev, db:reset, db:seed, db:seed:locations (+4 more)

### Community 117 - "categories/page.tsx"
Cohesion: 0.36
Nodes (7): CategoriesPage(), CategoryItem, CategoryTree(), CategoryTreeProps, TreeNode(), CategoryFormDialog(), toSlug()

### Community 118 - "activity-logger.ts"
Cohesion: 0.25
Nodes (9): GET(), ActivityAction, ActivityActionLabels, ActivityLogEntry, buffer, ensureTimer(), flushBuffer(), registerShutdownHandler() (+1 more)

### Community 119 - "getCatalogOptions"
Cohesion: 0.60
Nodes (3): GET(), CatalogOptions, getCatalogOptions()

### Community 120 - "search-dialog.tsx"
Cohesion: 0.22
Nodes (12): AccountWishlist(), EmptyState(), EmptyStateProps, SearchDialog(), SearchDialogProps, SuggestionGroup, addRecentSearch(), clearRecentSearches() (+4 more)

### Community 121 - "filter-store.ts"
Cohesion: 0.29
Nodes (9): useFilters(), activeFilterCount(), applyFilters(), FilterState, FilterValues, initialState, SORT_OPTIONS, SortOption (+1 more)

### Community 122 - "@prisma/client"
Cohesion: 0.18
Nodes (5): config, decodeBase64AsWasm(), LogOptions, PrismaClientConstructor, @prisma/client

### Community 123 - "cn"
Cohesion: 0.11
Nodes (27): AccountLayout(), BREADCRUMB_MAP, AccountNav(), NAV_ITEMS, NavItem(), StatsCardProps, ErrorState(), ErrorStatePresets (+19 more)

### Community 124 - "settings/page.tsx"
Cohesion: 0.12
Nodes (27): emptySettings(), FieldError(), FieldName, SectionHeader(), SettingsField(), SettingsFieldProps, SiteSettingsPage(), SocialField() (+19 more)

### Community 125 - "banner-form-dialog.tsx"
Cohesion: 0.16
Nodes (25): ALIGN_LABELS, BannerFormData, BannerFormDialog(), BannerFormDialogProps, bannerSchema, POSITION_LABELS, CouponFormData, CouponFormDialog() (+17 more)

### Community 128 - "about-client.tsx"
Cohesion: 0.32
Nodes (6): AboutClient(), MILESTONES, TEAM, VALUES, AboutPage(), metadata

### Community 129 - "sections/index.ts"
Cohesion: 0.25
Nodes (13): GET(), HomePage(), Brands(), CampaignBanner(), CategoryCards(), Feature, Features, ProductSection() (+5 more)

### Community 143 - "Product photography"
Cohesion: 0.40
Nodes (5): Flat lay: black tee, grey trousers, white sneakers, watch, Placeholder image (beige, generic image glyph) JPG, Placeholder image SVG (800x800, #F4F1EC bg, sun+mountain glyph), Product photography, Product: plain white crew-neck t-shirt on model

### Community 155 - "product-form.tsx"
Cohesion: 0.15
Nodes (19): EditProductPage(), NewProductPage(), Card(), Color, EMPTY_FORM, FieldError(), formatToman(), FormState (+11 more)

### Community 165 - "PrismaClientBaseOptions"
Cohesion: 0.67
Nodes (3): PrismaClientBaseOptions, PrismaClientOptionsWithAccelerateUrl, PrismaClientOptionsWithAdapter

### Community 167 - "[slug]/page.tsx"
Cohesion: 0.23
Nodes (10): GET(), GET(), generateMetadata(), generateStaticParams(), Params, ProductPage(), revalidate, getProductBySlug() (+2 more)

### Community 171 - "activity-logs/page.tsx"
Cohesion: 0.29
Nodes (10): ACTION_GROUPS, ActivityLog, ActivityLogsPage(), ActivityStats, DetailRow(), getActionColor(), getActionIcon(), LogDetailModal() (+2 more)

### Community 172 - "product-section.tsx"
Cohesion: 0.33
Nodes (6): fetchers, ProductKind, fetchBestsellerProducts(), fetchDiscountedProducts(), fetchNewestProducts(), rejectProducts()

### Community 173 - "hero-slider.tsx"
Cohesion: 0.39
Nodes (7): HeroSlide, HeroSlider(), HeroSliderSkeleton(), prefersReducedMotion(), SideBanner, SideBannerCard(), SideBannerPlaceholder()

### Community 174 - "(dashboard)/orders/[id]/page.tsx"
Cohesion: 0.29
Nodes (6): OrderDetailData, PAYMENT_STATUS_MAP, STATUS_COLORS, STATUS_ICONS, STATUS_LABELS, VALID_TRANSITIONS

### Community 175 - "38. Footer"
Cohesion: 0.40
Nodes (5): 38. Footer, ارتباط, خدمات مشتریان, خرید, درباره Zivo

### Community 176 - "4. سیستم رنگ"
Cohesion: 0.50
Nodes (4): 4.1 رنگ‌های اصلی, 4.2 نسبت تقریبی استفاده, 4.3 رنگ‌های Semantic, 4. سیستم رنگ

### Community 177 - "63. اولویت‌بندی توسعه"
Cohesion: 0.50
Nodes (4): 63. اولویت‌بندی توسعه, P0 --- ضروری, P1 --- مهم, P2 --- تکمیلی

### Community 178 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 180 - "15. صفحه محصولات"
Cohesion: 0.67
Nodes (3): 15. صفحه محصولات, Filter, Sort

### Community 181 - "17. سیستم سایزبندی"
Cohesion: 0.67
Nodes (3): 17. سیستم سایزبندی, سوتین, لباس شب

### Community 182 - "28. احراز هویت"
Cohesion: 0.67
Nodes (3): 28. احراز هویت, ثبت‌نام, ورود

### Community 183 - "6. اصول کلی UI/UX"
Cohesion: 0.67
Nodes (3): 6.1 سبک طراحی, 6.2 انیمیشن, 6. اصول کلی UI/UX

### Community 184 - "7. Responsive Design"
Cohesion: 0.67
Nodes (3): 7.1 موبایل, 7.2 Bottom Dock موبایل, 7. Responsive Design

### Community 185 - "8. ساختار کلی سایت"
Cohesion: 0.67
Nodes (3): 8. ساختار کلی سایت, صفحات اصلی, صفحات حساب کاربری

## Ambiguous Edges - Review These
- `Clothing rack / retail display imagery` → `Street style: woman in plaid coat with burgundy studded bag (not a rack)`  [AMBIGUOUS]
  public/images/rack-clothes.jpg · relation: conceptually_related_to
- `Outerwear & seasonal lifestyle` → `Editorial: blonde model in sheer black top, dark studio`  [AMBIGUOUS]
  public/images/editorial-coat.jpg · relation: conceptually_related_to
- `Portrait / beauty close-ups` → `Product shot: chambray heart-print shirt on hanger`  [AMBIGUOUS]
  public/images/beauty-1.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **23 isolated node(s):** `mariadb`, `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/react` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 4655 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **86 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client` connect `@prisma/client` to `Product.ts`, `prismaNamespace.ts`, `Order.ts`, `User.ts`, `ProductVariant.ts`, `Address.ts`, `Category.ts`, `Review.ts`, `OrderStatusHistory.ts`, `ProductColor.ts`, `City.ts`, `OrderItem.ts`, `ProductSize.ts`, `Wishlist.ts`, `commonInputTypes.ts`, `Color.ts`, `Size.ts`, `prismaNamespaceBrowser.ts`, `Province.ts`, `Admin.ts`, `Media.ts`, `Payment.ts`, `ProductDetail.ts`, `SearchLog.ts`, `ProductImage.ts`, `ProductVideo.ts`, `ReviewImage.ts`, `Coupon.ts`, `Brand.ts`, `MediaFolder.ts`, `Banner.ts`, `PersonalAccessToken.ts`, `ActivityLog.ts`, `PasswordResetToken.ts`, `SiteSetting.ts`, `ContactMessage.ts`, `Feature.ts`, `Newsletter.ts`, `Page.ts`, `client.ts`, `package.json`?**
  _High betweenness centrality (0.393) - this node is a cross-community bridge._
- **What connects `mariadb`, `react-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Product.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.01020408163265306 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Button` to `sections/index.ts`, `style-guide/page.tsx`, `Badge`, `addresses/page.tsx`, `product-form.tsx`, `product-detail-page.tsx`, `cart-drawer.tsx`, `activity-logs/page.tsx`, `product-section.tsx`, `hero-slider.tsx`, `(dashboard)/orders/[id]/page.tsx`, `lucide-react`, `app/layout.tsx`, `utils.ts`, `jalali-calendar.tsx`, `(dashboard)/page.tsx`, `sonner`, `product-listing.tsx`, `package.json`, `media-picker-dialog.tsx`, `(dashboard)/products/page.tsx`, `users/page.tsx`, `header.tsx`, `categories/page.tsx`, `search-dialog.tsx`, `cn`, `settings/page.tsx`, `banner-form-dialog.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `prismaNamespace.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.010471204188481676 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Clothing rack / retail display imagery` and `Street style: woman in plaid coat with burgundy studded bag (not a rack)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Outerwear & seasonal lifestyle` and `Editorial: blonde model in sheer black top, dark studio`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._