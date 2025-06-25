// Dtos/ReviewDto.cs
namespace Torito.API.Dtos;

public class ReviewDto
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty; // 投稿者の名前
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime PostedAt { get; set; }
}