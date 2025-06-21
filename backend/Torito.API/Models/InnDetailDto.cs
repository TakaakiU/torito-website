// backend/Torito.API/Models/InnDetailDto.cs

namespace Torito.API.Models;

// DTO (Data Transfer Object) - APIの応答として使うデータ構造
public class InnDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> PhotoUrls { get; set; } = new();
    public List<Review> Reviews { get; set; } = new(); // 宿に紐づくクチコミ一覧
}