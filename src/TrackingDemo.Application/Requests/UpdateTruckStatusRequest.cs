namespace TrackingDemo.Application.Requests;

public sealed record UpdateTruckStatusRequest(
    string Status,
    bool IsLoaded
);
