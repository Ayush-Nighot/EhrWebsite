using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task sendEmail(string to, string subject, string body)
        {
            var smtpHost = _configuration["Smtp:Host"];
            var smtpPort = _configuration["Smtp:Port"];
            var smtpEmail = _configuration["Smtp:Email"];
            var smtpPassword = _configuration["Smtp:Password"];
            var smtpEnableSsl = _configuration["Smtp:EnableSsl"];
            var smtpFrom = _configuration["Smtp:From"];

            var smtpClient = new SmtpClient(smtpHost)
            {
                Port = int.Parse(smtpPort),
                Credentials = new NetworkCredential(smtpEmail, smtpPassword),
                EnableSsl = bool.Parse(smtpEnableSsl),
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(smtpFrom),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(to);

            try
            {
                await smtpClient.SendMailAsync(mailMessage);

            }
            catch (SmtpException smtpEx)
            {

                throw new InvalidOperationException($"SMTP error sending email to {to}: {smtpEx.Message}", smtpEx);
            }

            catch (Exception ex)
            {

                throw new InvalidOperationException($"Unexpected error sending email to {to}: {ex.Message}", ex);
            }
        }

    }
}
