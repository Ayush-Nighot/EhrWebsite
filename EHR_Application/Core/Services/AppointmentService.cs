using App.Core.Common;
using Core.Interface;
using Core.ModelDto;
using Dapper;
using Domain.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Stripe;
using System;
using System.Linq;
using System.Threading.Tasks;
using static Domain.Models.AppointmentModel;

namespace Core.Services
{
    public class AppointmentService
    {
        private readonly JwtService _jwtService;
        private readonly EmailService _emailService;
        private readonly IAppDbContext _appDbContext;
        private readonly IOptions<StripeClientOptions> _stripeOptions;

        public AppointmentService(IAppDbContext appDbContext, JwtService jwtService, EmailService emailService , IOptions<StripeClientOptions> stripeOptions)
        {
            _appDbContext = appDbContext;
            _jwtService = jwtService;
            _emailService = emailService;
            _stripeOptions = stripeOptions;
        }

        // Get Patient's appointments
        public async Task<ResponseDto> GetPatientAppointments(int patientId)
        {
            var appointments = await _appDbContext.Appointments
                .Where(x => x.PatientId == patientId && x.Status == "Scheduled")
                .ToListAsync();

            return new ResponseDto
            {
                Status = 200,
                Message = "Appointments Fetched Successfully",
                Data = appointments
            };
        }

        // Get Provider's upcoming appointments
        public async Task<ResponseDto> GetProviderAppointments(int providerId)
        {
            var appointments = await _appDbContext.Appointments
                .Where(x => x.ProviderId == providerId && x.Status == "Scheduled")
                .ToListAsync();

            return new ResponseDto
            {
                Status = 200,
                Message = "Appointments Fetched Successfully",
                Data = appointments
            };
        }

        // Add a new Appointment (for patient or provider)
        public async Task<ResponseDto> AddAppointment(AppointmentDto appointmentDto)
        {
            var patient = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Id == appointmentDto.PatientId && x.UserTypeId == 2); // Patient
            var provider = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Id == appointmentDto.ProviderId && x.UserTypeId == 1); // Provider

            if (patient == null || provider == null)
            {
                return new ResponseDto
                {
                    Status = 404,
                    Message = "Patient or Provider not found",
                    Data = null
                };
            }

            var appointment = new AppointmentModel
            {
                PatientId = appointmentDto.PatientId,
                ProviderId = appointmentDto.ProviderId,
                AppointmentDate = appointmentDto.AppointmentDate,
                AppointmentTime = appointmentDto.AppointmentTime,
                ChiefComplaint = appointmentDto.ChiefComplaint,
                Status = "Scheduled",
                Fee = appointmentDto.Fee,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            // Stripe Payment Integration (This part requires implementation of Stripe API handling)
            var paymentSuccess = await ProcessPayment(appointmentDto.Fee, patient.Email);
            if (!paymentSuccess)
            {
                return new ResponseDto
                {
                    Status = 400,
                    Message = "Payment failed, appointment not scheduled.",
                    Data = null
                };
            }

            await _appDbContext.Appointments.AddAsync(appointment);
            await _appDbContext.SaveChangesAsync();

            // Send email notifications to Patient and Provider
            await SendAppointmentConfirmationEmail(patient, provider, appointment);

            return new ResponseDto
            {
                Status = 200,
                Message = "Appointment Scheduled Successfully",
                Data = appointment
            };
        }


        // Send Appointment Confirmation Email
        private async Task SendAppointmentConfirmationEmail(Usermodel patient, Usermodel provider, AppointmentModel appointment)
        {
            string emailTemplate = $@"
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ text-align: center; padding: 10px; background-color: #4CAF50; color: white; }}
                .footer {{ text-align: center; font-size: 12px; color: #777777; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Appointment Confirmation</h1>
                </div>
                <p>Dear Patient and Provider,</p>
                <p>Your appointment has been successfully scheduled.</p>
                <p><strong>Appointment Date:</strong> {appointment.AppointmentDate.ToShortDateString()}</p>
                <p><strong>Appointment Time:</strong> {appointment.AppointmentTime.ToShortTimeString()}</p>
                <p><strong>Provider:</strong> {provider.Email}</p>
                <p><strong>Chief Complaint:</strong> {appointment.ChiefComplaint}</p>
                <div class='footer'>
                    <p>Thank you for using our EHR Application</p>
                </div>
            </div>
        </body>
        </html>";

            await _emailService.sendEmail(patient.Email, "Appointment Scheduled", emailTemplate);
            await _emailService.sendEmail(provider.Email, "Appointment Scheduled", emailTemplate);
        }


        // Method to process payment (this should integrate with Stripe API)
        private async Task<bool> ProcessPayment(decimal fee, string patientEmail)
        {
            // Implement Stripe API payment processing here.
            // Example: After successful payment, return true. Otherwise, return false.
            return true;
        }



        public async Task<ResponseDto> UpdateAppointment(UpdateAppointmentDto update)
        {
            // Step 1: Fetch the appointment details by ID
            var appointment = await _appDbContext.Appointments
                .FirstOrDefaultAsync(x => x.Id == update.AppointmentId);

            if (appointment == null)
            {
                return new ResponseDto
                {
                    Status = 404,
                    Message = "Appointment not found",
                    Data = null
                };
            }

            // Step 2: Validate that the appointment is not completed or canceled
            if (appointment.Status == "Completed"|| appointment.Status == "Cancelled")
            {
                return new ResponseDto
                {
                    Status = 400,
                    Message = "Cannot update a completed or canceled appointment",
                    Data = null
                };
            }

            // Step 3: Apply the updates
            appointment.AppointmentDate = (DateTime)update.AppointmentDate;
            appointment.AppointmentTime = (DateTime)update.AppointmentTime;
            appointment.ChiefComplaint = update.ChiefComplaint;

            appointment.UpdatedAt = DateTime.Now;

            // Step 4: Save changes to the database
            await _appDbContext.SaveChangesAsync();

            // Step 5: Fetch the updated patient and provider details for email notifications
            var patient = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Id == appointment.PatientId);
            var provider = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Id == appointment.ProviderId);

            if (patient == null || provider == null)
            {
                return new ResponseDto
                {
                    Status = 404,
                    Message = "Patient or Provider not found",
                    Data = null
                };
            }

            // Step 6: Send email notifications about the updated appointment
            await SendAppointmentUpdateEmail(patient, provider, appointment);

            // Return success response with updated appointment data
            return new ResponseDto
            {
                Status = 200,
                Message = "Appointment updated successfully",
                Data = appointment
            };
        }


        private async Task SendAppointmentUpdateEmail(Usermodel patient, Usermodel provider, AppointmentModel appointment)
        {
            string emailTemplate = $@"
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 10px; background-color: #4CAF50; color: white; }}
            .footer {{ text-align: center; font-size: 12px; color: #777777; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Appointment Updated</h1>
            </div>
            <p>Dear Patient and Provider,</p>
            <p>Your appointment has been successfully updated.</p>
            <p><strong>New Appointment Date:</strong> {appointment.AppointmentDate.ToShortDateString()}</p>
            <p><strong>New Appointment Time:</strong> {appointment.AppointmentTime.ToShortTimeString()}</p>
            <p><strong>Provider:</strong> {provider.Email}</p>
            <p><strong>Chief Complaint:</strong> {appointment.ChiefComplaint}</p>
            <div class='footer'>
                <p>Thank you for using our EHR Application</p>
            </div>
        </div>
    </body>
    </html>";

            await _emailService.sendEmail(patient.Email, "Appointment Updated", emailTemplate);
            await _emailService.sendEmail(provider.Email, "Appointment Updated", emailTemplate);
        }




        // Update Appointment status to Completed
        public async Task<ResponseDto> CompleteAppointment(int appointmentId)
        {
            var appointment = await _appDbContext.Appointments.FirstOrDefaultAsync(x => x.Id == appointmentId);
            if (appointment == null)
            {
                return new ResponseDto
                {
                    Status = 404,
                    Message = "Appointment not found",
                    Data = null
                };
            }

            if (appointment.Status == "Completed")
            {
                return new ResponseDto
                {
                    Status = 400,
                    Message = "Appointment already completed",
                    Data = null
                };
            }

            appointment.Status = "Completed";
            appointment.UpdatedAt = DateTime.Now;

            await _appDbContext.SaveChangesAsync();

            return new ResponseDto
            {
                Status = 200,
                Message = "Appointment marked as completed successfully",
                Data = appointment
            };
        }

        // Cancel Appointment
        public async Task<ResponseDto> CancelAppointment(int appointmentId)
        {
            var appointment = await _appDbContext.Appointments.FirstOrDefaultAsync(x => x.Id == appointmentId);
            if (appointment == null)
            {
                return new ResponseDto
                {
                    Status = 404,
                    Message = "Appointment not found",
                    Data = null
                };
            }

            if (appointment.Status == "Completed")
            {
                return new ResponseDto
                {
                    Status = 400,
                    Message = "Completed appointments cannot be canceled",
                    Data = null
                };
            }

            appointment.Status = "Canceled"; // You can create a new 'Canceled' status if needed
            appointment.UpdatedAt = DateTime.Now;

            // Fetch the patient and provider details for email notifications
            var patient = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Id == appointment.PatientId);
            var provider = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Id == appointment.ProviderId);

            if (patient == null || provider == null)
            {
                return new ResponseDto
                {
                    Status = 404,
                    Message = "Patient or Provider not found",
                    Data = null
                };
            }

            await _appDbContext.SaveChangesAsync();

            // Send email notifications about the cancellation
            await SendAppointmentCancellationEmail(appointment, patient, provider);

            return new ResponseDto
            {
                Status = 200,
                Message = "Appointment canceled successfully",
                Data = appointment
            };
        }



        // Send Appointment Cancellation Email
        private async Task SendAppointmentCancellationEmail(AppointmentModel appointment, Usermodel patient, Usermodel provider)
        {
            string emailTemplate = $@"
        <html>
            <body>
                <p>Dear Patient and Provider,</p>
                <p>We regret to inform you that the following appointment has been canceled:</p>
                <p><strong>Appointment Date:</strong> {appointment.AppointmentDate.ToShortDateString()}</p>
                <p><strong>Appointment Time:</strong> {appointment.AppointmentTime.ToShortTimeString()}</p>
                <p><strong>Provider:</strong> {provider.Email}</p>
                <p><strong>Reason:</strong> Appointment was canceled.</p>
                <p>Thank you for your understanding.</p>
            </body>
        </html>";

            await _emailService.sendEmail(patient.Email, "Appointment Canceled", emailTemplate);
            await _emailService.sendEmail(provider.Email, "Appointment Canceled", emailTemplate);
        }

        public async Task<ResponseDto> getCancelledAppointment(int providerId)
        {
            var canceled=await _appDbContext.Appointments.Where(x=>x.Status=="Canceled" && x.ProviderId == providerId).ToListAsync();
            return new ResponseDto
            {
                Status = 200,
                Message = "Canceled Appointments",
                Data = canceled
            };
        }

        public async Task<ResponseDto> getCompletedAppointment(int providerId)
        {
            var commpleted = await _appDbContext.Appointments.Where(x => x.Status == "Completed" && x.ProviderId==providerId).ToListAsync();
            return new ResponseDto
            {
                Status = 200,
                Message = "Completed Appointments",
                Data = commpleted
            };
        }

        public async Task<ResponseDto> getCompletedAppointmentPatient(int patientId)
        {
            var com=await _appDbContext.Appointments.Where(x=>x.PatientId==patientId && x.Status=="Completed").ToListAsync();
            return new ResponseDto
            {
                Status = 200,
                Message = "Completed Appointments",
                Data = com
            };
        }
    }
}
