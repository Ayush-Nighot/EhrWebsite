using Core.ModelDto;
using Core.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Application.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly AppointmentService _appointmentService;
        private readonly StripeService _stripeService;

        public AppointmentController(AppointmentService appointmentService, StripeService stripeService)
        {
            _appointmentService = appointmentService;
            _stripeService = stripeService;
        }

        // Get Patient's Appointments
        [HttpGet("patient")]
        public async Task<IActionResult> GetPatientAppointments(int patientId)
        {
            var response = await _appointmentService.GetPatientAppointments(patientId);
            return Ok(response);
        }

        // Get Provider's Appointments
        [HttpGet("provider")]
        public async Task<IActionResult> GetProviderAppointments(int providerId)
        {
            var response = await _appointmentService.GetProviderAppointments(providerId);
            return Ok(response);
        }

        // Add a new Appointment
        [HttpPost("addappointment")]
        public async Task<IActionResult> AddAppointment([FromBody] AppointmentDto appointmentDto)
        {
            if (appointmentDto == null)
            {
                return BadRequest("Appointment details are required.");
            }

            var response = await _appointmentService.AddAppointment(appointmentDto);
            if (response.Status == 200)
            {
                return Ok(response);
            }
            return BadRequest(response.Message);
        }

        // Complete an Appointment
        [HttpPut("complete")]
        public async Task<IActionResult> CompleteAppointment(int appointmentId)
        {
            var response = await _appointmentService.CompleteAppointment(appointmentId);
            if (response.Status == 200)
            {
                return Ok(response);
            }
            return BadRequest(response.Message);
        }

        // Cancel an Appointment
        [HttpPut("cancel")]
        public async Task<IActionResult> CancelAppointment(int appointmentId)
        {
            var response = await _appointmentService.CancelAppointment(appointmentId);
            if (response.Status == 200)
            {
                return Ok(response);
            }
            return BadRequest(response.Message);
        }

        [HttpPost("create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentRequest request)
        {
            var paymentIntentClientSecret = await _stripeService.CreatePaymentIntent(request.Amount);
            return Ok(new { clientSecret = paymentIntentClientSecret });
        }

        [HttpPut("updateappointment")]
        public async Task<IActionResult> UpdateAppointment(UpdateAppointmentDto updateAppointmentDto)
        {
            var res=await _appointmentService.UpdateAppointment(updateAppointmentDto);
            return Ok(res);
        }

        [HttpGet("canceled")]
        public async Task<IActionResult> getCanceledAppointments(int id)
        {
            var app=await _appointmentService.getCancelledAppointment(id);
            return Ok(app);
        }

        [HttpGet("completed")]
        public async Task<IActionResult> getCompletedAppointments(int id)
        {
            var app = await _appointmentService.getCompletedAppointment(id);
            return Ok(app);
        }

        [HttpGet("completedpat")]
        public async Task<IActionResult> getCompletedAppointmentPat(int id)
        {
            var ap=await _appointmentService.getCompletedAppointmentPatient(id);
            return Ok(ap);
        }
    }
}
