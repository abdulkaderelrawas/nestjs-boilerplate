import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/modules/auth/enums/roles.enum';
import { AuthService } from 'src/modules/auth/service/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { IUser } from '../interface/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly authService: AuthService,
  ) {}

  //   8888888b.       888     888      888888b.        888           8888888       .d8888b.
  // 888   Y88b      888     888      888  "88b       888             888        d88P  Y88b
  // 888    888      888     888      888  .88P       888             888        888    888
  // 888   d88P      888     888      8888888K.       888             888        888
  // 8888888P"       888     888      888  "Y88b      888             888        888
  // 888             888     888      888    888      888             888        888    888
  // 888             Y88b. .d88P      888   d88P      888             888        Y88b  d88P
  // 888              "Y88888P"       8888888P"       88888888      8888888       "Y8888P"

  public async findByUserId(id: string) {
    return await this.userModel.findOne({ _id: id, is_deleted: false });
  }

  public async create(
    createUserDto: CreateUserDto,
  ): Promise<{ user: IUser; access_token: string }> {
    const Roles = Object.values(Role);

    const transaction = await this.userModel.startSession();
    transaction.startTransaction();

    try {
      if (await this.mailExists(createUserDto.email)) {
        throw new HttpException('Email already taken', HttpStatus.CONFLICT);
      }

      createUserDto.password = await this.authService.hashPassword(
        createUserDto.password,
      );

      const nameIsNum = /^\d+$/.test(createUserDto.name);
      const emailIsNum = /^\d+$/.test(createUserDto.email.split('@')[0]);
      if (nameIsNum || emailIsNum) {
        throw new HttpException(
          'Name & Email can not only contain numbers',
          HttpStatus.BAD_REQUEST,
        );
      }

      createUserDto.roles?.map((cr) => {
        if (!Roles.some((r) => r === cr)) {
          throw new HttpException(
            'Unacceptable Role',
            HttpStatus.NOT_ACCEPTABLE,
          );
        }
      });

      const newUser = await this.userModel.create(createUserDto);

      const cleanUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        roles: newUser.roles,
        is_deleted: newUser.is_deleted,
        createdAt: newUser.createdAt,
      } as IUser;

      const accessToken = await this.authService.generateJWT(cleanUser);

      return {
        user: cleanUser,
        access_token: accessToken,
      };
    } catch (e) {
      await transaction.abortTransaction();
      transaction.endSession();
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  public async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ user: IUser; access_token: string }> {
    const user: IUser = await this.findUserByEmail(loginUserDto.email);

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const passwordMatches = await this.authService.comparePasswords(
      loginUserDto.password,
      user.password,
    );

    if (!passwordMatches)
      throw new HttpException(
        'Login was not Successful',
        HttpStatus.UNAUTHORIZED,
      );

    const cleanUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      is_deleted: user.is_deleted,
      createdAt: user.createdAt,
    } as IUser;

    const accessToken = await this.authService.generateJWT(cleanUser);

    return {
      user: cleanUser,
      access_token: accessToken,
    };
  }

  public async getAllUsers(): Promise<any> {
    const users = await this.userModel.find({}).select('-password');

    if (!users) {
      throw new HttpException('Users do not exist', HttpStatus.NOT_FOUND);
    }

    return users;
  }

  public async getUser(id: string): Promise<any> {
    const user = await this.userModel.findById(id).select('-password');

    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  public async getUserProfile(id: string): Promise<any> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }

    if (user.roles.includes('super_admin') || user.roles.includes('admin')) {
      return {
        name: user.name,
        email: user.email,
        roles: user.roles,
        phone: user.phone,
        is_deleted: user.is_deleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        id: user.id,
      };
    }

    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      id: user.id,
    };
  }

  public async deleteUser(userId: string): Promise<any> {
    const user = await this.getUser(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.is_deleted) {
      throw new HttpException(
        'User is already deleted',
        HttpStatus.NOT_MODIFIED,
      );
    }

    user.is_deleted = true;

    const deletedUser = await user.save();

    if (!deletedUser) {
      throw new HttpException(
        'Something wrong happened while trying to delete this user.',
        HttpStatus.NOT_MODIFIED,
      );
    }

    return { message: 'User Deleted Successfully!' };
  }

  //   8888888b.       8888888b.       8888888      888     888             d8888      88888888888      8888888888
  // 888   Y88b      888   Y88b        888        888     888            d88888          888          888
  // 888    888      888    888        888        888     888           d88P888          888          888
  // 888   d88P      888   d88P        888        Y88b   d88P          d88P 888          888          8888888
  // 8888888P"       8888888P"         888         Y88b d88P          d88P  888          888          888
  // 888             888 T88b          888          Y88o88P          d88P   888          888          888
  // 888             888  T88b         888           Y888P          d8888888888          888          888
  // 888             888   T88b      8888888          Y8P          d88P     888          888          8888888888

  private async mailExists(email: string) {
    const acc = await this.userModel.findOne({ email });
    if (acc) {
      return true;
    } else {
      return false;
    }
  }

  private async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email, is_deleted: false });
  }
}
