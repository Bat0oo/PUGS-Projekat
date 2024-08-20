using Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    [DataContract]
    public class LogedUserDTO
    {
        [DataMember]
        public Guid Id { get; set; }

        [DataMember]
        public UserRoles.Roles Roles { get; set; }

        public LogedUserDTO(Guid id,UserRoles.Roles roles)
        {
            Id = id;
            Roles = roles;
        }

        public LogedUserDTO()
        {
        }
    }
}
