import { PrismaClient, Prisma } from '@prisma/client';

export const db = new PrismaClient();

export const user = {
  create: (args: Prisma.UserCreateArgs) => db.user.create(args),
  find: (where: Prisma.UserWhereUniqueInput) => db.user.findUnique({ where }),
  update: (args: Prisma.UserUpdateArgs) => db.user.update(args),
  remove: (where: Prisma.UserWhereUniqueInput) => db.user.delete({ where }),
};

export const item = {
  create: (args: Prisma.ItemCreateArgs) => db.item.create(args),
  find: (where: Prisma.ItemWhereUniqueInput) => db.item.findUnique({ where }),
  update: (args: Prisma.ItemUpdateArgs) => db.item.update(args),
  remove: (where: Prisma.ItemWhereUniqueInput) => db.item.delete({ where }),
};

export const review = {
  create: (args: Prisma.ReviewCreateArgs) => db.review.create(args),
  find: (where: Prisma.ReviewWhereUniqueInput) => db.review.findUnique({ where }),
  update: (args: Prisma.ReviewUpdateArgs) => db.review.update(args),
  remove: (where: Prisma.ReviewWhereUniqueInput) => db.review.delete({ where }),
};

export const itemState = {
  create: (args: Prisma.ItemStateCreateArgs) => db.itemState.create(args),
  find: (where: Prisma.ItemStateWhereUniqueInput) => db.itemState.findUnique({ where }),
  update: (args: Prisma.ItemStateUpdateArgs) => db.itemState.update(args),
  remove: (where: Prisma.ItemStateWhereUniqueInput) => db.itemState.delete({ where }),
};

export const objectiveState = {
  create: (args: Prisma.ObjectiveStateCreateArgs) => db.objectiveState.create(args),
  find: (where: Prisma.ObjectiveStateWhereUniqueInput) =>
    db.objectiveState.findUnique({ where }),
  update: (args: Prisma.ObjectiveStateUpdateArgs) => db.objectiveState.update(args),
  remove: (where: Prisma.ObjectiveStateWhereUniqueInput) =>
    db.objectiveState.delete({ where }),
};

export const clusterState = {
  create: (args: Prisma.ClusterStateCreateArgs) => db.clusterState.create(args),
  find: (where: Prisma.ClusterStateWhereUniqueInput) =>
    db.clusterState.findUnique({ where }),
  update: (args: Prisma.ClusterStateUpdateArgs) => db.clusterState.update(args),
  remove: (where: Prisma.ClusterStateWhereUniqueInput) =>
    db.clusterState.delete({ where }),
};

export const objective = {
  create: (args: Prisma.ObjectiveCreateArgs) => db.objective.create(args),
  find: (where: Prisma.ObjectiveWhereUniqueInput) => db.objective.findUnique({ where }),
  update: (args: Prisma.ObjectiveUpdateArgs) => db.objective.update(args),
  remove: (where: Prisma.ObjectiveWhereUniqueInput) => db.objective.delete({ where }),
};

export const course = {
  create: (args: Prisma.CourseCreateArgs) => db.course.create(args),
  find: (where: Prisma.CourseWhereUniqueInput) => db.course.findUnique({ where }),
  update: (args: Prisma.CourseUpdateArgs) => db.course.update(args),
  remove: (where: Prisma.CourseWhereUniqueInput) => db.course.delete({ where }),
};
