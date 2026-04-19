using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.DTOs
{
    public class UploadFileDto
    {
        public int CategoryId { get; set; }
        public string FileNumber { get; set; }
        public string FileName { get; set; }

        public DateTime? InputDate { get; set; }
        public DateTime? ExpireDate { get; set; }

        public decimal? Amount { get; set; }
    }
}
