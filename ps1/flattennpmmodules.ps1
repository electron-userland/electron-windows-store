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

function flatMe([string]$path){
	write-host "Get subdirectories of: " $path
	Get-ChildItem $path -Directory | ForEach-Object {
		if($_.Name -eq 'node_modules'){
			write-host "Flattening: " $path
			node $flattenbin $path
		}else{
			flatMe($path + '\' + $_)
		}
	}
}

$dir = $source
write-host "Flattening npm modules from this directory: " $dir

if(!$dir.EndsWith('\')){
	$dir = $dir + '\'
}
flatMe($dir)


