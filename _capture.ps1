param(
  [Parameter(Mandatory = $true)][string]$Out,
  [int]$Frames = 36
)
$ErrorActionPreference = 'Continue'
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$pkg = 'com.alfath.medical'
$act = 'com.alfath.medical/.MainActivity'

if (Test-Path -LiteralPath $Out) { Remove-Item -LiteralPath $Out -Recurse -Force }
New-Item -ItemType Directory -Force -Path $Out | Out-Null

& $adb shell am force-stop $pkg | Out-Null
Start-Sleep -Seconds 3
& $adb shell input keyevent KEYCODE_WAKEUP | Out-Null
$sw = [System.Diagnostics.Stopwatch]::StartNew()
& $adb shell am start -S -W -n $act | Select-String -Pattern "LaunchState|TotalTime"

$times = @()
for ($i = 0; $i -lt $Frames; $i++) {
  & $adb shell screencap -p "/data/local/tmp/cap$i.png" | Out-Null
  $times += [math]::Round($sw.Elapsed.TotalMilliseconds)
}
for ($i = 0; $i -lt $Frames; $i++) {
  & $adb pull "/data/local/tmp/cap$i.png" (Join-Path $Out ("f{0:d2}.png" -f $i)) | Out-Null
  & $adb shell rm "/data/local/tmp/cap$i.png" | Out-Null
}
$times | Set-Content -Path (Join-Path $Out "times.txt")
Write-Output "captured $Frames frames -> $Out"
