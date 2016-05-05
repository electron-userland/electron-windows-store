# Electron Apps in the Windows Store
<a href="https://david-dm.org/catalystcode/electron-windows-store" title="Dependency status"><img src="https://david-dm.org/catalystcode/electron-windows-store.svg"/></a> <a href="https://www.npmjs.com/package/electron-windows-store"><img src="https://badge.fury.io/js/electron-windows-store.svg" alt="npm version" height="18"></a>

Electron-Windows-Store: A CLI that takes the packaged output of your Electron app, then converts it into an AppX package. Once Windows Codename Redstone (also known as the "Windows Anniversary Update") is released, you will be able to submit your AppX packages to the Windows Store.

![](https://cloud.githubusercontent.com/assets/1426799/15042115/3471f6a0-12b9-11e6-91b4-80f25ec1d0b8.jpg)

To install this command line tool, get it directly from npm:

```
npm install -g electron-windows-store
```

## System Requirements

#### Supported Operating System

Windows 10 Anniversary Update - Preview (Build 14316 and up) - Enterprise edition

#### Required Hardware Configuration

Your computer must have the following minimum capabilities:
- 64 bit (x64) processor
- Hardware-assisted virtualization
- Second Level Address Translation (SLAT)

## How to Install?

### Prerequisites
Before running the Electron-Windows-Store CLI, let's make sure we have all the prerequisites in place.
- Download and follow the installation steps to install the Desktop App Converter from [here](https://www.microsoft.com/en-us/download/details.aspx?id=51691). You will get the following files: `DesktopAppConverter.zip` and `BaseImage-14316.wim`
- Make sure you are running a Windows 10 Enterprise edition 14316 or higher (if in doubt, run `electron-windows-store -b` to display your build number).
- Download the Windows 10 SDK from [here](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk)
- Ensure you have Node 4.x

### Package Your Electron Application
Package the application using [electron-packager](https://github.com/electron-userland/electron-packager) (or something similar). Make sure to remove node_modules that you don't need in your final application.

The output should look roughly like this:
```
├── Ghost.exe
├── LICENSE
├── content_resources_200_percent.pak
├── content_shell.pak
├── d3dcompiler_47.dll
├── ffmpeg.dll
├── icudtl.dat
├── libEGL.dll
├── libGLESv2.dll
├── locales
│   ├── am.pak
│   ├── ar.pak
│   ├── [...]
├── msvcp120.dll
├── msvcr120.dll
├── natives_blob.bin
├── node.dll
├── pdf.dll
├── resources
│   ├── app
│   └── atom.asar
├── snapshot_blob.bin
├── squirrel.exe
├── ui_resources_200_percent.pak
├── vccorlib120.dll
└── xinput1_3.dll
```

## Running the Basic Version
From an elevated PowerShell (run it "as Administrator"), run `electron-windows-store` with the required parameters, passing both the input and output directories, the app's name and version, and confirmation that node_modules should be flattened. If you don't pass these parameters, we will simply ask you for them.

```
electron-windows-store --input-directory C:\myelectronapp  --output-directory C:\output\myelectronapp --flatten true --package-version 1.0.0.0 --package-name myelectronapp
```

> :bulb: Note: The first time you run this tool, we need to know some settings. We will ask you only once and store your answers in your profile folder in a .electron-windows-store file. You can also provide these values when running the CLI or create a .electron-windows-store file in your profile folder.

```
{
  "desktopConverter": "C:\\Tools\\DesktopConverter",
  "expandedBaseImage": "C:\\ProgramData\\Microsoft\\Windows\\Images\\BaseImage-14316\\",
  "publisher": "CN=developmentca",
  "windowsKit": "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64",
  "devCert": "C:\Tools\DesktopConverter\Certs\devcert.pfx"
}
```

Here are more options for the CLI:

```
 -h, --help                                 Output usage information
 -b, --windows-build                        Output Windows Build information
 -V, --version                              Output the version number
 -i, --input-directory <path>               Directory containing your application
 -o, --output-directory <path>              Output directory for the appx
 -f, --flatten <true|false>                 Flatten Node modules without warning
 -p, --package-version <version>            Version of the app package
 -n, --package-name <name>                  Name of the app package
 -e, --package-executable <executablePath>  Path to the package executable
 -a, --assets <assetsPath>                  Path to the visual assets for the appx
 -m, --manifest <manifestPath>              Path to a manifest, if you want to overwrite the default one
 -d, --deploy <true|false>                  Should the app be deployed after creation?
```

## What is the CLI Doing?
The `electron-windows-store` CLI takes the packaged output of your Electron app as an input. First it flattens the node_modules in the packaged output of the Electron app. Then, it creates a zip file `app.zip` with the updated content of the packaged Electron app in the output folder you specified. With the `app.zip` file, the CLI uses the `DesktopAppConverter` utilities to convert the zip file into AppX packaged output files (including the `AppXManifest.xml` file) in the output folder you specified.

Once we have the AppX packaged output files, the CLI uses the Windows App Packager (MakeAppx.exe) to create an AppX package from those files on disk. Finally, the CLI can be used to create a trusted certificate on your computer before we sign the new AppX pacakge. With the signed AppX package, the CLI can also deploy the package using the `Add-AppxPackage` PowerShell Cmdlet. 

## So How Do I Release?
Once Windows Codename Redstone (also known as the "Windows Anniversary Update") is released, you will be able to submit your AppX packages to the Windows Store. When that happens, you will sign your apps with a Microsoft Certificate - but in the meantime, this widget can also help you sign your brand new appx package with a certificate trusted by your computer.

## License
Licensed using the MIT License (MIT); Copyright (c) Microsoft Corporation. For more information, please see [LICENSE](LICENSE).
