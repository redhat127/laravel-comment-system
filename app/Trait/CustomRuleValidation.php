<?php

namespace App\Trait;

use Illuminate\Validation\Rule;

trait CustomRuleValidation
{
    public function emailRule()
    {
        return ['bail', 'required', 'string', 'email', 'max:50'];
    }

    public function rememberMeRule()
    {
        return ['bail', 'required', 'boolean'];
    }

    public function codeRule()
    {
        return ['bail', 'required', 'string', 'min:1', 'max:50'];
    }

    public function nameRule()
    {
        return ['bail', 'required', 'string', 'min:3', 'max:50', 'regex:/^[a-zA-Z0-9 _-]+$/'];
    }

    public function usernameRule(?string $uniqueIgnoreId = null)
    {
        $rules = [
            'bail',
            'required',
            'string',
            'min:6',
            'max:50',
            'lowercase',
            'regex:/^[a-z0-9][a-z0-9_-]*$/',
            Rule::notIn(['admin', 'root', 'system', 'support', 'api', 'www', 'mail', 'help']),
        ];

        $uniqueRule = Rule::unique('users', 'username');

        if ($uniqueIgnoreId) {
            $uniqueRule->ignore($uniqueIgnoreId);
        }

        $rules[] = $uniqueRule;

        return $rules;
    }
}
