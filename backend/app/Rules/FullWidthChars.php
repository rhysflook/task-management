<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class FullWidthChars implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // 'regex:/^[\p{Han}\p{Katakana}\p{Hiragana}\x{FF01}-\x{FF5E}\x{3000}-\x{303F}\s]+$/u'
        if (!preg_match('/^[\p{Han}\p{Katakana}\p{Hiragana}\x{FF01}-\x{FF5E}\x{3000}-\x{303F}\s]+$/u', $value)) {
            $fail(':attributeは、全角文字で入力してください。');
        }
    }
}
