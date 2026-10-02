// users/invitation.service.ts
import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as crypto from "crypto";
import { UserInvitation } from "./entities/user-invitation.entity";
import { User } from "./entities/user.entity";
import { EmailService } from "src/email/email.service"; // ajusta la ruta real
import { ConfigService } from "@nestjs/config";

const TOKEN_BYTES = 32;
const EXPIRATION_HOURS = 48;

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name);

  constructor(
    @InjectRepository(UserInvitation)
    private invitationRepository: Repository<UserInvitation>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  private hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  async createInvitation(user: User): Promise<void> {
    const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EXPIRATION_HOURS);

    const invitation = this.invitationRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      used: false,
    });
    await this.invitationRepository.save(invitation);

    const frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:4200");
    const activationLink = `${frontendUrl}/activar-cuenta?token=${rawToken}&uid=${user.id}`;

    await this.emailService.sendActivationEmail(user.email, user.name, activationLink);

    this.logger.log(`Invitación creada para ${user.email}`);
  }

  async resendInvitation(userId: string, user: User): Promise<void> {
    await this.invitationRepository.update({ userId, used: false }, { used: true });
    await this.createInvitation(user);
  }

  async validateToken(userId: string, rawToken: string): Promise<UserInvitation> {
    const tokenHash = this.hashToken(rawToken);

    const invitation = await this.invitationRepository.findOne({
      where: { userId, tokenHash, used: false },
    });

    if (!invitation) {
      throw new BadRequestException("Token inválido o ya utilizado");
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException("El link ha expirado, solicita uno nuevo");
    }

    return invitation;
  }

  async markAsUsed(invitation: UserInvitation): Promise<void> {
    invitation.used = true;
    await this.invitationRepository.save(invitation);
  }
}
