using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    [DataContract]
    public class FileUploadDTO
    {
        [DataMember]
        public string FileName { get; set; }

        [DataMember]
        public string ContentType { get; set; }

        [DataMember]
        public byte[] FileContent { get; set; }

        public FileUploadDTO(byte[] fileContent)
        {
            FileContent = fileContent;
        }

        public FileUploadDTO(string fileName, string contentType, byte[] fileContent)
        {
            FileName = fileName;
            ContentType = contentType;
            FileContent = fileContent;
        }

        public FileUploadDTO()
        {
        }
    }
}
