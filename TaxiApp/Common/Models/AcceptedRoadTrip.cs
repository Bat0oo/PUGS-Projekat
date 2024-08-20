using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class AcceptedRoadTrip
    {
        public string Destination { get; set; } // ovo dobija 
        public string CurrentLocation { get; set; } // ovo dobija 
        public Guid RiderId { get; set; } // ovo dobija 
        public double Price { get; set; } // ovo dobija 
        public bool Accepted { get; set; } // ovo dobija 

        public int MinutesToDriverArrive { get; set; }
        public AcceptedRoadTrip() { }
    }
}
