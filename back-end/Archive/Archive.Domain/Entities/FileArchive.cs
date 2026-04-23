using Archive.Domain.Common;
using Archive.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Domain.Entities
{
    public class FileArchive : BaseEntity
    {
        public int UploadedByUserId { get; private set; }
        public int CategoryId { get; private set; }

        public string FileNumber { get; private set; } = null!;
        public string FileName { get; private set; } = null!;

        public DateTime? InputDate { get; private set; }
        public DateTime? ExpireDate { get; private set; }

        public decimal? Amount { get; private set; }
        public string? FilePath { get; private set; }

        public DateTime UploadedAt { get; private set; }

        public User UploadedBy { get; private set; } = null!;
        public Category Category { get; private set; } = null!;

        private FileArchive() { }

        public FileArchive(
      int uploadedByUserId,
      int categoryId,
      string fileNumber,
      string fileName,
      DateTime? inputDate,
      DateTime? expireDate,
      decimal? amount,
      string? filePath)
        {
            if (uploadedByUserId <= 0)
                throw new ArgumentException("Uploader is required");

            if (categoryId <= 0)
                throw new ArgumentException("Category is required");

            if (string.IsNullOrWhiteSpace(fileNumber))
                throw new ArgumentException("File number is required");

            if (string.IsNullOrWhiteSpace(fileName))
                throw new ArgumentException("File name is required");

            UploadedByUserId = uploadedByUserId;
            CategoryId = categoryId;

            FileNumber = fileNumber;
            FileName = fileName;

            InputDate = inputDate;
            ExpireDate = expireDate;

            Amount = amount;
            FilePath = filePath;

            UploadedAt = DateTime.UtcNow; 
        }
        public void UpdateFileName(string newFileName)
        {
            if (string.IsNullOrWhiteSpace(newFileName))
                throw new ArgumentException("File name cannot be empty");

            FileName = newFileName;
        }
    }
}
