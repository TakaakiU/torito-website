using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Torito.API.Data;
using Torito.API.Dtos;
using Torito.API.Models;

[ApiController]
[Route("api/[controller]")]
public class InnsController : ControllerBase
{
    // データベースコンテキスト(_context)をDIで受け取る
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InnsController> _logger;

    public InnsController(ApplicationDbContext context, ILogger<InnsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // 「宿の一覧を取得する」API
    // GET: api/inns
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InnDto>>> GetInns()
    {
        _logger.LogInformation("宿の一覧取得リクエストを受け付けました。");

        // データベースのInnsテーブルから全件取得し、InnDtoに変換
        var inns = await _context.Inns
            .Select(inn => new InnDto
            {
                Id = inn.Id,
                Name = inn.Name,
                Area = inn.Area,
                Description = inn.Description
            })
            .ToListAsync();

        return Ok(inns);
    }

    // 「特定の宿の詳細を取得する」API
    // GET: api/inns/5
    [HttpGet("{id}")]
    public async Task<ActionResult<InnDto>> GetInn(int id)
    {
        _logger.LogInformation($"宿ID: {id} の情報を取得リクエストを受け付けました。");

        // Includeを使い関連するReviewとその先のUserも一緒に読み込む
        var inn = await _context.Inns
            .Include(i => i.Reviews)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inn == null)
        {
            return NotFound();
        }

        // InnモデルをInnDtoに変換する
        var innDto = new InnDto
        {
            Id = inn.Id,
            Name = inn.Name,
            Area = inn.Area,
            Description = inn.Description,
            // クチコミ情報もマッピング
            Reviews = inn.Reviews.Select(r => new ReviewDto
            {
                Id = r.Id,
                UserName = r.User.Email, // ユーザーのEmailを投稿者名として使用
                Rating = r.Rating,
                Comment = r.Comment,
                PostedAt = r.PostedAt
            }).OrderByDescending(r => r.PostedAt).ToList()
        };

        return Ok(innDto);
    }

    // 「宿を登録する」API
    // POST: api/inns
    [HttpPost]
    [Authorize] // 宿の登録はログインユーザーのみに許可
    public async Task<ActionResult<InnDto>> CreateInn(CreateInnDto createInnDto)
    {
        _logger.LogInformation($"新しい宿の登録リクエストを受け付けました: {createInnDto.Name}");

        var inn = new Inn
        {
            Name = createInnDto.Name,
            Area = createInnDto.Area,
            Description = createInnDto.Description
        };

        _context.Inns.Add(inn);
        await _context.SaveChangesAsync();

        var innDto = new InnDto
        {
            Id = inn.Id,
            Name = inn.Name,
            Area = inn.Area,
            Description = inn.Description
        };
        
        return CreatedAtAction(nameof(GetInn), new { id = inn.Id }, innDto);
    }
}