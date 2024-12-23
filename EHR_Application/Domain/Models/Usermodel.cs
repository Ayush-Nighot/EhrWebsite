using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class Usermodel
    {
        

            [Key]
            public int Id { get; set; }

            [Required]
            [StringLength(100)]
            public string FirstName { get; set; }

            [Required]
            [StringLength(100)]
            public string LastName { get; set; }
            public string Email { get; set; }
            public string Mobile {  get; set; }
            [Required]
            public DateTime DateOfBirth { get; set; }

            [Required]
            [StringLength(100)]
            public string UserName { get; set; }

            [Required]
            public string Password { get; set; }

            public string Gender { get; set; }
            public string BloodGroup { get; set; }
            public string Address { get; set; }
            public string City { get; set; }
            public string Country { get; set; }
            public string State { get; set; }
            public string PinCode { get; set; }


            [Required]
            public int UserTypeId { get; set; }

            public string? ProfileImage { get; set; } 
            public DateTime CreatedAt { get; set; }
            public DateTime UpdatedAt { get; set; }


            // Provider specific fields (nullable)
            public string? Qualification { get; set; }
            public int? SpecializationId { get; set; }
            public string? RegistrationNumber { get; set; }
            public decimal? VisitingCharge { get; set; }
        }
    }

