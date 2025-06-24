// Models/Inn.cs

// ↓↓↓ この1行を追加する ↓↓↓
using System.ComponentModel.DataAnnotations;

namespace Torito.API.Models
{
    public class Inn
    {
        public int Id { get; set; }
    
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Area { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public List<string> PhotoUrls { get; set; } = new List<string>();
        
        // この宿に紐づくクチコミ一覧 (リレーション)
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}