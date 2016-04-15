# Electron Apps in the Windows Store
Turn Electron Apps into Windows Store AppX Packages

## How to use
1) Package application using electron-packager (or something similar)
2) Zip the contents as app.zip (without using a subdirectory - ./yourapp.exe)
3) Copy together with ElectronInstaller.exe into a folder

#### Execute the Desktop Converter
Execute the converter, passing in the "ElectronInstaller.exe" as your installer. :warning: Please ensure that your `Publisher` name matches the one in your certificate. If you [do not yet have a certificate, you can create one](#sign-the-package).

```
.\DesktopAppConverter.ps1 
    -ExpandedBaseImage C:\ProgramData\Microsoft\Windows\Images\BaseImage-14316\
    -Installer C:\Users\feriese\Desktop\input\ElectronInstaller.exe
    -Destination C:\Users\feriese\Desktop\output\
    -PackageName "YOURAPP"
    -Publisher "CN=testca"
    -Version 1.0.0.0
    -AppExecutable "C:\Users\ContainerAdministrator\AppData\Roaming\e\YOURAPP.EXE"
    -Verbose
```

#### Add Tile Images, Logos, and Other Metadata
At this point, your app consists of three components that can be found in the output folder: The Virtualized Filesystem (found in the `VFS` folder), visual assets for your app (found in `assets`) and an application manifest (found in `AppXManifesst.xml`). 

Before proceeding with the next step, add icons, logos, descriptions, and other meta data you'd like to be in the app. For tipps and documents around tiles and icons, please see the ["Guidelines for tile and icon assets"](https://msdn.microsoft.com/en-us/windows/uwp/controls-and-patterns/tiles-and-notifications-app-assets). For more information about the package manifest, please [consult the docs](https://msdn.microsoft.com/en-us/library/windows/apps/br211474.aspx).

#### Create AppX Package
App packager (MakeAppx.exe) creates an app package from files on disk. It is included with the Windows SDK. The MakeAppx.exe tool is typically found inside your Windows 10 SDK installation folder. To pack the created directory into an appx, run:

```
cd "C:\Program Files (x86)\Windows Kits\10\bin\x64\"
.\makeappx.exe pack /d C:\Users\feriese\Desktop\output\ /p C:\Users\feriese\Desktop\Ghost.appx
```

#### Sign the Package
Once Windows Codename Redstone (also known as the "Windows Anniversary Update") is released, you will be able to submit packages to the Windows Store. When that happens, you will sign your apps with a Microsoft Certificate - but in the meantime, you will need to sign your brand new appx package with a certificate trusted by your computer.

If you have not already created one, use the tool `MakeCert.exe`. 

```
cd "C:\Program Files (x86)\Windows Kits\10\bin\x64\"
MakeCert.exe -r -h 0 -n "CN=<publisher_name>" -eku 1.3.6.1.5.5.7.3.3 -pe -sv <my.pvk> <my.cer>
pvk2pfx.exe -pvk <my.pvk> -spc <my.cer> -pfx <my.pfx>
signtool.exe sign -f <my.pfx> -fd SHA256 -v .\<outputAppX>.appx
```

#### Deploy the Package
```
Add-AppxPackage .\Ghost.appx
```

## Things to keep in mind
The Electron auto-updater module on Windows is based on Squirrel, which is not available. Keep in mind that the Windows Store already provides auto-updating, so you can simply ensure that the auto-updater isn't hit when running inside the Windows Store (much like you would on Linux).

## Things that are broken
- MAX_PATH is an issue, especially due to the long base path