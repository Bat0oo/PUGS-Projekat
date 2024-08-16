using Common.Entities;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UserService
{
    public class UserRepository
    {
        private CloudStorageAccount storageAccount;

        private CloudTableClient tableClient;
        private CloudTable usersTable;

        private CloudBlobClient blobClient;

        public CloudStorageAccount StorageAccount
        {
            get { return storageAccount; }
            set { storageAccount = value; }
        }

        public CloudTableClient TableClient
        {
            get { return tableClient; }
            set { tableClient = value; }
        }

        public CloudTable UsersTable
        {
            get { return usersTable; }
            set { usersTable = value; }
        }

        public CloudBlobClient BlobClient
        {
            get { return blobClient; }
            set { blobClient = value; }
        }


        public UserRepository(string tableName)
        {
            try
            {
                string dataConnectionString = Environment.GetEnvironmentVariable("DataConnectionString");
                StorageAccount = CloudStorageAccount.Parse(dataConnectionString); // create cloud client for making blob,table or queue 

                BlobClient = StorageAccount.CreateCloudBlobClient();  // blob client 

                TableClient = StorageAccount.CreateCloudTableClient(); // table client

                UsersTable = TableClient.GetTableReference(tableName); // create if not exists Users table 
                UsersTable.CreateIfNotExistsAsync().Wait();

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<CloudBlockBlob> GetBlockBlobReference(string containerName, string blobName)
        {
            CloudBlobContainer container = blobClient.GetContainerReference(containerName);
            await container.CreateIfNotExistsAsync();
            CloudBlockBlob blob = container.GetBlockBlobReference(blobName);

            return blob;
        }

        public IEnumerable<UserEntity> GetAllUsers()
        {
            var q = new TableQuery<UserEntity>();
            var qRes = UsersTable.ExecuteQuerySegmentedAsync(q, null).GetAwaiter().GetResult();
            return qRes.Results;
        }

        public async Task<byte[]> DownloadImage(UserRepository dataRepo, UserEntity user, string nameOfContainer)
        {

            CloudBlockBlob blob = await dataRepo.GetBlockBlobReference(nameOfContainer, $"image_{user.Id}");


            await blob.FetchAttributesAsync();

            long blobLength = blob.Properties.Length;

            byte[] byteArray = new byte[blobLength];
            await blob.DownloadToByteArrayAsync(byteArray, 0);

            return byteArray;

        }


    }
}
