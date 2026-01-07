import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { firstname, lastname, email, password } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'user';
    const scopes = this.getScopesForRole(role); 

    const user = this.userRepository.create({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: hashedPassword,
      role: [role],
      scopes: scopes
    });

    return this.userRepository.save(user);
  }

  private getScopesForRole(role: string): string[] {
    const map = {
      user: ['read:own_profile', 'update:own_profile'],
      admin: ['*'],
    };
    return map[role] || [];
  }

  async updateLastConnection(userId: number, date: Date): Promise<void> {
    await this.userRepository.update(userId, { lastConnection: date });
  }

  async getAll() {
    return this.userRepository.getAll();
  }
}
