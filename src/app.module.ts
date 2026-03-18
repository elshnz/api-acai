import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeServiceModule } from './type-service/type-service.module';
import { MunicipalityModule } from './municipality/municipality.module';
import { ProspectModule } from './prospect/prospect.module';
import { EmailModule } from './email/email.module';
import { PagesModule } from './pages/pages.module';
import { MenuModule } from './menu/menu.module';
import { NoticiasModule } from './noticias/noticias.module';
import { MaterialModule } from './material/material.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'acai_db'),
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
  ],
})
export class AppModule {}
