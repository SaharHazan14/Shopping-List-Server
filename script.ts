import { prisma } from './prisma/prisma'
import { ListRepository } from './src/modules/list/list.repository'

const listRepository = new ListRepository()

async function main() {
    
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