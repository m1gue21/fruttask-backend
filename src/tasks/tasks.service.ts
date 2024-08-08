import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/rol.enum';
import { UserActiveInterface } from '../common/interfaces/user-active.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}

  async create(createTaskDto: CreateTaskDto, user: UserActiveInterface) {
    return await this.taskRepository.save({
      ...createTaskDto,
      userEmail: user.email
    });
  }

  async findAll(user: UserActiveInterface) {
    if(user.role === Role.ADMIN) {
      return await this.taskRepository.find();
    }
    return await this.taskRepository.find({
      where: { userEmail: user.email },
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new BadRequestException('task not found');
    }
    this.validateOwnership(task, user);
    return task;
  }

  async findByStatus(status: string, user: UserActiveInterface) {
    // Los administradores pueden ver todas las tareas con el estado dado
    if (user.role === Role.ADMIN) {
      return await this.taskRepository.find({
        where: { status: status },
      });
    }
    // Los usuarios regulares solo pueden ver sus propias tareas con el estado dado
    return await this.taskRepository.find({
      where: {
        status: status,
        userEmail: user.email,
      },
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: UserActiveInterface) {
    await this.findOne(id, user );
    return await this.taskRepository.update(id, {
      ...updateTaskDto,
      userEmail: user.email,
    })
  }

  async remove(id: number, user: UserActiveInterface) {
    await this.findOne(id, user );
    return await this.taskRepository.softDelete({ id }); // se le pasa el id
  }

  private validateOwnership(task: Task, user: UserActiveInterface) {
    if (user.role !== Role.ADMIN && task.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }

}
