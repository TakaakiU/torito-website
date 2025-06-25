// Models/User.cs
using System.ComponentModel.DataAnnotations;

namespace Torito.API.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    public string CognitoSub { get; set; } = string.Empty; // Cognitoのユーザー識別子(sub)

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}