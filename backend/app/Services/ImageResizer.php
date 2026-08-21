<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

// Every admin upload controller (products, banners, categories, brands) used
// to store the raw uploaded file as-is — a 6000x4000 phone photo served
// unresized to a 400px grid card. This resizes down to a target width
// before storing, using the exact same disk/URL convention those
// controllers already relied on (Storage::disk($disk)->url($path)).
class ImageResizer
{
    private ImageManager $manager;

    public function __construct()
    {
        // GD is what's available on this environment; Imagick isn't
        // installed. Revisit if the target deploy server only has Imagick.
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Resizes the uploaded image down to fit within $maxWidth (never
     * upscales — a source already narrower than $maxWidth is stored as-is
     * in size, just re-encoded) and stores it. Returns the stored path,
     * exactly like UploadedFile::store() would, so callers keep using
     * Storage::disk($disk)->url($path) as before.
     */
    public function resizeAndStore(UploadedFile $file, string $dir, int $maxWidth, string $disk = 'public'): string
    {
        $image = $this->manager->read($file->getRealPath());
        $image->scaleDown(width: $maxWidth);

        // Not $file->hashName() — it memoizes the generated name on the
        // UploadedFile instance, so calling this twice on the same $file
        // (thumbnail + detail size) would silently collide on one filename
        // and the second write would clobber the first.
        $path = "{$dir}/".Str::random(40).'.'.$file->extension();

        Storage::disk($disk)->put($path, (string) $image->encode());

        return $path;
    }
}
