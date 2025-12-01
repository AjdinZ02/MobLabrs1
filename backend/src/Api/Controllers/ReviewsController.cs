
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using Application.DTOs;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ReviewsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reviews = await _db.Reviews
                .Include(r => r.Product)
                .Include(r => r.User)
                .Select(r => new ReviewDto
                {
                    ReviewID   = r.ReviewID,
                    ProductName= r.ProductName,
                    UserName   = r.UserName,
                    Rating      = r.Rating ?? 0,          
                    Comment     = r.Comment ?? string.Empty
                })
                .ToListAsync();

            return Ok(reviews);
        }
        [HttpPost]
        public async Task<IActionResult>AddReview([FromBody]ReviewDto reviewDto)
            {
                if (reviewDto == null || string.IsNullOrWhiteSpace(reviewDto.Comment) || reviewDto.Rating < 1 || reviewDto.Rating > 5)
                {
                 return BadRequest("Nevažeći podaci o recenziji.");
                }
            var review=new Infrastructure.Persistence.Entities.Review
            {
                Rating=reviewDto.Rating,
                Comment=reviewDto.Comment,
                ProductName=reviewDto.ProductName,
                UserName=reviewDto.UserName
            };
            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();
            return Ok(new{Message="Recenzija je uspešno dodana."});
        }
    }
}
