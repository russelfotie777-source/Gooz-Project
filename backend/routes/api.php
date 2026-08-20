<?php

use App\Http\Controllers\Admin\AddressController as AdminAddressController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\DeliveryController as AdminDeliveryController;
use App\Http\Controllers\Admin\HomepageSectionController as AdminHomepageSectionController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ProductImageController as AdminProductImageController;
use App\Http\Controllers\Admin\ProductVariantController as AdminProductVariantController;
use App\Http\Controllers\Admin\CartSettingController as AdminCartSettingController;
use App\Http\Controllers\Admin\CompanyProfileController as AdminCompanyProfileController;
use App\Http\Controllers\Admin\RolePermissionController as AdminRolePermissionController;
use App\Http\Controllers\Admin\DeliverySettingController as AdminDeliverySettingController;
use App\Http\Controllers\Admin\InventoryLedgerController as AdminInventoryLedgerController;
use App\Http\Controllers\Admin\NeighborhoodController as AdminNeighborhoodController;
use App\Http\Controllers\Admin\StockAdjustmentController as AdminStockAdjustmentController;
use App\Http\Controllers\Admin\StockController as AdminStockController;
use App\Http\Controllers\Admin\SupplierController as AdminSupplierController;
use App\Http\Controllers\Admin\AccountController as AdminAccountController;
use App\Http\Controllers\Admin\ExpenseController as AdminExpenseController;
use App\Http\Controllers\Admin\MoneyMovementController as AdminMoneyMovementController;
use App\Http\Controllers\Admin\PurchaseInvoiceController as AdminPurchaseInvoiceController;
use App\Http\Controllers\Admin\PurchaseOrderController as AdminPurchaseOrderController;
use App\Http\Controllers\Admin\AccountingPeriodController as AdminAccountingPeriodController;
use App\Http\Controllers\Admin\CashSessionController as AdminCashSessionController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\StatsController as AdminStatsController;
use App\Http\Controllers\Admin\TicketController as AdminTicketController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\UserNotificationController as AdminUserNotificationController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\HomepageSectionController;
use App\Http\Controllers\Admin\WarehouseController as AdminWarehouseController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\DeliveryEstimateController;
use App\Http\Controllers\DeliveryQuoteController;
use App\Http\Controllers\DeviceTokenController;
use App\Http\Controllers\EnkapWebhookController;
use App\Http\Controllers\NeighborhoodController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserNotificationController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/auth/social', [AuthController::class, 'social']);

    Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);

    // Called by Enkap's servers directly — no Sanctum token to send, so
    // this has to sit outside the auth:sanctum group. See
    // EnkapWebhookController for why the notified status is re-verified
    // rather than trusted as-is.
    Route::put('/webhooks/enkap/{orderReference}', [EnkapWebhookController::class, 'handle']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/me', [AuthController::class, 'updateProfile']);
        Route::delete('/me', [AuthController::class, 'destroy']);

        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart/items', [CartController::class, 'addItem']);
        Route::put('/cart/items/{cartItem}', [CartController::class, 'updateItem']);
        Route::delete('/cart/items/{cartItem}', [CartController::class, 'removeItem']);
        Route::delete('/cart', [CartController::class, 'clear']);

        Route::post('/checkout', [CheckoutController::class, 'store']);

        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        // Bound by order_reference, not id: the customer lands back on the
        // frontend return page carrying only the reference Enkap was given
        // (see EnkapWebhookController's docblock for the matching webhook path).
        Route::post('/orders/{order:order_reference}/payment/refresh', [PaymentController::class, 'refresh']);
        // Same reason: the checkout confirmation screen only has the
        // reference (it's in the URL, see CheckoutConfirmationStep) and
        // needs to verify it — and that it belongs to this user — before
        // showing a "your order is confirmed" screen for it.
        Route::get('/orders/reference/{order:order_reference}', [OrderController::class, 'show']);

        Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);

        Route::get('/deliveries', [DeliveryController::class, 'index']);
        Route::patch('/deliveries/{delivery}/status', [DeliveryController::class, 'updateStatus']);

        Route::post('/device-tokens', [DeviceTokenController::class, 'store']);
        Route::delete('/device-tokens', [DeviceTokenController::class, 'destroy']);

        Route::post('/delivery/quote', [DeliveryQuoteController::class, 'store']);

        Route::post('/coupons/validate', [CouponController::class, 'validateCode']);

        Route::get('/addresses', [AddressController::class, 'index']);
        Route::post('/addresses', [AddressController::class, 'store']);
        Route::put('/addresses/{address}', [AddressController::class, 'update']);
        Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);

        Route::get('/tickets', [TicketController::class, 'index']);
        Route::post('/tickets', [TicketController::class, 'store']);

        Route::get('/notifications', [UserNotificationController::class, 'index']);
        Route::post('/notifications/{notification}/read', [UserNotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [UserNotificationController::class, 'markAllRead']);
    });

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    Route::get('/banners', [BannerController::class, 'index']);

    Route::get('/homepage-sections', [HomepageSectionController::class, 'index']);

    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/{brand}', [BrandController::class, 'show']);

    Route::get('/warehouses', [WarehouseController::class, 'index']);
    Route::get('/warehouses/{warehouse}', [WarehouseController::class, 'show']);

    Route::get('/cities', [CityController::class, 'index']);
    Route::get('/neighborhoods', [NeighborhoodController::class, 'index']);
    Route::get('/delivery/estimate', [DeliveryEstimateController::class, 'show']);

    Route::middleware(['auth:sanctum', 'can:manage-products'])->group(function () {
        Route::get('/admin/products', [AdminProductController::class, 'index']);
        Route::get('/admin/products/{product}', [AdminProductController::class, 'show']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);

        Route::get('/admin/variants', [AdminProductVariantController::class, 'index']);
        Route::get('/admin/variants/{variant}', [AdminProductVariantController::class, 'show']);
        Route::post('/products/{product}/variants', [AdminProductVariantController::class, 'store']);
        Route::put('/variants/{variant}', [AdminProductVariantController::class, 'update']);
        Route::delete('/variants/{variant}', [AdminProductVariantController::class, 'destroy']);

        Route::post('/products/{product}/images', [AdminProductImageController::class, 'store']);
        Route::delete('/images/{image}', [AdminProductImageController::class, 'destroy']);

        Route::get('/admin/stocks', [AdminStockController::class, 'index']);
        Route::get('/admin/stocks/{stock}', [AdminStockController::class, 'show']);

        Route::get('/admin/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

        Route::get('/admin/brands', [AdminBrandController::class, 'index']);
        Route::post('/brands', [AdminBrandController::class, 'store']);
        Route::put('/brands/{brand}', [AdminBrandController::class, 'update']);
        Route::delete('/brands/{brand}', [AdminBrandController::class, 'destroy']);

        Route::get('/admin/banners', [AdminBannerController::class, 'index']);
        Route::get('/admin/banners/{banner}', [AdminBannerController::class, 'show']);
        Route::post('/banners', [AdminBannerController::class, 'store']);
        Route::put('/banners/{banner}', [AdminBannerController::class, 'update']);
        Route::delete('/banners/{banner}', [AdminBannerController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-homepage-sections'])->group(function () {
        Route::get('/admin/homepage-sections', [AdminHomepageSectionController::class, 'index']);
        Route::get('/admin/homepage-sections/{homepageSection}', [AdminHomepageSectionController::class, 'show']);
        Route::post('/admin/homepage-sections', [AdminHomepageSectionController::class, 'store']);
        Route::post('/admin/homepage-sections/reorder', [AdminHomepageSectionController::class, 'reorder']);
        Route::put('/admin/homepage-sections/{homepageSection}', [AdminHomepageSectionController::class, 'update']);
        Route::delete('/admin/homepage-sections/{homepageSection}', [AdminHomepageSectionController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-coupons'])->group(function () {
        Route::get('/admin/coupons', [AdminCouponController::class, 'index']);
        Route::get('/admin/coupons/{coupon}', [AdminCouponController::class, 'show']);
        Route::post('/admin/coupons', [AdminCouponController::class, 'store']);
        Route::put('/admin/coupons/{coupon}', [AdminCouponController::class, 'update']);
        Route::delete('/admin/coupons/{coupon}', [AdminCouponController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'can:view-stats'])->group(function () {
        Route::get('/admin/stats/overview', [AdminStatsController::class, 'overview']);
        Route::get('/admin/stats/revenue', [AdminStatsController::class, 'revenue']);
        Route::get('/admin/stats/top-products', [AdminStatsController::class, 'topProducts']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-orders'])->group(function () {
        Route::get('/admin/orders', [AdminOrderController::class, 'index']);
        Route::get('/admin/orders/{order}', [AdminOrderController::class, 'show']);
        Route::patch('/admin/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-deliveries'])->group(function () {
        Route::get('/admin/deliveries', [AdminDeliveryController::class, 'index']);
        Route::post('/admin/orders/{order}/delivery', [AdminDeliveryController::class, 'store']);
    });

    Route::middleware(['auth:sanctum', 'can:moderate-reviews'])->group(function () {
        Route::get('/admin/reviews', [AdminReviewController::class, 'index']);
        Route::patch('/admin/reviews/{review}/approve', [AdminReviewController::class, 'approve']);
        Route::delete('/admin/reviews/{review}', [AdminReviewController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-users'])->group(function () {
        Route::get('/admin/users', [AdminUserController::class, 'index']);
        Route::post('/admin/users', [AdminUserController::class, 'store']);
        Route::get('/admin/users/{user}', [AdminUserController::class, 'show']);
        Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy']);
        Route::patch('/admin/users/{user}/role', [AdminUserController::class, 'updateRole']);
        Route::patch('/admin/users/{user}/status', [AdminUserController::class, 'updateStatus']);
        Route::patch('/admin/users/{user}/verify-phone', [AdminUserController::class, 'verifyPhone']);
        Route::post('/admin/users/{user}/tickets', [AdminTicketController::class, 'store']);

        Route::get('/admin/role-permissions', [AdminRolePermissionController::class, 'index']);
        Route::put('/admin/role-permissions', [AdminRolePermissionController::class, 'update']);

        Route::get('/admin/tickets', [AdminTicketController::class, 'index']);
        Route::get('/admin/tickets/{ticket}', [AdminTicketController::class, 'show']);
        Route::patch('/admin/tickets/{ticket}/status', [AdminTicketController::class, 'updateStatus']);
        Route::patch('/admin/tickets/{ticket}/assign', [AdminTicketController::class, 'assign']);

        Route::get('/admin/addresses', [AdminAddressController::class, 'index']);
        Route::get('/admin/addresses/{address}', [AdminAddressController::class, 'show']);

        Route::get('/admin/notifications', [AdminUserNotificationController::class, 'index']);
        Route::post('/admin/notifications', [AdminUserNotificationController::class, 'store']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-warehouses'])->group(function () {
        Route::get('/admin/warehouses', [AdminWarehouseController::class, 'index']);
        Route::get('/admin/warehouses/{warehouse}', [AdminWarehouseController::class, 'show']);
        Route::post('/admin/warehouses', [AdminWarehouseController::class, 'store']);
        Route::put('/admin/warehouses/{warehouse}', [AdminWarehouseController::class, 'update']);
        Route::delete('/admin/warehouses/{warehouse}', [AdminWarehouseController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-suppliers'])->group(function () {
        Route::get('/admin/suppliers', [AdminSupplierController::class, 'index']);
        Route::get('/admin/suppliers/{supplier}', [AdminSupplierController::class, 'show']);
        Route::post('/admin/suppliers', [AdminSupplierController::class, 'store']);
        Route::put('/admin/suppliers/{supplier}', [AdminSupplierController::class, 'update']);
        Route::delete('/admin/suppliers/{supplier}', [AdminSupplierController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-stock-adjustments'])->group(function () {
        Route::get('/admin/stock-adjustments', [AdminStockAdjustmentController::class, 'index']);
        Route::get('/admin/stock-adjustments/{stockAdjustment}', [AdminStockAdjustmentController::class, 'show']);
        Route::post('/admin/stock-adjustments', [AdminStockAdjustmentController::class, 'store']);
        Route::put('/admin/stock-adjustments/{stockAdjustment}', [AdminStockAdjustmentController::class, 'update']);
        Route::delete('/admin/stock-adjustments/{stockAdjustment}', [AdminStockAdjustmentController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'can:view-inventory-ledger'])->group(function () {
        Route::get('/admin/inventory-ledgers', [AdminInventoryLedgerController::class, 'index']);
        Route::get('/admin/inventory-ledgers/{inventoryLedger}', [AdminInventoryLedgerController::class, 'show']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-delivery-settings'])->group(function () {
        Route::get('/admin/delivery-settings', [AdminDeliverySettingController::class, 'show']);
        Route::put('/admin/delivery-settings', [AdminDeliverySettingController::class, 'update']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-cart-settings'])->group(function () {
        Route::get('/admin/cart-settings', [AdminCartSettingController::class, 'show']);
        Route::put('/admin/cart-settings', [AdminCartSettingController::class, 'update']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-company-profile'])->group(function () {
        Route::get('/admin/company-profile', [AdminCompanyProfileController::class, 'show']);
        Route::put('/admin/company-profile', [AdminCompanyProfileController::class, 'update']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-neighborhoods'])->group(function () {
        Route::get('/admin/neighborhoods', [AdminNeighborhoodController::class, 'index']);
        Route::get('/admin/neighborhoods/{neighborhood}', [AdminNeighborhoodController::class, 'show']);
        Route::post('/admin/neighborhoods', [AdminNeighborhoodController::class, 'store']);
        Route::put('/admin/neighborhoods/{neighborhood}', [AdminNeighborhoodController::class, 'update']);
        Route::delete('/admin/neighborhoods/{neighborhood}', [AdminNeighborhoodController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-accounting'])->group(function () {
        Route::get('/admin/accounts', [AdminAccountController::class, 'index']);
        Route::get('/admin/accounts/{account}', [AdminAccountController::class, 'show']);
        Route::post('/admin/accounts', [AdminAccountController::class, 'store']);
        Route::put('/admin/accounts/{account}', [AdminAccountController::class, 'update']);
        Route::delete('/admin/accounts/{account}', [AdminAccountController::class, 'destroy']);

        Route::get('/admin/money-movements', [AdminMoneyMovementController::class, 'index']);
        Route::get('/admin/money-movements/{moneyMovement}', [AdminMoneyMovementController::class, 'show']);

        Route::get('/admin/purchase-orders', [AdminPurchaseOrderController::class, 'index']);
        Route::get('/admin/purchase-orders/{purchaseOrder}', [AdminPurchaseOrderController::class, 'show']);
        Route::post('/admin/purchase-orders', [AdminPurchaseOrderController::class, 'store']);
        Route::delete('/admin/purchase-orders/{purchaseOrder}', [AdminPurchaseOrderController::class, 'destroy']);

        Route::get('/admin/purchase-invoices', [AdminPurchaseInvoiceController::class, 'index']);
        Route::get('/admin/purchase-invoices/{purchaseInvoice}', [AdminPurchaseInvoiceController::class, 'show']);
        Route::post('/admin/purchase-invoices', [AdminPurchaseInvoiceController::class, 'store']);
        Route::put('/admin/purchase-invoices/{purchaseInvoice}', [AdminPurchaseInvoiceController::class, 'update']);
        Route::post('/admin/purchase-invoices/{purchaseInvoice}/cancel', [AdminPurchaseInvoiceController::class, 'cancel']);

        Route::get('/admin/expenses', [AdminExpenseController::class, 'index']);
        Route::get('/admin/expenses/{expense}', [AdminExpenseController::class, 'show']);
        Route::post('/admin/expenses', [AdminExpenseController::class, 'store']);
        Route::post('/admin/expenses/{expense}/cancel', [AdminExpenseController::class, 'cancel']);

        Route::get('/admin/accounting-periods', [AdminAccountingPeriodController::class, 'index']);
        Route::post('/admin/accounting-periods', [AdminAccountingPeriodController::class, 'store']);
        Route::delete('/admin/accounting-periods/{accountingPeriod}', [AdminAccountingPeriodController::class, 'destroy']);

        Route::get('/admin/cash-sessions', [AdminCashSessionController::class, 'index']);
        Route::get('/admin/cash-sessions/{cashSession}', [AdminCashSessionController::class, 'show']);
        Route::post('/admin/cash-sessions', [AdminCashSessionController::class, 'store']);
        Route::put('/admin/cash-sessions/{cashSession}', [AdminCashSessionController::class, 'update']);
        Route::delete('/admin/cash-sessions/{cashSession}', [AdminCashSessionController::class, 'destroy']);
    });
});
