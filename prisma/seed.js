import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs' 

const prisma = new PrismaClient()
const priorities = ['low', 'medium', 'high']

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.todo.deleteMany()
  await prisma.user.deleteMany()

  // Chỉ 2 người dùng
  for (let i = 1; i <= 2; i++) {
    const hashedPassword = await bcrypt.hash(`password${i}`, 10)

    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        todos: {
          create: Array.from({ length: 20 }).map((_, j) => ({
            title: `Todo ${j + 1} for User ${i}`,
            description: `This is todo ${j + 1} of user ${i}`,
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            completed: Math.random() < 0.5,
            dueDate: new Date(
              Date.now() + Math.floor(Math.random() * 10 - 5) * 24 * 60 * 60 * 1000
            ),
          })),
        },
      },
    })

    console.log(`✅ Created ${user.name}`)
  }

  console.log('🌸 Done seeding.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
