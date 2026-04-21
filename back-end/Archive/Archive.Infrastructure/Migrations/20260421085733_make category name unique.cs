using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Archive.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class makecategorynameunique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_CATEGORIES_Name",
                table: "CATEGORIES",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CATEGORIES_Name",
                table: "CATEGORIES");
        }
    }
}
