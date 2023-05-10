import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpCode,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { Role } from 'src/modules/auth/enums/roles.enum';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { IUser } from '../interface/user.interface';
import { UserService } from '../service/user.service';

@Controller('users')
@UsePipes(new ValidationPipe())
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ user: IUser; access_token: string }> {
    return await this.userService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ user: IUser; access_token: string }> {
    return await this.userService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async getAllUsers(): Promise<any> {
    return await this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile(@User() user: IUser): Promise<any> {
    return await this.userService.getUserProfile(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async getUser(@Param('id') id: string): Promise<any> {
    return await this.userService.getUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/delete')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async deleteUser(@Param('id') userId: string): Promise<any> {
    return await this.userService.deleteUser(userId);
  }
}
