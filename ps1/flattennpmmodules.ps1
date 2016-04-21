$dir = (get-item $PSScriptRoot).parent.FullName
write-host "Flattening npm modules from this directory: " $dir
if(!$dir.EndsWith('\')){
	$dir = $dir + '\'
}
write-host "Processing root level..."
Get-ChildItem $dir -Directory | ForEach-Object {
	if($_.Name -eq 'node_modules'){
			write-host $dir
			flatten-packages $dir
	}
}

write-host "Processing SubDirectories..."
Get-ChildItem $dir -Directory | ForEach-Object {
	$path = $dir + $_
	
	Get-ChildItem $path -Directory | ForEach-Object{
		if($_.Name -eq 'node_modules'){
			write-host $path
			flatten-packages $path
		}
	}
	
}

write-host "Processing Sub-SubDirectories..."
Get-ChildItem $dir -Directory | ForEach-Object {
	$path = $dir + $_
	
	Get-ChildItem $path -Directory | ForEach-Object{
		$subpath = $path + '\' + $_
	
		Get-ChildItem $subpath -Directory | ForEach-Object{
			if($_.Name -eq 'node_modules'){
				write-host $subpath
				flatten-packages $subpath
			}
		}
	}
}