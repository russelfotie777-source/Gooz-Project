<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\EncodedImageInterface;
use Intervention\Image\Interfaces\ImageInterface;

// Every admin upload controller (products, banners, categories, brands) used
// to store the raw uploaded file as-is — a 6000x4000 phone photo served
// unresized to a 400px grid card. This resizes down to a target width
// before storing, using the exact same disk/URL convention those
// controllers already relied on (Storage::disk($disk)->url($path)).
class ImageResizer
{
    // Measured on real product photos (PSNR against the source): AVIF at
    // quality 80 already beats WebP quality 90 on both fidelity (47dB vs
    // 45.3dB) AND file size (~22Ko vs ~24Ko on a 1200px photo) — WebP's
    // "quality" number simply isn't on the same scale as AVIF's, so
    // reusing the old WebP quality value here would have made files
    // needlessly larger for no real quality gain. Public so the
    // images:reencode command (see ReencodeImages) can apply this exact
    // same setting to files uploaded before it changed, without
    // duplicating (and risking drifting from) these values.
    public const LOSSY_QUALITY = 80;

    // AVIF beats WebP on quality-per-byte for real photos (see above) —
    // every lossy source (JPEG, WebP, ...) is transcoded to it on upload.
    // PNG/other lossless sources are left alone (see encode()).
    public const LOSSY_OUTPUT_MEDIA_TYPE = 'image/avif';

    public const LOSSY_OUTPUT_EXTENSION = 'avif';

    public const LOSSY_MEDIA_TYPES = [
        'image/jpeg', 'image/jpg', 'image/pjpeg', 'image/x-jpeg',
        'image/webp', 'image/x-webp',
    ];

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
        $encoded = $this->encode($image);

        // Not $file->hashName() — it memoizes the generated name on the
        // UploadedFile instance, so calling this twice on the same $file
        // (thumbnail + detail size) would silently collide on one filename
        // and the second write would clobber the first.
        //
        // The stored extension must match what was actually encoded, not
        // the upload's original one — a JPEG upload comes out the other
        // end as .avif (see encode()), and naming the file .jpg while it
        // holds AVIF bytes would serve it with the wrong Content-Type.
        $extension = $this->extensionFor($encoded->mediaType());
        $path = "{$dir}/".Str::random(40).'.'.$extension;

        Storage::disk($disk)->put($path, (string) $encoded);

        return $path;
    }

    /**
     * Transcodes any lossy source (JPEG, WebP, ...) to AVIF — see
     * LOSSY_QUALITY's comment for why. PNG/other lossless formats have no
     * "quality" concept (their encoder doesn't even accept the option) and
     * are left in their original format. Public so ReencodeImages can
     * re-apply this to an already-stored file without resizing it again.
     */
    public function encode(ImageInterface $image): EncodedImageInterface
    {
        $mediaType = $image->origin()->mediaType();

        return in_array($mediaType, self::LOSSY_MEDIA_TYPES, true)
            ? $image->encodeByMediaType(self::LOSSY_OUTPUT_MEDIA_TYPE, quality: self::LOSSY_QUALITY)
            : $image->encode();
    }

    public function extensionFor(string $mediaType): string
    {
        return $mediaType === self::LOSSY_OUTPUT_MEDIA_TYPE
            ? self::LOSSY_OUTPUT_EXTENSION
            : (Str::contains($mediaType, '/') ? Str::after($mediaType, '/') : $mediaType);
    }

    public function read(string $path): ImageInterface
    {
        return $this->manager->read($path);
    }
}
