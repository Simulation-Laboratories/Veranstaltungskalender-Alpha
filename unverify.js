import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.location.update({
    where: { id: 'cmqzn0zn300009cinzidb5gy7' },
    data: { ownerId: null, isVerified: false }
  });
  console.log('Location owner removed.');
}
main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
