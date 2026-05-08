namespace TrackingDemo.Application.Requests;

public sealed record UpdateTruckPositionRequest(
    decimal X,
    decimal Y
);
