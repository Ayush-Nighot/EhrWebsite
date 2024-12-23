using Core.Interface;
using Core.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stripe;
using Stripe.Terminal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfigurationManager configuration)
        {
            services.AddScoped<IAppDbContext, AppDbContext>();
            services.AddScoped<EmailService>();
            services.AddScoped<JwtService>();
            services.AddScoped<PasswordGenerator>();
            services.AddScoped<UploadHandler>();
            services.AddScoped<UserService>();
            services.AddScoped<AppointmentService>();
            services.AddScoped<SoapNoteService>();
            services.AddScoped<StripeService>();
            services.AddHttpContextAccessor();

            services.AddDbContext<AppDbContext>((provider, options) =>
            {
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName));
            });

            return services;
        }
    }
}
