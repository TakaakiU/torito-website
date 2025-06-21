// backend/Torito.API/Data/DummyDataStore.cs

using Torito.API.Models;

namespace Torito.API.Data;

// シングルトンパターンでダミーデータを保持するストア
public class DummyDataStore
{
    public static DummyDataStore Current { get; } = new DummyDataStore();

    public List<Inn> Inns { get; set; }
    public List<Review> Reviews { get; set; }

    public DummyDataStore()
    {
        Inns = new List<Inn>
        {
            new Inn
            {
                Id = 1,
                Name = "ことりの宿",
                Area = "信州",
                Description = "自然豊かな森の中、小鳥のさえずりで目覚める静かな宿です。",
                PhotoUrls = new List<string> { "https://example.com/photo1.jpg" }
            },
            new Inn
            {
                Id = 2,
                Name = "ペンション・ぴーちゃん",
                Area = "伊豆高原",
                Description = "看板鳥のぴーちゃんがお出迎え！アットホームなペンションです。",
                PhotoUrls = new List<string> { "https://example.com/photo2.jpg" }
            }
        };

        Reviews = new List<Review>
        {
            new Review { Id = 101, InnId = 1, UserName = "Taro", Rating = 5, Comment = "最高の体験でした！また来ます。", PostedAt = DateTime.Now.AddDays(-10) },
            new Review { Id = 102, InnId = 1, UserName = "Jiro", Rating = 4, Comment = "静かでとても癒やされました。", PostedAt = DateTime.Now.AddDays(-5) },
            new Review { Id = 103, InnId = 2, UserName = "Saburo", Rating = 5, Comment = "ぴーちゃんが可愛すぎます！", PostedAt = DateTime.Now.AddDays(-2) }
        };
    }
}