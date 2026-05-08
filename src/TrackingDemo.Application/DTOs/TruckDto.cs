namespace TrackingDemo.Application.DTOs;

public sealed record TruckDto(
    Guid Id,
    string TruckCode,
    string Status,
    decimal X,
    decimal Y,
    bool IsLoaded,
    DateTimeOffset UpdatedAtUtc
);
