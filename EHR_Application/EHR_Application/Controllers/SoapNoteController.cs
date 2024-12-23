using Core.Services;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Application.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SoapNoteController : ControllerBase
    {
        private readonly SoapNoteService _soapNoteService;

        // Inject SoapNoteService via constructor
        public SoapNoteController(SoapNoteService soapNoteService)
        {
            _soapNoteService = soapNoteService;
        }

        // POST: api/soapnote
        [HttpPost]
        public async Task<IActionResult> CreateSoapNote([FromBody] SoapNoteModel soapNoteModel)
        {
            if (soapNoteModel == null)
            {
                return BadRequest("SOAP Note model is null");
            }

            var response = await _soapNoteService.CreateSoapNote(soapNoteModel);
            if (response.Status == 200)
            {
                return CreatedAtAction(nameof(GetSoapNoteById), new { id = soapNoteModel.Id }, response.Data);
            }
            return StatusCode(response.Status, response.Message);
        }

        // GET: api/soapnote
        [HttpGet]
        public async Task<IActionResult> GetSoapNotes()
        {
            var response = await _soapNoteService.GetSoapNotes();
            if (response.Status == 200)
            {
                return Ok(response.Data);
            }
            return StatusCode(response.Status, response.Message);
        }

        // GET: api/soapnote/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSoapNoteById(int id)
        {
            var response = await _soapNoteService.GetSoapNoteById(id);
            if (response.Status == 200)
            {
                return Ok(response.Data);
            }
            return StatusCode(response.Status, response.Message);
        }

        // PUT: api/soapnote/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSoapNote(int id, [FromBody] SoapNoteModel updatedSoapNote)
        {
            if (updatedSoapNote == null || updatedSoapNote.Id != id)
            {
                return BadRequest("Invalid SOAP Note data");
            }

            var response = await _soapNoteService.UpdateSoapNote(updatedSoapNote);
            if (response.Status == 200)
            {
                return Ok(response.Data);
            }
            return StatusCode(response.Status, response.Message);
        }

        // DELETE: api/soapnote/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSoapNote(int id)
        {
            var response = await _soapNoteService.DeleteSoapNote(id);
            if (response.Status == 200)
            {
                return Ok(response.Message);
            }
            return StatusCode(response.Status, response.Message);
        }
    }
}
