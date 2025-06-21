// backend/Torito.API/Controllers/InnsController.cs

using Microsoft.AspNetCore.Mvc;
using Torito.API.Services;

namespace Torito.API.Controllers;

[ApiController]
[Route("api/[controller]")] // URLは /api/inns になります
public class InnsController : ControllerBase
{
    private readonly InnService _innService;
    private readonly ILogger<InnsController> _logger;

    public InnsController(ILogger<InnsController> logger)
    {
        _logger = logger;
        _innService = new InnService(); // 本来はDI(依存性注入)を使います
    }

    [HttpGet("{id}")] // GET /api/inns/1 のようなリクエストに対応
    public IActionResult GetInnById(int id)
    {
        _logger.LogInformation($"宿ID: {id} の情報を取得リクエストを受け付けました。");

        var innDetail = _innService.GetInnDetailById(id);

        if (innDetail == null)
        {
            _logger.LogWarning($"宿ID: {id} は見つかりませんでした。");
            return NotFound(); // 404 Not Found を返す
        }

        return Ok(innDetail); // 200 OK と共にデータを返す
    }
}