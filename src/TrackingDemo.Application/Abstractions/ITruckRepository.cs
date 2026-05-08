using TrackingDemo.Domain.Entities;

namespace TrackingDemo.Application.Abstractions;

public interface ITruckRepository
{
    Task<IReadOnlyList<Truck>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Truck?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Truck truck, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
