<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

// Laravel's own `mimes:` rule only accepts a file whose content Symfony's
// MimeTypes component can confidently fingerprint back to one of the listed
// extensions (via libmagic signature bytes). Several online JPEG→AVIF
// converters produce files that decode fine in a browser but don't match
// that fingerprint closely enough — `mimes:jpg,...,avif` rejected them even
// though "avif" was right there in the allowed list. Falling back to the
// uploaded filename's own extension when the strict sniff fails is safe
// here: this only guards admin upload endpoints, and the next step
// (ImageResizer::resizeAndStore, via Intervention Image/GD) still has to
// actually decode the file — a renamed non-image would fail there instead,
// not silently get stored.
class ImageUploadRule implements ValidationRule
{
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'avif', 'avifs'];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile) {
            $fail('The :attribute must be a file.');

            return;
        }

        $byContentSniff = strtolower((string) $value->guessExtension());
        $byFilename = strtolower($value->getClientOriginalExtension());

        if (in_array($byContentSniff, self::ALLOWED_EXTENSIONS, true) || in_array($byFilename, self::ALLOWED_EXTENSIONS, true)) {
            return;
        }

        $fail('The :attribute must be a file of type: '.implode(', ', self::ALLOWED_EXTENSIONS).'.');
    }
}
