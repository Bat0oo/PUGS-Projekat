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
    public interface IDrive : IService
    {
        [OperationContract]
        Task<RoadTrip> AcceptRoadTrip(RoadTrip trip);

        [OperationContract]
        Task<RoadTrip> GetCurrentRoadTrip(Guid id);

        [OperationContract]
        Task<List<RoadTrip>> GetRoadTrips();

        [OperationContract]
        Task<RoadTrip> AcceptRoadTripDriver(Guid rideId, Guid driverId);



        [OperationContract] 
        Task<List<RoadTrip>> GetListOfCompletedRidesForDriver(Guid driverId);

        [OperationContract]
        Task<List<RoadTrip>> GetListOfCompletedRidesForRider(Guid driverId);


        [OperationContract]
        Task<List<RoadTrip>> GetListOfCompletedRidesAdmin();

        [OperationContract]
        Task<RoadTrip> GetCurrentTrip(Guid id);


        [OperationContract]
        Task<RoadTrip> GetCurrentTripDriver(Guid id);

        [OperationContract]
        Task<List<RoadTrip>> GetAllNotRatedTrips();

        [OperationContract]
        Task<bool> SubmitRating(Guid tripId,int rating);    
     }
}
