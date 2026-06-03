# optimize_images.ps1
# Resize and compress JPG/PNG images for optimal Vercel loading.
# Place this script in the project root (same as index.html) and run:
#   powershell -ExecutionPolicy Bypass -File .\optimize_images.ps1

# Load System.Drawing assembly (required for image manipulation)
[void][Reflection.Assembly]::LoadWithPartialName('System.Drawing')

# Project root is the folder where this script resides
$projectRoot = Split-Path $PSScriptRoot -Parent
$sourceDir   = Join-Path $projectRoot 'images'

$maxDim     = 1200   # maximum width or height in pixels
$jpegQuality = 75     # JPEG quality (0‑100)

function Get-Encoder($mime) {
    [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq $mime }
}

$jpegEncoder = Get-Encoder 'image/jpeg'
$pngEncoder  = Get-Encoder 'image/png'

# Encoder parameters for JPEG quality
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$quality   = [System.Drawing.Imaging.Encoder]::Quality
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($quality, [int64]$jpegQuality)

Get-ChildItem -Path $sourceDir -Include *.jpg, *.jpeg, *.png -File -Recurse | ForEach-Object {
    $file = $_
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $width  = $img.Width
        $height = $img.Height
        $scale  = 1.0
        if ($width -gt $maxDim -or $height -gt $maxDim) {
            $scale = [Math]::Min($maxDim / $width, $maxDim / $height)
        }
        if ($scale -lt 1) {
            $newW = [int]($width  * $scale)
            $newH = [int]($height * $scale)
            $thumb = New-Object System.Drawing.Bitmap $newW, $newH
            $gr = [System.Drawing.Graphics]::FromImage($thumb)
            $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $gr.DrawImage($img, 0, 0, $newW, $newH)
            $gr.Dispose()
            $img.Dispose()
            $img = $thumb
        }
        if ($file.Extension -match '(?i)jpe?g') {
            $img.Save($file.FullName, $jpegEncoder, $encParams)
        } else {
            # PNG – re‑encode to strip metadata (no quality setting needed)
            $img.Save($file.FullName, $pngEncoder, $null)
        }
        $img.Dispose()
        Write-Host "Optimized $($file.Name)"
    } catch {
        Write-Warning "Failed $($file.Name): $_"
    }
}

Write-Host "Image optimisation complete."
