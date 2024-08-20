using Microsoft.AspNetCore.Mvc;
using Common.Models;
using Common.Enums;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System.Fabric;
using Common.Interfaces;
using Common.DTO;
using Common.Entities;
using System.Net;
using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json.Linq;
using System.Security.Claims;
using System.Runtime.InteropServices;
using System.ComponentModel.DataAnnotations;
using System.Net.Mail;
using Microsoft.AspNetCore.Identity.UI.Services;
namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class UsersController : ControllerBase
    {

        private IConfiguration _config;
        private readonly Common.Interfaces.IEmailSender emailSender;
        public UsersController(IConfiguration config, Common.Interfaces.IEmailSender emailSender)
        {
            _config = config;
            this.emailSender = emailSender;
        }

        [HttpPost]
        public async Task<IActionResult> RegularRegister([FromForm] UserRegister userData)
        {
            if (string.IsNullOrEmpty(userData.Email) || !IsValidEmail(userData.Email)) return BadRequest("Invalid email format");
            if (string.IsNullOrEmpty(userData.Password)) return BadRequest("Password cannot be null or empty");
            if (string.IsNullOrEmpty(userData.Username)) return BadRequest("Username cannot be null or empty");
            if (string.IsNullOrEmpty(userData.FirstName)) return BadRequest("First name cannot be null or empty");
            if (string.IsNullOrEmpty(userData.LastName)) return BadRequest("Last name cannot be null or empty");
            if (string.IsNullOrEmpty(userData.Address)) return BadRequest("Address cannot be null or empty");
            if (string.IsNullOrEmpty(userData.TypeOfUser)) return BadRequest("Type of user must be selected!");
            if (string.IsNullOrEmpty(userData.Birthday)) return BadRequest("Birthday need to be selected!");
            if (userData.ImageUrl.Length == 0) return BadRequest("You need to send image while doing registration!");
            try
            {

                User userForRegister = new User(userData);

                var fabricClient = new FabricClient();
                bool result = false;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UsersService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UsersService"), partitionKey);
                    result = await proxy.addNewUser(userForRegister);
                }

                if (result) return Ok($"Successfully registered new User: {userData.Username}");
                else return StatusCode(409, "User already exists in database!");


            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while registering new User");
            }
        }

        [HttpGet]
        public async Task<List<FullUserDTO>> GetUsers()
        {

            try
            {
                var fabricClient = new FabricClient();
                var result = new List<FullUserDTO>();

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UsersService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UsersService"), partitionKey);
                    var partitionResult = await proxy.listUsers();
                    result.AddRange(partitionResult);
                }

                return result;
            }
            catch (Exception ex)
            {
                
                Console.WriteLine($"An error occurred: {ex.Message}");
                return new List<FullUserDTO>(); 
            }
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginUserDTO user)
        {
            if (string.IsNullOrEmpty(user.Email) || !IsValidEmail(user.Email)) return BadRequest("Invalid email format");
            if (string.IsNullOrEmpty(user.Password)) return BadRequest("Password cannot be null or empty");

            try
            {
                var fabricClient = new FabricClient();
                LogedUserDTO result = null; 

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UsersService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UsersService"), partitionKey);
                    var partitionResult = await proxy.loginUser(user);

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

                    List<Claim> claims = new List<Claim>();
                    claims.Add(new Claim("MyCustomClaim", result.Roles.ToString()));

                    var Sectoken = new JwtSecurityToken(_config["Jwt:Issuer"],
                        _config["Jwt:Issuer"],
                        claims,
                        expires: DateTime.Now.AddMinutes(360), //
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

        [Authorize(Policy = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllDrivers()
        {
            try
            {

                var fabricClient = new FabricClient();
                List<DriverViewDTO> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UsersService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UsersService"), partitionKey);
                    var parititonResult = await proxy.listDrivers();
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        drivers = result,
                        message = "Succesfuly get list of drivers"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("Incorrect email or password");
                }

            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while registering new User");
            }
        }


        [Authorize(Policy = "Admin")]
        [HttpPut]
        public async Task<IActionResult> ChangeDriverStatus([FromBody] DriverChangeStatusDTO driver)
        {
            try
            {

                var fabricClient = new FabricClient();
                bool result = false;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UsersService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UsersService"), partitionKey);
                    bool parititonResult = await proxy.changeDriverStatus(driver.Id, driver.Status);
                    result = parititonResult;
                }

                if (result) return Ok("Succesfuly changed driver status");

                else return BadRequest("Driver status is not changed");

            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while registering new User");
            }
        }


        [AllowAnonymous]
        [HttpPut]
        public async Task<IActionResult> ChangeUserFields([FromForm] UserForUpdate user)
        {
            UserForUpdateOverNetwork userForUpdate = new UserForUpdateOverNetwork(user);

            try
            {
                var fabricClient = new FabricClient();
                FullUserDTO result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UsersService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UsersService"), partitionKey);
                    var proxyResult = await proxy.changeUserFields(userForUpdate);
                    if (proxyResult != null)
                    {
                        result = proxyResult;
                        break;
                    }
                }

                if (result != null)
                {
                    var response = new
                    {
                        changedUser = result,
                        message = "Succesfuly changed user fields!"
                    };
                    return Ok(response);
                }
                else return StatusCode(409, "User for change is not in db!");

            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating user");
            }
        }


        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetUserInfo([FromQuery] Guid id)
        {
            try
            {
                var fabricClient = new FabricClient();
                FullUserDTO result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UsersService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UsersService"), partitionKey);
                    var partitionResult = await proxy.GetUserInfo(id);
                    if (partitionResult != null)
                    {
                        result = partitionResult;
                        break;
                    }
                }

                if (result != null)
                {
                    var response = new
                    {
                        user = result,
                        message = "Successfully retrieved user info"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("This id does not exist");
                }
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving user info");
            }
        }


        [Authorize(Policy = "Rider")]
        [HttpGet]
        public async Task<IActionResult> GetEstimatedPrice([FromQuery] Trip trip)
        {
            Estimation estimation = await ServiceProxy.Create<IEstimation>(new Uri("fabric:/TaxiApp/EstimationService")).GetEstimatedPrice(trip.CurrentLocation, trip.Destination);
            if (estimation != null)
            {

                var response = new
                {
                    price = estimation,
                    message = "Succesfuly get estimation"
                };
                return Ok(response);
            }
            else
            {
                return StatusCode(500, "An error occurred while estimating price");
            }

        }

        private bool IsValidEmail(string email)
        {
            const string pattern = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";
            return Regex.IsMatch(email, pattern);
        }

        [Authorize(Policy = "Rider")]
        [HttpPut]
        public async Task<IActionResult> AcceptSuggestedDrive([FromBody] AcceptedRoadTrip acceptedRoadTrip)
        {
            try
            {
                if (string.IsNullOrEmpty(acceptedRoadTrip.Destination)) return BadRequest("You must send destination!");
                if (string.IsNullOrEmpty(acceptedRoadTrip.CurrentLocation)) return BadRequest("You must send location!");
                if (acceptedRoadTrip.Accepted == true) return BadRequest("Ride cannot be automaticaly accepted!");
                if (acceptedRoadTrip.Price == 0.0 || acceptedRoadTrip.Price < 0.0) return BadRequest("Invalid price!");


                var fabricClient = new FabricClient();
                RoadTrip result = null;
                RoadTrip tripFromRider = new RoadTrip(acceptedRoadTrip.CurrentLocation, acceptedRoadTrip.Destination, acceptedRoadTrip.RiderId, acceptedRoadTrip.Price, acceptedRoadTrip.Accepted, acceptedRoadTrip.MinutesToDriverArrive);
                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDrive>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var partitionResult = await proxy.AcceptRoadTrip(tripFromRider);
                    if (partitionResult != null)
                    {
                        result = partitionResult;
                        break;
                    }
                }

                if (result != null)
                {
                    var response = new
                    {
                        Drive = result,
                        message = "Successfully scheduled"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("You already submited ticked!");
                }


            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while accepting new drive!");
            }
        }

       

        [Authorize(Policy = "Admin")]
        [HttpPut]
        public async Task<IActionResult> VerifyDriver([FromBody] DriverVerificationDTO driver)
        {
            try
            {
                var fabricClient = new FabricClient();
                bool result = false;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UsersService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UsersService"), partitionKey);
                    var partitionResult = await proxy.VerifyDriver(driver.Id, driver.Email, driver.Action);
                    if (partitionResult != null)
                    {
                        result = partitionResult;
                        break;
                    }
                }

                if (result)
                {
                    var response = new
                    {
                        Verified = result,
                        message = $"Driver with id:{driver.Id} is now changed status of verification to:{driver.Action}"
                    };
                    if (driver.Action == "Prihvacen") await this.emailSender.SendEmailAsync(driver.Email, "Account verification", "Successfuly verified on MM Taxi  now you can drive! DRIVE SAFE!!");

                    return Ok(response);
                }
                else
                {
                    return BadRequest("This id does not exist");
                }

            }
            catch
            {
                return BadRequest("Something went wrong!");
            }
        }


        [Authorize(Policy = "Driver")]
        [HttpPut]
        public async Task<IActionResult> AcceptNewRide([FromBody] RideForAcceptDTO ride)
        {
            try
            {
                var fabricClient = new FabricClient();
                RoadTrip result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDrive>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var partitionResult = await proxy.AcceptRoadTripDriver(ride.RideId, ride.DriverId);
                    if (partitionResult != null)
                    {
                        result = partitionResult;
                        break;
                    }
                }

                if (result != null)
                {
                    var response = new
                    {
                        ride = result,
                        message = "Sucessfuly accepted driver!"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("This id does not exist");
                }

            }
            catch
            {
                return BadRequest("Something went wrong!");
            }
        }



        [Authorize(Policy = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetDriversForVerification()
        {
            try
            {

                var fabricClient = new FabricClient();
                List<DriverViewDTO> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UsersService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UsersService"), partitionKey);
                    var parititonResult = await proxy.GetNotVerifiedDrivers();
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        drivers = result,
                        message = "Succesfuly get list of drivers"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("Incorrect email or password");
                }

            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while registering new User");
            }
        }


        [Authorize(Policy = "Driver")]
        [HttpGet]
        public async Task<IActionResult> GetAllUncompletedRides()
        {
            try
            {

                var fabricClient = new FabricClient();
                List<RoadTrip> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDrive>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetRoadTrips();
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        rides = result,
                        message = "Succesfuly get list of not completed rides"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("Incorrect email or password");
                }

            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while registering new User");
            }
        }

        [Authorize(Policy = "Driver")]
        [HttpGet]
        public async Task<IActionResult> GetCompletedRidesForDriver([FromQuery] Guid id)
        {
            try
            {

                var fabricClient = new FabricClient();
                List<RoadTrip> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDrive>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetListOfCompletedRidesForDriver(id);
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        rides = result,
                        message = "Succesfuly get list completed rides"
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
                throw;
            }
        }

        [Authorize(Policy = "Rider")]
        [HttpGet]
        public async Task<IActionResult> GetCompletedRidesForRider([FromQuery] Guid id)
        {
            try
            {

                var fabricClient = new FabricClient();
                List<RoadTrip> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDrive>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetListOfCompletedRidesForRider(id);
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        rides = result,
                        message = "Succesfuly get list completed rides"
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
                throw;
            }
        }

        [Authorize(Policy = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetCompletedRidesAdmin()
        {
            try
            {

                var fabricClient = new FabricClient();
                List<RoadTrip> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDrive>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetListOfCompletedRidesAdmin();
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        rides = result,
                        message = "Succesfuly get list completed rides"
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
                throw;
            }
        }


        [Authorize(Policy = "Rider")]
        [HttpGet]
        public async Task<IActionResult> GetCurrentTrip(Guid id)
        {
            try
            {

                var fabricClient = new FabricClient();
                RoadTrip result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDrive>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetCurrentTrip(id);
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        trip = result,
                        message = "Succesfuly get current ride"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest();
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [Authorize(Policy = "Driver")]
        [HttpGet]
        public async Task<IActionResult> GetCurrentTripDriver(Guid id)
        {
            try
            {

                var fabricClient = new FabricClient();
                RoadTrip result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDrive>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetCurrentTripDriver(id);
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        trip = result,
                        message = "Succesfuly get current ride"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest();
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [Authorize(Policy = "Rider")]
        [HttpGet]
        public async Task<IActionResult> GetAllNotRatedTrips()
        {
            try
            {

                var fabricClient = new FabricClient();
                List<RoadTrip> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDrive>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetAllNotRatedTrips();
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        rides = result,
                        message = "Succesfuly get unrated rides"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest();
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [Authorize(Policy ="Rider")]
        [HttpPut]
        public async Task<IActionResult> SubmitRating([FromBody] Review review)
        {
            try
            {

                var fabricClient = new FabricClient();
                bool result = false;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDrive>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.SubmitRating(review.tripId, review.rating);
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != false)
                {
                    return Ok("Sucessfuly submited rating");
                }
                else
                {
                    return BadRequest("Rating is not submited");
                }

            }
            catch (Exception ex)
            {
                throw;
            }

        }

    }
}
