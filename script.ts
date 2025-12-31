import { Category } from './generated/prisma/enums'
import { prisma } from './lib/prisma'
import { ItemRepository } from './src/modules/item/item.repository'
import { ListRepository } from './src/modules/list/list.repository'

const listRepository = new ListRepository()
const itemRepository = new ItemRepository()

async function main() {
  await itemRepository.delete(9)
  await itemRepository.delete(10)
  await itemRepository.delete(11)
  await itemRepository.delete(12)
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