using Microsoft.EntityFrameworkCore;
using TrackingDemo.Domain.Entities;

namespace TrackingDemo.Infrastructure.Persistence;

public sealed class TrackingDemoDbContext : DbContext
{
    public TrackingDemoDbContext(DbContextOptions<TrackingDemoDbContext> options)
        : base(options)
    {
    }

    public DbSet<Truck> Trucks => Set<Truck>();
    public DbSet<Zone> Zones => Set<Zone>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Truck>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.TruckCode).HasMaxLength(50).IsRequired();
            entity.Property(x => x.X).HasPrecision(18, 4);
            entity.Property(x => x.Y).HasPrecision(18, 4);
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(32);
        });

        modelBuilder.Entity<Zone>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.MinX).HasPrecision(18, 4);
            entity.Property(x => x.MinY).HasPrecision(18, 4);
            entity.Property(x => x.MaxX).HasPrecision(18, 4);
            entity.Property(x => x.MaxY).HasPrecision(18, 4);
        });
    }
}
