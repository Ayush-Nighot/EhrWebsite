using Microsoft.Extensions.Configuration;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public class StripeService
    {
        private readonly IConfiguration _configuration;
        private readonly string _secretKey;

        public StripeService(IConfiguration configuration)
        {
            _configuration = configuration;
            _secretKey = "sk_test_51QXF8WArTiHSfmyLvIgUB6OLoo5MMRaX4Be8qU6mPrBLm0EX5e2loPAoRqLRiZVImG1IWa1OPfOCMKZfOzroI0Cv005Fsy0B0K";
            StripeConfiguration.ApiKey = _secretKey;
        }

        public async Task<string> CreatePaymentIntent(decimal amount)
        {
            var paymentIntentService = new PaymentIntentService();
            var paymentIntentCreateOptions = new PaymentIntentCreateOptions
            {
                Amount = (long)(amount),
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
            };

            var paymentIntent = await paymentIntentService.CreateAsync(paymentIntentCreateOptions);
            return paymentIntent.ClientSecret;
        }
    }
}
