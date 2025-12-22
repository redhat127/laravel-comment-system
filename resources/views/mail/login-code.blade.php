<x-mail::message>
# Hello,

Here's your secure login code:

**{{ $code }}**

This code will expire in 10 minutes.

If you didn't request this code, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
