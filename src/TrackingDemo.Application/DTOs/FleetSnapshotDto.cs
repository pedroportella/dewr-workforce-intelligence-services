namespace TrackingDemo.Application.DTOs;

public sealed record FleetSnapshotDto(
    IReadOnlyList<TruckDto> Trucks,
    DateTimeOffset SnapshotTakenAtUtc
);
