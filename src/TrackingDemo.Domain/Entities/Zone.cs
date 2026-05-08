namespace TrackingDemo.Domain.Entities;

public sealed class Zone
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal MinX { get; init; }
    public decimal MinY { get; init; }
    public decimal MaxX { get; init; }
    public decimal MaxY { get; init; }
}
