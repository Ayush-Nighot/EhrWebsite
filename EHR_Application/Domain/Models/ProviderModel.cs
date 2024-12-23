using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Models.Usermodel;

namespace Domain.Models
{
    public class ProviderModel
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Qualification { get; set; }
        public int SpecialisationId { get; set; }
        public string RegistrationNumber { get; set; }
        public decimal VisitingCharge { get; set; }
    }
}
