using App.Core.Common;
using Core.Interface;
using Core.ModelDto;
using Dapper;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Core.Services
{
    public class UserService
    {
        private readonly JwtService _jwtService;
        private readonly EmailService _emailService;
        private readonly PasswordGenerator _passwordGenerator;
        private readonly IConfiguration _configuration;
        private readonly IAppDbContext _appDbContext;

        public UserService(IAppDbContext appDbContext, JwtService jwtService, EmailService emailService, PasswordGenerator passwordGenerator, IConfiguration configuration)
        {
            _appDbContext = appDbContext;
            _jwtService = jwtService;
            _emailService = emailService;
            _passwordGenerator = passwordGenerator;
            _configuration = configuration;
        }

        public async Task<ResponseDto> getSpecialization()
        {
            var specia = await _appDbContext.Specializations.ToListAsync();
            return new ResponseDto
            {
                Status = 200,
                Message = "specialization Fetched Successfully",
                Data = specia.ToList()
            };
        }

        //Getting User
        public async Task<ResponseDto> GetUsers()
        {
            using var connection = _appDbContext.GetConnection();
            var query = "SELECT * FROM users where UserTypeId=2";
            var data = await connection.QueryAsync<Usermodel>(query);

            return new ResponseDto
            {
                Status = 200,
                Message = "Users Fetched Successfully",
                Data = data.ToList()
            };
        }

        //Get user by email
        public async Task<ResponseDto> getUserByEmail(string email)
        {
            using var connection = _appDbContext.GetConnection();
            var query = "SELECT * FROM users where Email=@email";
            var data = await connection.QueryAsync<Usermodel>(query, new { email });
            var obj=data.ToList();

            return new ResponseDto
            {
                Status = 200,
                Message = "User Fetched Successfully",
                Data = obj
            };
        }


        public async Task<ResponseDto> getUserById(int id)
        {
            using var connection = _appDbContext.GetConnection();
            var query = "SELECT * FROM users where Id=@id";
            var data = await connection.QueryAsync<Usermodel>(query, new { id });
            var obj = data.ToList();

            return new ResponseDto
            {
                Status = 200,
                Message = "User Fetched Successfully",
                Data = obj
            };
        }



        public async Task<ResponseDto> GetVisitingPrice(int id)
        {
            var fee=await _appDbContext.Users.FindAsync(id);
            return new ResponseDto
            {
                Status = 200,
                Message = "",
                Data = fee.VisitingCharge
            };
        }

        // Register User
        public async Task<ResponseDto> RegisterUser(UserDto userDto)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Email == userDto.Email);
            if (user != null)
            {
                return new ResponseDto
                {
                    Status = 401,
                    Message = "UserName Already Exist",
                    Data = null
                };
            }

            var newUser = new Usermodel
            {
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                DateOfBirth = userDto.DateOfBirth,
                Email = userDto.Email,
                Mobile = userDto.Mobile,
                Gender = userDto.Gender,
                BloodGroup = userDto.BloodGroup,
                Address = userDto.Address,
                Country = userDto.Country,
                State = userDto.State,
                City = userDto.City,
                PinCode = userDto.PinCode,
                UserTypeId = userDto.UserTypeId,
                ProfileImage = userDto.ProfileImage,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                Qualification = userDto.Qualification,
                SpecializationId = userDto.SpecializationId,
                RegistrationNumber = userDto.RegistrationNumber,
                VisitingCharge = userDto.VisitingCharge,

            };

            if (newUser.UserTypeId == 1)
            {
                newUser.UserName = $"PR_{newUser.FirstName.ToUpper()}{newUser.LastName.Substring(0, 1).ToUpper()}{newUser.DateOfBirth.ToString("ddMMyy")}";
            }
            if (newUser.UserTypeId == 2)
            {
                newUser.UserName = $"PT_{newUser.FirstName.ToUpper()}{newUser.LastName.Substring(0, 1).ToUpper()}{newUser.DateOfBirth.ToString("ddMMyy")}";

            }

            newUser.Password = _passwordGenerator.GeneratePassword(newUser.FirstName, newUser.Mobile, newUser.Email);

            var usernameExist = await _appDbContext.Users.FirstOrDefaultAsync(x => x.UserName == newUser.UserName);
            if (usernameExist != null)
            {
                return new ResponseDto
                {
                    Status = 409,
                    Message = "Email/UserName already Exist",
                    Data = ""
                };
            }


            await _emailService.sendEmail(newUser.Email, "Welcome to EHR",
               $"<html><body style='font-family: Arial, sans-serif;'>" +
               $"<table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f4f4f4; padding: 20px;'>" +
               $"  <tr>" +
               $"    <td align='center' style='background-color: #2E3B4E; padding: 20px; color: white; font-size: 24px; font-weight: bold;'>" +
               $"      <h1 style='margin: 0; color: white;'>EHR_Application</h1>" +
               $"    </td>" +
               $"  </tr>" +
               $"  <tr>" +
               $"    <td style='background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);'>" +
               $"      <p style='font-size: 18px;'>Dear {newUser.FirstName},</p>" +
               $"      <p style='font-size: 16px;'>Congratulations! Your account has been successfully created on <strong>EHRApplication</strong>. We're excited to have you on board.</p>" +
               $"      <p style='font-size: 16px;'><strong>Below are your account details:</strong></p>" +
               $"      <p style='font-size: 16px;'><strong>Username:</strong> {newUser.UserName}</p>" +
               $"      <p style='font-size: 16px;'><strong>Password:</strong> {newUser.Password}</p>" +
               $"      <p style='font-size: 16px;'>Please make sure to keep your credentials secure. If you did not create this account, please contact our support team immediately.</p>" +
               $"      <p style='font-size: 16px;'>Thank you for choosing <strong>EHRApplication</strong>. We look forward to providing you with a great experience.</p>" +
               $"      <p style='font-size: 16px;'>Best regards,<br>The EComApplication Team</p>" +
               $"    </td>" +
               $"  </tr>" +
               $"  <tr>" +
               $"    <td align='center' style='background-color: #2E3B4E; padding: 20px; color: white; font-size: 14px;'>" +
               $"      <p>© {DateTime.Now.Year} EComApplication. All rights reserved.</p>" +
               $"    </td>" +
               $"  </tr>" +
               $"</table>" +
               $"</body></html>");

            newUser.Password = BCrypt.Net.BCrypt.HashPassword(newUser.Password);

            await _appDbContext.Users.AddAsync(newUser);
            await _appDbContext.SaveChangesAsync();

            return new ResponseDto
            {
                Status = 200,
                Message = "User Created Successfully",
                Data = newUser
            };
        }


        // Login User
        public async Task<ResponseDto> LoginUser(LoginDto login)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(x => x.UserName == login.UserName);
            if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
            {
                return new ResponseDto
                {
                    Status = 404,
                    Message = "Username Or Password Invalid",
                    Data = "Wrong Username or password"
                };
            }
            var otpt = new Random().Next(100000, 999999).ToString();
            await _appDbContext.otps.AddAsync(new Otp { Email = user.Email, Code = otpt, Expiration = DateTime.Now.AddMinutes(5) });
            await _appDbContext.SaveChangesAsync();

            //// Change to Mobile
            //string accountSid = "ACfe9f525aca0a989b9a1b2edcb7672225";
            //string authToken = "9e84b8d0d45559fd042071f13d3937b6";
            //TwilioClient.Init(accountSid, authToken);

            //var message = MessageResource.Create(
            //        body: $"The Otp is Valid for 5 min only {otpt}. ",
            //        from: new Twilio.Types.PhoneNumber("+1 775 637 3194"),
            //        to: new Twilio.Types.PhoneNumber($"+91{user.Mobile}")
            //    );

            await _emailService.sendEmail(user.Email, "Your OTP Code", $"Your OTP For Verification is {otpt}");

            return new ResponseDto
            {
                Status = 200,
                Message = "Otp Sent Successfully",
                Data = user
            };
        }



        // Update User
        public async Task<ResponseDto> UpdateUser(updateUserDto updateUserDto)
        {
            var User= await _appDbContext.Users.FirstOrDefaultAsync(x=> x.Email== updateUserDto.Email);
            if (User == null)
            {
                return new ResponseDto
                {
                    Status = 404,
                    Message = "User Not Found",
                    Data = null
                };
            }

            User.FirstName = updateUserDto.FirstName;
            User.LastName = updateUserDto.LastName;
            User.Email = updateUserDto.Email;
            User.Mobile = updateUserDto.Mobile;
            User.DateOfBirth = updateUserDto.DateOfBirth;
            User.Gender = updateUserDto.Gender;
            User.BloodGroup = updateUserDto.BloodGroup;
            User.Address = updateUserDto.Address;
            User.Country = updateUserDto.Country;
            User.State = updateUserDto.State;
            User.City = updateUserDto.City;
            User.PinCode = updateUserDto.PinCode;
            User.ProfileImage = updateUserDto.ProfileImage;
            User.Qualification = updateUserDto.Qualification;
            User.SpecializationId = updateUserDto.SpecializationId;
            User.RegistrationNumber = updateUserDto.RegistrationNumber;
            User.VisitingCharge= updateUserDto.VisitingCharge;
            User.UpdatedAt=DateTime.Now;

            await _appDbContext.SaveChangesAsync();
            return new ResponseDto
            {
                Status = 200,
                Message = "User updated successfully",
                Data=null
            };
        }



        //Forget Password
        public async Task<ResponseDto> ForgetPassword(string email)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(X=>X.Email==email);

            if (user == null)
            {
                return new ResponseDto
                {
                    Status = 404,
                    Message = "Email Not Found",
                    Data = ""
                };
            }

            var Password = _passwordGenerator.GeneratePassword(user.FirstName, user.Mobile, user.Email);

            await _emailService.sendEmail(user.Email, "New Password", $"New Password for login is given below \n" +
               $"UserName = {user.UserName} " +
               $"New Password = {Password}"
               );

            user.Password = BCrypt.Net.BCrypt.HashPassword(Password);
            await _appDbContext.SaveChangesAsync();

            return new ResponseDto
            {
                Status = 200,
                Message = "New Password sent to your Email",
                Data = ""
            };
        }


        //Change Password
        public async Task<ResponseDto> changePassword(changePasswordDto changePasswordDto)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Email == changePasswordDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(changePasswordDto.Password, user.Password))
            {
                return new ResponseDto
                {
                    Status = 400,
                    Message = "Cannot change the password",
                    Data = ""
                };
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.newPassword);

            await _appDbContext.SaveChangesAsync();
            return new ResponseDto
            {
                Status = 200,
                Message = "Password Changed",
                Data = user
            };

        }


        // Validating OTP
        public async Task<ResponseDto> VerifyOtp(ValidateOtp validateOtp)
        {
            var otp = await _appDbContext.otps.FirstOrDefaultAsync(x => x.Email == validateOtp.Email && x.Code == validateOtp.otp);
            var user = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Email == validateOtp.Email);
            var roleType = "";

            if (user.UserTypeId == 1)
            {
                roleType = "Provider";
            }
            else if (user.UserTypeId == 2)
            {
                roleType = "Patient";
            }

            var result = await Task.FromResult(_jwtService.GenerateToken(validateOtp.Email, new List<string> { roleType }));
            if (otp == null)
            {
                return new ResponseDto
                {
                    Status = 401,
                    Message = "Otp Not Verified",
                    Data = ""
                };
            }

            return new ResponseDto
            {
                Status = 200,
                Message = "Otp Verified Successfully",
                Data = result
            };
        }

        public async Task<ResponseDto> getProvidersBySpecialityId(int id)
        {
            var providers=await _appDbContext.Users.Where(x=>x.SpecializationId == id).ToListAsync();
            return new ResponseDto
            {
                Status = 200,
                Message = "Providers Fetched",
                Data = providers
            };
        }

        public async Task<ResponseDto> getSpecializationById(int id)
        {
            var specialization=await _appDbContext.Specializations.FindAsync(id);
            return new ResponseDto
            {
                Status = 200,
                Message = "Fetched Successfully",
                Data = specialization
            };
        }

        public async Task<ResponseDto> GetCountry()
        {
            using var connection = _appDbContext.GetConnection();
            var query = "SELECT * FROM countries";
            var data = await connection.QueryAsync<Country>(query);

            return new ResponseDto
            {
                Status = 200,
                Message = "Countries Fetched Successfully",
                Data = data.ToList(),
            };
        }

        public async Task<ResponseDto> getIdByName(string names)
        {
            var name=await _appDbContext.countries.Where(x=>x.name==names).ToListAsync();
            return new ResponseDto
            {
                Status = 200,
                Message = "Countries Fetched Successfully",
                Data = name,
            };
        }

        public async Task<ResponseDto> GetStates(int id)
        {
            using var connection = _appDbContext.GetConnection();
            var query = "SELECT * FROM states where CountryId=@id";
            var data = await connection.QueryAsync<State>(query, new { id });

            return new ResponseDto
            {
                Status = 200,
                Message = "Sates Fetched Successfully",
                Data = data.ToList(),
            };
        }
    }
}
