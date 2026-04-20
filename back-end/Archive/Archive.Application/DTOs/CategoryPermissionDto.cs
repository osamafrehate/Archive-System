using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.DTOs
{
    public class CategoryPermissionDto
    {
        public int CategoryId { get; set; }
        public bool IsSelected { get; set; }
        public List<string>? Permissions { get; set; }
    }
}
