#
# Takes a folder, flatten node modules within the folder.
#

[CmdletBinding(DefaultParameterSetName="Convert")]
Param(
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $source
)

If (-Not (Test-path $source)) {
    return "Source directory for flatten cannot be found"
}

$flattenbin = (get-item $PSScriptRoot).parent.FullName + '\node_modules\flatten-packages\bin\flatten'

$dir = $source
write-host "Flattening npm modules from this directory: " $dir

if(!$dir.EndsWith('\')){
	$dir = $dir + '\'
}
write-host "npm install..."
cd $dir
npm install
write-host "Processing root level..."
Get-ChildItem $dir -Directory | ForEach-Object {
	if($_.Name -eq 'node_modules'){
			write-host $dir
			node $flattenbin $dir
	}
}

write-host "Processing SubDirectories..."
Get-ChildItem $dir -Directory | ForEach-Object {
	$path = $dir + $_
	
	Get-ChildItem $path -Directory | ForEach-Object{
		if($_.Name -eq 'node_modules'){
			write-host $path
			node $flattenbin $path
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
				node $flattenbin $subpath
			}
		}
	}
}