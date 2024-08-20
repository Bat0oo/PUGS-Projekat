using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    [DataContract]
    public class Estimation
    {
        [DataMember]
        public double EstimatedPrice { get;set; }
        [DataMember]
        public TimeSpan DriversArivalSeconds { get;set; }

        [DataMember]
        public TimeSpan RideTime { get;set; }

        public Estimation(double estimatedPrice, TimeSpan driversArivalSeconds, TimeSpan rideTime)
        {
            EstimatedPrice = estimatedPrice;
            DriversArivalSeconds = driversArivalSeconds;
            RideTime = rideTime;
        }
    }
}
