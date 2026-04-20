using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.DTOs
{
    public class AssignUserPermissionsDto
    {
        public int UserId { get; set; }
        public List<CategoryPermissionDto> Categories { get; set; }
    }
}
