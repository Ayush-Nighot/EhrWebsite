using Core.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Application.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ImageController(IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
        {
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost("[action]")]
        public IActionResult UploadFile(IFormFile file)
        {
            var uploadHandler = new UploadHandler(_environment, _httpContextAccessor);
            var result = uploadHandler.Upload(file);
            return Ok(result);
        }

    }
}
