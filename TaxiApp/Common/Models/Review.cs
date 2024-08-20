using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class Review
    {
        public Guid tripId { get; set; }    
        public int rating { get; set; }

        public Review()
        {
        }
    }
}
