import { Body, Controller, Get, Post, UseGuards, Req, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/register')
async register(@Body() body: { username: string; password: string }) {
  try {
    return await this.authService.register(body.username, body.password);
  } catch (error) {
    console.error('Error en el controlador de registro:', error);
    if (error instanceof BadRequestException) {
      throw error; 
    }
    throw new InternalServerErrorException('Error inesperado. Por favor, intenta nuevamente.');
  }
}

  @Post('auth/login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      return { message: 'Credenciales inválidas' };
    }
    return this.authService.login(user);
  }

  @Post('auth/logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: any): Promise<{ message : string}> {
    const userId = req.user.userId;
    console.log('Contenido de req.user:', req.user);
    if (!userId) {
        throw new Error('Usuario no autenticado'); 
      }
    
      await this.authService.logout(userId); 
      return { message: 'Logout exitoso!!' };
    }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile() {
    return { message: 'Acceso autorizado' };
  }

  @Post('auth/refresh')
  async refreshToken(@Body() body : { userId: number, refreshToken: string }): Promise<{ acces_token: string }> {
    const isValid = await this.authService.validateRefreshToken(body.userId, body.refreshToken);
    if (!isValid){
        throw new Error('Refresh token invalid!!');
    }
    const user = await this.authService.getUserById(body.userId);
    const payload = { username: user?.username, sub: user?.id };
    return {
        acces_token: this.authService.generateAccessToken(payload),
    }

  }

}