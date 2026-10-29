@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
{{-- Hosted on the frontend's own public/ folder (same asset Header.tsx's
     light-theme logo uses) — only resolves for recipients once
     config('app.frontend_url') is a real, publicly reachable domain, not
     localhost (see FRONTEND_URL in .env.example). --}}
<img
    src="{{ rtrim(config('app.frontend_url'), '/') }}/logo-shopitech-primaire/logoFichier%205version%20F.png"
    class="logo"
    alt="Shopitech"
>
</a>
</td>
</tr>
