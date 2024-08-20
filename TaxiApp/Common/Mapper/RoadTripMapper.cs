using Common.Entities;
using Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Mapper
{
    public class RoadTripMapper
    {
        public RoadTripMapper() { }

        public static RoadTrip MapRoadTripEntityToRoadTrip(RoadTripEntity roadTrip)
        {
            return new RoadTrip(roadTrip.CurrentLocation, roadTrip.Destination, roadTrip.RiderId, roadTrip.DriverId, roadTrip.Price, roadTrip.Accepted,roadTrip.TripId,roadTrip.SecondsToDriverArive,roadTrip.SecondsToEndTrip,roadTrip.IsFinished,roadTrip.IsRated);
        }  
    }
}
