
using Archive.Application.Interfaces.Services;
using Archive.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.DependencyInjection
{
    public static class ApplicationDependencyInjection
    {
        public static IServiceCollection AddApplication(
       this IServiceCollection services,
       IConfiguration configuration)
        {
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IPermissionServiceApp, PermissionServiceApp>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IFileStorageService, FileStorageService>();

            return services;
        }
    }
}
