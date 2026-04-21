using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
