using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.DTOs
{
    public class UserCategoryPermissionsDto
    {
        public int UserId { get; set; }
        public List<CategoryPermissionsDto> Categories { get; set; } = new();
    }
}
