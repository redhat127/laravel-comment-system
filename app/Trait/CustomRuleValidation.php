<?php

namespace App\Trait;

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
}
