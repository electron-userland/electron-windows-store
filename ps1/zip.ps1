#
# Takes a folder, turns it into a zip file.
#

[CmdletBinding(DefaultParameterSetName="Convert")]
Param(
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $Source,

    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $Destination
)

If (-Not (Test-path $Source)) {
    return "Source directory cannot be found"
}

If (-Not (Test-path $Destination)) {
    return "Destination directory cannot be found"
}

# We're zipping using the sytem's compressor
Add-Type -assembly "system.io.compression.filesystem"
$Zip = Join-Path -Path $Destination -ChildPath app.zip

If (Test-Path $Zip) {
    Remove-Item $Zip
}

[io.compression.zipfile]::CreateFromDirectory($Source, $Zip)

# Copy over installer
$Installer = (Get-Item $PSScriptRoot).parent.FullName + '\bin\ElectronInstaller.exe'
Copy-item $Installer -Destination $Destination