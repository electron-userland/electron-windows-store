[CmdletBinding(DefaultParameterSetName="Convert")]
Param(
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $Installer,
    
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $Converter,

    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $ExpandedBaseImage,
    
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $Destination,
    
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $PackageName,
    
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $Version,
    
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $Publisher,
    
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $AppExecutable
)

Write-Host "-noprofile -file $Converter -Installer $Installer -ExpandedBaseImage $ExpandedBaseImage -Destination $Destination -PackageName $PackageName -Version $Version -Publisher $Publisher -AppExecutable $AppExecutable -Verbose";
Start-Process powershell -ArgumentList "-noprofile -file $Converter -Installer $Installer -ExpandedBaseImage $ExpandedBaseImage -Destination $Destination -PackageName $PackageName -Version $Version -Publisher $Publisher -AppExecutable $AppExecutable -Verbose" -verb RunAs