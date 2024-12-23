using Core.ModelDto;
using Core.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stripe.Terminal;

namespace EHR_Application.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet("specialization")]
        public async Task<IActionResult> getSpecializationById(int id)
        {
            var spe=await _userService.getSpecializationById(id);
            return Ok(spe);
        }

        [HttpGet("visitingfee")]
        public async Task<IActionResult> getFee(int id)
        {
            var fee=await _userService.GetVisitingPrice(id);
            return Ok(fee.Data);
        }

        // GET: api/user
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var response = await _userService.GetUsers();
            return Ok(response);
        }

        [HttpGet("getbyid")]
        public async Task<IActionResult> GetUsersById(int id)
        {
            var response = await _userService.getUserById(id);
            return Ok(response);
        }


        [HttpGet("getspecialization")]
        public async Task<IActionResult> GetSpecialization()
        {
            var res=await _userService.getSpecialization();
            return Ok(res);
        }

        // GET: api/user/{email}
        [HttpGet("{email}")]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            var response = await _userService.getUserByEmail(email);
            return Ok(response);
        }

        [HttpGet("providers")]
        public async Task<IActionResult> GetProvidersBySpecializationId(int id)
        {
            var res=await _userService.getProvidersBySpecialityId(id);
            return Ok(res);
        }

        // POST: api/user/register
        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserDto userDto)
        {
            var response = await _userService.RegisterUser(userDto);
            return Ok(response);
        }

        // POST: api/user/login
        [HttpPost("login")]
        public async Task<IActionResult> LoginUser([FromBody] LoginDto loginDto)
        {
            var response = await _userService.LoginUser(loginDto);
            if (response.Status == 200)
                return Ok(response);
            return BadRequest(response);
        }

        // PUT: api/user/update
        [HttpPut("update")]
        public async Task<IActionResult> UpdateUser([FromBody] updateUserDto updateUserDto)
        {
            var response = await _userService.UpdateUser(updateUserDto);
            if (response.Status == 200)
                return Ok(response);
            return NotFound(response);
        }

        // POST: api/user/forget-password
        [HttpPost("forget-password")]
        public async Task<IActionResult> ForgetPassword(string email)
        {
            var response = await _userService.ForgetPassword(email);
            if (response.Status == 200)
                return Ok(response);
            return NotFound(response);
        }

        // POST: api/user/change-password
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] changePasswordDto changePasswordDto)
        {
            var response = await _userService.changePassword(changePasswordDto);
            if (response.Status == 200)
                return Ok(response);
            return BadRequest(response);
        }

        // POST: api/user/verify-otp
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] ValidateOtp validateOtp)
        {
            var response = await _userService.VerifyOtp(validateOtp);
            if (response.Status == 200)
                return Ok(response);
            return Unauthorized(response);
        }

        [HttpGet("country")]
        public async Task<IActionResult> getCountry()
        {
            var country = await _userService.GetCountry();
            return Ok(country);
        }

        [HttpGet("states")]
        public async Task<IActionResult> getState(int id)
        {
            var states = await _userService.GetStates(id);
            return Ok(states);
        }

        [HttpGet("idcountry")]
        public async Task<IActionResult> getidByname(string id)
        {
            var states = await _userService.getIdByName(id);
            return Ok(states);
        }
    }
}
