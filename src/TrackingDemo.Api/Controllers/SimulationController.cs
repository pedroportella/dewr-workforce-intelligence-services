using Microsoft.AspNetCore.Mvc;

namespace TrackingDemo.Api.Controllers;

[ApiController]
[Route("api/v1/simulation")]
public sealed class SimulationController : ControllerBase
{
    [HttpPost("start")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public IActionResult Start() => Accepted(new { message = "Simulation start requested." });

    [HttpPost("stop")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public IActionResult Stop() => Accepted(new { message = "Simulation stop requested." });

    [HttpPost("reset")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public IActionResult Reset() => Accepted(new { message = "Simulation reset requested." });
}
