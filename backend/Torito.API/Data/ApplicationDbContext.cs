// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using Torito.API.Models;

namespace Torito.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // これらのプロパティがデータベースのテーブルになる
    public DbSet<Inn> Inns { get; set; }
    public DbSet<Review> Reviews { get; set; }
}
