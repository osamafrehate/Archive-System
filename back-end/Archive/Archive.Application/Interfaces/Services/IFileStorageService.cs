using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Services
{
    
        public interface IFileStorageService
        {
            Task<string> SaveFileAsync(
           string categoryName,
           string fileName,
           string fileNumber,
           string extension,
           Stream fileStream,
           CancellationToken ct);
        }
    }

