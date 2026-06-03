# compress_images.ps1
# Compress JPEG images in the 'images' folder to reduce file size.
# Place this script in the project root and run it with PowerShell.

$sourceDir = Join-Path $PSScriptRoot 'images'
$files = Get-ChildItem $sourceDir -Include *.jpg, *.jpeg -File -Recurse

foreach ($file in $files) {
    try {
        $bitmap = [System.Drawing.Image]::FromFile($file.FullName)
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $quality = [System.Drawing.Imaging.Encoder]::Quality
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($quality, 80L)
        $bitmap.Save($file.FullName, $encoder, $encoderParams)
        $bitmap.Dispose()
        Write-Host "Compressed $($file.Name)"
    } catch {
        Write-Warning "Failed to process $($file.Name): $_"
    }
}
