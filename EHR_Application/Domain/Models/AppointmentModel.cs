using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Models.Usermodel;

namespace Domain.Models
{
    public class AppointmentModel
    {

            [Key]
            public int Id { get; set; }

            [Required]
            public int PatientId { get; set; }

            [Required]
            public int ProviderId { get; set; }

            [Required]
            [DataType(DataType.Date)]
            public DateTime AppointmentDate { get; set; }

            [Required]
            [DataType(DataType.Time)]
            public DateTime AppointmentTime { get; set; }

            [Required]
            public string ChiefComplaint { get; set; }

            [Required]
            public string Status { get; set; }

            public decimal Fee { get; set; }

            [DataType(DataType.Date)]
            public DateTime CreatedAt { get; set; }

            [DataType(DataType.Date)]
            public DateTime UpdatedAt { get; set; }
        }

}
