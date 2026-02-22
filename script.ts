import { prisma } from './prisma/prisma'
import { ListRepository } from './src/modules/list/list.repository'
import { UserRepository } from './src/modules/user/user.repository'

const userRepository = new UserRepository()

async function main() {
    const user = await userRepository.findByCognitoSub("12345678-1234-1234-1234-123456789012")
    console.log("User:", user)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })