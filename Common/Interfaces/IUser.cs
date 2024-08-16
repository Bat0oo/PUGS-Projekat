using Common.DTO;
using Common.Models;
using CoreWCF;
using Microsoft.ServiceFabric.Services.Remoting;

namespace Common.Interfaces
{
    [ServiceContract]
    public interface IUser:IService
    {
        [OperationContract]
        Task<bool> AddNewUser(User user);

        [OperationContract]
        Task<List<FullUserDTO>> ListUsers();

        [OperationContract]
        Task<LogedUserDTO> LoginUser(LoginUserDTO loginUserDTO);
    }
}
