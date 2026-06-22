using Backend.DTOs;

namespace Backend.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllAsync(int userId);
    Task<ProductResponseDto?> GetByIdAsync(int id, int userId);
    Task<ProductResponseDto> CreateAsync(CreateProductDto dto, int userId);
    Task<ProductResponseDto?> UpdateAsync(int id, UpdateProductDto dto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
}
