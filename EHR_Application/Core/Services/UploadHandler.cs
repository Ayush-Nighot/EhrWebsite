using App.Core.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public class UploadHandler
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UploadHandler(IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
        {
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
        }



        public async Task<object> Upload(IFormFile file)
        {

            // Valid extensions
            List<string> validExtensions = new List<string>() { ".jpg", ".png", ".jpeg" };
            string extension = Path.GetExtension(file.FileName);
            if (!validExtensions.Contains(extension))
            {
                return new ResponseDto
                {
                    Status = 400,
                    Message = "Extension Not Valid",
                    Data = ""
                };
            }

            // Size check
            long size = file.Length;
            if (size > (5 * 1024 * 1024))
            {
                return new ResponseDto
                {
                    Status = 400,
                    Message = "Maximum size can be 5Mb",
                    Data = ""
                };
            }

            // Change file name
            string filename = Guid.NewGuid().ToString() + extension;
            string uploadPath = Path.Combine(_environment.ContentRootPath, "wwwroot/Images");

            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            using (FileStream stream = new FileStream(Path.Combine(uploadPath, filename), FileMode.Create))
            {
                file.CopyTo(stream)
;
            }

            // Get the host and scheme from HttpContext
            var request = _httpContextAccessor.HttpContext.Request;
            string scheme = request.Scheme; 
            string host = request.Host.Value; 

            // Generate the full URL
            string fileUrl = $"{scheme}://{host}/Images/{filename}";


            return new ResponseDto
            {
                Status = 200,
                Message = "File Stored Successfully",
                Data = fileUrl
            };
        }
    }
}
