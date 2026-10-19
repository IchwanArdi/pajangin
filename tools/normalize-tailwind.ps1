$root = Join-Path $PSScriptRoot '..\apps\frontend'
$files = Get-ChildItem -Path $root -Recurse -File | Where-Object { $_.Extension -in '.ts', '.tsx', '.js', '.jsx' }

$replacements = @{
  'rounded-[var(--radius-card)]' = 'rounded-(--radius-card)';
  'rounded-[var(--radius-input)]' = 'rounded-(--radius-input)';
  'bg-[var(--color-paper)]' = 'bg-paper';
  'bg-[var(--color-paper-2)]' = 'bg-paper-2';
  'bg-[var(--color-accent)]' = 'bg-accent';
  'bg-[var(--color-accent-soft)]' = 'bg-accent-soft';
  'bg-[var(--color-ink)]' = 'bg-ink';
  'text-[var(--color-ink)]' = 'text-ink';
  'text-[var(--color-ink-2)]' = 'text-ink-2';
  'text-[var(--color-accent)]' = 'text-accent';
  'text-[var(--color-accent-ink)]' = 'text-accent-ink';
  'text-[var(--color-paper)]' = 'text-paper';
  'text-[var(--color-rule)]' = 'text-rule';
  'border-[var(--color-rule)]' = 'border-rule';
  'border-[var(--color-accent)]' = 'border-accent';
  'hover:text-[var(--color-ink)]' = 'hover:text-ink';
  'hover:bg-[var(--color-paper-2)]' = 'hover:bg-paper-2';
  'hover:border-[var(--color-rule)]' = 'hover:border-rule';
  'focus:border-[var(--color-accent)]' = 'focus:border-accent';
  'focus:ring-[var(--color-focus)]' = 'focus:ring-focus';
  'ring-[var(--color-accent)]' = 'ring-accent';
  'shadow-[var(--shadow-pop)]' = 'shadow-pop';
  'bg-[var(--color-accent-soft)]/20' = 'bg-accent-soft/20';
  'bg-[var(--color-accent)]/40' = 'bg-accent/40';
  'bg-[var(--color-paper)]/80' = 'bg-paper/80';
  'text-[var(--color-ink)]/70' = 'text-ink/70';
  'text-[var(--color-accent)]/80' = 'text-accent/80';
  'text-[var(--color-ink)]/60' = 'text-ink/60';
  'bg-[var(--color-paper-2)]/80' = 'bg-paper-2/80';
  'ring-[var(--color-focus)]' = 'ring-focus';
}

$changed = 0
foreach ($file in $files) {
  $content = Get-Content -Path $file.FullName -Raw
  $updated = $content
  foreach ($key in $replacements.Keys) {
    $updated = $updated.Replace($key, $replacements[$key])
  }
  if ($updated -ne $content) {
    Set-Content -Path $file.FullName -Value $updated -NoNewline
    $changed++
  }
}

Write-Host "CLASS_NORMALIZE_DONE $changed"
