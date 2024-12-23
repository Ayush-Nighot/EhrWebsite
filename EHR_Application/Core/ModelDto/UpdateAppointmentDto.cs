using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.ModelDto
{
    public class UpdateAppointmentDto
    {
            public int AppointmentId { get; set; }
            public DateTime? AppointmentDate { get; set; }
            public DateTime? AppointmentTime { get; set; }
            public string ChiefComplaint { get; set; }

    }
}
