// Controllers/UsersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims; // ユーザー情報(Claim)の取得用
using Torito.API.Data;
using Torito.API.Models;

[ApiController]
[Route("api/[controller]")]
[Authorize] // コントローラー全体を認証必須とする
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/users/me
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        // JWTからCognitoのsub(一意なID)を取得
        var cognitoSub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(cognitoSub))
        {
            return Unauthorized();
        }

        // DBにユーザー存在確認を実施
        var user = await _context.Users.FirstOrDefaultAsync(u => u.CognitoSub == cognitoSub);

        if (user == null)
        {
            // 存在しない場合、新しいユーザーとしてDBに登録する
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            
            user = new User
            {
                CognitoSub = cognitoSub,
                Email = email ?? string.Empty, // emailが取得できないケースを考慮
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        // DBから取得したユーザー情報を返す
        return Ok(user);
    }
}