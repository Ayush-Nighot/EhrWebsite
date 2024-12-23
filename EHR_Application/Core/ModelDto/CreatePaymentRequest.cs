using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Twilio.Types;

namespace Core.ModelDto
{
    public class CreatePaymentRequest
    {
        public decimal Amount { get; set; }
    }
}
