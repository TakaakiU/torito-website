// backend/Torito.API/Models/Inn.cs

namespace Torito.API.Models;

public class Inn
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> PhotoUrls { get; set; } = new();
}