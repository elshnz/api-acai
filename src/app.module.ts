import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TypeServiceModule } from "./type-service/type-service.module";
import { MunicipalityModule } from "./municipality/municipality.module";
import { ProspectModule } from "./prospect/prospect.module";
import { EmailModule } from "./email/email.module";
import { PagesModule } from "./pages/pages.module";
import { MenuModule } from "./menu/menu.module";
import { NoticiasModule } from "./noticias/noticias.module";
import { MaterialModule } from "./material/material.module";
import { LicitacionesModule } from "./licitaciones/licitaciones.module";
import { ProxyModule } from "./proxy/proxy.module";
import { JwtStrategy } from "./auth/jwt.strategy";

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST", "http://127.0.0.1:8082/"),
        port: configService.get<number>("DB_PORT", 5432),
        username: configService.get<string>("DB_USERNAME", "acai-user"),
        password: configService.get<string>("DB_PASSWORD", "qewqwrqwer"),
        database: configService.get<string>("DB_NAME", "acai_db"),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    TypeServiceModule,
    MunicipalityModule,
    ProspectModule,
    EmailModule,
    PagesModule,
    MenuModule,
    NoticiasModule,
    MaterialModule,
    LicitacionesModule,
    ProxyModule,
  ],
  providers: [JwtStrategy],
  exports: [JwtStrategy, PagesModule],
})
export class AppModule {}
