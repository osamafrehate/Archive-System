using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.DTOs
{
    public class CategoryPermissionsDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;

        public Dictionary<string, bool> Permissions { get; set; } = new();
    }
}
