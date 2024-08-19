using Common.DTO;
using Common.Interfaces;
using Common.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System.Fabric;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.RegularExpressions;

namespace FrontService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private IConfiguration _config;
        public UsersController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost("register")]
            public async Task<IActionResult> RegularRegister([FromForm] UserRegister userData)
            {
                try
                {

                    User userForRegister = new User(userData);

                    var fabricClient = new FabricClient();
                    bool result = false;

                    var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApplication/UserService"));
                    foreach (var partition in partitionList)
                    {
                        var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                        var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApplication/UserService"), partitionKey);
                        result = await proxy.AddNewUser(userForRegister);
                    }

                    if (result) return Ok($"Successfully registered new User: {userData.Username}");
                    else return StatusCode(500, "Failed to register new User");


                }
                catch (Exception)
                {
                    return StatusCode(500, "An error occurred while registering new User");
                }
        }

        [HttpGet("get")]
        public async Task<List<FullUserDTO>> GetUsers()
        {

            try
            {
                var fabricClient = new FabricClient();
                var result = new List<FullUserDTO>();

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApplication/UserService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApplication/UserService"), partitionKey);
                    var partitionResult = await proxy.ListUsers();
                    result.AddRange(partitionResult);
                }

                return result;
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"An error occurred: {ex.Message}");
                return new List<FullUserDTO>(); // Return an empty list or handle the error as needed
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDTO user)
        {
            if (string.IsNullOrEmpty(user.Email) || !IsValidEmail(user.Email)) return BadRequest("Invalid email format!");
            if (string.IsNullOrEmpty(user.Password)) return BadRequest("Password cannot be null or empty!");

            try
            {
                var fabricClient = new FabricClient();
                LogedUserDTO result = null; 

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApplication/UserService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApplication/UserService"), partitionKey);
                    var partitionResult = await proxy.LoginUser(user);

                    if (partitionResult != null)
                    {
                        result = partitionResult;
                        break;
                    }
                }

                if (result != null)
                {
                    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
                    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                    var Sectoken = new JwtSecurityToken(_config["Jwt:Issuer"],
                        _config["Jwt:Issuer"],
                        null,
                        expires: DateTime.Now.AddMinutes(360),
                        signingCredentials: credentials);

                    var token = new JwtSecurityTokenHandler().WriteToken(Sectoken);

                    var response = new
                    {
                        token = token,
                        user = result,
                        message = "Login successful"
                    };

                    return Ok(response);
                }
                else
                {
                    return BadRequest("Incorrect email or password");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while login User");
            }
        }

        private bool IsValidEmail(string email)
        {
            const string pattern = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";
            return Regex.IsMatch(email, pattern);
        }


    }
}
