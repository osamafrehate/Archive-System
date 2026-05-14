using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Archive.API.Converters
{
    /// <summary>
    /// Custom JSON converter for DateTime values that ensures they are always serialized with UTC indicators.
    /// This converter treats all DateTime values as UTC, which is necessary because:
    /// 1. EF Core reads from datetime2 columns (timezone-naive) and creates DateTime with Kind = Unspecified
    /// 2. The default .NET JSON serializer doesn't include 'Z' suffix for Unspecified kind
    /// 3. JavaScript interprets missing 'Z' as local browser time, causing timezone mismatches
    /// 
    /// By explicitly marking all DateTime values as UTC during serialization, we ensure that:
    /// - API responses include the 'Z' suffix: "2026-05-12T07:15:35.0480000Z"
    /// - JavaScript correctly interprets them as UTC
    /// - Frontend can properly convert to local timezone using toTimeString() and toLocaleDateString()
    /// </summary>
    public class UtcDateTimeJsonConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            string? dateString = reader.GetString();
            if (string.IsNullOrEmpty(dateString))
                throw new JsonException($"Empty date string encountered");

            // Parse the date string and ensure it's treated as UTC
            if (DateTime.TryParseExact(dateString, "O", null, System.Globalization.DateTimeStyles.RoundtripKind, out DateTime result))
            {
                // If parsed from ISO format with 'Z', it's already UTC
                if (result.Kind == DateTimeKind.Utc)
                    return result;
                
                // If parsed without timezone info (Unspecified), assume it's UTC
                if (result.Kind == DateTimeKind.Unspecified)
                    return DateTime.SpecifyKind(result, DateTimeKind.Utc);
                
                return result;
            }

            // Fallback: try standard DateTime parsing
            return DateTime.Parse(dateString);
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            // Always write as UTC with 'Z' suffix
            // Ensure the DateTime is treated as UTC when serializing
            DateTime utcValue = value.Kind == DateTimeKind.Utc 
                ? value 
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);

            writer.WriteStringValue(utcValue.ToUniversalTime().ToString("O"));
        }
    }
}
