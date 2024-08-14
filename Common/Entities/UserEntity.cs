using System;
using Common.Models;
using System.Collections.Concurrent;
using Microsoft.WindowsAzure.Storage.Table;

namespace Common.Entities
{
    public class UserEntity : TableEntity
    {
        // User properties
        public string Address { get; set; }
        public double AverageRating { get; set; }
        public int SumOfRatings { get; set; }
        public int NumOfRatings { get; set; }
        public DateTime Birthday { get; set; }
        public string Email { get; set; }
        public bool IsVerified { get; set; }
        public bool IsBlocked { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
        public string Username { get; set; }

        // Enums stored as strings since Azure Table Storage does not support enums
        public string TypeOfUser { get; set; }
        public string Status { get; set; }

        // Additional properties
        public string ImageUrl { get; set; } // Location of the image in blob storage
        public Guid Id { get; set; }

        // Constructors
        public UserEntity(User user, string imageUrl)
        {
            InitializeUserEntity(user);
            ImageUrl = imageUrl; 
        }

        public UserEntity(User user)
        {
            InitializeUserEntity(user); 
            ImageUrl = user.ImageUrl;
        }

        public UserEntity()
        {
        }

        // Method to initialize properties from a User object
        private void InitializeUserEntity(User user)
        {
            RowKey = user.Username; // Primary key is the username
            PartitionKey = user.TypeOfUser.ToString(); // Partition key is the user type

            // Copy all fields from the User object
            Address = user.Address;
            AverageRating = user.AverageRating;
            SumOfRatings = user.SumOfRatings;
            NumOfRatings = user.NumOfRatings;
            Birthday = user.Birthday;
            Email = user.Email;
            IsVerified = user.IsVerified;
            IsBlocked = user.IsBlocked;
            FirstName = user.FirstName;
            LastName = user.LastName;
            Password = user.Password;
            Username = user.Username;

            // Convert enum values to strings for Azure Table Storage
            TypeOfUser = user.TypeOfUser.ToString();
            Status = user.Status.ToString();

            Id = user.Id;
        }
    }
}
