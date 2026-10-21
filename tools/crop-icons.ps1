Add-Type -AssemblyName System.Drawing
$src=[System.Drawing.Bitmap]::new('C:\Users\Weslley\AppData\Local\Temp\codex-clipboard-b96132f6-b48e-4d7c-b758-765eddf4933a.png')
$out='C:\Users\Weslley\Downloads\Linktree\assets'
New-Item -ItemType Directory -Force -Path $out | Out-Null
foreach($item in @(@{name='instagram';x=16;y=112},@{name='whatsapp';x=112;y=14})){
  $bmp=[System.Drawing.Bitmap]::new(66,66,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g=[System.Drawing.Graphics]::FromImage($bmp);$g.DrawImage($src,0,0,(New-Object System.Drawing.Rectangle($item.x,$item.y,66,66)),[System.Drawing.GraphicsUnit]::Pixel);$g.Dispose()
  $corner=$bmp.GetPixel(0,0)
  for($x=0;$x -lt 66;$x++){for($y=0;$y -lt 66;$y++){ $p=$bmp.GetPixel($x,$y); if([math]::Abs($p.R-$corner.R)+[math]::Abs($p.G-$corner.G)+[math]::Abs($p.B-$corner.B) -lt 18){$bmp.SetPixel($x,$y,[System.Drawing.Color]::FromArgb(0,$p.R,$p.G,$p.B))}}}
  $bmp.Save((Join-Path $out ($item.name+'.png')),[System.Drawing.Imaging.ImageFormat]::Png);$bmp.Dispose()
}
$src.Dispose()
