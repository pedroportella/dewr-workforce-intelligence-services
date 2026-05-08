using Microsoft.AspNetCore.Mvc;
using TrackingDemo.Application.Abstractions;
using TrackingDemo.Application.Requests;
using TrackingDemo.Domain.Entities;

namespace TrackingDemo.Api.Controllers;

[ApiController]
[Route("api/v1/trucks")]
public sealed class TrucksController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromServices] ITruckRepository truckRepository,
        CancellationToken cancellationToken)
    {
        var trucks = await truckRepository.GetAllAsync(cancellationToken);

        var result = trucks.Select(truck => new
        {
            truck.Id,
            truck.TruckCode,
            Status = truck.Status.ToString(),
            truck.X,
            truck.Y,
            truck.IsLoaded,
            truck.UpdatedAtUtc
        });

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid id,
        [FromServices] ITruckRepository truckRepository,
        CancellationToken cancellationToken)
    {
        var truck = await truckRepository.GetByIdAsync(id, cancellationToken);

        if (truck is null)
        {
            return NotFound();
        }

        return Ok(new
        {
            truck.Id,
            truck.TruckCode,
            Status = truck.Status.ToString(),
            truck.X,
            truck.Y,
            truck.IsLoaded,
            truck.UpdatedAtUtc
        });
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromServices] ITruckRepository truckRepository,
        CancellationToken cancellationToken)
    {
        var truck = new Truck($"T-{Random.Shared.Next(100, 999)}", 50, 50);
        await truckRepository.AddAsync(truck, cancellationToken);
        await truckRepository.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = truck.Id }, new { truck.Id });
    }

    [HttpPost("{id:guid}/position")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePosition(
        Guid id,
        [FromBody] UpdateTruckPositionRequest request,
        [FromServices] ITruckRepository truckRepository,
        CancellationToken cancellationToken)
    {
        var truck = await truckRepository.GetByIdAsync(id, cancellationToken);

        if (truck is null)
        {
            return NotFound();
        }

        truck.UpdatePosition(request.X, request.Y);
        await truckRepository.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpPost("{id:guid}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateTruckStatusRequest request,
        [FromServices] ITruckRepository truckRepository,
        CancellationToken cancellationToken)
    {
        var truck = await truckRepository.GetByIdAsync(id, cancellationToken);

        if (truck is null)
        {
            return NotFound();
        }

        if (!Enum.TryParse<TruckStatus>(request.Status, true, out var status))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid status",
                Detail = $"The status '{request.Status}' is not supported."
            });
        }

        truck.ChangeStatus(status, request.IsLoaded);
        await truckRepository.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
