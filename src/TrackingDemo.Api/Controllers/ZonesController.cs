using Microsoft.AspNetCore.Mvc;

namespace TrackingDemo.Api.Controllers;

[ApiController]
[Route("api/v1/zones")]
public sealed class ZonesController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetZones()
    {
        return Ok(new[]
        {
            new
            {
                id = "loading-zone",
                name = "Loading zone",
                minX = 0,
                minY = 0,
                maxX = 250,
                maxY = 250
            },
            new
            {
                id = "dump-zone",
                name = "Dump zone",
                minX = 750,
                minY = 550,
                maxX = 1000,
                maxY = 800
            }
        });
    }
}
