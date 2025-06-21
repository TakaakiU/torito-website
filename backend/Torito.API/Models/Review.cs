// backend/Torito.API/Models/Review.cs

namespace Torito.API.Models;

public class Review
{
    public int Id { get; set; }
    public int InnId { get; set; } // どの宿へのクチコミかを示すID
    public string UserName { get; set; } = string.Empty;
    public int Rating { get; set; } // 1-5の評価
    public string Comment { get; set; } = string.Empty;
    public DateTime PostedAt { get; set; }
}