// Data/SeedData.cs
using Microsoft.EntityFrameworkCore;
using Torito.API.Models;

namespace Torito.API.Data;

public static class SeedData
{
    public static void Initialize(IServiceProvider serviceProvider)
    {
        using (var context = new ApplicationDbContext(
            serviceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>()))
        {
            // DBに既に宿情報がある場合は何もしない
            if (context.Inns.Any())
            {
                return;
            }

            context.Inns.AddRange(
                new Inn
                {
                    Name = "ペンション ことりの森",
                    Area = "長野県・軽井沢",
                    Description = "自然豊かな森の中に佇む、小鳥の声で目覚めることができるペンションです。特製のバードフィーダーには毎日たくさんの野鳥が訪れます。"
                },
                new Inn
                {
                    Name = "海辺の宿 かもめ亭",
                    Area = "静岡県・伊豆",
                    Description = "全室オーシャンビュー。窓を開ければ潮風とウミネコの鳴き声が心地よい、海好きのための宿。新鮮な海の幸も自慢です。"
                },
                new Inn
                {
                    Name = "山荘 ふくろうの棲家",
                    Area = "北海道・富良野",
                    Description = "夜にはフクロウの声が聞こえるかもしれない、静かで落ち着いた山荘。満点の星空と暖炉の火が、あなたをお待ちしています。"
                }
            );

            context.SaveChanges();
        }
    }
}