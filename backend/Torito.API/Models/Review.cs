// Models/Review.cs
using System.ComponentModel.DataAnnotations;

namespace Torito.API.Models;

public class Review
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty; // 本来はUserモデルと連携

    [Range(1, 5)]
    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;

    public DateTime PostedAt { get; set; } = DateTime.UtcNow;

    // 外部キー
    public int InnId { get; set; }

    // どの宿に紐づくか (ナビゲーションプロパティ)
    public Inn Inn { get; set; } = null!;
}
