using Common.Interfaces;
using Common.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using System.Text;

namespace WebApi
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance.
    /// </summary>
    internal sealed class WebApi : StatelessService
    {
        public WebApi(StatelessServiceContext context)
            : base(context)
        { }

        /// <summary>
        /// Optional override to create listeners (like tcp, http) for this service instance.
        /// </summary>
        /// <returns>The collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting Kestrel on {url}");

                        var builder = WebApplication.CreateBuilder();

                        //jwt
                        var jwtIssuer = builder.Configuration.GetSection("Jwt:Issuer").Get<string>();
                        var jwtKey = builder.Configuration.GetSection("Jwt:Key").Get<string>();
                        builder.Services.AddTransient<IEmailSender,EmailSender>();
                        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                         .AddJwtBearer(options =>
                         {
                             options.TokenValidationParameters = new TokenValidationParameters
                             {
                                 ValidateIssuer = true,
                                 ValidateAudience = true,
                                 ValidateLifetime = true,
                                 ValidateIssuerSigningKey = true,
                                 ValidIssuer = jwtIssuer,
                                 ValidAudience = jwtIssuer,
                                 IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                             };
                         });
                        //jwt


                        builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);
                        builder.WebHost
                                    .UseKestrel()
                                    .UseContentRoot(Directory.GetCurrentDirectory())
                                    .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                                    .UseUrls(url);
                        builder.Services.AddControllers();
                        builder.Services.AddEndpointsApiExplorer();
                        builder.Services.AddSwaggerGen();
                        builder.Services.AddSignalR();
                        builder.Services.AddAuthorization(options =>
                        {
                               options.AddPolicy("Admin", policy => policy.RequireClaim("MyCustomClaim", "Admin"));
                               options.AddPolicy("Rider", policy => policy.RequireClaim("MyCustomClaim", "Rider"));
                               options.AddPolicy("Driver", policy => policy.RequireClaim("MyCustomClaim", "Driver"));
                        });

                          builder.Services.AddCors(options =>
                        {
                            options.AddPolicy(name: "cors", builder => {
                                builder.WithOrigins("http://localhost:3000")
                                        .AllowAnyHeader()
                                        .AllowAnyMethod()
                                        .AllowCredentials();

                                });
                            });



                        var app = builder.Build();
      

                      
                        app.UseRouting();


                        app.UseAuthentication();
                        app.UseAuthorization();

                        app.UseStaticFiles();


                                          if (app.Environment.IsDevelopment())
                        {
                        app.UseSwagger();
                       app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    c.RoutePrefix = string.Empty; // Set Swagger UI at the root
});
                        }
                                          /*
                                          app.UseSwagger(); // Enables middleware to serve the Swagger JSON document.

app.UseSwaggerUI(); // Enables middleware to serve the Swagger UI, specifying the default Swagger JSON endpoint.

*/
                                            app.UseCors("cors");

                        app.UseFileServer();
                        app.UseDefaultFiles();


                        app.MapControllers();

                        return app;

                    }))
            };
        }
    }
}
