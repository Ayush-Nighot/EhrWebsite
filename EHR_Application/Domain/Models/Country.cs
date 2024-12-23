using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class Country
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string shortname { get; set; }

        public string name { get; set; }
        public int phonecode { get; set; }
    }
}
