// Dtos/CreateInnDto.cs
using System.ComponentModel.DataAnnotations;

namespace Torito.API.Dtos;

public class CreateInnDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Area { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}