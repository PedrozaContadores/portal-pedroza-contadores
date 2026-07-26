$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Root = Split-Path -Parent $PSScriptRoot
$Utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)
$Extensions = @(".html", ".htm", ".css", ".js", ".json", ".xml", ".md", ".txt", ".svg", ".yml", ".yaml", ".ps1", ".mjs")
$Errors = New-Object System.Collections.Generic.List[string]
$TrimChars = [char[]]@([char]92, [char]47)

$BadPatterns = @(
    @{ Name = "double encoded UTF-8 sequence C3-0192"; Value = (([string][char]0x00C3) + ([string][char]0x0192)) },
    @{ Name = "double encoded UTF-8 sequence C3-201A"; Value = (([string][char]0x00C3) + ([string][char]0x201A)) },
    @{ Name = "replacement bytes rendered as text"; Value = (([string][char]0x00EF) + ([string][char]0x00BF) + ([string][char]0x00BD)) },
    @{ Name = "Unicode replacement character"; Value = ([string][char]0xFFFD) }
)

$Files = Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object {
    $Extensions -contains $_.Extension.ToLowerInvariant() -and
    $_.FullName -notmatch "[\\/]\.git[\\/]" -and
    $_.FullName -notmatch "[\\/]node_modules[\\/]"
}

foreach ($File in $Files) {
    $Relative = $File.FullName.Substring($Root.Length).TrimStart($TrimChars)

    try {
        $Bytes = [System.IO.File]::ReadAllBytes($File.FullName)
        $Text = $Utf8Strict.GetString($Bytes)
    }
    catch {
        $Errors.Add("UTF-8 invalido: $Relative | $($_.Exception.Message)")
        continue
    }

    $Lines = [System.Text.RegularExpressions.Regex]::Split($Text, "\r?\n")
    for ($Index = 0; $Index -lt $Lines.Count; $Index++) {
        foreach ($Bad in $BadPatterns) {
            if ($Lines[$Index].Contains([string]$Bad.Value)) {
                $Snippet = $Lines[$Index].Trim()
                if ($Snippet.Length -gt 160) {
                    $Snippet = $Snippet.Substring(0, 160) + "..."
                }
                $Errors.Add("$Relative linha $($Index + 1): $($Bad.Name) | $Snippet")
            }
        }
    }
}

if ($Errors.Count -gt 0) {
    Write-Host ""
    Write-Host "COMMIT BLOQUEADO: problemas reais de codificacao encontrados." -ForegroundColor Red
    $Errors | Sort-Object -Unique | ForEach-Object {
        Write-Host " - $_" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host "Validacao UTF-8 concluida sem erros." -ForegroundColor Green
exit 0