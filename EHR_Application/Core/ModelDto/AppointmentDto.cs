using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.ModelDto
{
    public class AppointmentDto
    {
        public int PatientId { get; set; }  // ID of the patient making the appointment
        public int ProviderId { get; set; }  // ID of the provider the appointment is with
        public DateTime AppointmentDate { get; set; }  // Date of the appointment
        public DateTime AppointmentTime { get; set; }  // Time of the appointment
        public string ChiefComplaint { get; set; }  // The reason or complaint for the appointment
        public decimal Fee { get; set; }  // The fee for the appointment (could be adjusted based on insurance)
    }
}
