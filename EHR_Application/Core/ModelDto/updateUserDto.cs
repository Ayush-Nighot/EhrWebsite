using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.ModelDto
{
    public class updateUserDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Mobile { get; set; }

        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string BloodGroup { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string State { get; set; }
        public string PinCode { get; set; }
        public string ProfileImage { get; set; }

        // Provider specific fields (nullable)
        public string? Qualification { get; set; }
        public int? SpecializationId { get; set; }
        public string? RegistrationNumber { get; set; }
        public decimal? VisitingCharge { get; set; }
    }
}
