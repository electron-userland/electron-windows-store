#
# Takes a folder, turns it into a zip file.
#

[CmdletBinding(DefaultParameterSetName="Convert")]
Param(
    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $source,

    [Parameter(Mandatory=$True, ParameterSetName="Convert")]
    [string]
    [ValidateNotNullOrEmpty()]
    $destination
)

If (-Not (Test-path $source)) {
    return "Source directory cannot be found"
}

If (-Not (Test-path $destination)) {
    return "Destination directory cannot be found"
}

# We're zipping using the sytem's compressor
Add-Type -assembly "system.io.compression.filesystem"
$zip = Join-Path -Path $destination -ChildPath windowsstore.zip

[io.compression.zipfile]::CreateFromDirectory($source, $zip)