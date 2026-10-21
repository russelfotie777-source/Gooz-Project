<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

/**
 * A lightweight, backend-only guard against a plain "create" action being
 * double-submitted (double-click before the UI disables the button, a
 * client retry after a timed-out response) — for actions where, unlike
 * checkout or stock adjustments, there's no natural row/business invariant
 * to lock against: two submissions just independently create two otherwise
 * valid records (a second notification send, a second expense, a second
 * purchase order...).
 *
 * Cache::add() is atomic ("set if not already set"), so this is a real
 * concurrency-safe guard, not a racy "check then act" query — and it
 * auto-expires, so it can never leave a stale lock behind. It only ever
 * rejects the exact same actor submitting the exact same payload again
 * within a few seconds, which is what a double-submit looks like; any
 * genuinely different request is unaffected.
 */
trait PreventsDuplicateSubmission
{
    /**
     * @param  array<string, mixed>  $payload  Only the fields that make two
     *   submissions "the same" — e.g. pass the validated request data for a
     *   plain create, or add an actor id yourself for an admin action.
     */
    protected function rejectIfDuplicateSubmission(string $scope, array $payload, int $withinSeconds = 8): void
    {
        $key = 'dedupe:'.$scope.':'.sha1(json_encode($payload));

        if (! Cache::add($key, true, $withinSeconds)) {
            throw ValidationException::withMessages([
                'duplicate' => ["Cette action vient d'être effectuée — merci de patienter quelques secondes avant de réessayer."],
            ]);
        }
    }
}
