// Dtos/CreateReviewDto.cs
using System.ComponentModel.DataAnnotations;

namespace Torito.API.Dtos;

public class CreateReviewDto
{
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;
}