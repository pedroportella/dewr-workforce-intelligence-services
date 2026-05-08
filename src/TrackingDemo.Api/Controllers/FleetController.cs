using Microsoft.AspNetCore.Mvc;
using TrackingDemo.Application.Services;

namespace TrackingDemo.Api.Controllers;

[ApiController]
[Route("api/v1/fleet")]
public sealed class FleetController : ControllerBase
{
    [HttpGet("snapshot")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSnapshot(
        [FromServices] FleetQueryService fleetQueryService,
        CancellationToken cancellationToken)
    {
        var snapshot = await fleetQueryService.GetFleetSnapshotAsync(cancellationToken);
        return Ok(snapshot);
    }
}
