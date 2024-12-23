using Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interface
{
    public interface IAppDbContext
    {
        public DbSet<AppointmentModel> Appointments { get; set; }
        public DbSet<Otp> otps { get; set; }
        public DbSet<SoapNoteModel> SoapNotes { get; set; }
        public DbSet<SpecializationModel> Specializations { get; set; }
        public DbSet<Usermodel> Users { get; set; }
        public DbSet<Country> countries{ get; set; }
        public DbSet<State> states { get; set; }
        public Task<int> SaveChangesAsync();
        public IDbConnection GetConnection();
    }
}
