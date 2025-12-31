import { Category, Role } from './generated/prisma/enums'
import { prisma } from './lib/prisma'
import { ItemRepository } from './src/modules/item/item.repository'
import { ListRepository } from './src/modules/list/list.repository'

const listRepository = new ListRepository()
const itemRepository = new ItemRepository()

async function main() {
    const member = await listRepository.addMember(2, 5, Role.EDITOR)

    console.log(member)
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