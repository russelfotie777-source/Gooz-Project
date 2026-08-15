<?php

use App\Http\Controllers\Admin\AddressController as AdminAddressController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\DeliveryController as AdminDeliveryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ProductImageController as AdminProductImageController;
use App\Http\Controllers\Admin\ProductVariantController as AdminProductVariantController;
use App\Http\Controllers\Admin\StockController as AdminStockController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\StatsController as AdminStatsController;
use App\Http\Controllers\Admin\TicketController as AdminTicketController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\Admin\WarehouseController as AdminWarehouseController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\DeliveryEstimateController;
use App\Http\Controllers\DeliveryQuoteController;
use App\Http\Controllers\DeviceTokenController;
use App\Http\Controllers\NeighborhoodController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::delete('/me', [AuthController::class, 'destroy']);

        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart/items', [CartController::class, 'addItem']);
        Route::put('/cart/items/{cartItem}', [CartController::class, 'updateItem']);
        Route::delete('/cart/items/{cartItem}', [CartController::class, 'removeItem']);
        Route::delete('/cart', [CartController::class, 'clear']);

        Route::post('/checkout', [CheckoutController::class, 'store']);

        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);

        Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);

        Route::get('/deliveries', [DeliveryController::class, 'index']);
        Route::patch('/deliveries/{delivery}/status', [DeliveryController::class, 'updateStatus']);

        Route::post('/device-tokens', [DeviceTokenController::class, 'store']);
        Route::delete('/device-tokens', [DeviceTokenController::class, 'destroy']);

        Route::post('/delivery/quote', [DeliveryQuoteController::class, 'store']);

        Route::get('/addresses', [AddressController::class, 'index']);
        Route::post('/addresses', [AddressController::class, 'store']);
        Route::put('/addresses/{address}', [AddressController::class, 'update']);
        Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
    });

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    Route::get('/banners', [BannerController::class, 'index']);

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
        Route::post('/banners', [AdminBannerController::class, 'store']);
        Route::put('/banners/{banner}', [AdminBannerController::class, 'update']);
        Route::delete('/banners/{banner}', [AdminBannerController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-coupons'])->group(function () {
        Route::get('/admin/coupons', [AdminCouponController::class, 'index']);
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
        Route::get('/admin/users/{user}', [AdminUserController::class, 'show']);
        Route::patch('/admin/users/{user}/role', [AdminUserController::class, 'updateRole']);
        Route::patch('/admin/users/{user}/status', [AdminUserController::class, 'updateStatus']);
        Route::patch('/admin/users/{user}/verify-phone', [AdminUserController::class, 'verifyPhone']);
        Route::post('/admin/users/{user}/tickets', [AdminTicketController::class, 'store']);

        Route::get('/admin/tickets', [AdminTicketController::class, 'index']);
        Route::get('/admin/tickets/{ticket}', [AdminTicketController::class, 'show']);
        Route::patch('/admin/tickets/{ticket}/status', [AdminTicketController::class, 'updateStatus']);
        Route::patch('/admin/tickets/{ticket}/assign', [AdminTicketController::class, 'assign']);

        Route::get('/admin/addresses', [AdminAddressController::class, 'index']);
        Route::get('/admin/addresses/{address}', [AdminAddressController::class, 'show']);
    });

    Route::middleware(['auth:sanctum', 'can:manage-warehouses'])->group(function () {
        Route::get('/admin/warehouses', [AdminWarehouseController::class, 'index']);
        Route::post('/admin/warehouses', [AdminWarehouseController::class, 'store']);
        Route::put('/admin/warehouses/{warehouse}', [AdminWarehouseController::class, 'update']);
        Route::delete('/admin/warehouses/{warehouse}', [AdminWarehouseController::class, 'destroy']);
    });
});
