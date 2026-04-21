using Archive.Application.Interfaces.Services;
using System.Text.RegularExpressions;

namespace Archive.Application.Services
{
    
    public class FileStorageService : IFileStorageService
    {
        private const string BasePath = @"C:\Archive";

        public async Task<string> SaveFileAsync(
            string categoryName,
            string fileName,
            string fileNumber,
            string extension,
            Stream fileStream,
            CancellationToken ct)
        {
            var safeCategory = Sanitize(categoryName);
            var safeFileName = Sanitize(fileName);
            extension = extension.ToLower();

            var year = DateTime.UtcNow.Year.ToString();

            var directoryPath = Path.Combine(BasePath, safeCategory, year);

            if (!Directory.Exists(directoryPath))
                Directory.CreateDirectory(directoryPath);

            var finalFileName = $"{safeFileName}_{fileNumber}{extension}";
            var fullPath = Path.Combine(directoryPath, finalFileName);

            await using var output = new FileStream(
                fullPath,
                FileMode.Create,
                FileAccess.Write,
                FileShare.None,
                81920,
                true);

            await fileStream.CopyToAsync(output, ct);

            return fullPath;
        }

        private string Sanitize(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return "unknown";

            return Regex.Replace(input, @"[^a-zA-Z0-9-_]", "_");
        }
    }
}