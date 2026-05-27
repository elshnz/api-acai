// auth/passkey.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
// ✅ v8+: los tipos vienen directo de '@simplewebauthn/server'
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/server';
import { UsersService } from '../users/users.service';
import { Passkey } from './entities/passkey.entity';
import { WebauthnChallenge } from './entities/webauth-challenge.entity';

@Injectable()
export class PasskeyService {
    private readonly logger = new Logger(PasskeyService.name);
    private readonly rpID: string;
    private readonly rpName: string;
    private readonly origin: string;

    constructor(
        @InjectRepository(Passkey)
        private passkeyRepository: Repository<Passkey>,
        @InjectRepository(WebauthnChallenge)
        private challengeRepository: Repository<WebauthnChallenge>,
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        this.rpID = this.configService.get('RP_ID', 'localhost');
        this.rpName = this.configService.get('RP_NAME', 'Mi Aplicación');
        this.origin = this.configService.get('ORIGIN', 'http://localhost:4200');
    }

    async generateRegistrationOptions(userId: string) {
        try {
            const user = await this.usersService.findById(userId);

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const userPasskeys = await this.passkeyRepository.find({
                where: { userId: user.id },
            });

            const options = await generateRegistrationOptions({
                rpName: this.rpName,
                rpID: this.rpID,
                userName: user.email,
                userDisplayName: user.name || user.email,
                attestationType: 'none',
                // ✅ v8+: id debe ser string base64url, no Buffer
                excludeCredentials: userPasskeys.map(passkey => ({
                    id: passkey.credentialId, // ya está guardado como base64url string
                    transports: passkey.transports?.split(',') as any || [],
                })),
                authenticatorSelection: {
                    residentKey: 'preferred',
                    userVerification: 'preferred',
                    authenticatorAttachment: 'platform',
                },
            });

            // Guardar challenge
            const challenge = this.challengeRepository.create({
                userId: user.id,
                challenge: options.challenge,
                type: 'registration',
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                isUsed: false,
            });
            await this.challengeRepository.save(challenge);

            return options;
        } catch (error) {
            this.logger.error(`Error generating registration options: ${error.message}`);
            throw error;
        }
    }

    async verifyRegistration(userId: string, response: RegistrationResponseJSON, challenge: string) {
        try {
            const user = await this.usersService.findById(userId);

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const storedChallenge = await this.challengeRepository.findOne({
                where: {
                    userId: user.id,
                    challenge: challenge,
                    type: 'registration',
                    isUsed: false,
                },
            });

            if (!storedChallenge || storedChallenge.expiresAt < new Date()) {
                throw new UnauthorizedException('Invalid or expired challenge');
            }

            const verification = await verifyRegistrationResponse({
                response,
                expectedChallenge: challenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID,
            });

            const { verified, registrationInfo } = verification;

            if (!verified || !registrationInfo) {
                throw new UnauthorizedException('Verification failed');
            }

            // ✅ v8+: credentialPublicKey, credentialID y counter ahora viven en registrationInfo.credential
            const { credential } = registrationInfo;
            const credentialPublicKey = credential.publicKey;
            const credentialID = credential.id; // ya es string base64url en v8+
            const counter = credential.counter;

            // Guardar passkey
            const passkey = this.passkeyRepository.create({
                credentialId: credentialID,
                publicKey: Buffer.from(credentialPublicKey),
                counter: counter,
                userId: user.id,
                webauthnUserID: user.id,
                deviceType: 'singleDevice',
                backedUp: registrationInfo.credentialDeviceType === 'multiDevice' || false,
                transports: response.response.transports?.join(',') || '',
                aaguid: registrationInfo.aaguid || '',
            });
            await this.passkeyRepository.save(passkey);

            // Marcar challenge como usado
            storedChallenge.isUsed = true;
            await this.challengeRepository.save(storedChallenge);

            return { verified: true, message: 'Passkey registered successfully' };
        } catch (error) {
            this.logger.error(`Error verifying registration: ${error.message}`);
            throw new UnauthorizedException('Failed to verify registration');
        }
    }

    async generateAuthenticationOptions(email: string) {
        try {
            const user = await this.usersService.findByEmail(email);

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const userPasskeys = await this.passkeyRepository.find({
                where: { userId: user.id },
            });

            if (userPasskeys.length === 0) {
                throw new UnauthorizedException('No passkeys registered for this user');
            }

            const options = await generateAuthenticationOptions({
                rpID: this.rpID,
                // ✅ v8+: id debe ser string base64url, no Buffer
                allowCredentials: userPasskeys.map(passkey => ({
                    id: passkey.credentialId, // ya está guardado como base64url string
                    transports: passkey.transports?.split(',') as any || ['internal'],
                })),
                userVerification: 'preferred',
            });

            // Guardar challenge
            const challenge = this.challengeRepository.create({
                userId: user.id,
                challenge: options.challenge,
                type: 'authentication',
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                isUsed: false,
            });
            await this.challengeRepository.save(challenge);

            return options;
        } catch (error) {
            this.logger.error(`Error generating authentication options: ${error.message}`);
            throw error;
        }
    }

    async verifyAuthentication(email: string, response: AuthenticationResponseJSON, challenge: string) {
        try {
            const user = await this.usersService.findByEmail(email);

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const passkey = await this.passkeyRepository.findOne({
                where: { credentialId: response.id },
            });

            if (!passkey) {
                throw new UnauthorizedException('Passkey not found');
            }

            const storedChallenge = await this.challengeRepository.findOne({
                where: {
                    userId: user.id,
                    challenge: challenge,
                    type: 'authentication',
                    isUsed: false,
                },
            });

            if (!storedChallenge || storedChallenge.expiresAt < new Date()) {
                throw new UnauthorizedException('Invalid or expired challenge');
            }

            const verification = await verifyAuthenticationResponse({
                response,
                expectedChallenge: challenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID,
                // ✅ v8+: el campo se llama 'credential', no 'authenticator'
                credential: {
                    id: passkey.credentialId, // string base64url
                    publicKey: new Uint8Array(passkey.publicKey), // Uint8Array
                    counter: passkey.counter,
                    transports: passkey.transports?.split(',') as any || [],
                },
            });

            const { verified, authenticationInfo } = verification;

            if (!verified) {
                throw new UnauthorizedException('Authentication failed');
            }

            // Actualizar contador
            if (authenticationInfo.newCounter) {
                passkey.counter = authenticationInfo.newCounter;
                await this.passkeyRepository.save(passkey);
            }

            // Marcar challenge como usado
            storedChallenge.isUsed = true;
            await this.challengeRepository.save(storedChallenge);

            const { password: _, ...userWithoutPassword } = user;
            return { verified: true, user: userWithoutPassword };
        } catch (error) {
            this.logger.error(`Error verifying authentication: ${error.message}`);
            throw new UnauthorizedException('Failed to verify authentication');
        }
    }

    async getUserPasskeys(userId: string) {
        return this.passkeyRepository.find({
            where: { userId },
            select: ['id', 'credentialId', 'deviceType', 'backedUp', 'createdAt'],
        });
    }

    async deletePasskey(userId: string, passkeyId: string) {
        const passkey = await this.passkeyRepository.findOne({
            where: { id: passkeyId, userId },
        });

        if (!passkey) {
            throw new UnauthorizedException('Passkey not found');
        }

        await this.passkeyRepository.remove(passkey);
        return { message: 'Passkey deleted successfully' };
    }
}