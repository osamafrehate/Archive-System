using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.DTOs
{
    public class FileDto
    {
        public int Id { get; set; }
        public string Status { get; set; }
        public string FileNumber { get; set; }
        public string FileName { get; set; }
        public DateTime UploadedAt { get; set; }

        public string CategoryName { get; set; }
        public string UploadedByUsername { get; set; }
        public decimal? Amount { get; set; }
    }
}
