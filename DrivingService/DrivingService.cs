using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Remoting;
using Common.Interfaces;
using Common.Models;
using Common.Mapper;
using Common.Entities;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using System.Transactions;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Microsoft.ServiceFabric.Services.Client;
namespace DrivingService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    public sealed class DrivingService : StatefulService,IDrive
    {
        DrivingDataRepo dataRepo;
        public DrivingService(StatefulServiceContext context)
            : base(context)
        {
           dataRepo  = new DrivingDataRepo("TaxiAppDriving");
        }

        public async Task<RoadTrip> AcceptRoadTrip(RoadTrip trip)
        {
            var roadTrips = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {
                    if (!await CheckIfTripAlreadyExists(trip))
                    {
                        var enumerable = await roadTrips.CreateEnumerableAsync(tx);

                        using (var enumerator = enumerable.GetAsyncEnumerator())
                        {

                            await roadTrips.AddAsync(tx, trip.TripId, trip);
                            RoadTripEntity entity = new RoadTripEntity(trip.RiderId, trip.DriverId, trip.CurrentLocation, trip.Destination, trip.Accepted, trip.Price, trip.TripId, trip.SecondsToDriverArrive);
                            TableOperation operation = TableOperation.Insert(entity);
                            await dataRepo.Trips.ExecuteAsync(operation);

                            ConditionalValue<RoadTrip> result = await roadTrips.TryGetValueAsync(tx, trip.TripId);
                            await tx.CommitAsync();
                            return result.Value;
                            
                        }

                    }
                    else return null;
                    
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        private async Task<bool> CheckIfTripAlreadyExists(RoadTrip trip)
        {
            var roadTrips = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {
                  
                    var enumerable = await roadTrips.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {
                            if ((enumerator.Current.Value.RiderId == trip.RiderId && enumerator.Current.Value.Accepted == false)) // provera da li je pokusao da posalje novi zahtev za voznju
                            {                                                                                                    // a da mu ostali svi nisu izvrseni 
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
            catch (Exception)
            {
                throw;
            }
        }

        private async Task LoadRoadTrips()
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
        
            try
            {
                using (var transaction = StateManager.CreateTransaction())
                {
                    var trips = dataRepo.GetAllTrips();
                    if (trips.Count() == 0) return;
                    else
                    {
                        foreach (var trip in trips)
                        {
                            await roadTrip.AddAsync(transaction, trip.TripId, RoadTripMapper.MapRoadTripEntityToRoadTrip(trip)); // svakako cu se iterirati kroz svaki move next async 
                        }
                    }

                    await transaction.CommitAsync();

                }

            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Optional override to create listeners (e.g., HTTP, Service Remoting, WCF, etc.) for this service replica to handle client or user requests.
        /// </summary>
        /// <remarks>
        /// For more information on service communication, see https://aka.ms/servicefabricservicecommunication
        /// </remarks>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
            => this.CreateServiceRemotingReplicaListeners();

        /// <summary>
        /// This is the main entry point for your service replica.
        /// This method executes when this replica of your service becomes primary and has write status.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service replica.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {

            var roadTrips = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            await LoadRoadTrips();
            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using (var tx = this.StateManager.CreateTransaction())
                {
                    var enumerable = await roadTrips.CreateEnumerableAsync(tx);
                    if (await roadTrips.GetCountAsync(tx) > 0)
                    {
                        using (var enumerator = enumerable.GetAsyncEnumerator())
                        {

                            while (await enumerator.MoveNextAsync(default(CancellationToken)))
                            {
                                if (!enumerator.Current.Value.Accepted || enumerator.Current.Value.IsFinished) 
                                {
                                    continue;
                                }
                                else if (enumerator.Current.Value.Accepted && enumerator.Current.Value.SecondsToDriverArrive > 0)
                                {
                                    enumerator.Current.Value.SecondsToDriverArrive--; 
                                }
                                else if (enumerator.Current.Value.Accepted && enumerator.Current.Value.SecondsToDriverArrive == 0 && enumerator.Current.Value.SecondsToEndTrip > 0)
                                {
                                    enumerator.Current.Value.SecondsToEndTrip--;
                                }
                                else if (enumerator.Current.Value.IsFinished == false)
                                {
                                    enumerator.Current.Value.IsFinished = true;
                                    // ovde bi trebalo update baze da se izvrsi 
                                    await dataRepo.FinishTrip(enumerator.Current.Value.TripId);

                                }
                                await roadTrips.SetAsync(tx, enumerator.Current.Key, enumerator.Current.Value);
                            }
                        }
                    }
                    await tx.CommitAsync();
                }

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }

        /// <summary>
        /// Rider id is sent
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<RoadTrip> GetCurrentRoadTrip(Guid id)
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {

                    var enumerable = await roadTrip.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {
                            if ((enumerator.Current.Value.RiderId == id && enumerator.Current.Value.IsFinished == false))
                            {
                                return enumerator.Current.Value;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception)
            {
                throw;
            }

        }

        public async Task<List<RoadTrip>> GetRoadTrips()
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            List<RoadTrip> notCompletedTrips = new List<RoadTrip>();
            Guid forCompare = new Guid("00000000-0000-0000-0000-000000000000");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {

                    var enumerable = await roadTrip.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {
                            if (enumerator.Current.Value.DriverId == forCompare)
                            {
                                notCompletedTrips.Add(enumerator.Current.Value);
                            }
                        }
                    }
                    await tx.CommitAsync();
                }
                
                return notCompletedTrips;
            }
           
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<RoadTrip> AcceptRoadTripDriver(Guid rideId, Guid driverId)
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            Guid forCompare = new Guid("00000000-0000-0000-0000-000000000000");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {
                    ConditionalValue<RoadTrip> result = await roadTrip.TryGetValueAsync(tx, rideId);

                    if (result.HasValue && result.Value.DriverId == forCompare)
                    {
                        // azuriranje polja u reliable 
                        RoadTrip tripForAccept = result.Value;
                        tripForAccept.SecondsToEndTrip = 60; // ovde mozda da se zove servis za estimaciju opet 
                        tripForAccept.DriverId = driverId;
                        tripForAccept.Accepted = true;
                        await roadTrip.SetAsync(tx, tripForAccept.TripId, tripForAccept);
                        if (await dataRepo.UpdateEntity(driverId, rideId))
                        {
                            await tx.CommitAsync();
                            return tripForAccept;
                        }
                        else return null;
                    }
                    else return null;

                }
            }

            catch (Exception)
            {
                throw;
            }
        }

        public async Task<List<RoadTrip>> GetListOfCompletedRidesForDriver(Guid driverId)
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            List<RoadTrip> driverTrips = new List<RoadTrip>();
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {

                    var enumerable = await roadTrip.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {
                            if (enumerator.Current.Value.DriverId == driverId && enumerator.Current.Value.IsFinished)
                            {
                                driverTrips.Add(enumerator.Current.Value);
                            }
                        }
                    }
                    await tx.CommitAsync();
                }

                return driverTrips;
            }

            catch (Exception)
            {
                throw;
            }
        }

        public async  Task<List<RoadTrip>> GetListOfCompletedRidesForRider(Guid driverId)
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            List<RoadTrip> driverTrips = new List<RoadTrip>();
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {

                    var enumerable = await roadTrip.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {
                            if (enumerator.Current.Value.RiderId == driverId && enumerator.Current.Value.IsFinished)
                            {
                                driverTrips.Add(enumerator.Current.Value);
                            }
                        }
                    }
                    await tx.CommitAsync();
                }

                return driverTrips;
            }

            catch (Exception)
            {
                throw;
            }
        }

        public async Task<List<RoadTrip>> GetListOfCompletedRidesAdmin()
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            List<RoadTrip> driverTrips = new List<RoadTrip>();
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {

                    var enumerable = await roadTrip.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {

                                driverTrips.Add(enumerator.Current.Value);
                        }
                    }
                    await tx.CommitAsync();
                }

                return driverTrips;
            }

            catch (Exception)
            {
                throw;
            }
        }

        public async Task<RoadTrip> GetCurrentTrip(Guid id) // ovde se salje userId
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {

                    var enumerable = await roadTrip.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {
                            if ((enumerator.Current.Value.RiderId == id && enumerator.Current.Value.IsFinished ==false))
                            {
                                return enumerator.Current.Value;    
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<RoadTrip> GetCurrentTripDriver(Guid id)
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {

                    var enumerable = await roadTrip.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {
                            if ((enumerator.Current.Value.DriverId == id && enumerator.Current.Value.IsFinished == false))
                            {
                                return enumerator.Current.Value;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<List<RoadTrip>> GetAllNotRatedTrips()
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            List<RoadTrip> trips = new List<RoadTrip>();
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {

                    var enumerable = await roadTrip.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {
                            if (!enumerator.Current.Value.IsRated && enumerator.Current.Value.IsFinished)
                            {
                                trips.Add(enumerator.Current.Value);
                            }
                        }
                    }
                }
                return trips;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> SubmitRating(Guid tripId, int rating)
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, RoadTrip>>("Trips");
            bool result = false;
            var fabricClient = new FabricClient();
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {
                    var trip = await roadTrip.TryGetValueAsync(tx, tripId);
                    if (!trip.HasValue)
                    {
                        return false; // Trip not found
                    }

                   
                    Guid driverId = trip.Value.DriverId;
                    var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UsersService"));

                    foreach (var partition in partitionList)
                    {
                        var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                        var proxy = ServiceProxy.Create<IRating>(new Uri("fabric:/TaxiApp/UsersService"), partitionKey);

                        try
                        {
                            var partitionResult = await proxy.AddRating(driverId, rating);
                            if (partitionResult)
                            {
                                result = true;
                                trip.Value.IsRated = true;
                                await roadTrip.SetAsync(tx, trip.Value.TripId, trip.Value);
                                //update entity in db
                                await dataRepo.RateTrip(trip.Value.TripId);
                                break;
                            }
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }

                    await tx.CommitAsync();
                }
                return result;
            }
            catch (Exception ex)
            {
                // Log exception
                throw new ApplicationException($"Failed to submit rating for TripId: {tripId}", ex);
            }
        }

    }
}
