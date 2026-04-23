using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.DTOs
{
    public class DownloadFileDto
    {
        public string FilePath { get; set; } = null!;
        public string FileName { get; set; } = null!;
    }
}
