using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Archive.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class add_file_filtering_indexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create index on CategoryId for category filtering
            migrationBuilder.CreateIndex(
                name: "IX_FileArchive_CategoryId",
                table: "FILES",
                column: "CategoryId");

            // Create index on FileNumber for partial search filtering
            migrationBuilder.CreateIndex(
                name: "IX_FileArchive_FileNumber",
                table: "FILES",
                column: "FileNumber");

            // Create index on InputDate for year-based filtering
            migrationBuilder.CreateIndex(
                name: "IX_FileArchive_InputDate",
                table: "FILES",
                column: "InputDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FileArchive_CategoryId",
                table: "FILES");

            migrationBuilder.DropIndex(
                name: "IX_FileArchive_FileNumber",
                table: "FILES");

            migrationBuilder.DropIndex(
                name: "IX_FileArchive_InputDate",
                table: "FILES");
        }
    }
}
