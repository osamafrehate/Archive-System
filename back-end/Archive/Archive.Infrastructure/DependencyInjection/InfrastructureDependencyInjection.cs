
using Archive.Application.Interfaces.Authentication;
using Archive.Application.Interfaces.Caching;
using Archive.Application.Interfaces.Repositories;
using Archive.Application.Interfaces.Services;
using Archive.Infrastructure.Persistence;
using Archive.Infrastructure.Repositories;
using Archive.Infrastructure.Services.Authentication;
using Archive.Infrastructure.Services.Caching;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Infrastructure.DependencyInjection
{
    public static class InfrastructureDependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
       this IServiceCollection services,
       IConfiguration configuration)
        {
            services.AddDbContext<ArchiveDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
            // Auth
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();
            
            

            // Redis
            //services.AddSingleton<IConnectionMultiplexer>(_ =>
            //    ConnectionMultiplexer.Connect(configuration.GetConnectionString("Redis")!));

            //services.AddScoped<IRedisService, RedisService>();


            //Repo
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IFileRepository, FileRepository>();
            services.AddScoped<IUserCategoryPermissionRepository, UserCategoryPermissionRepository>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();


            //Authz
            services.AddScoped<IPermissionService, PermissionService>();

            return services;
        }
    }
}
