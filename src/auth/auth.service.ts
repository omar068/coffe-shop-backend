import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './../../node_modules/@types/jsonwebtoken/index.d';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    console.log("UserRepository is disponible", !!this.userRepository);
    const verificar = 'VERIFICAR SI ESTAMOS USANDO LOS PRINCIPIOS SOLID';
  }

  async register(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({ username, password: hashedPassword });
    return this.userRepository.save(newUser);
  }

  async login(user: any): Promise<{ access_token: string, username: string, id: string, refreshToken: string}>{
    const payload = {username : user.username, sub : user.id};
    console.log(payload);
    const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET || 'access-secret', expiresIn: '1h'});

    const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret', expiresIn : '7d'});

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, {refreshToken: hashedRefreshToken});

    return {
        id: user.id,
        username: user.username,
        access_token : accessToken,
        refreshToken : refreshToken
    }
  }

  async logout(userId: number): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null })
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return false;
  }

  async validateRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id : userId } });
    if (!user || user.refreshToken !== refreshToken){
        return false;
    }
    return bcrypt.compare(refreshToken, user.refreshToken);
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async getUserByUserName(userName: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username : userName}});
  }

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload)
  }
}
