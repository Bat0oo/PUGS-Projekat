using Common.DTO;
using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;

namespace Common.Interfaces
{
    [ServiceContract]
    public interface IUser : IService
    {
        [OperationContract]
        Task<bool> addNewUser(User user);

        [OperationContract]
        Task<LogedUserDTO> loginUser(LoginUserDTO loginUserDTO);

        [OperationContract] 
        Task<List<FullUserDTO>> listUsers();

        [OperationContract]
        Task<List<DriverViewDTO>> listDrivers();

        [OperationContract]
        Task<bool> changeDriverStatus(Guid id, bool status);

        [OperationContract]
        Task<FullUserDTO> changeUserFields(UserForUpdateOverNetwork user);

        [OperationContract]
        Task<FullUserDTO> GetUserInfo(Guid id);

        [OperationContract]
        Task<bool> VerifyDriver(Guid id,string email,string action);

        [OperationContract]
        Task<List<DriverViewDTO>> GetNotVerifiedDrivers();



       
    }
}
