#
# Takes a folder, flattens node modules within the folder.
#

[CmdletBinding(DefaultParameterSetName="Convert")]
Param(
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $source
)

If (-Not (Test-path $source)) {
    return "Source directory cannot be found"
}

$flattenbin = (get-item $PSScriptRoot).parent.FullName + '\node_modules\flatten-packages\bin\flatten'
If (!(Test-Path $flattenbin)) {
    $flattenbin = (get-item $PSScriptRoot).parent.FullName + '\..\flatten-packages\bin\flatten'
}

function flatMe([string]$path){
    if (!$path.EndsWith('\')) {
        $path = $path + '\'
    }
    
    Write-Host "Getting subdirectories of: " $path
    Get-ChildItem $path -Directory | ForEach-Object {
        if($_.Name -eq 'node_modules'){
            Write-Host "Flattening: " $path
            node $flattenbin $path
        } else {
            flatMe($path + $_)
        }
    }
}

$dir = $source
Write-Host "Flattening npm modules for this directory: " $dir

flatMe($dir)
