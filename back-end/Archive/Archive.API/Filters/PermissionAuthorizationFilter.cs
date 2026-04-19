//using Archive.API.Attributes;
//using Archive.Application.Interfaces.Authentication;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.AspNetCore.Mvc.Filters;
//using System.Security.Claims;

//namespace Archive.API.Filters
//{
//    public class PermissionAuthorizationFilter : IAsyncAuthorizationFilter
//    {
//        private readonly IPermissionService _permissionService;

//        public PermissionAuthorizationFilter(IPermissionService permissionService)
//        {
//            _permissionService = permissionService;
//        }

//        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
//        {
//            var endpoint = context.ActionDescriptor.EndpointMetadata
//                .OfType<RequirePermissionAttribute>()
//                .FirstOrDefault();

//            if (endpoint == null)
//                return;

//            var userIdClaim = context.HttpContext.User
//                .FindFirst(ClaimTypes.NameIdentifier);

//            if (userIdClaim == null)
//            {
//                context.Result = new UnauthorizedResult();
//                return;
//            }

//            int userId = int.Parse(userIdClaim.Value);

//            var hasPermission = await _permissionService.HasPermissionAsync(
//                userId,
//                endpoint.PermissionKey
//            );

//            if (!hasPermission)
//            {
//                context.Result = new ForbidResult();
//            }
//        }
//    }
//}