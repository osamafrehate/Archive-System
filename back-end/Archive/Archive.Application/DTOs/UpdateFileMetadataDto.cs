namespace Archive.Application.DTOs
{
    /// <summary>
    /// DTO for updating file metadata only (not the physical file).
    /// Fields that can be edited:
    /// - FileName
    /// - FileNumber
    /// - CategoryId
    /// - InputDate
    /// - ExpireDate
    /// - Amount
    /// 
    /// Fields that CANNOT be changed:
    /// - FilePath (physical file location)
    /// - UploadedByUserId (who uploaded)
    /// - UploadedAt (upload timestamp)
    /// </summary>
    public class UpdateFileMetadataDto
    {
        public string? FileName { get; set; }
        public string? FileNumber { get; set; }
        public int? CategoryId { get; set; }
        public DateTime? InputDate { get; set; }
        public DateTime? ExpireDate { get; set; }
        public decimal? Amount { get; set; }
    }
}
