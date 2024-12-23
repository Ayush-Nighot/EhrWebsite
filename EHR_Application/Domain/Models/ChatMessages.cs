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
    public class ChatMessages
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SenderId { get; set; }
        [Required]
        public int ReceiverId { get; set; }
        [Required]
        public string Message { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime Timestamp { get; set; }

        [Required]
        public int AppointmentId { get; set; }

    }
}
