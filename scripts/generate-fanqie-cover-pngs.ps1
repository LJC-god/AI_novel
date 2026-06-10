param(
  [string]$Root = 'outputs\fanqie-first-9-books'
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$root = Join-Path (Get-Location) $Root
$coverDataPath = Join-Path $root 'cover-data.json'
$coverDataJson = [System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes($coverDataPath))
$coverData = $coverDataJson | ConvertFrom-Json

$palettes = @(
  @{ Bg='#101828'; Accent='#ef4444'; Text='#fde68a' },
  @{ Bg='#0f172a'; Accent='#06b6d4'; Text='#fef3c7' },
  @{ Bg='#1f2937'; Accent='#f97316'; Text='#fff7ed' },
  @{ Bg='#111827'; Accent='#a855f7'; Text='#dcfce7' },
  @{ Bg='#0b1120'; Accent='#22c55e'; Text='#e0f2fe' },
  @{ Bg='#2a160a'; Accent='#f59e0b'; Text='#fef9c3' },
  @{ Bg='#10231f'; Accent='#14b8a6'; Text='#fefce8' },
  @{ Bg='#1e1b4b'; Accent='#facc15'; Text='#f8fafc' },
  @{ Bg='#172554'; Accent='#ef4444'; Text='#fef2f2' }
)

function New-Color($hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function Split-Title([string]$text, [int]$maxLen) {
  $chars = $text.ToCharArray()
  $lines = New-Object System.Collections.Generic.List[string]
  for ($i = 0; $i -lt $chars.Length; $i += $maxLen) {
    $take = [Math]::Min($maxLen, $chars.Length - $i)
    $segment = New-Object char[] $take
    [Array]::Copy($chars, $i, $segment, 0, $take)
    $lines.Add((-join $segment))
  }
  return $lines
}

$footer = -join @(
  [char]0x756A, [char]0x8304, [char]0x5411, ' ', '-', ' ',
  [char]0x524D, '2', '0', [char]0x7AE0, [char]0x8BD5, [char]0x5199
)

$coverIndex = 0
foreach ($cover in $coverData) {
  $palette = $palettes[$coverIndex % $palettes.Count]
  $coverIndex += 1

  $dir = Join-Path $root $cover.dir
  $out = Join-Path $dir 'cover.png'

  $w = 1200
  $h = 1600
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $bg = New-Color $palette.Bg
  $accent = New-Color $palette.Accent
  $text = New-Color $palette.Text

  $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($w, $h)),
    $bg,
    $accent
  )
  $g.FillRectangle($brushBg, 0, 0, $w, $h)

  $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, $accent))
  $g.FillEllipse($accentBrush, 760, 70, 420, 420)
  $g.FillEllipse($accentBrush, -140, 1080, 520, 520)

  $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(72, 0, 0, 0))
  $panelPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, $text), 3)
  $g.FillRectangle($panelBrush, 110, 235, 980, 1110)
  $g.DrawRectangle($panelPen, 110, 235, 980, 1110)

  $textBrush = New-Object System.Drawing.SolidBrush($text)
  $accentPen = New-Object System.Drawing.Pen($accent, 16)
  $accentPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $accentPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawBezier($accentPen, 130, 1130, 330, 900, 675, 900, 1060, 510)

  $fontGenre = New-Object System.Drawing.Font('Microsoft YaHei UI', 48, [System.Drawing.FontStyle]::Bold)
  $fontTitle = New-Object System.Drawing.Font('Microsoft YaHei UI', 76, [System.Drawing.FontStyle]::Bold)
  $fontLine = New-Object System.Drawing.Font('Microsoft YaHei UI', 38, [System.Drawing.FontStyle]::Regular)
  $fontSmall = New-Object System.Drawing.Font('Microsoft YaHei UI', 30, [System.Drawing.FontStyle]::Regular)
  $fmtCenter = New-Object System.Drawing.StringFormat
  $fmtCenter.Alignment = [System.Drawing.StringAlignment]::Center

  $g.DrawString($cover.genre, $fontGenre, $textBrush, (New-Object System.Drawing.RectangleF(0, 105, $w, 80)), $fmtCenter)

  $titleLines = Split-Title $cover.title 10
  $startY = 360
  foreach ($line in $titleLines) {
    $g.DrawString($line, $fontTitle, $textBrush, (New-Object System.Drawing.RectangleF(90, $startY, 1020, 96)), $fmtCenter)
    $startY += 100
  }

  $symbolBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(215, $text))
  $symbolAccentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(185, $accent))
  $g.FillEllipse($symbolAccentBrush, 415, 835, 370, 370)
  $g.FillEllipse($symbolBrush, 525, 885, 150, 150)
  $g.FillPolygon($symbolBrush, @(
    (New-Object System.Drawing.Point(440, 1180)),
    (New-Object System.Drawing.Point(545, 1010)),
    (New-Object System.Drawing.Point(655, 1010)),
    (New-Object System.Drawing.Point(760, 1180))
  ))

  $g.DrawString($cover.line, $fontLine, $textBrush, (New-Object System.Drawing.RectangleF(80, 1260, 1040, 70)), $fmtCenter)
  $g.DrawString($footer, $fontSmall, $textBrush, (New-Object System.Drawing.RectangleF(80, 1370, 1040, 60)), $fmtCenter)

  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose()
  $bmp.Dispose()
}
