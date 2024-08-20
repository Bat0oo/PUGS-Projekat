using Common.DTO;
using Common.Entities;
using Common.Enums;
using Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Common.Enums.VerificationStatus;

namespace Common.Mapper
{
    public class UserMapper
    {
       
            public static User MapUserEntityToUser(UserEntity u, byte[] imageOfUser)
            {
                var statusString = u.Status; 
                Status myStatus;

                if (Enum.TryParse(statusString, out myStatus))
                {

                    return new User(
                        u.Address,
                        u.AverageRating,
                        u.SumOfRatings,
                        u.NumOfRatings,
                        u.Birthday,
                        u.Email,
                        u.IsVerified,
                        u.IsBlocked,
                        u.FirstName,
                        u.LastName,
                        u.Password,
                        u.Username,
                        (UserRoles.Roles)Enum.Parse(typeof(UserRoles.Roles), u.PartitionKey),
                        new FileUploadDTO(imageOfUser),
                        u.ImageUrl,
                        myStatus,
                        u.Id
                    );
                }
            return null;
            }

        public static FullUserDTO MapUserToFullUserDto(User u)
        {

            return new FullUserDTO(u.Address, u.AverageRating, u.SumOfRatings, u.NumOfRatings, u.Birthday, u.Email, u.IsVerified, u.IsBlocked, u.FirstName, u.LastName, u.Username, u.TypeOfUser, u.ImageFile,u.Password,u.Status,u.Id);
        }
    }
}
