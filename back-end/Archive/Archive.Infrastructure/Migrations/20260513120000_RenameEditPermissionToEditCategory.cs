using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Archive.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameEditPermissionToEditCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update the permission name from "EDIT" to "EDIT CATEGORY"
            migrationBuilder.Sql(
                @"UPDATE PERMISSIONS SET Name = 'EDIT CATEGORY' WHERE Name = 'EDIT' AND Id = 3;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert the permission name back to "EDIT"
            migrationBuilder.Sql(
                @"UPDATE PERMISSIONS SET Name = 'EDIT' WHERE Name = 'EDIT CATEGORY' AND Id = 3;");
        }
    }
}
