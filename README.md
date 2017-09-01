# Electron Apps in the Windows Store
<a href="https://david-dm.org/catalystcode/electron-windows-store" title="Dependency status"><img src="https://david-dm.org/catalystcode/electron-windows-store.svg"/></a> <a href="https://www.npmjs.com/package/electron-windows-store"><img src="https://badge.fury.io/js/electron-windows-store.svg" alt="npm version" height="18"></a> <a href="https://ci.appveyor.com/project/felixrieseberg/electron-windows-store"><img src="https://ci.appveyor.com/api/projects/status/jd5fn0ryk3a7v7i3/branch/master?svg=true" /></a>

Electron-Windows-Store: A CLI that takes the packaged output of your Electron app, then converts it into an AppX package. Once Windows Codename Redstone (also known as the "Windows Anniversary Update") is released, you will be able to submit your AppX packages to the Windows Store. :package: Users will also be able to just double-click your `.appx` to automatically install it.

> :warning: If you want to submit your package to the Windows Store, please sign up [for the Desktop Bridge Program](https://developer.microsoft.com/de-de/windows/projects/campaigns/desktop-bridge). Microsoft will currently not accept your packages if you have not done so.

> :warning: The resulting AppX is not currently compatible with Assigned Access for use as a kiosk.

![](https://cloud.githubusercontent.com/assets/1426799/15042115/3471f6a0-12b9-11e6-91b4-80f25ec1d0b8.jpg)

To install this command line tool, get it directly from npm:

```
npm install -g electron-windows-store
```

Then, configure your PowerShell:

```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

To turn an Electron app into an AppX package, run:

```
electron-windows-store --input-directory C:\myelectronapp  --output-directory C:\output\myelectronapp --flatten true --package-version 1.0.0.0 --package-name myelectronapp
```

This tool supports two methods to create AppX packages: Either using manual file copy operations, or using Windows Containers. The first option requires only the [Windows 10 SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk), while the second option also requires the [Desktop App Converter](https://www.microsoft.com/en-us/download/details.aspx?id=51691).

# Usage
Before running the Electron-Windows-Store CLI, let's make sure we have all the prerequisites in place. You will need:

 * Windows 10 Anniversary Update - Enterprise Edition (This is build 14316 and up - as of May 2016, it's part of the latest Windows Insiders Preview)
 * Windows 10 SDK from [here](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk) (the lastest version might not include all the tools needed, take a look at [the archives](https://developer.microsoft.com/en-us/windows/downloads/sdk-archive))
 * Node 4 or above (to check, run `node -v`)

## Package Your Electron Application
Package the application using [electron-packager](https://github.com/electron-userland/electron-packager) (or something similar). Make sure to remove node_modules that you don't need in your final application.

The output should look roughly like this:
```
├── Ghost.exe
├── LICENSE
├── content_resources_200_percent.pak
├── node.dll
├── pdf.dll
├── resources
│   ├── app
│   └── atom.asar
├── snapshot_blob.bin
├── [... and more files]
```

## Convert with File Copying
**From an elevated PowerShell (run it "as Administrator")**, run `electron-windows-store` with the required parameters, passing both the input and output directories, the app's name and version, and confirmation that node_modules should be flattened. If you don't pass these parameters, we will simply ask you for them.

```
electron-windows-store --input-directory C:\myelectronapp  --output-directory C:\output\myelectronapp --flatten true --package-version 1.0.0.0 --package-name myelectronapp
```

These are all options for the CLI:

```
  -h, --help                                 output usage information
  -V, --version                              output the version number
  -c, --container-virtualization             Create package using Windows Container virtualization
  -b, --windows-build                        Display Windows Build information
  -i, --input-directory <path>               Directory containing your application
  -o, --output-directory <path>              Output directory for the appx
  -f, --flatten <true|false>                 Flatten Node modules without warning
  -p, --package-version <version>            Version of the app package
  -n, --package-name <name>                  Name of the app package
      --package-display-name <displayName>   Display name of the package
      --package-description <description>    Description of the package
      --package-background-color <color>     Background color for the app icon (example: #464646)
  -e, --package-executable <executablePath>  Path to the package executable
  -a, --assets <assetsPath>                  Path to the visual assets for the appx
  -m, --manifest <manifestPath>              Path to a manifest, if you want to be overwritten
  -d, --deploy <true|false>                  Should the app be deployed after creation?
  --publisher <publisher>                    Publisher to use (example: CN=developmentca)
  --publisher-display-name <publisherDisplayName> Publisher display name to use
  --make-pri <true|false>                    Use makepri.exe (you don't need to unless you know you do)
  --windows-kit <windows-kit>                Path to the Windows Kit bin folder
  --dev-cert <dev-cert>                      Path to the developer certificate to use
  --cert-pass <cert-pass>                    Password to use when signing the application (only necessary if a p12 certication is used)
  --desktop-converter <desktop-converter>    Path to the desktop converter tools
  --expanded-base-image <base-image>         Path to the expanded base image
  --makeappx-params <params>                 Additional parameters for Make-AppXPackage (example: --makeappx-params "/l","/d")
  --signtool-params <params>                 Additional parameters for signtool.exe (example: --makeappx-params "/l","/d")
  --create-config-params <params>            Additional parameters for makepri.exe "createconfig" (example: --create-config-params "/l","/d")')
  --create-pri-params <params>               Additional parameters for makepri.exe "new" (example: --create-pri-params "/l","/d")')
  --verbose <true|false>                     Enable debugging (similar to setting a DEBUG=electron-windows-store environment variable)
```

## Programmatic Usage
You can call this package directly. All options correspond to the CLI options and are equally optional. There is one exception: You can provide a `finalSay` function, which will be executed right before `makeappx.exe` is being called. This allows you to modify the output folder right before we turn it into a package.

```js
const convertToWindowsStore = require('electron-windows-store')

convertToWindowsStore({
   containerVirtualization: false,
   inputDirectory: 'C:\\input\\',
   outputDirectory: 'C:\\output\\',
   flatten: false,
   packageVersion: '1.0.0.0',
   packageName: 'Ghost',
   packageDisplayName: 'Ghost Desktop',
   packageDescription: 'Ghost for Desktops',
   packageExecutable: 'app/Ghost.exe',
   assets: 'C:\\assets\\',
   manifest: 'C:\\AppXManifest.xml',
   deploy: false,
   publisher: 'CN=developmentca',
   windowsKit: 'C:\\windowskit',
   devCert: 'C:\\devcert.pfx',
   certPass: 'abcd',
   desktopConverter: 'C:\\desktop-converter-tools',
   expandedBaseImage: 'C:\\base-image.wim',
   makeappxParams: ['/l'],
   signtoolParams: ['/p'],
   makePri: true,
   createConfigParams: ['/a'],
   createPriParams: ['/b'],
   finalSay: function () {
     return new Promise((resolve, reject) => resolve())
   }
})
```

## Convert with Container Virtualization
The Desktop App Converter is capabable of running an installer and your app during conversion inside a Windows Container. This is useful if you're not entirely sure what your application does, but requires installation of the Desktop App Converter.

:computer: Ensure that your computer is capable of running containers: You'll need a 64 bit (x64) processor, hardware-assisted virtualization and second Level Address Translation (SLAT).

:bulb: Before running the CLI for the first time, you will have to setup the "Windows Desktop App Converter". This will take a few minutes, but don't worry - you only have to do this once. Download and the Desktop App Converter from [here](https://www.microsoft.com/en-us/download/details.aspx?id=51691). You will receive two files: `DesktopAppConverter.zip` and `BaseImage-14316.wim`.

1. Unzip `DesktopAppConverter.zip`. From an elevated PowerShell (opened with "run as Administrator"., ensure that your systems execution policy allows us to run everything we inted to run by calling `Set-ExecutionPolicy bypass`.
2. Then, run the installation of the Desktop App Converter, passing in the location of the Windows .ase Image (downloaded as `BaseImage-14316.wim`), by calling `.\DesktopAppConverter.ps1 -Setup -BaseImage .\BaseImage-14316.wim`.
3. If running the above command prompts you for a reboot, please restart your machine and run the above command again after a successful restart.

Then, run `electron-windows-store` with the `--container-virtualization` flag!

#### What is the CLI Doing?
Once executed, the tool goes to work: It accepts your Electron app as an input, flattening the `node_modules`. Then, it archives your application as `app.zip`. Using an installer and a Windows Container, the tool creates an "expanded" AppX package - including the Windows Application Manifest (`AppXManifest.xml`) as well as the virtual file system and the virtual registry inside your output folder.

Once we have the expanded AppX files, the tool uses the Windows App Packager (`MakeAppx.exe`) to create a single-file AppX package from those files on disk. Finally, the tool can be used to create a trusted certificate on your computer to sign the new AppX pacakge. With the signed AppX package, the CLI can also automatically install the package on your machine.

## Configuration
:bulb: The first time you run this tool, it needs to know some settings. It will ask you only once and store your answers in your profile folder in a `.electron-windows-store` file. You can also provide these values as a parameter when running the CLI.

```json
{
  "publisher": "CN=developmentca",
  "windowsKit": "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64",
  "devCert": "C:\\Tools\\DesktopConverter\\Certs\\devcert.pfx",
  "desktopConverter": "C:\\Tools\\DesktopConverter",
  "expandedBaseImage": "C:\\ProgramData\\Microsoft\\Windows\\Images\\BaseImage-14316\\"
}
```

## Using all the fancy Windows APIs
You can pair up your Electron app with a little invisible UWP side-kick, enabling your Electron app to call all WinRT APIs. Check out [an example over here](https://github.com/felixrieseberg/electron-uwp-background).

## Devices
The compiled AppX package still contains a win32 executable - and will therefore not run on Xbox, HoloLens, or Phones.

## License
Licensed using the MIT License (MIT); Copyright (c) Microsoft Corporation. For more information, please see [LICENSE](LICENSE).
