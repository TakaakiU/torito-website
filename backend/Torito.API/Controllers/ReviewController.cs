// Controllers/ReviewsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Torito.API.Data;
using Torito.API.Dtos;
using Torito.API.Models;

[ApiController]
[Route("api/inns/{innId}/reviews")] 
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReviewsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // POST: api/inns/5/reviews - 特定の宿にクチコミを投稿
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> PostReview(int innId, CreateReviewDto createReviewDto)
    {
        var innExists = await _context.Inns.AnyAsync(i => i.Id == innId);
        if (!innExists)
        {
            return NotFound("指定された宿が見つかりません。");
        }

        var cognitoSub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (cognitoSub == null) return Unauthorized();

        var user = await _context.Users.SingleOrDefaultAsync(u => u.CognitoSub == cognitoSub);
        if (user == null)
        {
            return Forbid("ユーザー情報がデータベースに存在しません。");
        }

        var review = new Review
        {
            Rating = createReviewDto.Rating,
            Comment = createReviewDto.Comment,
            PostedAt = DateTime.UtcNow,
            InnId = innId,
            UserId = user.Id,
            UserName = user.Email
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        var reviewDto = new ReviewDto
        {
            Id = review.Id,
            UserName = user.Email,
            Rating = review.Rating,
            Comment = review.Comment,
            PostedAt = review.PostedAt
        };

        return CreatedAtAction(
            nameof(InnsController.GetInn), 
            "Inns",
            new { id = innId }, 
            reviewDto);
    }
}