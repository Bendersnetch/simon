import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    async register(createUserDto : CreateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.userService.findByEmail(createUserDto.email);

        if (existingUser) {
            throw new ConflictException(`User with this email already exist`);
        }

        const user = await this.userService.create(createUserDto);

        return Object.assign(new UserResponseDto(), {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            createdAt: user.createdAt,
            lastConnection: user.lastConnection,
        });
    }

    async login(loginDto: LoginDto): Promise<{token: string}> {
        const user = await this.userService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException(`Email or password invalid`);
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException(`Email or password invalid`)
        }

        const payload = { sub: user.id, role: user.role, scopes: user.scopes };
        const sign = this.jwtService.sign(payload);

        await this.userService.updateLastConnection(user.id, new Date());

        return { token: sign };
    }
}
