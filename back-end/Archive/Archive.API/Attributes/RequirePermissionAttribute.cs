using Microsoft.AspNetCore.Mvc;

namespace Archive.API.Attributes;

[AttributeUsage(AttributeTargets.Method)]
public class RequirePermissionAttribute : Attribute
{
    public string PermissionKey { get; }

    public RequirePermissionAttribute(string permissionKey)
    {
        PermissionKey = permissionKey;
    }
}