import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  await db.user.upsert({
    where: { uuid: 'demo-uuid' },
    create: { uuid: 'demo-uuid' },
    update: {}
  });

  const clusters = await db.$transaction(
    Array.from({ length: 8 }).map((_, i) =>
      db.objective.create({
        data: {
          clusterId: i + 1,
          text: `Objective ${i + 1}`,
          bloom: 'Remember',
          items: {
            createMany: {
              data: Array.from({ length: 3 }).map((__, j) => ({
                tier: 1,
                stem: `Seed stem C${i + 1}-${j + 1}`,
                reference: JSON.stringify({ answer: 'demo' })
              }))
            }
          }
        }
      })
    )
  );
  console.log(`Seeded ${clusters.length} objectives`);
}

main().then(() => db.$disconnect());
