using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public class PasswordGenerator
    {
        private static Random _random = new Random();

        public string GeneratePassword(string firstName, string mobile, string email)
        {
            // Combine the input details
            string baseString = firstName + mobile + email;

            // Convert base string to char array and shuffle
            var charArray = baseString.ToCharArray();
            Shuffle(charArray);

            // Randomly pick a format for the password
            int formatChoice = _random.Next(1, 5);

            // Ensure that the generated password is at least 8 characters
            string password = formatChoice switch
            {
                1 => GenerateRandomPassword(charArray, 8), // Random password with base characters
                2 => GenerateAlphanumericPassword(8),     // Alphanumeric password of length 8
                3 => GenerateSamplePassword(charArray, 8), // Random sample of characters of length 8
                4 => GenerateComplexPassword(),            // Complex password of length 8 (updated below)
                _ => GenerateRandomPassword(charArray, 8) // Default to 8-character random password
            };

            return password;
        }

        private static void Shuffle(char[] array)
        {
            int n = array.Length;
            while (n > 1)
            {
                n--;
                int k = _random.Next(n + 1);
                char value = array[k];
                array[k] = array[n];
                array[n] = value;
            }
        }

        // Generate a random password from a set of characters with a given length
        private static string GenerateRandomPassword(char[] baseChars, int length)
        {
            length = Math.Max(length, 8);  // Ensure length is at least 8
            var result = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                result.Append(baseChars[_random.Next(baseChars.Length)]);
            }
            return result.ToString();
        }

        // Generate an alphanumeric password with uppercase, lowercase, and digits
        private static string GenerateAlphanumericPassword(int length)
        {
            length = Math.Max(length, 8);  // Ensure length is at least 8
            const string alphanumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var result = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                result.Append(alphanumeric[_random.Next(alphanumeric.Length)]);
            }
            return result.ToString();
        }

        // Generate a password by sampling from the input string (no repeating characters)
        private static string GenerateSamplePassword(char[] baseChars, int length)
        {
            length = Math.Max(length, 8);  // Ensure length is at least 8
            return new string(baseChars.OrderBy(x => _random.Next()).Take(length).ToArray());
        }

        // Generate a complex password with special characters (length 8 or more)
        private static string GenerateComplexPassword()
        {
            const string complexChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
            int length = 8; // Default to 8 characters
            var result = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                result.Append(complexChars[_random.Next(complexChars.Length)]);
            }
            return result.ToString();
        }
    }
}

