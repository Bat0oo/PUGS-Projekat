using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    [DataContract]
    public class DriverViewDTO
    {
        [DataMember]
        public string Email { get; set; }

        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public string LastName { get; set; }
        [DataMember]    
        public string Username { get; set; }

        [DataMember]    
        public bool IsBlocked { get; set; }


        [DataMember]
        public double AverageRating { get; set; }

        [DataMember]
        public Guid Id { get;set; }

        [DataMember]
        public Common.Enums.VerificationStatus.Status Status { get; set; }

        public DriverViewDTO(string email, string name, string lastName, string username, bool isBlocked, double averageRating,Guid id, Common.Enums.VerificationStatus.Status status)
        { 
            Email = email;
            Name = name;
            LastName = lastName;
            Username = username;
            IsBlocked = isBlocked;
            AverageRating = averageRating;
            Status = status;
            Id = id;
        }
    }
}
