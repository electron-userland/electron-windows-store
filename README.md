# Electron Apps in the Windows Store
Turn Your Electron Apps into Windows Store AppX Packages!

Electron-Windows-Store: A CLI that takes the packaged output of your Electron app, then converts it into an AppX package. Once Windows Codename Redstone (also known as the "Windows Anniversary Update") is released, you will be able to submit your AppX packages to the Windows Store. When that happens, you will sign your apps with a Microsoft Certificate - but in the meantime, this widget can also help you sign your brand new appx package with a certificate trusted by your computer.

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
- Make sure you are running a Windows 10 Enterprise edition base image version 10.0.14316.0 and higher.
- Download Windows 10 SDK from [here](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk)
- Ensure you have Node 4.x

### Package Your Electron Application
Package the application using [electron-packager](https://github.com/electron-userland/electron-packager) (or something similar). Make sure to remove node_modules that you don't want in your final app. 

### Installing From NPM
You can install the electron-windows-store cli npm package directly.

```
npm install -g electron-windows-store
```

## Running the Basic Version
From an admin PowerShell window, run the `electron-windows-store` CLI. 

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
 -h, --help                                 output usage information
 -V, --version                              output the version number
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
The electron-windows-store CLI takes the packaged output of your Electron app as an input. First it flattens the node_modules in the packaged output of the Electron app. Then it creates a zip file `app.zip` with the updated content of the packaged Electron app in the output folder you specified. With the `app.zip` file, the CLI uses the `DesktopAppConverter` utilities to convert the zip file into AppX packaged output files (including the `AppXManifest.xml` file) in the output folder you specified. Once we have the AppX packaged output files, the CLI uses App packager (MakeAppx.exe) to create an AppX package from those files on disk. Finally, the CLI can be used to create a trusted cert on your computer before we sign the new AppX pacakge. With the signed AppX package, the CLI can also deploy the package using the `Add-AppxPackage` PowerShell Cmdlet. 


## So How Do I Release?
Once Windows Codename Redstone (also known as the "Windows Anniversary Update") is released, you will be able to submit your AppX packages to the Windows Store. When that happens, you will sign your apps with a Microsoft Certificate - but in the meantime, this widget can also help you sign your brand new appx package with a certificate trusted by your computer.

