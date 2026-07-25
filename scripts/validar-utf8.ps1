$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)
$Extensions = @('.html','.htm','.css','.js','.json','.xml','.md','.txt','.svg','.yml','.yaml')
$BadPatterns = @([string][char]0x00C3,[string][char]0x00C2,[string][char]0xFFFD)
$Errors = New-Object System.Collections.Generic.List[string]

Get-ChildItem -Path $Root -Recurse -File | Where-Object {
    $Extensions -contains $_.Extension.ToLowerInvariant() -and $_.FullName -notmatch '\\.git\\|\\node_modules\\'
} | ForEach-Object {
    try {
        $Text = $Utf8Strict.GetString([System.IO.File]::ReadAllBytes($_.FullName))
    }
    catch {
        $Errors.Add("UTF-8 invalido: $($_.FullName.Substring($Root.Length + 1))")
        return
    }

    foreach ($Pattern in $BadPatterns) {
        if ($Text.Contains([string]$Pattern)) {
            $Errors.Add("Possivel texto corrompido: $($_.FullName.Substring($Root.Length + 1))")
            break
        }
    }
}

if ($Errors.Count -gt 0) {
    Write-Host ''
    Write-Host 'COMMIT BLOQUEADO: foram encontrados problemas de codificacao.' -ForegroundColor Red
    $Errors | Sort-Object -Unique | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
    exit 1
}

Write-Host 'Validacao UTF-8 concluida sem erros.' -ForegroundColor Green
exit 0