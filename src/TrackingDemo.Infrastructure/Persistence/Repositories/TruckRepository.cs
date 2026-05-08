using Microsoft.EntityFrameworkCore;
using TrackingDemo.Application.Abstractions;
using TrackingDemo.Domain.Entities;

namespace TrackingDemo.Infrastructure.Persistence.Repositories;

public sealed class TruckRepository : ITruckRepository
{
    private readonly TrackingDemoDbContext _dbContext;

    public TruckRepository(TrackingDemoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<IReadOnlyList<Truck>> GetAllAsync(CancellationToken cancellationToken = default) =>
        _dbContext.Trucks
            .AsNoTracking()
            .OrderBy(x => x.TruckCode)
            .ToListAsync(cancellationToken)
            .ContinueWith(task => (IReadOnlyList<Truck>)task.Result, cancellationToken);

    public Task<Truck?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _dbContext.Trucks.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task AddAsync(Truck truck, CancellationToken cancellationToken = default) =>
        _dbContext.Trucks.AddAsync(truck, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
