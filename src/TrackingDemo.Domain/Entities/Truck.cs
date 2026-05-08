namespace TrackingDemo.Domain.Entities;

public sealed class Truck
{
    public Guid Id { get; init; }
    public string TruckCode { get; private set; } = string.Empty;
    public TruckStatus Status { get; private set; } = TruckStatus.Idle;
    public decimal X { get; private set; }
    public decimal Y { get; private set; }
    public bool IsLoaded { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; } = DateTimeOffset.UtcNow;

    public Truck(string truckCode, decimal x, decimal y)
    {
        TruckCode = string.IsNullOrWhiteSpace(truckCode)
            ? throw new ArgumentException("Truck code is required.", nameof(truckCode))
            : truckCode.Trim();

        X = x;
        Y = y;
    }

    public void UpdatePosition(decimal x, decimal y)
    {
        X = x;
        Y = y;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    public void ChangeStatus(TruckStatus status, bool isLoaded)
    {
        Status = status;
        IsLoaded = isLoaded;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
}
