import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryFailedError } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { InvitationService } from "./invitation.service";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private invitationService: InvitationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      password: null, // se setea después vía link de activación
      status: "pending",
    });

    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).code === "23505") {
        throw new ConflictException("El email ya está registrado");
      }
      throw error;
    }

    try {
      await this.invitationService.createInvitation(savedUser);
    } catch (err) {
      this.logger.error(`No se pudo enviar invitación a ${savedUser.email}`, err);
      // El usuario queda creado en estado "pending".
      // Se puede reenviar la invitación luego con otro endpoint.
    }

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ["id", "name", "email", "avatar", "status", "createdAt"],
    });
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(id, { password: hashedPassword });
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
  }

  async updatePasswordAndActivate(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, {
      password: hashedPassword,
      status: "active",
    });
  }
}
