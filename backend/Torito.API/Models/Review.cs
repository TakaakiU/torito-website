// Models/Review.cs
using System.ComponentModel.DataAnnotations;

namespace Torito.API.Models;

public class Review
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty; // 削除予定

    [Range(1, 5)]
    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;

    public DateTime PostedAt { get; set; } = DateTime.UtcNow;

    // 外部キー 宿との紐づき
    public int InnId { get; set; }
    public Inn Inn { get; set; } = null!;

    // 外部キー ユーザーとの紐づき
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
