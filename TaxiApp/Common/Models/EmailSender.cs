using Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class EmailSender : IEmailSender
    {
        public Task SendEmailAsync(string email, string subject, string message)
        {
            var client = new SmtpClient("smtp.mailersend.net", 587)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential("MS_RzINFM@trial-o65qngkz5yogwr12.mlsender.net", "9PxXVY4lgd1DnhxI")
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress("MS_RzINFM@trial-o65qngkz5yogwr12.mlsender.net"),
                Subject = subject,
                Body = message,
                IsBodyHtml = true
            };

            mailMessage.To.Add(email);

            return client.SendMailAsync(mailMessage);
        }
    }
}
