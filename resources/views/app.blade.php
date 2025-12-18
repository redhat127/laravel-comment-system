<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title inertia>{{ config('app.name', 'Laravel') }}</title>

  <script>
    (function() {
      const stored = localStorage.getItem('theme');
      const validThemes = ['light', 'dark', 'system'];
      const isValid = stored && validThemes.includes(stored);
      const theme = isValid ? stored : 'system';

      // Save to localStorage if invalid or missing
      if (!isValid) {
        localStorage.setItem('theme', 'system');
      }

      const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const resolved = theme === 'system' ? getSystemTheme() : theme;

      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
    })();
  </script>

  @viteReactRefresh
  @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
  @inertiaHead
</head>

<body class="font-inter antialiased bg-gray-100 dark:bg-slate-950">
  @inertia
</body>

</html>
