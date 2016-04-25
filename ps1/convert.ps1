[CmdletBinding(DefaultParameterSetName="Convert")]
Param(
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $LogFile,
    
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

Start-Process powershell -WindowStyle Hidden -ArgumentList "-noprofile -nologo -file $Converter -LogFile $LogFile -Installer $Installer -ExpandedBaseImage $ExpandedBaseImage -Destination $Destination -PackageName $PackageName -Version $Version -Publisher $Publisher -AppExecutable $AppExecutable -Verbose" -verb RunAs