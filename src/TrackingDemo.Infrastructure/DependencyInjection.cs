using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TrackingDemo.Application.Abstractions;
using TrackingDemo.Infrastructure.Persistence;
using TrackingDemo.Infrastructure.Persistence.Repositories;

namespace TrackingDemo.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("TrackingDemoDatabase")
            ?? "Server=(localdb)\\mssqllocaldb;Database=TrackingDemoDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

        services.AddDbContext<TrackingDemoDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<ITruckRepository, TruckRepository>();

        return services;
    }
}
