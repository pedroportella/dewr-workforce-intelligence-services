using TrackingDemo.Application.Abstractions;
using TrackingDemo.Application.DTOs;

namespace TrackingDemo.Application.Services;

public sealed class FleetQueryService
{
    private readonly ITruckRepository _truckRepository;

    public FleetQueryService(ITruckRepository truckRepository)
    {
        _truckRepository = truckRepository;
    }

    public async Task<FleetSnapshotDto> GetFleetSnapshotAsync(CancellationToken cancellationToken = default)
    {
        var trucks = await _truckRepository.GetAllAsync(cancellationToken);

        var items = trucks
            .Select(truck => new TruckDto(
                truck.Id,
                truck.TruckCode,
                truck.Status.ToString(),
                truck.X,
                truck.Y,
                truck.IsLoaded,
                truck.UpdatedAtUtc))
            .ToList();

        return new FleetSnapshotDto(items, DateTimeOffset.UtcNow);
    }
}
