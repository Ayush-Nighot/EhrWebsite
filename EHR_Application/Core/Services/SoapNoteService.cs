using App.Core.Common;
using Core.Interface;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public class SoapNoteService
    {
      private readonly IAppDbContext _appDbContext;

            public SoapNoteService(IAppDbContext appDbContext)
            {
                _appDbContext = appDbContext;
            }

            // Create Soap Note
            public async Task<ResponseDto> CreateSoapNote(SoapNoteModel soapNoteDto)
            {
            //var app=await _appDbContext.Appointments.Where(x=>x.Id==soapNoteDto.AppointmentId);
            //if (app == null) {

            //    return new ResponseDto
            //    {
            //        Status = 404,
            //        Message = "No Appointment Find",
            //        Data = ""
            //    };
            //}

            var newSoapNote = new SoapNoteModel
            {
                AppointmentId = soapNoteDto.AppointmentId,
                Subjective = soapNoteDto.Subjective,
                Objective = soapNoteDto.Objective,
                Assessment = soapNoteDto.Assessment,
                Plan = soapNoteDto.Plan,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _appDbContext.SoapNotes.AddAsync(newSoapNote);
            await _appDbContext.SaveChangesAsync();

            return new ResponseDto
            {
                Status = 200,
                Message = "Soap Note Created Successfully",
                Data = newSoapNote
            };
        }
            // Get all Soap Notes
            public async Task<ResponseDto> GetSoapNotes()
            {
                var soapNotes = await _appDbContext.SoapNotes.ToListAsync();
                return new ResponseDto
                {
                    Status = 200,
                    Message = "SOAP Notes Fetched Successfully",
                    Data = soapNotes
                };
            }

            // Get Soap Note by ID
            public async Task<ResponseDto> GetSoapNoteById(int id)
            {
                var soapNote = await _appDbContext.SoapNotes.FirstOrDefaultAsync(x => x.AppointmentId == id);
                if (soapNote == null)
                {
                    return new ResponseDto
                    {
                        Status = 404,
                        Message = "SOAP Note Not Found",
                        Data = null
                    };
                }

                return new ResponseDto
                {
                    Status = 200,
                    Message = "SOAP Note Fetched Successfully",
                    Data = soapNote
                };
            }

            // Update Soap Note
            public async Task<ResponseDto> UpdateSoapNote(SoapNoteModel updatedSoapNote)
            {
                var existingSoapNote = await _appDbContext.SoapNotes.FirstOrDefaultAsync(x => x.Id == updatedSoapNote.Id);
                if (existingSoapNote == null)
                {
                    return new ResponseDto
                    {
                        Status = 404,
                        Message = "SOAP Note Not Found",
                        Data = null
                    };
                }

                existingSoapNote.Subjective = updatedSoapNote.Subjective;
                existingSoapNote.Objective = updatedSoapNote.Objective;
                existingSoapNote.Assessment = updatedSoapNote.Assessment;
                existingSoapNote.Plan = updatedSoapNote.Plan;
                existingSoapNote.UpdatedAt = DateTime.Now;

                await _appDbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    Status = 200,
                    Message = "SOAP Note Updated Successfully",
                    Data = existingSoapNote
                };
            }

            // Delete Soap Note
            public async Task<ResponseDto> DeleteSoapNote(int id)
            {
                var soapNote = await _appDbContext.SoapNotes.FirstOrDefaultAsync(x => x.Id == id);
                if (soapNote == null)
                {
                    return new ResponseDto
                    {
                        Status = 404,
                        Message = "SOAP Note Not Found",
                        Data = null
                    };
                }

                _appDbContext.SoapNotes.Remove(soapNote);
                await _appDbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    Status = 200,
                    Message = "SOAP Note Deleted Successfully",
                    Data = null
                };
            }
        }
    }
