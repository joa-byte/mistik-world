import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'change-me';
  const name = process.env.SEED_ADMIN_NAME ?? 'Admin';
  const artistName = process.env.SEED_ARTIST_NAME ?? 'Artist Name';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });

  const existingProfile = await prisma.artistProfile.findFirst();

  if (existingProfile) {
    await prisma.artistProfile.update({
      where: { id: existingProfile.id },
      data: { name: existingProfile.name || artistName },
    });
  } else {
    await prisma.artistProfile.create({
      data: {
        name: artistName,
        shortBio: 'Artist portfolio',
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
