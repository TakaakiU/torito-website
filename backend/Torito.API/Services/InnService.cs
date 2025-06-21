// backend/Torito.API/Services/InnService.cs

using Torito.API.Data;
using Torito.API.Models;

namespace Torito.API.Services;

public class InnService
{
    private readonly DummyDataStore _dataStore;

    public InnService()
    {
        _dataStore = DummyDataStore.Current;
    }

    public InnDetailDto? GetInnDetailById(int id)
    {
        // 1. IDに一致する宿を探す
        var inn = _dataStore.Inns.FirstOrDefault(i => i.Id == id);

        // もし宿が見つからなければ、nullを返す
        if (inn == null)
        {
            return null;
        }

        // 2. その宿に紐づくクチコミを探す
        var reviews = _dataStore.Reviews.Where(r => r.InnId == id).ToList();

        // 3. 宿情報とクチコミ情報をDTOに詰めて返す
        var innDetail = new InnDetailDto
        {
            Id = inn.Id,
            Name = inn.Name,
            Area = inn.Area,
            Description = inn.Description,
            PhotoUrls = inn.PhotoUrls,
            Reviews = reviews
        };

        return innDetail;
    }
}