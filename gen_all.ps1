function w([string]`$n,[string]`$c){[System.IO.File]::WriteAllText("d:/flowcv/src/blocks/`$n",`$c.TrimStart([char]10),[System.Text.UTF8Encoding]::new(`$false));Write-Host "Created:`$n"}
