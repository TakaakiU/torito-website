// Dtos/InnDto.cs
namespace Torito.API.Dtos;

public class InnDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<ReviewDto> Reviews { get; set; } = new List<ReviewDto>();
}