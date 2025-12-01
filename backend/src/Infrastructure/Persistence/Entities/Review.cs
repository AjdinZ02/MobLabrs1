using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Review
{
    public int ReviewID { get; set; }

    public int? ProductID { get; set; }

    public int? UserID { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public virtual Product? Product { get; set; }

    public virtual User? User { get; set; }
}
