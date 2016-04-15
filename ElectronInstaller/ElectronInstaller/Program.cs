using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.IO.Compression;
using System.Reflection;

namespace ElectronInstaller
{
    class Program
    {
        public static string AssemblyDirectory
        {
            get
            {
                string codeBase = Assembly.GetExecutingAssembly().CodeBase;
                UriBuilder uri = new UriBuilder(codeBase);
                string path = Uri.UnescapeDataString(uri.Path);
                return Path.GetDirectoryName(path);
            }
        }

        static void Main(string[] args)
        {
            Console.WriteLine("This tool functions as a basic installer for Electron Apps, to be used with the Desktop to UWP converter (also known as Project Centennial).");
            Console.WriteLine("");

            var input = Path.Combine(AssemblyDirectory, "app.zip");
            var output = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "e");

            if (!Directory.Exists(output))
            {
                Directory.CreateDirectory(output);
            }

            Logger("Input:");
            Logger(input);
            Logger("Output:");
            Logger(output);

            Unzip(input, output);
        }

        static void Logger(String lines)
        {
            var log = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "e", "log.txt");
            System.IO.StreamWriter file = new System.IO.StreamWriter(log, true);
            file.WriteLine(lines);

            file.Close();
        }

        static void Unzip(string zip, string destination)
        {

            if (!File.Exists(zip))
            {
                Logger("app.zip does not exist or could not be found");
                Environment.Exit(1);
                return;
            }

            Logger("Unzipping " + zip + " to " + destination);
            ZipFile.ExtractToDirectory(zip, destination);
            Logger("Unzip operation successful");
        }
    }
}
