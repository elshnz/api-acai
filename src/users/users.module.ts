import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import { AuthModule } from "@/auth/auth.module";
import { InvitationService } from "./invitation.service";
import { UserInvitation } from "./entities/user-invitation.entity";
import { EmailModule } from "@/email/email.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserInvitation]), EmailModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, InvitationService],
  exports: [UsersService, InvitationService],
})
export class UsersModule {}
