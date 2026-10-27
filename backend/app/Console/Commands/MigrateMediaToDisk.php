<?php

namespace App\Console\Commands;

use App\Models\AppPromoImage;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ProductImage;
use App\Models\PurchaseInvoice;
use App\Services\ImageResizer;
use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

// One-time (but safe to re-run) migration for moving already-uploaded
// media off local disk once MEDIA_DISK points somewhere else (S3/R2) — see
// the performance audit's #7 finding. New uploads already go straight to
// the configured disk (see ImageResizer::defaultDisk()); this is only for
// files that existed before that config was set.
class MigrateMediaToDisk extends Command
{
    protected $signature = 'media:migrate
        {--from=public : Disk the files currently live on}
        {--to= : Disk to copy them to — defaults to whatever MEDIA_DISK/filesystems.media_disk resolves to}
        {--dry-run : List what would move without touching any file or row}';

    protected $description = 'Copies every product/banner/category/brand/app-promo/purchase-invoice file from '
        .'--from to --to and repoints the owning row\'s URL at the new location. Never deletes the source file — '
        .'re-running it is safe, already-migrated rows (URL already on the target disk) are skipped.';

    private array $stats = ['migrated' => 0, 'skipped' => 0, 'missing' => 0, 'failed' => 0];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $fromDiskName = $this->option('from');
        $toDiskName = $this->option('to') ?: ImageResizer::defaultDisk();

        if ($fromDiskName === $toDiskName) {
            $this->error("--from and --to are both \"{$fromDiskName}\" — nothing to migrate.");

            return self::FAILURE;
        }

        $from = Storage::disk($fromDiskName);
        $to = Storage::disk($toDiskName);

        $this->info(($dryRun ? '[dry-run] ' : '')."Migrating media from \"{$fromDiskName}\" to \"{$toDiskName}\"...");

        ProductImage::query()->each(function (ProductImage $image) use ($from, $to, $dryRun) {
            $this->migrateField($image, 'image_url', $from, $to, $dryRun);
            $this->migrateField($image, 'thumbnail_url', $from, $to, $dryRun);
        });

        Banner::query()->each(fn (Banner $m) => $this->migrateField($m, 'image', $from, $to, $dryRun));
        Category::query()->each(fn (Category $m) => $this->migrateField($m, 'image', $from, $to, $dryRun));
        Brand::query()->each(fn (Brand $m) => $this->migrateField($m, 'logo', $from, $to, $dryRun));
        AppPromoImage::query()->each(fn (AppPromoImage $m) => $this->migrateField($m, 'image', $from, $to, $dryRun));
        PurchaseInvoice::query()->each(
            fn (PurchaseInvoice $m) => $this->migrateField($m, 'attachment_path', $from, $to, $dryRun)
        );

        $this->info(sprintf(
            '%sMigrées : %d — déjà sur "%s" : %d — fichiers introuvables : %d — échecs : %d',
            $dryRun ? '[dry-run] ' : '',
            $this->stats['migrated'],
            $toDiskName,
            $this->stats['skipped'],
            $this->stats['missing'],
            $this->stats['failed'],
        ));

        return self::SUCCESS;
    }

    private function migrateField(
        EloquentModel $model,
        string $column,
        Filesystem $from,
        Filesystem $to,
        bool $dryRun
    ): void {
        $url = $model->{$column};

        if (! $url) {
            return;
        }

        $fromPrefix = $from->url('');

        if (! Str::startsWith($url, $fromPrefix)) {
            // Already pointing somewhere other than --from (most likely
            // already migrated in a previous run) — nothing to do.
            $this->stats['skipped']++;

            return;
        }

        $path = Str::after($url, $fromPrefix);

        if (! $from->exists($path)) {
            $this->stats['missing']++;
            $this->warn("Introuvable sur \"{$from->url('')}\": {$path} (".class_basename($model)." #{$model->id})");

            return;
        }

        $this->line(($dryRun ? '[dry-run] ' : '')."{$path} (".class_basename($model)." #{$model->id})");

        if ($dryRun) {
            $this->stats['migrated']++;

            return;
        }

        try {
            $to->put($path, $from->get($path));

            $model->{$column} = $to->url($path);
            $model->saveQuietly();

            $this->stats['migrated']++;
        } catch (Throwable $e) {
            $this->stats['failed']++;
            $this->error("Échec sur {$path}: {$e->getMessage()}");
        }
    }
}
