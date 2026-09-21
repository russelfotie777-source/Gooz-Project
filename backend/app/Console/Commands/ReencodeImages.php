<?php

namespace App\Console\Commands;

use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ProductImage;
use App\Services\ImageResizer;
use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ReencodeImages extends Command
{
    protected $signature = 'images:reencode {--dry-run : List what would change without touching any file or row}';

    protected $description = 'Transcodes already-stored lossy images (products, banners, categories, brands) to '
        .'AVIF at ImageResizer::LOSSY_QUALITY — for files uploaded before that became the target format. Renames '
        .'the file and updates the owning row so its URL keeps pointing at a real file. Idempotent: an image '
        ."already in AVIF is left untouched, so running this again after a partial run (or after new uploads "
        .'that are already AVIF) is safe. Never resizes, never touches PNG/SVG/other lossless formats.';

    private array $stats = ['reencoded' => 0, 'skipped' => 0, 'missing' => 0, 'failed' => 0];

    public function handle(ImageResizer $resizer): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $disk = Storage::disk('public');

        ProductImage::query()->each(function (ProductImage $image) use ($resizer, $disk, $dryRun) {
            $this->reencodeField($image, 'image_url', $resizer, $disk, $dryRun);
            $this->reencodeField($image, 'thumbnail_url', $resizer, $disk, $dryRun);
        });

        Banner::query()->each(fn (Banner $b) => $this->reencodeField($b, 'image', $resizer, $disk, $dryRun));
        Category::query()->each(fn (Category $c) => $this->reencodeField($c, 'image', $resizer, $disk, $dryRun));
        Brand::query()->each(fn (Brand $b) => $this->reencodeField($b, 'logo', $resizer, $disk, $dryRun));

        // saveQuietly() (see reencodeField()) skips model events on purpose
        // — bypasses the admin controllers' own Cache::forget() too, so it
        // has to be repeated here. Banners/products aren't cached this way.
        if (! $dryRun && $this->stats['reencoded'] > 0) {
            Cache::forget(CategoryController::CACHE_KEY);
            Cache::forget(BrandController::CACHE_KEY);
        }

        $this->info(sprintf(
            '%sRé-encodées : %d — déjà AVIF ou format sans perte : %d — fichiers introuvables : %d — échecs : %d',
            $dryRun ? '[dry-run] ' : '',
            $this->stats['reencoded'],
            $this->stats['skipped'],
            $this->stats['missing'],
            $this->stats['failed'],
        ));

        return self::SUCCESS;
    }

    private function reencodeField(
        EloquentModel $model,
        string $column,
        ImageResizer $resizer,
        Filesystem $disk,
        bool $dryRun
    ): void {
        $url = $model->{$column};

        if (! $url) {
            return;
        }

        $path = Str::after($url, '/storage/');

        if (! $disk->exists($path)) {
            $this->stats['missing']++;

            return;
        }

        try {
            $image = $resizer->read($disk->path($path));
            $mediaType = $image->origin()->mediaType();

            if (! in_array($mediaType, ImageResizer::LOSSY_MEDIA_TYPES, true)) {
                // Already AVIF (nothing left to convert) or a lossless
                // format (PNG, ...) that's never transcoded — either way,
                // correctly nothing to do.
                $this->stats['skipped']++;

                return;
            }

            $newPath = Str::beforeLast($path, '.').'.'.ImageResizer::LOSSY_OUTPUT_EXTENSION;

            $this->line(($dryRun ? '[dry-run] ' : '')."{$path} -> {$newPath}");

            if (! $dryRun) {
                $encoded = $resizer->encode($image);
                $disk->put($newPath, (string) $encoded);
                $disk->delete($path);

                $model->{$column} = $disk->url($newPath);
                $model->saveQuietly();
            }

            $this->stats['reencoded']++;
        } catch (Throwable $e) {
            $this->stats['failed']++;
            $this->error("Échec sur {$path} : {$e->getMessage()}");
        }
    }
}
