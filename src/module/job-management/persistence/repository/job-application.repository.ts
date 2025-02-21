import { PrismaService } from '@sharedModule/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { DefaultPrismaRepository } from '@sharedModule/prisma/default.prisma.repository';
import JobApplicationModel from '@jobManagementModule/core/model/job-application.model';

type QueryableFields = Prisma.$UserPayload['scalars'];

@Injectable()
export class JobApplicationRepository extends DefaultPrismaRepository {
  private readonly model: PrismaService['jobApplicationProcess'];

  constructor(prismaService: PrismaService) {
    super();
    this.model = prismaService.jobApplicationProcess;
  }
  getAllApplicationJobsByUserId = async (
    userId: string,
  ): Promise<JobApplicationModel[]> => {
    try {
      return this.model.findMany({ where: { userId } });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  save = async (data: JobApplicationModel): Promise<JobApplicationModel> => {
    try {
      return await this.model.create({ data });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  findByOne = async (
    fields: Partial<QueryableFields>,
  ): Promise<JobApplicationModel | undefined> => {
    try {
      const jobApplicationProcess = await this.model.findFirst({
        where: fields,
      });
      if (!jobApplicationProcess) {
        return;
      }
      return jobApplicationProcess;
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  update = async (
    id: string,
    data: Partial<JobApplicationModel>,
  ): Promise<JobApplicationModel> => {
    try {
      const updateJobApplicationProcess = await this.model.update({
        where: { id },
        data,
      });
      return updateJobApplicationProcess;
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  getJobApplications = async (
    page: number = 1,
    pageSize: number = 20,
  ): Promise<
    {
      userId: string;
      fullName: string;
      totalApplications: number;
      activeProcessCount: number;
      statusCount: {
        IN_PROGRESS: number;
        APPROVED: number;
        APPLIED: number;
        REJECTED: number;
        CLOSED: number;
        NOT_PROCESSING: number;
      };
    }[]
  > => {
    try {
      const skip = (page - 1) * pageSize;
      const groupedApplications = await this.model.groupBy({
        by: ['userId'],
        _count: {
          id: true,
        },
        skip,
        take: pageSize,
        orderBy: {
          userId: 'desc',
        },
      });
      const jobApplications = await Promise.all(
        groupedApplications.map(async (app) => {
          const statusCounts = await this.model.groupBy({
            by: ['status', 'userId'],
            _count: {
              id: true,
            },
            where: {
              userId: app.userId,
            },
          });
          const userDetails = await this.getUserDetails(app.userId);
          const activeProcessCount = statusCounts.reduce((sum, curr) => {
            if (
              ['IN_PROGRESS', 'APPROVED', 'APPLIED'].includes(
                curr.status as string,
              )
            ) {
              return sum + curr._count.id;
            }
            return sum;
          }, 0);

          const statusCountMap = statusCounts.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.status as string]: curr._count.id,
            }),
            {
              IN_PROGRESS: 0,
              APPROVED: 0,
              APPLIED: 0,
              REJECTED: 0,
              CLOSED: 0,
              NOT_PROCESSING: 0,
            },
          );
          return {
            userId: app.userId,
            fullName:
              userDetails?.user?.firstName + ' ' + userDetails?.user?.lastName,
            totalApplications: app._count.id,
            activeProcessCount,
            statusCount: statusCountMap,
          };
        }),
      );
      return jobApplications;
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  private getUserDetails = async (userId: string) => {
    return this.model.findFirst({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  };

  clear = async (): Promise<{ count: number }> => {
    try {
      return await this.model.deleteMany();
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
}
